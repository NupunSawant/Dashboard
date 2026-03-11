import { Response } from "express";
import { AuthRequest } from "../../middleware/auth";
import {
	createitem,
	deleteItem,
	getItemById,
	listItems,
	updateItem,
} from "../../services/Masters/itemService";
import { formatUser } from "../../utils/formatUser";

export const addItem = async (req: AuthRequest, res: Response) => {
	const item = await createitem(req.body, req.userId);

	return res.status(201).json({
		success: true,
		message: "Item created successfully",
		data: {
			id: item._id,
			srNo: item.srNo,
			itemName: item.itemName,
			itemCode: item.itemCode,
			category: item.category,
			subCategory: item.subCategory || "",
			unit: item.unit,
			gst: item.gst || "0",
			remark: item.remark || "",
			createdAt: item.createdAt,
			updatedAt: item.updatedAt,
			createdBy: formatUser(item.createdBy),
			updatedBy: formatUser(item.updatedBy),
		},
	});
};

export const getItems = async (_req: AuthRequest, res: Response) => {
	const items = await listItems();

	return res.status(200).json({
		success: true,
		data: items.map((i: any) => ({
			id: i._id,
			srNo: i.srNo,
			itemName: i.itemName,
			itemCode: i.itemCode,
			category: i.category,
			subCategory: i.subCategory || "",
			unit: i.unit,
			gst: i.gst || "0",
			remark: i.remark || "",
			createdAt: i.createdAt,
			updatedAt: i.updatedAt,
			createdBy: formatUser(i.createdBy),
			updatedBy: formatUser(i.updatedBy),
		})),
	});
};

export const getItem = async (req: AuthRequest, res: Response) => {
	const item = await getItemById(String(req.params.id));

	return res.status(200).json({
		success: true,
		data: {
			id: item._id,
			srNo: item.srNo,
			itemName: item.itemName,
			itemCode: item.itemCode,
			category: item.category,
			subCategory: item.subCategory || "",
			unit: item.unit,
			gst: item.gst || "0",
			remark: item.remark || "",
			createdAt: item.createdAt,
			updatedAt: item.updatedAt,
			createdBy: formatUser(item.createdBy),
			updatedBy: formatUser(item.updatedBy),
		},
	});
};

export const editItem = async (req: AuthRequest, res: Response) => {
	const item = await updateItem(String(req.params.id), req.body, req.userId);

	return res.status(200).json({
		success: true,
		message: "Item updated",
		data: {
			id: item._id,
			srNo: item.srNo,
			itemName: item.itemName,
			itemCode: item.itemCode,
			category: item.category,
			subCategory: item.subCategory || "",
			unit: item.unit,
			gst: item.gst || "0",
			remark: item.remark || "",
			updatedAt: item.updatedAt,
			updatedBy: formatUser(item.updatedBy),
		},
	});
};

export const removeItem = async (req: AuthRequest, res: Response) => {
	await deleteItem(String(req.params.id));

	return res.status(200).json({
		success: true,
		message: "Item deleted",
	});
};
