// services/Orders/orderService.ts

import mongoose from "mongoose";
import { Order } from "../../models/Orders/Order";
import { Item } from "../../models/Masters/Item";
import { Counter } from "../../models/Counter";
import { Quotation } from "../../models/Orders/Quotation";
import { Enquiry } from "../../models/Orders/Enquiry";
import { Customer } from "../../models/Masters/Customer";
import { Dispatch } from "../../models/Dispatch/Dispatch";
import {
	reserveInventoryForOrder,
	releaseInventoryReservation,
	consumeReservedForOrder,
} from "../Inventory/inventoryService";

const normalizeId = (raw: any): string => {
	if (!raw) return "";

	if (typeof raw === "string") return raw.trim();
	if (Array.isArray(raw)) return String(raw[0] ?? "").trim();

	// supports dropdown objects: { value }, { id }, { _id }
	if (typeof raw === "object") {
		return String(raw.value || raw.id || raw._id || "").trim();
	}

	return String(raw).trim();
};

const ensureObjectId = (id: string, name: string) => {
	if (!mongoose.Types.ObjectId.isValid(id)) {
		throw Object.assign(new Error(`Invalid ${name}`), { statusCode: 400 });
	}
};

const nextOrderNo = async (): Promise<string> => {
	//   Keep same counter pattern you used in quotation/enquiry (if any)
	const c = await Counter.findOneAndUpdate(
		{ key: "orderNo" },
		{ $inc: { seq: 1 } },
		{ new: true, upsert: true },
	);
	return `ORD-${String(c.seq).padStart(4, "0")}`;
};

type CreateOrderItemPayload = {
	itemsCategory: string;
	itemsSubCategory: string;

	itemId: any; // accept string/object from dropdown
	itemsName?: string;
	itemsCode?: string;
	itemsUnit?: string;

	quantity: number;

	rate?: number;
	discountPercent?: number;
	gstRate?: number;

	remark?: string;
};

type CreateOrderPayload = {
	orderDate: string;

	quotationId?: any;
	quotationNo?: string;

	enquiryId?: any;
	enquiryNo?: string;

	customerName: string;
	customerContactPersonName?: string;
	customerContactPersonPhone?: number;
	customerAddress?: string;
	customerCity?: string;
	customerState?: string;
	customerPincode?: string;

	dispatchFromWarehouseName: string;

	orderStatus?: any; // default PENDING
	remarks?: string;

	items: CreateOrderItemPayload[];

	createdBy?: string;
};

export const createOrderFromDispatch = async (
	dispatchId: string,
	userId?: string,
) => {
	if (!mongoose.Types.ObjectId.isValid(dispatchId)) {
		throw Object.assign(new Error("Invalid dispatchId"), { statusCode: 400 });
	}

	const d: any = await Dispatch.findById(dispatchId).lean();
	if (!d)
		throw Object.assign(new Error("Dispatch not found"), { statusCode: 404 });

	// prevent duplicate order creation (optional)
	const existing = await Order.findOne({ sourceDispatchId: d._id }).lean();
	if (existing) return existing;

	const orderNo = await nextOrderNo();

	const order = await Order.create({
		orderNo,
		orderDate: new Date(),

		// link back
		sourceDispatchId: d._id,
		quotationNo: d.quotationNo || "",

		customerName: d.customerName,
		dispatchFromWarehouseName: d.issuedFromWarehouseName,

		orderStatus: "DELIVERED", // since you create it at delivery

		items: (d.items || []).map((it: any) => ({
			itemsCategory: it.itemsCategory,
			itemsSubCategory: it.itemsSubCategory,
			itemId: it.itemId,
			itemsName: it.itemsName,
			itemsCode: it.itemsCode,
			itemsUnit: it.itemsUnit,
			quantity: it.dispatchQuantity, // delivered qty
			rate: it.rate ?? 0,
			discountPercent: it.discountPercent ?? 0,
			gstRate: it.gstRate ?? 0,
			remark: it.remark ?? "",
		})),

		createdBy: userId ? new mongoose.Types.ObjectId(userId) : undefined,
		updatedBy: userId ? new mongoose.Types.ObjectId(userId) : undefined,
	} as any);

	return order.toObject();
};

export const createOrder = async (payload: CreateOrderPayload) => {
	const orderNo = await nextOrderNo();

	// optional ids
	const quotationId = payload.quotationId
		? normalizeId(payload.quotationId)
		: "";
	const enquiryId = payload.enquiryId ? normalizeId(payload.enquiryId) : "";

	if (quotationId) ensureObjectId(quotationId, "quotationId");
	if (enquiryId) ensureObjectId(enquiryId, "enquiryId");

	//   items enrichment: always trust Item master for snapshots
	const items = await Promise.all(
		(payload.items || []).map(async (it) => {
			const itemId = normalizeId(it.itemId);
			ensureObjectId(itemId, "itemId");

			const item = await Item.findById(itemId).lean();
			if (!item)
				throw Object.assign(new Error("Item not found"), { statusCode: 404 });

			return {
				itemsCategory: String(it.itemsCategory || "").trim(),
				itemsSubCategory: String(it.itemsSubCategory || "").trim(),

				itemId: item._id,

				//   MUST MATCH Order model fields
				itemsName: String((item as any).itemName || "").trim(),
				itemsCode: String((item as any).itemCode || "").trim(),
				itemsUnit: String((item as any).unit || "").trim(),

				quantity: Number(it.quantity || 0),

				rate: it.rate,
				discountPercent: it.discountPercent,
				gstRate: it.gstRate,

				remark: String(it.remark || "").trim(),
			};
		}),
	);

	if (!items.length) {
		throw Object.assign(new Error("At least 1 item is required"), {
			statusCode: 400,
		});
	}

	const order = await Order.create({
		orderNo,
		orderDate: new Date(payload.orderDate),

		quotationId: quotationId || undefined,
		quotationNo: payload.quotationNo?.trim() || undefined,

		enquiryId: enquiryId || undefined,
		enquiryNo: payload.enquiryNo?.trim() || undefined,

		customerName: payload.customerName.trim(),
		customerContactPersonName: payload.customerContactPersonName
			? String(payload.customerContactPersonName).trim()
			: undefined,
		customerContactPersonPhone: payload.customerContactPersonPhone
			? Number(payload.customerContactPersonPhone)
			: undefined,
		customerAddress: payload.customerAddress
			? String(payload.customerAddress).trim()
			: undefined,
		customerCity: payload.customerCity
			? String(payload.customerCity).trim()
			: undefined,
		customerState: payload.customerState
			? String(payload.customerState).trim()
			: undefined,
		customerPincode: payload.customerPincode
			? String(payload.customerPincode).trim()
			: undefined,

		dispatchFromWarehouseName: payload.dispatchFromWarehouseName.trim(),

		orderStatus: payload.orderStatus || "PENDING",
		remarks: payload.remarks?.trim() || "",

		items,

		createdBy: payload.createdBy
			? new mongoose.Types.ObjectId(payload.createdBy)
			: undefined,
	});

	return order;
};

export const createOrderFromQuotation = async (
	quotationIdRaw: any,
	userId?: string,
) => {
	const quotationId = normalizeId(quotationIdRaw);
	ensureObjectId(quotationId, "quotationId");

	const q = await Quotation.findById(quotationId).lean();
	if (!q)
		throw Object.assign(new Error("Quotation not found"), { statusCode: 404 });

	const existing = await Order.findOne({
		quotationId: new mongoose.Types.ObjectId(quotationId),
	});
	if (existing) {
		return existing;
	}

	//   allow ONLY if WON (as per your rule)
	if (String((q as any).status) !== "WON") {
		throw Object.assign(
			new Error("Order can be created only when quotation is WON"),
			{
				statusCode: 400,
			},
		);
	}

	// optional enquiry link (quotation may or may not have it)
	const enquiryId = (q as any).enquiryId
		? String((q as any).enquiryId)
		: undefined;
	let enquiryNo: string | undefined = undefined;

	if (enquiryId && mongoose.Types.ObjectId.isValid(enquiryId)) {
		const e = await Enquiry.findById(enquiryId).lean();
		enquiryNo = (e as any)?.enquiryNo;
	}

	const orderItems: CreateOrderItemPayload[] = await Promise.all(
		((q as any).items || []).map(async (it: any) => {
			const rawItemId = normalizeId(it.itemId || it.item?._id || "");

			let resolvedItemId = "";
			if (rawItemId && mongoose.Types.ObjectId.isValid(rawItemId)) {
				resolvedItemId = rawItemId;
			} else {
				let itemDoc = null;

				const code = String(it.itemsCode || "").trim();
				const name = String(it.itemsName || "").trim();

				if (code) {
					itemDoc = await Item.findOne({ itemCode: code }).select("_id").lean();
				}

				if (!itemDoc && name) {
					itemDoc = await Item.findOne({ itemName: name }).select("_id").lean();
				}

				if (!itemDoc?._id) {
					throw Object.assign(
						new Error(
							`Unable to resolve item for quotation row: ${code || name || "unknown"}`,
						),
						{ statusCode: 400 },
					);
				}

				resolvedItemId = String(itemDoc._id);
			}

			return {
				itemsCategory: it.itemsCategory,
				itemsSubCategory: it.itemsSubCategory,

				itemId: resolvedItemId,
				quantity: it.quantity,

				rate: it.rate,
				discountPercent: it.discountPercent,
				gstRate: it.gstRate,

				remark: it.itemsRemark || it.remark || "",
			};
		}),
	);

	// ✅ Fetch customer details from Customer master by name
	const customerName = String((q as any).customerName || "").trim();
	let customerDetails: any = {};

	if (customerName) {
		const customer = await Customer.findOne({
			customerName: {
				$regex: `^${customerName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
				$options: "i",
			},
		}).lean();

		if (customer) {
			customerDetails = {
				customerContactPersonName: (customer as any).customerContactPersonName,
				customerContactPersonPhone: (customer as any)
					.customerContactPersonPhone,
				customerAddress: (customer as any).customerAddress,
				customerCity: (customer as any).customerCity,
				customerState: (customer as any).customerState,
				customerPincode: (customer as any).customerPincode,
			};
		}
	}

	const created = await createOrder({
		orderDate: new Date().toISOString(),
		quotationId,
		quotationNo: (q as any).quotationNo,
		enquiryId,
		enquiryNo,
		customerName: (q as any).customerName,
		...customerDetails,
		dispatchFromWarehouseName: (q as any).warehouseName,
		orderStatus: "PENDING",
		remarks: (q as any).remarks || "",
		items: orderItems,
		createdBy: userId,
	});

	return created;
};


export const listOrders = async (filters?: { status?: string }) => {
	const q: any = {};
	if (filters?.status) q.orderStatus = filters.status;

	return Order.find(q).sort({ createdAt: -1 }).lean();
};

export const getOrderById = async (id: string) => {
	ensureObjectId(id, "orderId");

	const order = await Order.findById(id).lean();
	if (!order)
		throw Object.assign(new Error("Order not found"), { statusCode: 404 });

	return order;
};

export const updateOrder = async (
	id: string,
	payload: {
		orderDate?: string;

		customerName?: string;
		dispatchFromWarehouseName?: string;

		quotationId?: any;
		quotationNo?: string;

		enquiryId?: any;
		enquiryNo?: string;

		remarks?: string;

		items?: CreateOrderItemPayload[];
	},
) => {
	ensureObjectId(id, "orderId");

	let itemsSnapshot: any = undefined;

	if (payload.items !== undefined) {
		const enriched = await Promise.all(
			payload.items.map(async (it) => {
				const itemId = normalizeId(it.itemId);
				ensureObjectId(itemId, "itemId");

				const item = await Item.findById(itemId).lean();
				if (!item)
					throw Object.assign(new Error("Item not found"), { statusCode: 404 });

				return {
					itemsCategory: String(it.itemsCategory || "").trim(),
					itemsSubCategory: String(it.itemsSubCategory || "").trim(),

					itemId: item._id,
					itemsName: String((item as any).itemName || "").trim(),
					itemsCode: String((item as any).itemCode || "").trim(),
					itemsUnit: String((item as any).unit || "").trim(),

					quantity: it.quantity,

					rate: it.rate,
					discountPercent: it.discountPercent,
					gstRate: it.gstRate,

					remark: it.remark?.trim() || "",
				};
			}),
		);

		if (!enriched.length) {
			throw Object.assign(new Error("At least 1 item is required"), {
				statusCode: 400,
			});
		}

		itemsSnapshot = { items: enriched };
	}

	const quotationId = payload.quotationId
		? normalizeId(payload.quotationId)
		: undefined;
	const enquiryId = payload.enquiryId
		? normalizeId(payload.enquiryId)
		: undefined;

	if (quotationId) ensureObjectId(quotationId, "quotationId");
	if (enquiryId) ensureObjectId(enquiryId, "enquiryId");

	const updated = await Order.findByIdAndUpdate(
		id,
		{
			...(payload.orderDate !== undefined
				? { orderDate: new Date(payload.orderDate) }
				: {}),

			...(payload.customerName !== undefined
				? { customerName: payload.customerName.trim() }
				: {}),
			...(payload.dispatchFromWarehouseName !== undefined
				? {
						dispatchFromWarehouseName: payload.dispatchFromWarehouseName.trim(),
					}
				: {}),

			...(quotationId !== undefined ? { quotationId } : {}),
			...(payload.quotationNo !== undefined
				? { quotationNo: payload.quotationNo?.trim() || undefined }
				: {}),

			...(enquiryId !== undefined ? { enquiryId } : {}),
			...(payload.enquiryNo !== undefined
				? { enquiryNo: payload.enquiryNo?.trim() || undefined }
				: {}),

			...(payload.remarks !== undefined
				? { remarks: payload.remarks.trim() }
				: {}),

			...(itemsSnapshot !== undefined ? itemsSnapshot : {}),
		},
		{ new: true },
	);

	if (!updated)
		throw Object.assign(new Error("Order not found"), { statusCode: 404 });

	return updated;
};

export const updateOrderStatus = async (
	id: string,
	status: string,
	userId?: string,
) => {
	ensureObjectId(id, "orderId");

	const order = await Order.findById(id).lean();
	if (!order)
		throw Object.assign(new Error("Order not found"), { statusCode: 404 });

	const current = String((order as any).orderStatus);
	const next = String(status);

	const allowed: Record<string, string[]> = {
		PENDING: ["REQUESTED_FOR_DISPATCH", "CANCELLED"],
		REQUESTED_FOR_DISPATCH: ["DISPATCHED", "PENDING", "CANCELLED"], //   allow revert
		DISPATCHED: ["DELIVERED"],
		DELIVERED: [],
		CANCELLED: [],
	};

	if (!allowed[current]?.includes(next)) {
		throw Object.assign(
			new Error(`Invalid status transition: ${current} -> ${next}`),
			{ statusCode: 400 },
		);
	}

	// ===============================
	//   Inventory rules
	// ===============================

	// PENDING -> REQUESTED_FOR_DISPATCH  => reserve
	if (current === "PENDING" && next === "REQUESTED_FOR_DISPATCH") {
		const lines = ((order as any).items || []).map((it: any) => ({
			itemName: it.itemsName,
			category: it.itemsCategory,
			subCategory: it.itemsSubCategory,
			unit: it.itemsUnit,
			qty: Number(it.quantity || 0),
		}));

		await reserveInventoryForOrder({
			orderId: String((order as any)._id),
			orderNo: String((order as any).orderNo),
			warehouseName: String((order as any).dispatchFromWarehouseName || ""),
			lines,
			userId,
		});
	}

	// REQUESTED_FOR_DISPATCH -> PENDING => release reservation (revert)
	if (current === "REQUESTED_FOR_DISPATCH" && next === "PENDING") {
		await releaseInventoryReservation({
			orderId: String((order as any)._id),
			userId,
		});
	}

	// REQUESTED_FOR_DISPATCH -> DISPATCHED => consume reserved
	// (Usually you'll call this from dispatchService.createDispatch, but this keeps status update safe too)
	if (current === "REQUESTED_FOR_DISPATCH" && next === "DISPATCHED") {
		await consumeReservedForOrder({
			orderId: String((order as any)._id),
			userId,
		});
	}

	// ===============================
	//   Save status
	// ===============================
	const updated = await Order.findByIdAndUpdate(
		id,
		{
			orderStatus: next,
			updatedBy: userId ? new mongoose.Types.ObjectId(userId) : undefined,
		},
		{ new: true },
	).lean();

	return updated;
};

export const checkDispatchExists = async (quotationId: string) => {
	const existingDispatch = await Dispatch.findOne({
		quotationId: new mongoose.Types.ObjectId(quotationId),
	}).lean();

	if (existingDispatch) {
		throw Object.assign(
			new Error("Dispatch already created for this quotation"),
			{ statusCode: 400 },
		);
	}
};