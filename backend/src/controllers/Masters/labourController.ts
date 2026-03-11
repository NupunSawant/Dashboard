import { Response } from "express";
import { AuthRequest } from "../../middleware/auth";
import {
	createLabour,
	deleteLabour,
	getLabourById,
	listLabours,
	updateLabour,
} from "../../services/Masters/labourService";
import { formatUser } from "../../utils/formatUser";

export const addLabour = async (req: AuthRequest, res: Response) => {
	const labour = await createLabour(req.body, req.userId);

	return res.status(201).json({
		success: true,
		message: "Labour created successfully",
		data: {
			id: labour._id,
			srNo: labour.srNo,
			labourName: labour.labourName,
			remark: labour.remark || "",
			contactNumber: labour.contactNumber || "",
			address: labour.address || "",
			panNumber: labour.panNumber || "",
			panDocument: labour.panDocument || "",
			aadharNumber: labour.aadharNumber || "",
			aadharDocument: labour.aadharDocument || "",
			state: labour.state || "",
			city: labour.city || "",
			country: labour.country || "",
			pincode: labour.pincode || "",
			createdAt: labour.createdAt,
			updatedAt: labour.updatedAt,
			createdBy: formatUser(labour.createdBy),
			updatedBy: formatUser(labour.updatedBy),
		},
	});
};

export const getLabours = async (_req: AuthRequest, res: Response) => {
	const labours = await listLabours();

	return res.status(200).json({
		success: true,
		data: labours.map((c: any) => ({
			id: c._id,
			srNo: c.srNo,
			labourName: c.labourName,
			remark: c.remark || "",
			contactNumber: c.contactNumber || "",
			panNumber: c.panNumber || "",
			panDocument: c.panDocument || "",
			aadharNumber: c.aadharNumber || "",
			aadharDocument: c.aadharDocument || "",
			address: c.address || "",
			state: c.state || "",
			city: c.city || "",
			country: c.country || "",
			pincode: c.pincode || "",
			createdAt: c.createdAt,
			updatedAt: c.updatedAt,
			createdBy: formatUser(c.createdBy),
			updatedBy: formatUser(c.updatedBy),
		})),
	});
};

export const getLabour = async (req: AuthRequest, res: Response) => {
	const labour = await getLabourById(String(req.params.id));

	return res.status(200).json({
		success: true,
		data: {
			id: labour._id,
			srNo: labour.srNo,
			labourName: labour.labourName,
			contactNumber: labour.contactNumber || "",
			panNumber: labour.panNumber || "",
			panDocument: labour.panDocument || "",
			aadharNumber: labour.aadharNumber || "",
			aadharDocument: labour.aadharDocument || "",
			remark: labour.remark || "",
			address: labour.address || "",
			state: labour.state || "",
			city: labour.city || "",
			country: labour.country || "",
			pincode: labour.pincode || "",
			createdAt: labour.createdAt,
			updatedAt: labour.updatedAt,
			createdBy: formatUser(labour.createdBy),
			updatedBy: formatUser(labour.updatedBy),
		},
	});
};

export const editLabour = async (req: AuthRequest, res: Response) => {
	const labour = await updateLabour(
		String(req.params.id),
		req.body,
		req.userId,
	);

	return res.status(200).json({
		success: true,
		message: "Labour updated",
		data: {
			id: labour._id,
			srNo: (labour as any).srNo,
			labourName: (labour as any).labourName,
			contactNumber: (labour as any).contactNumber || "",
			panNumber: (labour as any).panNumber || "",
			panDocument: (labour as any).panDocument || "",
			aadharNumber: (labour as any).aadharNumber || "",
			aadharDocument: (labour as any).aadharDocument || "",
			address: (labour as any).address || "",
			state: (labour as any).state || "",
			city: (labour as any).city || "",
			country: (labour as any).country || "",
			pincode: (labour as any).pincode || "",
			remark: (labour as any).remark || "",
			updatedAt: (labour as any).updatedAt,
			updatedBy: formatUser((labour as any).updatedBy),
		},
	});
};

export const removeLabour = async (req: AuthRequest, res: Response) => {
	await deleteLabour(String(req.params.id));

	return res.status(200).json({
		success: true,
		message: "Labour deleted",
	});
};
