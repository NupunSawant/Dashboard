// controllers/Quotations/quotationController.ts

import { Response } from "express";
import { AuthRequest } from "../../middleware/auth";
import { formatUser } from "../../utils/formatUser";

import {
	createQuotation,
	deleteQuotation,
	getQuotationById,
	listQuotations,
	listQuotationRequests,
	revertQuotationRequest,
	setQuotationStatus,
	updateQuotation,
	requestQuotationToDispatchFromQuotation,
	revertQuotationDispatchRequest,
} from "../../services/Order/quotationService";

import {
	createQuotationSchema,
	updateQuotationSchema,
	updateQuotationStatusSchema,
} from "../../validation/Order/quotationValidation";

const toRow = (q: any) => ({
	id: q._id,
	srNo: q.srNo,
	quotationNo: q.quotationNo,

	quotationDate: q.quotationDate,

	enquiryId: q.enquiryId ?? null,
	enquiryNo: q.enquiryNo ?? null,

	warehouseName: q.warehouseName,

	customerName: q.customerName,
	contactPersonName: q.contactPersonName ?? null,
	contactPersonPhone: q.contactPersonPhone,

	status: q.status,

	remarks: q.remarks,

	dispatchRequested: !!q.dispatchRequested,
	readyToDispatch: !!q.readyToDispatch,

	createdAt: q.createdAt,
	updatedAt: q.updatedAt,

	createdBy: q.createdBy ? formatUser(q.createdBy) : null,
	updatedBy: q.updatedBy ? formatUser(q.updatedBy) : null,
});

const toRequestRow = (e: any) => ({
	id: e._id,
	srNo: e.srNo,
	enquiryNo: e.enquiryNo,

	enquiryDate: e.enquiryDate,
	customerName: e.customerName,
	contactPersonPhone: e.contactPersonPhone,

	stage: e.stage,
	staffName: e.staffName,
	sourceOfEnquiry: e.sourceOfEnquiry,

	remarks: e.remarks,

	dispatchRequested: !!e.dispatchRequested,
	readyToDispatch: !!e.readyToDispatch,

	createdAt: e.createdAt,
	updatedAt: e.updatedAt,

	createdBy: e.createdBy ? formatUser(e.createdBy) : null,
	updatedBy: e.updatedBy ? formatUser(e.updatedBy) : null,
});

const getParamId = (req: AuthRequest) => {
	const { id } = req.params as any;
	return Array.isArray(id) ? id[0] : id;
};

const getParamEnquiryId = (req: AuthRequest) => {
	const { enquiryId } = req.params as any;
	return Array.isArray(enquiryId) ? enquiryId[0] : enquiryId;
};

/* =========================================================
   QUOTATION REQUESTS
========================================================= */

export const getQuotationRequests = async (
	_req: AuthRequest,
	res: Response,
) => {
	try {
		const list = await listQuotationRequests();

		return res.status(200).json({
			success: true,
			message: "Quotation requests fetched successfully",
			data: list.map(toRequestRow),
		});
	} catch (err: any) {
		return res.status(500).json({
			success: false,
			message: err?.message || "Failed to fetch quotation requests",
		});
	}
};

export const revertRequestToEnquiry = async (
	req: AuthRequest,
	res: Response,
) => {
	try {
		if (!req.userId) {
			return res.status(401).json({
				success: false,
				message: "Unauthorized",
			});
		}

		const enquiryId = getParamEnquiryId(req);
		const updated = await revertQuotationRequest(enquiryId, req.userId);

		if (!updated) {
			return res.status(404).json({
				success: false,
				message: "Enquiry not found",
			});
		}

		return res.status(200).json({
			success: true,
			message: "Enquiry reverted to pending successfully",
			data: {
				...toRequestRow(updated),
				items: updated.items,
			},
		});
	} catch (err: any) {
		return res.status(400).json({
			success: false,
			message: err?.message || "Failed to revert enquiry",
		});
	}
};

/* =========================================================
   QUOTATIONS CRUD
========================================================= */

export const addQuotation = async (req: AuthRequest, res: Response) => {
	try {
		if (!req.userId) {
			return res.status(401).json({
				success: false,
				message: "Unauthorized",
			});
		}

		const payload = createQuotationSchema.parse(req.body);
		const quotation = await createQuotation(payload as any, req.userId);

		return res.status(201).json({
			success: true,
			message: "Quotation created successfully",
			data: {
				...toRow(quotation),
				items: quotation.items,
			},
		});
	} catch (err: any) {
		return res.status(400).json({
			success: false,
			message: err?.message || "Failed to create quotation",
		});
	}
};

export const getQuotations = async (_req: AuthRequest, res: Response) => {
	try {
		const list = await listQuotations();

		return res.status(200).json({
			success: true,
			message: "Quotations fetched successfully",
			data: list.map(toRow),
		});
	} catch (err: any) {
		return res.status(500).json({
			success: false,
			message: err?.message || "Failed to fetch quotations",
		});
	}
};

export const getQuotation = async (req: AuthRequest, res: Response) => {
	try {
		const idString = getParamId(req);

		const quotation = await getQuotationById(idString);
		if (!quotation) {
			return res.status(404).json({
				success: false,
				message: "Quotation not found",
			});
		}

		return res.status(200).json({
			success: true,
			message: "Quotation fetched successfully",
			data: {
				id: quotation._id,
				srNo: quotation.srNo,
				quotationNo: quotation.quotationNo,

				quotationDate: quotation.quotationDate,

				enquiryId: quotation.enquiryId ?? null,
				enquiryNo: quotation.enquiryNo ?? null,

				warehouseName: quotation.warehouseName,

				customerName: quotation.customerName,
				contactPersonName: quotation.contactPersonName,
				contactPersonPhone: quotation.contactPersonPhone,

				status: quotation.status,

				remarks: quotation.remarks,
				dispatchRequested: !!quotation.dispatchRequested,
				readyToDispatch: !!quotation.readyToDispatch,
				items: quotation.items,

				createdAt: quotation.createdAt,
				updatedAt: quotation.updatedAt,
				createdBy: quotation.createdBy
					? formatUser(quotation.createdBy as any)
					: null,
				updatedBy: quotation.updatedBy
					? formatUser(quotation.updatedBy as any)
					: null,
			},
		});
	} catch (err: any) {
		return res.status(400).json({
			success: false,
			message: err?.message || "Failed to fetch quotation",
		});
	}
};

export const editQuotation = async (req: AuthRequest, res: Response) => {
	try {
		if (!req.userId) {
			return res.status(401).json({
				success: false,
				message: "Unauthorized",
			});
		}

		const idString = getParamId(req);
		const payload = updateQuotationSchema.parse(req.body);

		const updated = await updateQuotation(idString, payload as any, req.userId);
		if (!updated) {
			return res.status(404).json({
				success: false,
				message: "Quotation not found",
			});
		}

		return res.status(200).json({
			success: true,
			message: "Quotation updated successfully",
			data: {
				...toRow(updated),
				items: updated.items,
			},
		});
	} catch (err: any) {
		return res.status(400).json({
			success: false,
			message: err?.message || "Failed to update quotation",
		});
	}
};

export const updateQuotationStatus = async (
	req: AuthRequest,
	res: Response,
) => {
	try {
		if (!req.userId) {
			return res.status(401).json({
				success: false,
				message: "Unauthorized",
			});
		}

		const idString = getParamId(req);
		const payload = updateQuotationStatusSchema.parse(req.body);

		const updated = await setQuotationStatus(
			idString,
			payload.status as any,
			req.userId,
		);

		if (!updated) {
			return res.status(404).json({
				success: false,
				message: "Quotation not found",
			});
		}

		return res.status(200).json({
			success: true,
			message: "Quotation status updated successfully",
			data: {
				...toRow(updated),
				items: updated.items,
			},
		});
	} catch (err: any) {
		return res.status(400).json({
			success: false,
			message: err?.message || "Failed to update quotation status",
		});
	}
};

/* =========================================================
   QUOTATION -> REQUEST TO DISPATCH
========================================================= */
export const requestQuotationToDispatch = async (
	req: AuthRequest,
	res: Response,
) => {
	try {
		if (!req.userId) {
			return res.status(401).json({
				success: false,
				message: "Unauthorized",
			});
		}

		const idString = getParamId(req);

		const data = await requestQuotationToDispatchFromQuotation(
			idString,
			req.userId,
		);

		return res.status(200).json({
			success: true,
			message: "Quotation sent to Request-to-Dispatch successfully",
			data,
		});
	} catch (err: any) {
		return res.status(400).json({
			success: false,
			message: err?.message || "Failed to request dispatch from quotation",
		});
	}
};

/* =========================================================
   REVERT DISPATCH REQUEST
========================================================= */
export const revertQuotationDispatch = async (
	req: AuthRequest,
	res: Response,
) => {
	try {
		const idString = getParamId(req);

		const data = await revertQuotationDispatchRequest(idString);

		return res.status(200).json({
			success: true,
			message: "Dispatch request reverted successfully",
			data,
		});
	} catch (err: any) {
		return res.status(err?.statusCode || 400).json({
			success: false,
			message: err?.message || "Failed to revert dispatch request",
		});
	}
};

export const removeQuotation = async (req: AuthRequest, res: Response) => {
	try {
		const idString = getParamId(req);

		const deleted = await deleteQuotation(idString);
		if (!deleted) {
			return res.status(404).json({
				success: false,
				message: "Quotation not found",
			});
		}

		return res.status(200).json({
			success: true,
			message: "Quotation deleted successfully",
			data: { id: deleted._id },
		});
	} catch (err: any) {
		return res.status(400).json({
			success: false,
			message: err?.message || "Failed to delete quotation",
		});
	}
};
