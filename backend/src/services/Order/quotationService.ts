// services/Quotations/quotationService.ts

import mongoose from "mongoose";
import {
	Quotation,
	IQuotation,
	QuotationStatus,
} from "../../models/Orders/Quotation";
import { Enquiry, IEnquiry } from "../../models/Orders/Enquiry";
import { Counter } from "../../models/Counter";
import { Order } from "../../models/Orders/Order";
import { Dispatch } from "../../models/Dispatch/Dispatch";
import { Item } from "../../models/Masters/Item";

type UserId = string;

type QuotationItemPayload = {
	itemsCategory: string;
	itemsSubCategory: string;
	itemsName: string;
	itemsCode: string;
	itemsUnit: string;

	quantity: number;
	rate: number;

	discountPercent?: number; // 0-100
	gstRate: number; // fetched from item master on frontend OR backend enrichment

	itemsRemark?: string;
};

type CreateQuotationPayload = {
	quotationDate: Date;

	// optional if created from enquiry
	enquiryId?: string;

	warehouseName: string;

	customerName: string;
	contactPersonName: string;
	contactPersonPhone: number;

	remarks?: string;

	items: QuotationItemPayload[];
};

type UpdateQuotationPayload = Partial<
	Omit<CreateQuotationPayload, "enquiryId"> & {
		// allow changing link only via create-from-enquiry
		enquiryNo?: string;
	}
>;

const ensureObjectId = (id: string, label = "id") => {
	if (!mongoose.Types.ObjectId.isValid(id)) {
		throw new Error(`Invalid ${label}`);
	}
	return new mongoose.Types.ObjectId(id);
};

const getNextSeq = async (key: string) => {
	const doc = await Counter.findOneAndUpdate(
		{ key },
		{ $inc: { seq: 1 } },
		{ new: true, upsert: true },
	);
	return Number(doc.seq || 0);
};

const pad5 = (n: number) => String(n).padStart(5, "0");

const userPopulate = {
	path: "createdBy updatedBy",
	select: "firstName lastName userName email phone",
};

/* =========================================================
     STATUS RULES (Backend workflow protection)
   Final: WON / LOST
========================================================= */
const ALLOWED_STATUS_TRANSITIONS: Record<QuotationStatus, QuotationStatus[]> = {
	PENDING: ["SEND", "WON", "LOST"],
	SEND: ["WON", "LOST"],
	WON: [],
	LOST: [],
};

const isAllowedStatusTransition = (
	from: QuotationStatus,
	to: QuotationStatus,
) => {
	if (from === to) return true;
	return (ALLOWED_STATUS_TRANSITIONS[from] || []).includes(to);
};

/* =========================================================
     CALC HELPERS (line-level)
   All maths is done & stored to keep quotation immutable.
========================================================= */
const clamp = (n: number, min: number, max: number) =>
	Math.min(max, Math.max(min, n));

const round2 = (n: number) =>
	Math.round((Number(n) + Number.EPSILON) * 100) / 100;

const computeLine = (it: QuotationItemPayload) => {
	const qty = Number(it.quantity || 0);
	const rate = Number(it.rate || 0);
	const amount = round2(qty * rate);

	const discPct = clamp(Number(it.discountPercent ?? 0), 0, 100);
	const discountPrice = round2((discPct / 100) * amount);
	const discountedAmount = round2(amount - discountPrice);

	const gstRate = clamp(Number(it.gstRate ?? 0), 0, 100);
	const gstAmount = round2((gstRate / 100) * discountedAmount);

	const totalAmount = round2(discountedAmount + gstAmount);

	return {
		amount,
		discountPercent: discPct,
		discountPrice,
		discountedAmount,
		gstRate,
		gstAmount,
		totalAmount,
	};
};

const mapItemsWithComputed = (items: QuotationItemPayload[]) => {
	return (items || []).map((it) => ({
		itemsCategory: it.itemsCategory,
		itemsSubCategory: it.itemsSubCategory,
		itemsName: it.itemsName,
		itemsCode: it.itemsCode,
		itemsUnit: it.itemsUnit,

		quantity: Number(it.quantity),
		rate: Number(it.rate),

		...computeLine(it),

		itemsRemark: it.itemsRemark,
	}));
};

/* =========================================================
     CREATE (Direct OR From Enquiry if enquiryId present)
========================================================= */
export const createQuotation = async (
	payload: CreateQuotationPayload,
	userId: UserId,
) => {
	const createdBy = ensureObjectId(userId, "userId");

	const [srNoSeq, qtnSeq] = await Promise.all([
		getNextSeq("quotation_srno"),
		getNextSeq("quotation_no"),
	]);

	const quotationNo = `QTN-${pad5(qtnSeq)}`;

	let enquiryObjectId: mongoose.Types.ObjectId | undefined = undefined;
	let enquiryNo: string | undefined = undefined;

	if (payload.enquiryId) {
		enquiryObjectId = ensureObjectId(payload.enquiryId, "enquiryId");

		const enquiry = await Enquiry.findById(enquiryObjectId);
		if (!enquiry) throw new Error("Enquiry not found");

		//   Only allow creating quotation if enquiry is in REQUEST_FOR_QUOTATION
		if (enquiry.stage !== "REQUEST_FOR_QUOTATION") {
			throw new Error(
				`Enquiry stage must be REQUEST_FOR_QUOTATION to create quotation. Current: ${enquiry.stage}`,
			);
		}

		enquiryNo = enquiry.enquiryNo;

		//   Update enquiry stage -> QUOTATION_CREATED
		enquiry.stage = "QUOTATION_CREATED";
		enquiry.updatedBy = createdBy;
		await enquiry.save();
	}

	const computedItems = mapItemsWithComputed(payload.items);

	const quotation = await Quotation.create({
		srNo: srNoSeq,
		quotationNo,

		quotationDate: payload.quotationDate,

		enquiryId: enquiryObjectId,
		enquiryNo,

		warehouseName: payload.warehouseName,

		customerName: payload.customerName,
		contactPersonName: payload.contactPersonName,
		contactPersonPhone: payload.contactPersonPhone,

		status: "PENDING",

		remarks: payload.remarks,

		items: computedItems,

		createdBy,
		updatedBy: createdBy,
	});

	const populated = await Quotation.findById(quotation._id).populate(
		userPopulate,
	);
	return populated as IQuotation;
};

/* =========================================================
     QUOTATION REQUEST LIST (Enquiries in REQUEST_FOR_QUOTATION)
========================================================= */
export const listQuotationRequests = async () => {
	const rows = await Enquiry.find({ stage: "REQUEST_FOR_QUOTATION" })
		.sort({ createdAt: -1 })
		.populate(userPopulate);

	return rows as IEnquiry[];
};

/* =========================================================
     REVERT (REQUEST_FOR_QUOTATION -> PENDING)
========================================================= */
export const revertQuotationRequest = async (
	enquiryId: string,
	userId: UserId,
) => {
	const _id = ensureObjectId(enquiryId, "enquiry id");
	const updatedBy = ensureObjectId(userId, "userId");

	const doc = await Enquiry.findById(_id);
	if (!doc) return null;

	if (doc.stage !== "REQUEST_FOR_QUOTATION") {
		throw new Error(`Only REQUEST_FOR_QUOTATION enquiries can be reverted.`);
	}

	doc.stage = "PENDING";
	doc.updatedBy = updatedBy;

	await doc.save();

	const populated = await Enquiry.findById(_id).populate(userPopulate);
	return populated as IEnquiry;
};

/* =========================================================
     LIST QUOTATIONS
========================================================= */
export const listQuotations = async () => {
	const rows = await Quotation.find()
		.sort({ createdAt: -1 })
		.populate(userPopulate);
	return rows as IQuotation[];
};

/* =========================================================
     GET QUOTATION BY ID
========================================================= */
export const getQuotationById = async (id: string) => {
	const _id = ensureObjectId(id, "quotation id");
	const doc = await Quotation.findById(_id).populate(userPopulate);
	return doc as IQuotation | null;
};

/* =========================================================
     UPDATE QUOTATION (Allowed only when status is PENDING or SEND)
========================================================= */
export const updateQuotation = async (
	id: string,
	payload: UpdateQuotationPayload,
	userId: UserId,
) => {
	const _id = ensureObjectId(id, "quotation id");
	const updatedBy = ensureObjectId(userId, "userId");

	const doc = await Quotation.findById(_id);
	if (!doc) return null;

	if (doc.status === "WON" || doc.status === "LOST") {
		throw new Error("Cannot edit quotation after it is WON/LOST.");
	}

	if (payload.quotationDate !== undefined)
		doc.quotationDate = payload.quotationDate;
	if (payload.warehouseName !== undefined)
		doc.warehouseName = payload.warehouseName;

	if (payload.customerName !== undefined)
		doc.customerName = payload.customerName;
	if (payload.contactPersonName !== undefined)
		doc.contactPersonName = payload.contactPersonName;
	if (payload.contactPersonPhone !== undefined)
		doc.contactPersonPhone = payload.contactPersonPhone;

	if (payload.remarks !== undefined) doc.remarks = payload.remarks;

	//   Replace items array cleanly if provided (and recompute all values)
	if (payload.items !== undefined) {
		doc.items = mapItemsWithComputed(payload.items as any) as any;
	}

	doc.updatedBy = updatedBy;
	await doc.save();

	const populated = await Quotation.findById(_id).populate(userPopulate);
	return populated as IQuotation;
};

/* =========================================================
     SET STATUS (SEND/WON/LOST)
   Side effects:
   - SEND: keep enquiry at QUOTATION_CREATED
   - WON/LOST: enquiry -> CLOSED (if linked)
========================================================= */
export const setQuotationStatus = async (
	id: string,
	status: QuotationStatus,
	userId: UserId,
) => {
	const _id = ensureObjectId(id, "quotation id");
	const updatedBy = ensureObjectId(userId, "userId");

	const doc = await Quotation.findById(_id);
	if (!doc) return null;

	const current = doc.status as QuotationStatus;
	const next = status as QuotationStatus;

	if (!isAllowedStatusTransition(current, next)) {
		throw new Error(`Invalid status transition: ${current} -> ${next}`);
	}

	doc.status = next;
	doc.updatedBy = updatedBy;
	await doc.save();

	//   Side effects on linked enquiry
	if (doc.enquiryId) {
		const enquiry = await Enquiry.findById(doc.enquiryId);
		if (enquiry) {
			if (next === "WON" || next === "LOST") {
				enquiry.stage = "CLOSED";
			} else if (next === "SEND") {
				// keep QUOTATION_CREATED (defensive)
				if (enquiry.stage === "REQUEST_FOR_QUOTATION") {
					enquiry.stage = "QUOTATION_CREATED";
				}
			}
			enquiry.updatedBy = updatedBy;
			await enquiry.save();
		}
	}

	const populated = await Quotation.findById(_id).populate(userPopulate);
	return populated as IQuotation;
};

/* =========================================================
     QUOTATION -> REQUEST TO DISPATCH (READY QUEUE)
========================================================= */
export const requestQuotationToDispatchFromQuotation = async (
	quotationId: string,
	userId: UserId,
) => {
	const _id = ensureObjectId(quotationId, "quotation id");
	const by = ensureObjectId(userId, "userId");

	const q = await Quotation.findById(_id).lean();
	if (!q) throw new Error("Quotation not found");

	if (String((q as any).status) !== "WON") {
		throw new Error("Request-to-dispatch allowed only when quotation is WON");
	}

	// 1) prevent duplicate ready-request from order side
	const existingRequestedOrder = await Order.findOne({
		quotationId: _id,
		orderStatus: "REQUESTED_FOR_DISPATCH",
	}).lean();

	if (existingRequestedOrder) {
		throw Object.assign(
			new Error("This quotation is already sent to Request-to-Dispatch"),
			{ statusCode: 400 },
		);
	}

	// 2) prevent duplicate if dispatch already exists
	const existingDispatch = await Dispatch.findOne({
		quotationId: _id,
	}).lean();

	if (existingDispatch) {
		throw Object.assign(
			new Error("Dispatch already created for this quotation"),
			{ statusCode: 400 },
		);
	}

	// 3) resolve itemIds from Item master
	const mappedItems = await Promise.all(
		((q as any).items || []).map(async (it: any) => {
			let resolvedItemId = it.itemId ? String(it.itemId) : "";

			if (!resolvedItemId) {
				const code = String(it.itemsCode || "").trim();
				const name = String(it.itemsName || "").trim();

				let itemDoc: any = null;

				if (code) {
					itemDoc = await Item.findOne({ itemCode: code }).select("_id").lean();
				}

				if (!itemDoc && name) {
					itemDoc = await Item.findOne({ itemName: name }).select("_id").lean();
				}

				if (!itemDoc?._id) {
					throw Object.assign(
						new Error(
							`Unable to resolve itemId for quotation item: ${code || name || "unknown"}`,
						),
						{ statusCode: 400 },
					);
				}

				resolvedItemId = String(itemDoc._id);
			}

			return {
				itemsCategory: it.itemsCategory,
				itemsSubCategory: it.itemsSubCategory,
				itemId: new mongoose.Types.ObjectId(resolvedItemId),

				itemsName: it.itemsName,
				itemsCode: it.itemsCode,
				itemsUnit: it.itemsUnit,

				quantity: Number(it.quantity || 0),
				rate: it.rate,
				discountPercent: it.discountPercent,
				gstRate: it.gstRate,
				remark: it.itemsRemark || it.remark || "",
			};
		}),
	);

	// 4) create placeholder order entry so it appears in ready-to-dispatch list
	// NOTE: orderNo is required by Order schema, so generate one here
	const tempOrderNo = `RTD-${pad5(await getNextSeq("ready_dispatch_order_no"))}`;

	const created = await Order.create({
		orderNo: tempOrderNo,
		orderDate: new Date(),

		quotationId: _id,
		quotationNo: (q as any).quotationNo || "",

		customerName: (q as any).customerName || "",
		dispatchFromWarehouseName: (q as any).warehouseName || "",

		orderStatus: "REQUESTED_FOR_DISPATCH",
		remarks: (q as any).remarks || "",

		items: mappedItems,

		createdBy: by,
		updatedBy: by,
	} as any);

	//   mark quotation as dispatched requested
	await Quotation.findByIdAndUpdate(
		_id,
		{ dispatchRequested: true, readyToDispatch: false },
		{ new: true },
	);

	return created.toObject();
};

/* =========================================================
     REVERT DISPATCH REQUEST FROM QUOTATION
========================================================= */
export const revertQuotationDispatchRequest = async (quotationId: string) => {
	const _id = ensureObjectId(quotationId, "quotation id");

	const q = await Quotation.findById(_id).lean();
	if (!q) throw new Error("Quotation not found");

	if (!((q as any).dispatchRequested || (q as any).readyToDispatch)) {
		throw Object.assign(new Error("No dispatch request to revert"), {
			statusCode: 400,
		});
	}

	// delete the REQUESTED_FOR_DISPATCH order that was created
	const requestedOrder = await Order.findOneAndDelete({
		quotationId: _id,
		orderStatus: "REQUESTED_FOR_DISPATCH",
	});

	if (!requestedOrder) {
		throw Object.assign(
			new Error(
				"Requested dispatch order not found. Please delete manually if needed.",
			),
			{ statusCode: 400 },
		);
	}

	// revert quotation flags
	const updated = await Quotation.findByIdAndUpdate(
		_id,
		{ dispatchRequested: false, readyToDispatch: false },
		{ new: true },
	);

	return updated?.toObject();
};

/* =========================================================
     DELETE QUOTATION
========================================================= */
export const deleteQuotation = async (id: string) => {
	const _id = ensureObjectId(id, "quotation id");
	const deleted = await Quotation.findByIdAndDelete(_id);
	return deleted;
};
