import { Response } from "express";
import { AuthRequest } from "../../middleware/auth";
import {
	createGST,
	deleteGST,
	getGSTById,
	listGSTs,
	updateGST,
} from "../../services/Masters/gstService";
import { formatUser } from "../../utils/formatUser";

export const addGST = async (req: AuthRequest, res: Response) => {
	const { gstRate, remark } = req.body;
	const gst = (await createGST({ gstRate, remark }, req.userId)) as any;

	if (!gst) {
		return res
			.status(500)
			.json({ success: false, message: "Failed to create GST" });
	}

	return res.status(201).json({
		success: true,
		message: "GST created successfully",
		data: {
			id: gst._id,
			srNo: gst.srNo,
			gstRate: gst.gstRate,
			remark: gst.remark,
			createdAt: gst.createdAt,
			updatedAt: gst.updatedAt,
			createdBy: formatUser(gst.createdBy),
			updatedBy: formatUser(gst.updatedBy),
		},
	});
};

export const getGSTs = async (_req: AuthRequest, res: Response) => {
	const gsts = await listGSTs();

	return res.status(200).json({
		success: true,
		data: gsts.map((g: any) => ({
			id: g._id,
			srNo: g.srNo,
			gstRate: g.gstRate,
			remark: g.remark,
			createdAt: g.createdAt,
			updatedAt: g.updatedAt,
			createdBy: formatUser(g.createdBy),
			updatedBy: formatUser(g.updatedBy),
		})),
	});
};

export const getGST = async (req: AuthRequest, res: Response) => {
	const gst = await getGSTById(String(req.params.id));

	return res.status(200).json({
		success: true,
		data: {
			id: gst._id,
			srNo: gst.srNo,
			gstRate: gst.gstRate,
			remark: gst.remark,
			createdAt: gst.createdAt,
			updatedAt: gst.updatedAt,
			createdBy: formatUser(gst.createdBy),
			updatedBy: formatUser(gst.updatedBy),
		},
	});
};

export const editGST = async (req: AuthRequest, res: Response) => {
	const gst = await updateGST(String(req.params.id), req.body, req.userId);

	return res.status(200).json({
		success: true,
		message: "GST updated successfully",
		data: {
			id: gst._id,
			srNo: gst.srNo,
			gstRate: gst.gstRate,
			remark: gst.remark,
			updatedAt: gst.updatedAt,
			updatedBy: formatUser(gst.updatedBy),
		},
	});
};

export const removeGST = async (req: AuthRequest, res: Response) => {
	await deleteGST(String(req.params.id));

	return res.status(200).json({
		success: true,
		message: "GST deleted successfully",
	});
};
