import { Request, Response } from "express";
import {
	createIssueToLabour,
	getIssueToLabourById,
	listIssueToLabours,
	updateIssueToLabour,
	revertIssueToLabour,
	listPendingIssueToLabours,
	completeIssueToLabour,
} from "../../services/Warehouse/issueToLabourService";

const getUserId = (req: Request) => {
	const user = (req as any).user;
	return user?._id || user?.id || undefined;
};

export const getIssueToLabours = async (req: Request, res: Response) => {
	try {
		const data = await listIssueToLabours();
		return res.status(200).json({
			success: true,
			message: "Issue to labour list fetched successfully",
			data,
		});
	} catch (error: any) {
		return res.status(error?.statusCode || 500).json({
			success: false,
			message: error?.message || "Failed to fetch issue to labour list",
		});
	}
};

export const getIssueToLabour = async (req: Request, res: Response) => {
	try {
		const data = await getIssueToLabourById(String(req.params.id));
		return res.status(200).json({
			success: true,
			message: "Issue to labour fetched successfully",
			data,
		});
	} catch (error: any) {
		return res.status(error?.statusCode || 500).json({
			success: false,
			message: error?.message || "Failed to fetch issue to labour",
		});
	}
};

export const addIssueToLabour = async (req: Request, res: Response) => {
	try {
		const userId = getUserId(req);

		const created = await createIssueToLabour(
			{
				issueDate: req.body.issueDate,
				issueFromWarehouse: req.body.issueFromWarehouse,
				labourName: req.body.labourName,
				remarks: req.body.remarks,
				items: req.body.items || [],
			},
			userId,
		);

		return res.status(201).json({
			success: true,
			message: "Issue to labour created successfully",
			data: created,
		});
	} catch (error: any) {
		return res.status(error?.statusCode || 500).json({
			success: false,
			message: error?.message || "Failed to create issue to labour",
		});
	}
};

export const editIssueToLabour = async (req: Request, res: Response) => {
	try {
		const userId = getUserId(req);

		const updated = await updateIssueToLabour(
			String(req.params.id),
			{
				issueDate: req.body.issueDate,
				issueFromWarehouse: req.body.issueFromWarehouse,
				labourName: req.body.labourName,
				remarks: req.body.remarks,
				items: req.body.items,
			},
			userId,
		);

		return res.status(200).json({
			success: true,
			message: "Issue to labour updated successfully",
			data: updated,
		});
	} catch (error: any) {
		return res.status(error?.statusCode || 500).json({
			success: false,
			message: error?.message || "Failed to update issue to labour",
		});
	}
};

export const revertIssueToLabourById = async (
	req: Request,
	res: Response,
) => {
	try {
		const userId = getUserId(req);
		const updated = await revertIssueToLabour(String(req.params.id), userId);

		return res.status(200).json({
			success: true,
			message: "Issue to labour reverted successfully",
			data: updated,
		});
	} catch (error: any) {
		return res.status(error?.statusCode || 500).json({
			success: false,
			message: error?.message || "Failed to revert issue to labour",
		});
	}
};

export const getPendingIssueToLabours = async (
	req: Request,
	res: Response,
) => {
	try {
		const data = await listPendingIssueToLabours();
		return res.status(200).json({
			success: true,
			message: "Pending issue to labour list fetched successfully",
			data,
		});
	} catch (error: any) {
		return res.status(error?.statusCode || 500).json({
			success: false,
			message:
				error?.message || "Failed to fetch pending issue to labour list",
		});
	}
};

export const completeIssueToLabourById = async (
	req: Request,
	res: Response,
) => {
	try {
		const userId = getUserId(req);

		const completed = await completeIssueToLabour(
			String(req.params.id),
			{
				inwardDate: req.body.inwardDate,
				receivedByWarehouseName: req.body.receivedByWarehouseName,
				receivedBy: req.body.receivedBy,
				remarks: req.body.remarks,
				itemsDetails: req.body.itemsDetails || [],
				labourReturnedItems: req.body.labourReturnedItems || [],
			},
			userId,
		);

		return res.status(200).json({
			success: true,
			message: "Issue to labour completed successfully",
			data: completed,
		});
	} catch (error: any) {
		return res.status(error?.statusCode || 500).json({
			success: false,
			message: error?.message || "Failed to complete issue to labour",
		});
	}
};