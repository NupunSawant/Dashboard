import mongoose from "mongoose";
import { WarehouseInward } from "../../models/Warehouses/WarehouseInward";
import { Dispatch } from "../../models/Dispatch/Dispatch";
import { Counter } from "../../models/Counter";
import { applyInventoryDelta } from "../Inventory/inventoryService";

const ensureObjectId = (id: string, name: string) => {
	if (!mongoose.Types.ObjectId.isValid(id)) {
		throw Object.assign(new Error(`Invalid ${name}`), { statusCode: 400 });
	}
};

const getNextSequence = async (key: string): Promise<number> => {
	const doc = await Counter.findOneAndUpdate(
		{ key },
		{ $inc: { seq: 1 } },
		{ new: true, upsert: true },
	).lean();

	return doc!.seq;
};

const padGrn = (n: number) => `GRN-${String(n).padStart(5, "0")}`;
const mustTrim = (v: unknown) => String(v ?? "").trim();

const assertStockKeys = (warehouseName: string, itemName: string) => {
	if (!warehouseName) {
		throw Object.assign(new Error("warehouseName is required"), {
			statusCode: 400,
		});
	}
	if (!itemName) {
		throw Object.assign(new Error("itemsName is required"), {
			statusCode: 400,
		});
	}
};

export const createWarehouseInward = async (
	payload: {
		inwardType: string;
		inwardDate: Date;
		receivedBy: string;
		remarks?: string;
		invoiceNo: string;
		supplierName: string;
		warehouseName: string;
		sourceDispatchId?: string;
		dispatchNo?: string;
		items: Array<{
			itemsCategory: string;
			itemsSubCategory: string;
			itemsName: string;
			itemsCode: string;
			itemsQuantity: number;
			itemsUnit: string;
			itemsRate: number;
			itemsAmount: number;
			itemsRemark?: string;
		}>;
	},
	userId?: string,
) => {
	const inwardType = mustTrim(payload.inwardType);
	const receivedBy = mustTrim(payload.receivedBy);
	const remarks = mustTrim(payload.remarks);
	const invoiceNo = mustTrim(payload.invoiceNo);
	const supplierName = mustTrim(payload.supplierName);
	const warehouseName = mustTrim(payload.warehouseName);
	const dispatchNo = mustTrim(payload.dispatchNo);

	let sourceDispatchId: mongoose.Types.ObjectId | undefined = undefined;

	if (payload.sourceDispatchId) {
		ensureObjectId(payload.sourceDispatchId, "sourceDispatchId");
		sourceDispatchId = new mongoose.Types.ObjectId(payload.sourceDispatchId);
	}

	if (!payload.items || payload.items.length === 0) {
		throw Object.assign(new Error("At least one item is required"), {
			statusCode: 400,
		});
	}

	const processedItems = payload.items.map((item) => ({
		itemsCategory: mustTrim(item.itemsCategory),
		itemsSubCategory: mustTrim(item.itemsSubCategory),
		itemsName: mustTrim(item.itemsName),
		itemsCode: mustTrim(item.itemsCode),
		itemsQuantity: Number(item.itemsQuantity),
		itemsUnit: mustTrim(item.itemsUnit),
		itemsRate: Number(item.itemsRate),
		itemsAmount: Number(item.itemsAmount),
		itemsRemark: item.itemsRemark ? mustTrim(item.itemsRemark) : undefined,
	}));

	if (inwardType === "SALES_RETURN") {
		if (!sourceDispatchId) {
			throw Object.assign(
				new Error("sourceDispatchId is required for sales return inward"),
				{ statusCode: 400 },
			);
		}

		const dispatch: any = await Dispatch.findById(sourceDispatchId);
		if (!dispatch) {
			throw Object.assign(new Error("Dispatch not found"), { statusCode: 404 });
		}

		if (String(dispatch.dispatchStatus) !== "DELIVERED") {
			throw Object.assign(
				new Error("Sales return inward allowed only for delivered dispatch"),
				{ statusCode: 400 },
			);
		}

		if (String(dispatch.salesReturnInwardStatus || "NONE") !== "PENDING") {
			throw Object.assign(new Error("No pending sales return inward found"), {
				statusCode: 400,
			});
		}
	}

	const srNo = await getNextSequence("warehouseinward_srno");
	const grnSeq = await getNextSequence("warehouseinward_grn");
	const grnNo = padGrn(grnSeq);

	const exists = await WarehouseInward.findOne({ grnNo }).lean();
	if (exists) {
		throw Object.assign(new Error("GRN already exists"), {
			statusCode: 409,
		});
	}

	const inward = await WarehouseInward.create({
		srNo,
		grnNo,
		inwardType,
		inwardDate: payload.inwardDate,
		receivedBy,
		remarks,
		invoiceNo,
		supplierName,
		warehouseName,
		sourceDispatchId,
		dispatchNo,
		items: processedItems as any,
		createdBy: userId ? new mongoose.Types.ObjectId(userId) : undefined,
		updatedBy: userId ? new mongoose.Types.ObjectId(userId) : undefined,
	});

	try {
		for (const item of processedItems) {
			assertStockKeys(warehouseName, item.itemsName);
			await applyInventoryDelta({
				warehouseName,
				itemName: item.itemsName,
				deltaQty: +item.itemsQuantity,
				category: item.itemsCategory,
				subCategory: item.itemsSubCategory,
				unit: item.itemsUnit,
				userId,
			});
		}

		if (inwardType === "SALES_RETURN" && sourceDispatchId) {
			const dispatch: any = await Dispatch.findById(sourceDispatchId);
			if (!dispatch) {
				throw Object.assign(new Error("Dispatch not found"), {
					statusCode: 404,
				});
			}

			for (const inwardItem of processedItems) {
				const match = (dispatch.items || []).find(
					(it: any) =>
						String(it.itemId) === String((inwardItem as any).itemId) ||
						String(it.itemsCode) === String(inwardItem.itemsCode) ||
						String(it.itemsName) === String(inwardItem.itemsName),
				);

				if (match) {
					match.returnInwardedQty = Number(inwardItem.itemsQuantity || 0);
				}
			}

			dispatch.salesReturnInwardStatus = "COMPLETED";
			dispatch.returnInwardedAt = new Date();

			if (userId) {
				dispatch.returnInwardedBy = new mongoose.Types.ObjectId(userId);
				dispatch.updatedBy = new mongoose.Types.ObjectId(userId);
			}

			await dispatch.save();
		}
	} catch (e) {
		await WarehouseInward.deleteOne({ _id: inward._id });
		throw e;
	}

	return inward;
};

export const listWarehouseInwards = async () => {
	try {
		const inwards = await WarehouseInward.find()
			.sort({ srNo: 1 })
			.populate("createdBy", "firstName lastName userName email phone")
			.populate("updatedBy", "firstName lastName userName email phone")
			.populate(
				"sourceDispatchId",
				"dispatchNo dispatchStatus returnedItemStatus",
			)
			.lean();

		const flattened = inwards.flatMap((inward: any) =>
			inward.items && inward.items.length > 0
				? (inward.items.map((item: any) => ({
						...inward,
						itemsCategory: item.itemsCategory,
						itemsSubCategory: item.itemsSubCategory,
						itemsName: item.itemsName,
						itemsCode: item.itemsCode,
						itemsQuantity: item.itemsQuantity,
						itemsUnit: item.itemsUnit,
						itemsRate: item.itemsRate,
						itemsAmount: item.itemsAmount,
						itemsRemark: item.itemsRemark,
						items: undefined,
					})) as any[])
				: ([] as any[]),
		);

		return flattened;
	} catch (error) {
		throw error;
	}
};

export const getWarehouseInwardById = async (id: string) => {
	ensureObjectId(id, "warehouse inward id");

	const inward = await WarehouseInward.findById(id)
		.populate("createdBy", "firstName lastName userName email phone")
		.populate("updatedBy", "firstName lastName userName email phone")
		.populate(
			"sourceDispatchId",
			"dispatchNo dispatchStatus returnedItemStatus",
		)
		.lean();

	if (!inward)
		throw Object.assign(new Error("Warehouse inward not found"), {
			statusCode: 404,
		});

	return inward;
};

export const updateWarehouseInward = async (
	id: string,
	payload: {
		grnNo?: string;
		inwardType?: string;
		inwardDate?: Date;
		receivedBy?: string;
		remarks?: string;
		invoiceNo?: string;
		supplierName?: string;
		warehouseName?: string;
		sourceDispatchId?: string;
		dispatchNo?: string;
		items?: Array<{
			itemsCategory: string;
			itemsSubCategory: string;
			itemsName: string;
			itemsCode: string;
			itemsQuantity: number;
			itemsUnit: string;
			itemsRate: number;
			itemsAmount: number;
			itemsRemark?: string;
		}>;
	},
	userId?: string,
) => {
	ensureObjectId(id, "warehouse inward id");

	const old = await WarehouseInward.findById(id).lean();
	if (!old) {
		throw Object.assign(new Error("Warehouse inward not found"), {
			statusCode: 404,
		});
	}

	const updateData: any = {};

	if (payload.inwardType !== undefined)
		updateData.inwardType = mustTrim(payload.inwardType);
	if (payload.inwardDate !== undefined)
		updateData.inwardDate = payload.inwardDate;
	if (payload.receivedBy !== undefined)
		updateData.receivedBy = mustTrim(payload.receivedBy);
	if (payload.remarks !== undefined)
		updateData.remarks = mustTrim(payload.remarks);
	if (payload.invoiceNo !== undefined)
		updateData.invoiceNo = mustTrim(payload.invoiceNo);
	if (payload.supplierName !== undefined)
		updateData.supplierName = mustTrim(payload.supplierName);
	if (payload.warehouseName !== undefined)
		updateData.warehouseName = mustTrim(payload.warehouseName);
	if (payload.dispatchNo !== undefined)
		updateData.dispatchNo = mustTrim(payload.dispatchNo);

	if (payload.sourceDispatchId !== undefined) {
		if (payload.sourceDispatchId) {
			ensureObjectId(payload.sourceDispatchId, "sourceDispatchId");
			updateData.sourceDispatchId = new mongoose.Types.ObjectId(
				payload.sourceDispatchId,
			);
		} else {
			updateData.sourceDispatchId = undefined;
		}
	}

	if (payload.items !== undefined) {
		if (payload.items.length === 0) {
			throw Object.assign(new Error("At least one item is required"), {
				statusCode: 400,
			});
		}
		updateData.items = payload.items.map((item) => ({
			itemsCategory: mustTrim(item.itemsCategory),
			itemsSubCategory: mustTrim(item.itemsSubCategory),
			itemsName: mustTrim(item.itemsName),
			itemsCode: mustTrim(item.itemsCode),
			itemsQuantity: Number(item.itemsQuantity),
			itemsUnit: mustTrim(item.itemsUnit),
			itemsRate: Number(item.itemsRate),
			itemsAmount: Number(item.itemsAmount),
			itemsRemark: item.itemsRemark ? mustTrim(item.itemsRemark) : undefined,
		}));
	}

	if (userId) updateData.updatedBy = new mongoose.Types.ObjectId(userId);

	const updated = await WarehouseInward.findByIdAndUpdate(id, updateData, {
		new: true,
	})
		.populate("createdBy", "firstName lastName userName email phone")
		.populate("updatedBy", "firstName lastName userName email phone")
		.populate(
			"sourceDispatchId",
			"dispatchNo dispatchStatus returnedItemStatus",
		);

	if (!updated) {
		throw Object.assign(new Error("Warehouse inward not found"), {
			statusCode: 404,
		});
	}

	if (payload.items !== undefined) {
		try {
			const oldItems = (old as any).items || [];
			const newItems = (updated as any).items || [];

			for (const item of oldItems) {
				await applyInventoryDelta({
					warehouseName: mustTrim((old as any).warehouseName),
					itemName: mustTrim(item.itemsName),
					deltaQty: -Number(item.itemsQuantity),
					category: mustTrim(item.itemsCategory),
					subCategory: mustTrim(item.itemsSubCategory),
					unit: mustTrim(item.itemsUnit),
					userId,
				});
			}

			for (const item of newItems) {
				assertStockKeys(
					mustTrim((updated as any).warehouseName),
					item.itemsName,
				);
				await applyInventoryDelta({
					warehouseName: mustTrim((updated as any).warehouseName),
					itemName: mustTrim(item.itemsName),
					deltaQty: +Number(item.itemsQuantity),
					category: mustTrim(item.itemsCategory),
					subCategory: mustTrim(item.itemsSubCategory),
					unit: mustTrim(item.itemsUnit),
					userId,
				});
			}
		} catch (e) {
			await WarehouseInward.updateOne(
				{ _id: id },
				{ $set: { items: old.items, updatedBy: old.updatedBy } },
			);
			throw e;
		}
	}

	return updated;
};

export const deleteWarehouseInward = async (id: string, userId?: string) => {
	ensureObjectId(id, "warehouse inward id");

	const inward = await WarehouseInward.findById(id).lean();
	if (!inward) {
		throw Object.assign(new Error("Warehouse inward not found"), {
			statusCode: 404,
		});
	}

	const warehouseName = mustTrim((inward as any).warehouseName);
	const items = (inward as any).items || [];

	try {
		for (const item of items) {
			assertStockKeys(warehouseName, item.itemsName);
			await applyInventoryDelta({
				warehouseName,
				itemName: mustTrim(item.itemsName),
				deltaQty: -Number(item.itemsQuantity),
				category: mustTrim(item.itemsCategory),
				subCategory: mustTrim(item.itemsSubCategory),
				unit: mustTrim(item.itemsUnit),
				userId,
			});
		}
	} catch (e) {
		throw e;
	}

	const deleted = await WarehouseInward.findByIdAndDelete(id);
	if (!deleted) {
		for (const item of items) {
			await applyInventoryDelta({
				warehouseName,
				itemName: mustTrim(item.itemsName),
				deltaQty: +Number(item.itemsQuantity),
				category: mustTrim(item.itemsCategory),
				subCategory: mustTrim(item.itemsSubCategory),
				unit: mustTrim(item.itemsUnit),
				userId,
			});
		}
		throw Object.assign(new Error("Warehouse inward not found"), {
			statusCode: 404,
		});
	}

	return true;
};
