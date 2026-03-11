// services/Order/enquiryService.ts

import mongoose from "mongoose";
import { Enquiry, IEnquiry, EnquiryStage } from "../../models/Orders/Enquiry";
import { Counter } from "../../models/Counter";

type UserId = string;

type CreateEnquiryPayload = {
	enquiryDate: Date;
	sourceOfEnquiry: string;

	customerName: string;
	contactPersonName: string;
	contactPersonPhone: number;

	staffName: string;
	stage?: EnquiryStage;

	remarks?: string;

	items: Array<{
		itemsCategory: string;
		itemsSubCategory: string;
		itemsName: string;
		itemsCode: string;
		itemsUnit: string;
		itemsRemark?: string;
	}>;
};

type UpdateEnquiryPayload = Partial<CreateEnquiryPayload>;

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
     STAGE RULES (Backend workflow protection)
   Required transitions:
   PENDING → REQUEST_FOR_QUOTATION
   REQUEST_FOR_QUOTATION → QUOTATION_CREATED
   QUOTATION_CREATED → CLOSED
========================================================= */
const ALLOWED_STAGE_TRANSITIONS: Record<EnquiryStage, EnquiryStage[]> = {
	PENDING: ["REQUEST_FOR_QUOTATION"],
	REQUEST_FOR_QUOTATION: ["QUOTATION_CREATED"],
	QUOTATION_CREATED: ["CLOSED"],
	CLOSED: [],
};

const isAllowedStageTransition = (from: EnquiryStage, to: EnquiryStage) => {
	if (from === to) return true;
	return (ALLOWED_STAGE_TRANSITIONS[from] || []).includes(to);
};

const STAGES: EnquiryStage[] = [
	"PENDING",
	"REQUEST_FOR_QUOTATION",
	"QUOTATION_CREATED",
	"CLOSED",
];

const assertStage = (v: any, label = "stage"): EnquiryStage => {
	const s = String(v || "").trim() as EnquiryStage;
	if (!STAGES.includes(s)) {
		throw new Error(`Invalid ${label}: ${v}`);
	}
	return s;
};

export const createEnquiry = async (
	payload: CreateEnquiryPayload,
	userId: UserId,
) => {
	const createdBy = ensureObjectId(userId, "userId");

	const [srNoSeq, enqSeq] = await Promise.all([
		getNextSeq("enquiry_srno"),
		getNextSeq("enquiry_no"),
	]);

	const enquiryNo = `ENQ-${pad5(enqSeq)}`;

	const enquiry = await Enquiry.create({
		srNo: srNoSeq,
		enquiryNo,

		enquiryDate: payload.enquiryDate,
		sourceOfEnquiry: payload.sourceOfEnquiry,

		customerName: payload.customerName,
		contactPersonName: payload.contactPersonName,
		contactPersonPhone: payload.contactPersonPhone,

		staffName: payload.staffName,
		stage: payload.stage ?? "PENDING",

		remarks: payload.remarks,
		items: payload.items,

		createdBy,
		updatedBy: createdBy,
	});

	const populated = await Enquiry.findById(enquiry._id).populate(userPopulate);
	return populated as IEnquiry;
};

/* =========================================================
     LIST (supports ?stage=REQUEST_FOR_QUOTATION)
========================================================= */
export const listEnquiries = async (params?: { stage?: any }) => {
	const filter: any = {};

	if (
		params?.stage !== undefined &&
		params?.stage !== null &&
		params?.stage !== ""
	) {
		filter.stage = assertStage(params.stage, "stage filter");
	}

	const rows = await Enquiry.find(filter)
		.sort({ createdAt: -1 })
		.populate(userPopulate);

	return rows as IEnquiry[];
};

export const getEnquiryById = async (id: string) => {
	const _id = ensureObjectId(id, "enquiry id");

	const doc = await Enquiry.findById(_id).populate(userPopulate);
	return doc as IEnquiry | null;
};

/* =========================================================
     UPDATE (PUT) - normal edit
   NOTE: stage transition should NOT be done here.
   Use PATCH /:id/stage for workflow.
========================================================= */
export const updateEnquiry = async (
	id: string,
	payload: UpdateEnquiryPayload,
	userId: UserId,
) => {
	const _id = ensureObjectId(id, "enquiry id");
	const updatedBy = ensureObjectId(userId, "userId");

	const doc = await Enquiry.findById(_id);
	if (!doc) return null;

	// ❌ Do not allow stage workflow here (keep source of truth in PATCH)
	if (payload.stage !== undefined) {
		throw new Error(
			"Stage update is not allowed here. Use PATCH /enquiries/:id/stage",
		);
	}

	if (payload.enquiryDate !== undefined) doc.enquiryDate = payload.enquiryDate;
	if (payload.sourceOfEnquiry !== undefined)
		doc.sourceOfEnquiry = payload.sourceOfEnquiry;

	if (payload.customerName !== undefined)
		doc.customerName = payload.customerName;
	if (payload.contactPersonName !== undefined)
		doc.contactPersonName = payload.contactPersonName;
	if (payload.contactPersonPhone !== undefined)
		doc.contactPersonPhone = payload.contactPersonPhone;

	if (payload.staffName !== undefined) doc.staffName = payload.staffName;

	if (payload.remarks !== undefined) doc.remarks = payload.remarks;

	if (payload.items !== undefined) {
		doc.items = payload.items as any;
	}

	doc.updatedBy = updatedBy;

	await doc.save();

	const populated = await Enquiry.findById(_id).populate(userPopulate);
	return populated as IEnquiry;
};

/* =========================================================
     STAGE UPDATE (PATCH /enquiries/:id/stage)
========================================================= */
export const updateEnquiryStage = async (
	id: string,
	payload: { stage: EnquiryStage },
	userId: UserId,
) => {
	const _id = ensureObjectId(id, "enquiry id");
	const updatedBy = ensureObjectId(userId, "userId");

	const doc = await Enquiry.findById(_id);
	if (!doc) return null;

	const currentStage = assertStage(doc.stage, "current stage");
	const nextStage = assertStage(payload.stage, "stage");

	if (!isAllowedStageTransition(currentStage, nextStage)) {
		throw new Error(
			`Invalid stage transition: ${currentStage} -> ${nextStage}`,
		);
	}

	doc.stage = nextStage;
	doc.updatedBy = updatedBy;

	await doc.save();

	const populated = await Enquiry.findById(_id).populate(userPopulate);
	return populated as IEnquiry;
};

export const deleteEnquiry = async (id: string) => {
	const _id = ensureObjectId(id, "enquiry id");
	const deleted = await Enquiry.findByIdAndDelete(_id);
	return deleted;
};
