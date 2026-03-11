import { Response } from "express";
import { AuthRequest } from "../../middleware/auth";
import {
	createHSNCode,
	deleteHSNCode,
	getHSNCodeById,
	listHSNCodes,
	updateHSNCode,
} from "../../services/Masters/hsnCodeService";
import { success } from "zod";

const formatUser = (u?: any) => {
	if (!u) return null;
	const name = [u.firstName, u.lastName].filter(Boolean).join(" ") || u.userName;
	return { id: u._id, name: name || "-" };
};

export const addHSNCode = async (req: AuthRequest, res: Response) => {
	const { gstRate, hsnCode, hsnDescription } = req.body;
	const hsn = (await createHSNCode(
		{ gstRate, hsnCode, hsnDescription },
		req.userId,
	)) as any;

	if (!hsn) {
		return res
			.status(500)
			.json({ success: false, message: "Failed to create HSN Code" });
	}

	return res.status(201).json({
		success: true,
		message: "HSN Code created successfully",
		data: {
			id: hsn._id,
			srNo: hsn.srNo,
			gstRate: hsn.gstRate,
			hsnCode: hsn.hsnCode,
			hsnDescription: hsn.hsnDescription,
			createdAt: hsn.createdAt,
			updatedAt: hsn.updatedAt,
			createdBy: formatUser(hsn.createdBy),
			updatedBy: formatUser(hsn.updatedBy),
		},
	});
};

export const getHSNCodes = async (_req: AuthRequest, res: Response) => {
	const hsnCodes = await listHSNCodes();

	return res.status(200).json({
		success: true,
		data: hsnCodes.map((h: any) => ({
			id: h._id,
			srNo: h.srNo,
			gstRate: h.gstRate,
			hsnCode: h.hsnCode,
			hsnDescription: h.hsnDescription,
			createdAt: h.createdAt,
			updatedAt: h.updatedAt,
			createdBy: formatUser(h.createdBy),
			updatedBy: formatUser(h.updatedBy),
		})),
	});
};

export const getHSNCode = async (req: AuthRequest, res: Response) => {
	const hsn = await getHSNCodeById(String(req.params.id));

	return res.status(200).json({
		success: true,
		data: {
			id: hsn._id,
			srNo: hsn.srNo,
			gstRate: hsn.gstRate,
			hsnCode: hsn.hsnCode,
			hsnDescription: hsn.hsnDescription,
			createdAt: hsn.createdAt,
			updatedAt: hsn.updatedAt,
			createdBy: formatUser(hsn.createdBy),
			updatedBy: formatUser(hsn.updatedBy),
		},
	});
};

export const editHSNCode = async (req: AuthRequest, res: Response) => {
	const hsn = await updateHSNCode(String(req.params.id), req.body, req.userId);

	return res.status(200).json({
		success: true,
		message: "HSN Code updated successfully",
		data: {
			id: hsn._id,
			srNo: hsn.srNo,
			gstRate: hsn.gstRate,
			hsnCode: hsn.hsnCode,
			hsnDescription: hsn.hsnDescription,
			updatedAt: hsn.updatedAt,
			updatedBy: formatUser(hsn.updatedBy),
		},
	});
};

export const removeHSNCode = async (req: AuthRequest, res: Response) => {
	await deleteHSNCode(String(req.params.id));

	return res.status(200).json({
		success: true,
		message: "HSN Code deleted successfully",
	});
};
