import mongoose from "mongoose";
import { Dispatch } from "../../models/Dispatch/Dispatch";
import { Counter } from "../../models/Counter";
import { Order } from "../../models/Orders/Order";
import { Quotation } from "../../models/Orders/Quotation";
import {
	consumeReservedForOrder,
	applyInventoryDelta,
} from "../Inventory/inventoryService";
import {
	updateOrderStatus,
	createOrderFromDispatch,
} from "../Order/orderService";

const ensureObjectId = (id: string, name: string) => {
	if (!mongoose.Types.ObjectId.isValid(id)) {
		throw Object.assign(new Error(`Invalid ${name}`), { statusCode: 400 });
	}
};

const mustTrim = (v: unknown) => String(v ?? "").trim();

const nextDispatchNo = async () => {
	const c = await Counter.findOneAndUpdate(
		{ key: "dispatchNo" },
		{ $inc: { seq: 1 } },
		{ new: true, upsert: true },
	);
	return `DSP-${String(c.seq).padStart(4, "0")}`;
};

const calcTotals = (items: any[]) => {
	let subTotal = 0;
	let totalDiscount = 0;
	let totalGst = 0;
	let grandTotal = 0;

	const mapped = items.map((it) => {
		const dispatchQty = Number(it.dispatchQuantity || 0);
		const rate = Number(it.rate || 0);
		const amount = dispatchQty * rate;

		const discountPercent = Number(it.discountPercent || 0);
		const discountAmount =
			it.discountAmount !== undefined
				? Number(it.discountAmount || 0)
				: (amount * discountPercent) / 100;

		const taxable = Math.max(amount - discountAmount, 0);

		const gstRate = Number(it.gstRate || 0);
		const gstAmount =
			it.gstAmount !== undefined
				? Number(it.gstAmount || 0)
				: (taxable * gstRate) / 100;

		const totalAmount = taxable + gstAmount;

		subTotal += amount;
		totalDiscount += discountAmount;
		totalGst += gstAmount;
		grandTotal += totalAmount;

		return {
			...it,
			amount,
			discountAmount,
			gstAmount,
			totalAmount,
			status: it.status || "CREATED",
			remark: it.remark || "",
			returnQty: Number(it.returnQty || 0),
			returnRemark: it.returnRemark || "",
			returnInwardedQty: Number(it.returnInwardedQty || 0),
		};
	});

	return { items: mapped, subTotal, totalDiscount, totalGst, grandTotal };
};

const computeReturnedItemStatus = (items: any[]) => {
	let totalDispatchQty = 0;
	let totalReturnQty = 0;

	for (const item of items || []) {
		totalDispatchQty += Number(item.dispatchQuantity || 0);
		totalReturnQty += Number(item.returnQty || 0);
	}

	if (totalReturnQty <= 0) return "NOT_RETURNED";
	if (totalReturnQty >= totalDispatchQty) return "FULLY_RETURNED";
	return "PARTIALLY_RETURNED";
};

export const listReadyToDispatchOrders = async () => {
	return Order.find({
		$or: [
			{ orderStatus: "REQUESTED_FOR_DISPATCH" },
			{ dispatchRequested: true },
			{ readyToDispatch: true },
		],
	})
		.sort({ createdAt: -1 })
		.lean();
};

export const listDispatches = async () => {
	return Dispatch.find().sort({ createdAt: -1 }).lean();
};

export const listPendingSalesReturns = async () => {
	return Dispatch.find({
		dispatchStatus: "DELIVERED",
		salesReturnInwardStatus: "PENDING",
	})
		.sort({ createdAt: -1 })
		.lean();
};

export const getDispatchById = async (id: string) => {
	ensureObjectId(id, "dispatchId");

	const doc = await Dispatch.findById(id).lean();
	if (!doc)
		throw Object.assign(new Error("Dispatch not found"), { statusCode: 404 });
	return doc;
};

export const createDispatch = async (payload: any, userId?: string) => {
	const dispatchType = String(
		payload.dispatchType || payload.sourceType || "ORDER",
	).toUpperCase();

	const dispatchNo = await nextDispatchNo();
	const totals = calcTotals(payload.items || []);

	if (dispatchType === "ORDER") {
		const orderId = mustTrim(payload.orderId);
		ensureObjectId(orderId, "orderId");

		const order = await Order.findById(orderId).lean();
		if (!order)
			throw Object.assign(new Error("Order not found"), { statusCode: 404 });

		if (String((order as any).orderStatus) !== "REQUESTED_FOR_DISPATCH") {
			throw Object.assign(
				new Error(
					"Dispatch can be created only when order is REQUESTED_FOR_DISPATCH",
				),
				{ statusCode: 400 },
			);
		}

		const created = await Dispatch.create({
			dispatchNo,
			dispatchDate: new Date(payload.dispatchDate),

			orderId: new mongoose.Types.ObjectId(orderId),
			orderNo: (order as any).orderNo,
			quotationNo: (order as any).quotationNo,

			dispatchType: "ORDER",

			issuedFromWarehouseName: mustTrim(
				payload.issuedFromWarehouseName ||
					(order as any).dispatchFromWarehouseName,
			),

			customerName: mustTrim(
				payload.customerName || (order as any).customerName,
			),

			customerNameForTransport: mustTrim(
				payload.customerNameForTransport || "",
			),
			transporterName: mustTrim(payload.transporterName || ""),
			contactPerson: mustTrim(payload.contactPerson || ""),
			contactNumber: payload.contactNumber
				? Number(payload.contactNumber)
				: undefined,

			address: mustTrim(payload.address || ""),
			city: mustTrim(payload.city || ""),
			state: mustTrim(payload.state || ""),
			country: mustTrim(payload.country || ""),
			pincode: mustTrim(payload.pincode || ""),

			invoiceNo: mustTrim(payload.invoiceNo || ""),
			dispatchedBy: mustTrim(payload.dispatchedBy || ""),

			dispatchStatus: payload.dispatchStatus || "PENDING",
			returnedItemStatus: "NOT_RETURNED",
			salesReturnInwardStatus: "NONE",
			remark: mustTrim(payload.remark || ""),

			items: totals.items,

			subTotal: totals.subTotal,
			totalDiscount: totals.totalDiscount,
			totalGst: totals.totalGst,
			grandTotal: totals.grandTotal,

			createdBy: userId ? new mongoose.Types.ObjectId(userId) : undefined,
			updatedBy: userId ? new mongoose.Types.ObjectId(userId) : undefined,
		} as any);

		await consumeReservedForOrder({ orderId, userId });
		await updateOrderStatus(orderId, "DISPATCHED", userId);

		return created.toObject();
	}

	if (dispatchType === "QUOTATION") {
		const quotationId = mustTrim(payload.sourceId || payload.quotationId);
		ensureObjectId(quotationId, "quotationId");

		const q = await Quotation.findById(quotationId).lean();
		if (!q)
			throw Object.assign(new Error("Quotation not found"), {
				statusCode: 404,
			});

		if (String((q as any).status) !== "WON") {
			throw Object.assign(
				new Error("Dispatch can be created only when quotation is WON"),
				{
					statusCode: 400,
				},
			);
		}

		const created = await Dispatch.create({
			dispatchNo,
			dispatchDate: new Date(payload.dispatchDate),

			quotationId: new mongoose.Types.ObjectId(quotationId),
			quotationNo: (q as any).quotationNo,

			dispatchType: "QUOTATION",

			issuedFromWarehouseName: mustTrim(
				payload.issuedFromWarehouseName || (q as any).warehouseName,
			),

			customerName: mustTrim(payload.customerName || (q as any).customerName),

			customerNameForTransport: mustTrim(
				payload.customerNameForTransport || "",
			),
			transporterName: mustTrim(payload.transporterName || ""),
			contactPerson: mustTrim(
				payload.contactPerson || (q as any).contactPersonName || "",
			),
			contactNumber: payload.contactNumber
				? Number(payload.contactNumber)
				: (q as any).contactPersonPhone
					? Number((q as any).contactPersonPhone)
					: undefined,

			address: mustTrim(payload.address || ""),
			city: mustTrim(payload.city || ""),
			state: mustTrim(payload.state || ""),
			country: mustTrim(payload.country || ""),
			pincode: mustTrim(payload.pincode || ""),

			invoiceNo: mustTrim(payload.invoiceNo || ""),
			dispatchedBy: mustTrim(payload.dispatchedBy || ""),

			dispatchStatus: payload.dispatchStatus || "PENDING",
			returnedItemStatus: "NOT_RETURNED",
			salesReturnInwardStatus: "NONE",
			remark: mustTrim(payload.remark || ""),

			items: totals.items,

			subTotal: totals.subTotal,
			totalDiscount: totals.totalDiscount,
			totalGst: totals.totalGst,
			grandTotal: totals.grandTotal,

			createdBy: userId ? new mongoose.Types.ObjectId(userId) : undefined,
			updatedBy: userId ? new mongoose.Types.ObjectId(userId) : undefined,
		} as any);

		return created.toObject();
	}

	throw Object.assign(new Error("Invalid dispatchType"), { statusCode: 400 });
};

export const revertReadyToDispatch = async (
	readyRowId: string,
	userId?: string,
) => {
	ensureObjectId(readyRowId, "readyRowId");

	const readyRow = await Order.findById(readyRowId);
	if (!readyRow) {
		throw Object.assign(new Error("Ready row not found"), { statusCode: 404 });
	}

	const quotationId = (readyRow as any).quotationId
		? String((readyRow as any).quotationId)
		: "";

	await Order.findByIdAndDelete(readyRowId);

	if (quotationId && mongoose.Types.ObjectId.isValid(quotationId)) {
		const updateData: any = {
			dispatchRequested: false,
			readyToDispatch: false,
		};

		if (userId) {
			updateData.updatedBy = new mongoose.Types.ObjectId(userId);
		}

		await Quotation.findByIdAndUpdate(
			quotationId,
			{ $set: updateData },
			{ new: true },
		);
	}

	return { id: readyRowId };
};

export const markDispatchDelivered = async (
	dispatchId: string,
	userId?: string,
) => {
	ensureObjectId(dispatchId, "dispatchId");

	const d = await Dispatch.findById(dispatchId);
	if (!d)
		throw Object.assign(new Error("Dispatch not found"), { statusCode: 404 });

	if (String(d.dispatchStatus) === "DELIVERED") {
		throw Object.assign(new Error("Dispatch already delivered"), {
			statusCode: 400,
		});
	}

	d.dispatchStatus = "DELIVERED";
	if (userId) d.updatedBy = new mongoose.Types.ObjectId(userId);
	await d.save();

	if (String(d.dispatchType) === "QUOTATION") {
		await createOrderFromDispatch(String(d._id), userId);
	}

	return d.toObject();
};

export const processSalesReturn = async (
	dispatchId: string,
	payload: {
		items: Array<{
			itemId?: string;
			itemsName?: string;
			itemsCode?: string;
			returnQty: number;
			returnRemark?: string;
		}>;
	},
	userId?: string,
) => {
	ensureObjectId(dispatchId, "dispatchId");

	const d = await Dispatch.findById(dispatchId);
	if (!d)
		throw Object.assign(new Error("Dispatch not found"), { statusCode: 404 });

	if (String(d.dispatchStatus) !== "DELIVERED") {
		throw Object.assign(
			new Error("Sales return can be processed only for delivered dispatch"),
			{ statusCode: 400 },
		);
	}

	if (String(d.salesReturnInwardStatus || "NONE") === "COMPLETED") {
		throw Object.assign(
			new Error("Sales return inward already completed for this dispatch"),
			{ statusCode: 400 },
		);
	}

	const selectedItems = Array.isArray(payload?.items) ? payload.items : [];
	if (!selectedItems.length) {
		throw Object.assign(new Error("At least one return item is required"), {
			statusCode: 400,
		});
	}

	let hasReturn = false;

	d.items = d.items.map((row: any) => {
		const match = selectedItems.find((x) => {
			if (x.itemId && String(x.itemId) === String(row.itemId)) return true;
			if (x.itemsCode && String(x.itemsCode) === String(row.itemsCode))
				return true;
			if (x.itemsName && String(x.itemsName) === String(row.itemsName))
				return true;
			return false;
		});

		if (!match) {
			row.returnQty = Number(row.returnQty || 0);
			row.returnRemark = row.returnRemark || "";
			row.returnInwardedQty = Number(row.returnInwardedQty || 0);
			return row;
		}

		const returnQty = Number(match.returnQty || 0);
		if (!Number.isFinite(returnQty) || returnQty <= 0) {
			throw Object.assign(
				new Error(
					`Return qty must be greater than 0 for item ${row.itemsName}`,
				),
				{ statusCode: 400 },
			);
		}

		const dispatchQty = Number(row.dispatchQuantity || 0);
		if (returnQty > dispatchQty) {
			throw Object.assign(
				new Error(
					`Return qty cannot exceed dispatch qty for item ${row.itemsName}`,
				),
				{ statusCode: 400 },
			);
		}

		hasReturn = true;
		row.returnQty = returnQty;
		row.returnRemark = mustTrim(match.returnRemark || "");
		row.returnInwardedQty = Number(row.returnInwardedQty || 0);

		return row;
	}) as any;

	if (!hasReturn) {
		throw Object.assign(new Error("No valid return items selected"), {
			statusCode: 400,
		});
	}

	d.returnedItemStatus = computeReturnedItemStatus(d.items as any);
	d.salesReturnInwardStatus = "PENDING";
	d.returnProcessedAt = new Date();

	if (userId) {
		d.returnProcessedBy = new mongoose.Types.ObjectId(userId);
		d.updatedBy = new mongoose.Types.ObjectId(userId);
	}

	await d.save();
	return d.toObject();
};

export const completeSalesReturnInward = async (
	dispatchId: string,
	userId?: string,
) => {
	ensureObjectId(dispatchId, "dispatchId");

	const d = await Dispatch.findById(dispatchId);
	if (!d)
		throw Object.assign(new Error("Dispatch not found"), { statusCode: 404 });

	if (String(d.dispatchStatus) !== "DELIVERED") {
		throw Object.assign(
			new Error("Sales return inward allowed only for delivered dispatch"),
			{ statusCode: 400 },
		);
	}

	if (String(d.salesReturnInwardStatus || "NONE") !== "PENDING") {
		throw Object.assign(new Error("No pending sales return inward found"), {
			statusCode: 400,
		});
	}

	const returnItems = (d.items || []).filter(
		(it: any) => Number(it.returnQty || 0) > 0,
	);

	if (!returnItems.length) {
		throw Object.assign(new Error("No return items found for inward"), {
			statusCode: 400,
		});
	}

	for (const item of returnItems as any[]) {
		const qty = Number(item.returnQty || 0);
		if (qty <= 0) continue;

		await applyInventoryDelta({
			warehouseName: mustTrim(d.issuedFromWarehouseName),
			itemName: mustTrim(item.itemsName),
			deltaQty: qty,
			category: mustTrim(item.itemsCategory),
			subCategory: mustTrim(item.itemsSubCategory),
			unit: mustTrim(item.itemsUnit),
			userId,
		});

		item.returnInwardedQty = qty;
	}

	d.salesReturnInwardStatus = "COMPLETED";
	d.returnInwardedAt = new Date();

	if (userId) {
		d.returnInwardedBy = new mongoose.Types.ObjectId(userId);
		d.updatedBy = new mongoose.Types.ObjectId(userId);
	}

	await d.save();
	return d.toObject();
};
