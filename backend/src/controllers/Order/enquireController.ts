import { Response } from "express";
import { AuthRequest } from "../../middleware/auth";
import { formatUser } from "../../utils/formatUser";

import {
	createEnquiry,
	deleteEnquiry,
	getEnquiryById,
	listEnquiries,
	updateEnquiry,
	updateEnquiryStage as updateEnquiryStageService,
} from "../../services/Order/enquiryService";

import {
	createEnquirySchema,
	updateEnquirySchema,
	updateEnquiryStageSchema, //   we will add this in enquiryValidation.ts
} from "../../validation/Order/enquiryValidation";

const toRow = (e: any) => ({
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

	createdAt: e.createdAt,
	updatedAt: e.updatedAt,

	createdBy: e.createdBy ? formatUser(e.createdBy) : null,
	updatedBy: e.updatedBy ? formatUser(e.updatedBy) : null,
});

const getParamId = (req: AuthRequest) => {
	const { id } = req.params as any;
	return Array.isArray(id) ? id[0] : id;
};

export const addEnquiry = async (req: AuthRequest, res: Response) => {
	try {
		if (!req.userId) {
			return res.status(401).json({
				success: false,
				message: "Unauthorized",
			});
		}

		const payload = createEnquirySchema.parse(req.body);
		const enquiry = await createEnquiry(payload as any, req.userId);

		return res.status(201).json({
			success: true,
			message: "Enquiry created successfully",
			data: {
				...toRow(enquiry),
				items: enquiry.items,
			},
		});
	} catch (err: any) {
		return res.status(400).json({
			success: false,
			message: err?.message || "Failed to create enquiry",
		});
	}
};

export const getEnquiries = async (req: AuthRequest, res: Response) => {
	try {
		const stageRaw = (req.query?.stage as string | undefined) ?? undefined;

		const list = await listEnquiries({ stage: stageRaw });

		return res.status(200).json({
			success: true,
			message: "Enquiries fetched successfully",
			data: list.map(toRow),
		});
	} catch (err: any) {
		//   invalid stage filter should be 400 (not 500)
		return res.status(400).json({
			success: false,
			message: err?.message || "Failed to fetch enquiries",
		});
	}
};

export const getEnquiry = async (req: AuthRequest, res: Response) => {
	try {
		const idString = getParamId(req);

		const enquiry = await getEnquiryById(idString);
		if (!enquiry) {
			return res.status(404).json({
				success: false,
				message: "Enquiry not found",
			});
		}

		return res.status(200).json({
			success: true,
			message: "Enquiry fetched successfully",
			data: {
				id: enquiry._id,
				srNo: enquiry.srNo,
				enquiryNo: enquiry.enquiryNo,

				enquiryDate: enquiry.enquiryDate,
				sourceOfEnquiry: enquiry.sourceOfEnquiry,

				customerName: enquiry.customerName,
				contactPersonName: enquiry.contactPersonName,
				contactPersonPhone: enquiry.contactPersonPhone,

				staffName: enquiry.staffName,
				stage: enquiry.stage,

				remarks: enquiry.remarks,
				items: enquiry.items,

				createdAt: enquiry.createdAt,
				updatedAt: enquiry.updatedAt,
				createdBy: enquiry.createdBy
					? formatUser(enquiry.createdBy as any)
					: null,
				updatedBy: enquiry.updatedBy
					? formatUser(enquiry.updatedBy as any)
					: null,
			},
		});
	} catch (err: any) {
		return res.status(400).json({
			success: false,
			message: err?.message || "Failed to fetch enquiry",
		});
	}
};

export const editEnquiry = async (req: AuthRequest, res: Response) => {
	try {
		if (!req.userId) {
			return res.status(401).json({
				success: false,
				message: "Unauthorized",
			});
		}

		const idString = getParamId(req);
		const payload = updateEnquirySchema.parse(req.body);

		const updated = await updateEnquiry(idString, payload as any, req.userId);
		if (!updated) {
			return res.status(404).json({
				success: false,
				message: "Enquiry not found",
			});
		}

		return res.status(200).json({
			success: true,
			message: "Enquiry updated successfully",
			data: {
				...toRow(updated),
				items: updated.items,
			},
		});
	} catch (err: any) {
		return res.status(400).json({
			success: false,
			message: err?.message || "Failed to update enquiry",
		});
	}
};

//   PATCH /orders/enquiries/:id/stage
export const updateEnquiryStage = async (req: AuthRequest, res: Response) => {
	try {
		if (!req.userId) {
			return res.status(401).json({
				success: false,
				message: "Unauthorized",
			});
		}

		const idString = getParamId(req);
		const payload = updateEnquiryStageSchema.parse(req.body); // { stage }

		const updated = await updateEnquiryStageService(
			idString,
			payload as any,
			req.userId,
		);

		if (!updated) {
			return res.status(404).json({
				success: false,
				message: "Enquiry not found",
			});
		}

		return res.status(200).json({
			success: true,
			message: "Enquiry stage updated successfully",
			data: {
				...toRow(updated),
				items: updated.items,
			},
		});
	} catch (err: any) {
		return res.status(400).json({
			success: false,
			message: err?.message || "Failed to update enquiry stage",
		});
	}
};

export const removeEnquiry = async (req: AuthRequest, res: Response) => {
	try {
		const idString = getParamId(req);

		const deleted = await deleteEnquiry(idString);
		if (!deleted) {
			return res.status(404).json({
				success: false,
				message: "Enquiry not found",
			});
		}

		return res.status(200).json({
			success: true,
			message: "Enquiry deleted successfully",
			data: { id: deleted._id },
		});
	} catch (err: any) {
		return res.status(400).json({
			success: false,
			message: err?.message || "Failed to delete enquiry",
		});
	}
};
