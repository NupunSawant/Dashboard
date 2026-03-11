import mongoose from "mongoose";
import { IssueToLabour } from "../../models/Warehouses/IssueToLabour";
import { Inventory } from "../../models/Inventory/Inventory";
import { Counter } from "../../models/Counter";
import { createWarehouseInward } from "./warehouseInwardService";

const ensureObjectId = (id: string, name: string) => {
	if (!mongoose.Types.ObjectId.isValid(id)) {
		throw Object.assign(new Error(`Invalid ${name}`), { statusCode: 400 });
	}
};

const mustTrim = (v: unknown) => String(v ?? "").trim();

const norm = (v: string) =>
	String(v || "")
		.trim()
		.toLowerCase();

const nextIssueNo = async () => {
	const c = await Counter.findOneAndUpdate(
		{ key: "issueToLabourNo" },
		{ $inc: { seq: 1 } },
		{ new: true, upsert: true },
	);
	return `LAB-${String(c!.seq).padStart(4, "0")}`;
};

const nextSrNo = async () => {
	const c = await Counter.findOneAndUpdate(
		{ key: "issueToLabour_srno" },
		{ $inc: { seq: 1 } },
		{ new: true, upsert: true },
	);
	return c!.seq;
};

type IssueItemInput = {
	itemsCategory: string;
	itemsSubCategory: string;
	itemsName: string;
	itemsCode: string;
	itemsUnit: string;
	dispatchQuantity: number;
	itemsRemark?: string;
};

type CompleteFinishedItemInput = {
	itemsCategory: string;
	itemsSubCategory: string;
	itemsName: string;
	itemsCode: string;
	itemsUnit: string;
	itemsQuantity: number;
	itemsRate?: number;
	itemsAmount?: number;
	itemsRemark?: string;
};

type ReturnedRawItemInput = {
	itemsCategory: string;
	itemsSubCategory: string;
	itemsName: string;
	itemsCode: string;
	itemsUnit: string;
	dispatchQuantity: number;
	returnQuantity: number;
	itemsRemark?: string;
};

const mapIssueItems = (items: IssueItemInput[]) => {
	return (items || []).map((item) => ({
		itemsCategory: mustTrim(item.itemsCategory),
		itemsSubCategory: mustTrim(item.itemsSubCategory),
		itemsName: mustTrim(item.itemsName),
		itemsCode: mustTrim(item.itemsCode),
		itemsUnit: mustTrim(item.itemsUnit),
		dispatchQuantity: Number(item.dispatchQuantity || 0),
		itemsRemark: item.itemsRemark ? mustTrim(item.itemsRemark) : "",
	}));
};

async function reserveInventory(
	warehouseName: string,
	items: Array<{
		itemsName: string;
		dispatchQuantity: number;
		itemsCategory?: string;
		itemsSubCategory?: string;
		itemsUnit?: string;
	}>,
) {
	const warehouseKey = norm(warehouseName);

	for (const item of items) {
		const itemName = mustTrim(item.itemsName);
		const qty = Number(item.dispatchQuantity) || 0;
		if (!itemName || qty <= 0) continue;

		const inv = await Inventory.findOne({
			warehouseKey: norm(warehouseName),
			itemKey: norm(item.itemsName),
			categoryKey: norm(item.itemsCategory || ""),
			subCategoryKey: norm(item.itemsSubCategory || ""),
			unitKey: norm(item.itemsUnit || ""),
		});

		if (!inv) {
			throw Object.assign(
				new Error(`Inventory not found for item "${itemName}" in warehouse`),
				{ statusCode: 400 },
			);
		}

		if (Number(inv.availableQuantity || 0) < qty) {
			throw Object.assign(
				new Error(
					`Insufficient available quantity for item "${itemName}" in warehouse "${warehouseName}"`,
				),
				{ statusCode: 400 },
			);
		}

		inv.availableQuantity = Math.max(
			0,
			Number(inv.availableQuantity || 0) - qty,
		);
		inv.reservedQuantity = Number(inv.reservedQuantity || 0) + qty;
		await inv.save();
	}
}

async function unreserveInventory(
	warehouseName: string,
	items: Array<{
		itemsName: string;
		dispatchQuantity: number;
		itemsCategory?: string;
		itemsSubCategory?: string;
		itemsUnit?: string;
	}>,
) {
	const warehouseKey = norm(warehouseName);

	for (const item of items) {
		const itemName = mustTrim(item.itemsName);
		const qty = Number(item.dispatchQuantity) || 0;
		if (!itemName || qty <= 0) continue;

		const inv = await Inventory.findOne({
			warehouseKey,
			itemKey: norm(itemName),
			categoryKey: norm(item.itemsCategory || ""),
			subCategoryKey: norm(item.itemsSubCategory || ""),
			unitKey: norm(item.itemsUnit || ""),
		});

		if (!inv) continue;

		const releasable = Math.min(Number(inv.reservedQuantity || 0), qty);
		if (releasable <= 0) continue;

		inv.reservedQuantity = Number(inv.reservedQuantity || 0) - releasable;
		inv.availableQuantity = Number(inv.availableQuantity || 0) + releasable;
		await inv.save();
	}
}

async function consumeReservedIssuedInventory(
	warehouseName: string,
	items: Array<{
		itemsName: string;
		dispatchQuantity: number;
		itemsCategory?: string;
		itemsSubCategory?: string;
		itemsUnit?: string;
	}>,
) {
	const warehouseKey = norm(warehouseName);

	for (const item of items) {
		const itemName = mustTrim(item.itemsName);
		const qty = Number(item.dispatchQuantity) || 0;
		if (!itemName || qty <= 0) continue;

		const inv = await Inventory.findOne({
			warehouseKey,
			itemKey: norm(itemName),
			categoryKey: norm(item.itemsCategory || ""),
			subCategoryKey: norm(item.itemsSubCategory || ""),
			unitKey: norm(item.itemsUnit || ""),
		});

		if (!inv) continue;

		const consumable = Math.min(Number(inv.reservedQuantity || 0), qty);
		if (consumable <= 0) continue;

		inv.reservedQuantity = Number(inv.reservedQuantity || 0) - consumable;
		await inv.save();
	}
}

const keyedName = (v: string) => mustTrim(v).toLowerCase();

export const listIssueToLabours = async () => {
	return IssueToLabour.find()
		.sort({ createdAt: -1 })
		.populate("createdBy", "firstName lastName userName email phone")
		.populate("updatedBy", "firstName lastName userName email phone")
		.lean();
};

export const getIssueToLabourById = async (id: string) => {
	ensureObjectId(id, "issue to labour id");

	const doc = await IssueToLabour.findById(id)
		.populate("createdBy", "firstName lastName userName email phone")
		.populate("updatedBy", "firstName lastName userName email phone")
		.lean();

	if (!doc) {
		throw Object.assign(new Error("Issue to labour not found"), {
			statusCode: 404,
		});
	}

	return doc;
};

export const createIssueToLabour = async (
	payload: {
		issueDate: Date;
		issueFromWarehouse: string;
		labourName: string;
		remarks?: string;
		items: IssueItemInput[];
	},
	userId?: string,
) => {
	const issueFromWarehouse = mustTrim(payload.issueFromWarehouse);
	const labourName = mustTrim(payload.labourName);
	const remarks = mustTrim(payload.remarks);

	const items = mapIssueItems(payload.items);

	if (!items.length) {
		throw Object.assign(new Error("At least one item is required"), {
			statusCode: 400,
		});
	}

	const srNo = await nextSrNo();
	const issueNo = await nextIssueNo();

	await reserveInventory(issueFromWarehouse, items);

	try {
		const created = await IssueToLabour.create({
			srNo,
			issueNo,
			issueDate: payload.issueDate ? new Date(payload.issueDate) : new Date(),
			issueFromWarehouse,
			labourName,
			status: "ISSUED",
			remarks,
			items,
			createdBy: userId ? new mongoose.Types.ObjectId(userId) : undefined,
			updatedBy: userId ? new mongoose.Types.ObjectId(userId) : undefined,
		});

		return created.toObject();
	} catch (e) {
		await unreserveInventory(issueFromWarehouse, items);
		throw e;
	}
};

export const updateIssueToLabour = async (
	id: string,
	payload: {
		issueDate?: Date;
		issueFromWarehouse?: string;
		labourName?: string;
		remarks?: string;
		items?: IssueItemInput[];
	},
	userId?: string,
) => {
	ensureObjectId(id, "issue to labour id");

	const issue = await IssueToLabour.findById(id);
	if (!issue) {
		throw Object.assign(new Error("Issue to labour not found"), {
			statusCode: 404,
		});
	}

	if (String(issue.status) !== "ISSUED") {
		throw Object.assign(new Error("Only ISSUED entries can be edited"), {
			statusCode: 400,
		});
	}

	const oldWarehouse = mustTrim(issue.issueFromWarehouse);
	const oldItems = mapIssueItems(issue.items as any);

	await unreserveInventory(oldWarehouse, oldItems);

	try {
		if (payload.issueDate !== undefined) {
			issue.issueDate = new Date(payload.issueDate);
		}
		if (payload.issueFromWarehouse !== undefined) {
			issue.issueFromWarehouse = mustTrim(payload.issueFromWarehouse);
		}
		if (payload.labourName !== undefined) {
			issue.labourName = mustTrim(payload.labourName);
		}
		if (payload.remarks !== undefined) {
			issue.remarks = mustTrim(payload.remarks);
		}
		if (payload.items !== undefined) {
			const mappedItems = mapIssueItems(payload.items);
			if (!mappedItems.length) {
				throw Object.assign(new Error("At least one item is required"), {
					statusCode: 400,
				});
			}
			issue.items = mappedItems as any;
		}

		if (userId) {
			issue.updatedBy = new mongoose.Types.ObjectId(userId);
		}

		await reserveInventory(
			mustTrim(issue.issueFromWarehouse),
			mapIssueItems(issue.items as any),
		);

		await issue.save();
		return issue.toObject();
	} catch (e) {
		await reserveInventory(oldWarehouse, oldItems);
		throw e;
	}
};

export const revertIssueToLabour = async (id: string, userId?: string) => {
	ensureObjectId(id, "issue to labour id");

	const issue = await IssueToLabour.findById(id);
	if (!issue) {
		throw Object.assign(new Error("Issue to labour not found"), {
			statusCode: 404,
		});
	}

	if (String(issue.status) !== "ISSUED") {
		throw Object.assign(new Error("Only ISSUED entries can be reverted"), {
			statusCode: 400,
		});
	}

	await unreserveInventory(
		mustTrim(issue.issueFromWarehouse),
		mapIssueItems(issue.items as any),
	);

	issue.status = "REVERTED";
	if (userId) {
		issue.updatedBy = new mongoose.Types.ObjectId(userId);
	}
	await issue.save();

	return issue.toObject();
};

export const listPendingIssueToLabours = async () => {
	return IssueToLabour.find({ status: "ISSUED" })
		.sort({ createdAt: -1 })
		.populate("createdBy", "firstName lastName userName email phone")
		.populate("updatedBy", "firstName lastName userName email phone")
		.lean();
};

export const completeIssueToLabour = async (
	id: string,
	payload: {
		inwardDate: Date;
		receivedByWarehouseName: string;
		receivedBy: string;
		remarks?: string;
		itemsDetails?: CompleteFinishedItemInput[];
		labourReturnedItems?: ReturnedRawItemInput[];
	},
	userId?: string,
) => {
	ensureObjectId(id, "issue to labour id");

	const issue = await IssueToLabour.findById(id);
	if (!issue) {
		throw Object.assign(new Error("Issue to labour not found"), {
			statusCode: 404,
		});
	}

	if (String(issue.status) !== "ISSUED") {
		throw Object.assign(new Error("Only ISSUED entries can be completed"), {
			statusCode: 400,
		});
	}

	const issueItems = mapIssueItems(issue.items as any);
	const issuedMap = new Map(
		issueItems.map((item) => [keyedName(item.itemsName), item]),
	);

	const itemsDetails = (payload.itemsDetails || []).map((item) => ({
		itemsCategory: mustTrim(item.itemsCategory),
		itemsSubCategory: mustTrim(item.itemsSubCategory),
		itemsName: mustTrim(item.itemsName),
		itemsCode: mustTrim(item.itemsCode),
		itemsUnit: mustTrim(item.itemsUnit),
		itemsQuantity: Number(item.itemsQuantity || 0),
		itemsRate: Number(item.itemsRate || 0),
		itemsAmount: Number(item.itemsAmount || 0),
		itemsRemark: item.itemsRemark ? mustTrim(item.itemsRemark) : "",
	}));

	const labourReturnedItems = (payload.labourReturnedItems || []).map(
		(item) => ({
			itemsCategory: mustTrim(item.itemsCategory),
			itemsSubCategory: mustTrim(item.itemsSubCategory),
			itemsName: mustTrim(item.itemsName),
			itemsCode: mustTrim(item.itemsCode),
			itemsUnit: mustTrim(item.itemsUnit),
			dispatchQuantity: Number(item.dispatchQuantity || 0),
			returnQuantity: Number(item.returnQuantity || 0),
			itemsRemark: item.itemsRemark ? mustTrim(item.itemsRemark) : "",
		}),
	);

	const hasFinished = itemsDetails.some(
		(item) => Number(item.itemsQuantity || 0) > 0,
	);
	const hasReturned = labourReturnedItems.some(
		(item) => Number(item.returnQuantity || 0) > 0,
	);

	if (!hasFinished && !hasReturned) {
		throw Object.assign(
			new Error("At least one finished item or returned raw item is required"),
			{ statusCode: 400 },
		);
	}

	for (const returned of labourReturnedItems) {
		const issued = issuedMap.get(keyedName(returned.itemsName));
		if (!issued) {
			throw Object.assign(
				new Error(`Returned item "${returned.itemsName}" was not issued`),
				{ statusCode: 400 },
			);
		}

		const issuedQty = Number(issued.dispatchQuantity || 0);
		const returnQty = Number(returned.returnQuantity || 0);

		if (returnQty > issuedQty) {
			throw Object.assign(
				new Error(
					`Return quantity cannot exceed issued quantity for item "${returned.itemsName}"`,
				),
				{ statusCode: 400 },
			);
		}
	}

	const inwardItems = [
		...itemsDetails
			.filter((item) => Number(item.itemsQuantity || 0) > 0)
			.map((item) => ({
				itemsCategory: item.itemsCategory,
				itemsSubCategory: item.itemsSubCategory,
				itemsName: item.itemsName,
				itemsCode: item.itemsCode,
				itemsQuantity: Number(item.itemsQuantity || 0),
				itemsUnit: item.itemsUnit,
				itemsRate: Number(item.itemsRate || 0),
				itemsAmount: Number(item.itemsAmount || 0),
				itemsRemark: item.itemsRemark || "",
			})),
		...labourReturnedItems
			.filter((item) => Number(item.returnQuantity || 0) > 0)
			.map((item) => ({
				itemsCategory: item.itemsCategory,
				itemsSubCategory: item.itemsSubCategory,
				itemsName: item.itemsName,
				itemsCode: item.itemsCode,
				itemsQuantity: Number(item.returnQuantity || 0),
				itemsUnit: item.itemsUnit,
				itemsRate: 0,
				itemsAmount: 0,
				itemsRemark: item.itemsRemark || "",
			})),
	];

	try {
		await createWarehouseInward(
			{
				inwardType: "LABOUR_RETURN",
				inwardDate: payload.inwardDate
					? new Date(payload.inwardDate)
					: new Date(),
				receivedBy: mustTrim(payload.receivedBy),
				remarks: mustTrim(payload.remarks || issue.remarks || ""),
				invoiceNo: mustTrim(issue.issueNo),
				supplierName: mustTrim(issue.labourName),
				warehouseName: mustTrim(payload.receivedByWarehouseName),
				items: inwardItems,
			},
			userId,
		);

		await consumeReservedIssuedInventory(
			mustTrim(issue.issueFromWarehouse),
			issueItems,
		);

		issue.status = "COMPLETED";
		if (userId) {
			issue.updatedBy = new mongoose.Types.ObjectId(userId);
		}
		await issue.save();

		return issue.toObject();
	} catch (e) {
		throw e;
	}
};
