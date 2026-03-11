// controllers/Inventory/ReorderLevel/reorderLevelController.ts

import { Response } from "express";
import { AuthRequest } from "../../middleware/auth"
import { formatUser } from "../../utils/formatUser";
import {
	createItemWiseReorderLevel,
	deleteItemWiseReorderLevel,
	getItemWiseReorderLevelById,
	getWarehouseWiseReorderLevelById,
	listItemWiseReorderLevels,
	listWarehouseWiseReorderLevels,
	updateItemWiseReorderLevel,
	updateWarehouseWiseReorderLevel,
	createWarehouseWiseReorderLevel,
	deleteWarehouseWiseReorderLevel,
} from "../../services/Inventory/reorderLevelService"

const mapItemWiseRow = (row: any) => ({
	id: row.id || row._id,
	srNo: Number(row.srNo ?? 0),
	itemName: row.itemName || "",
	itemCode: row.itemCode || "",
	category: row.category || "",
	subCategory: row.subCategory || "",
	unit: row.unit || "",
	totalStock: Number(row.totalStock ?? 0),
	reorderLevel: Number(row.reorderLevel ?? 0),
	status: row.status || "OUT_OF_STOCK",
	createdAt: row.createdAt,
	updatedAt: row.updatedAt,
	createdBy: formatUser(row.createdBy),
	updatedBy: formatUser(row.updatedBy),
});

const mapWarehouseWiseRow = (row: any) => ({
	id: row.id || row._id,
	srNo: Number(row.srNo ?? 0),
	itemName: row.itemName || "",
	itemCode: row.itemCode || "",
	category: row.category || "",
	subCategory: row.subCategory || "",
	unit: row.unit || "",
	warehouseName: row.warehouseName || "",
	warehouseStock: Number(row.warehouseStock ?? 0),
	reorderLevel: Number(row.reorderLevel ?? 0),
	status: row.status || "OUT_OF_STOCK",
	createdAt: row.createdAt,
	updatedAt: row.updatedAt,
	createdBy: formatUser(row.createdBy),
	updatedBy: formatUser(row.updatedBy),
});

// ======================================================
// ITEM WISE
// ======================================================

export const addItemWiseReorderLevel = async (
	req: AuthRequest,
	res: Response,
) => {
	try {
		const reorder = await createItemWiseReorderLevel(req.body, req.userId);

		return res.status(201).json({
			success: true,
			message: "Item-wise reorder level created successfully",
			data: mapItemWiseRow(reorder),
		});
	} catch (error: any) {
		return res.status(error?.statusCode || 500).json({
			success: false,
			message: error.message || "Failed to create item-wise reorder level",
		});
	}
};

export const getItemWiseReorderLevels = async (
	_req: AuthRequest,
	res: Response,
) => {
	try {
		const rows = await listItemWiseReorderLevels();

		return res.status(200).json({
			success: true,
			data: (rows || []).map(mapItemWiseRow),
		});
	} catch (error: any) {
		return res.status(error?.statusCode || 500).json({
			success: false,
			message: error.message || "Failed to list item-wise reorder levels",
		});
	}
};

export const getItemWiseReorderLevel = async (
	req: AuthRequest,
	res: Response,
) => {
	try {
		const row = await getItemWiseReorderLevelById(String(req.params.id));

		return res.status(200).json({
			success: true,
			data: mapItemWiseRow(row),
		});
	} catch (error: any) {
		return res.status(error?.statusCode || 500).json({
			success: false,
			message: error.message || "Failed to get item-wise reorder level",
		});
	}
};

export const editItemWiseReorderLevel = async (
	req: AuthRequest,
	res: Response,
) => {
	try {
		const row = await updateItemWiseReorderLevel(
			String(req.params.id),
			req.body,
			req.userId,
		);

		return res.status(200).json({
			success: true,
			message: "Item-wise reorder level updated successfully",
			data: mapItemWiseRow(row),
		});
	} catch (error: any) {
		return res.status(error?.statusCode || 500).json({
			success: false,
			message: error.message || "Failed to update item-wise reorder level",
		});
	}
};

export const removeItemWiseReorderLevel = async (
	req: AuthRequest,
	res: Response,
) => {
	try {
		await deleteItemWiseReorderLevel(String(req.params.id));

		return res.status(200).json({
			success: true,
			message: "Item-wise reorder level deleted successfully",
		});
	} catch (error: any) {
		return res.status(error?.statusCode || 500).json({
			success: false,
			message: error.message || "Failed to delete item-wise reorder level",
		});
	}
};

// ======================================================
// WAREHOUSE WISE
// ======================================================

export const addWarehouseWiseReorderLevel = async (
	req: AuthRequest,
	res: Response,
) => {
	try {
		const reorder = await createWarehouseWiseReorderLevel(req.body, req.userId);

		return res.status(201).json({
			success: true,
			message: "Warehouse-wise reorder level created successfully",
			data: mapWarehouseWiseRow(reorder),
		});
	} catch (error: any) {
		return res.status(error?.statusCode || 500).json({
			success: false,
			message: error.message || "Failed to create warehouse-wise reorder level",
		});
	}
};

export const getWarehouseWiseReorderLevels = async (
	req: AuthRequest,
	res: Response,
) => {
	try {
		const warehouseName = String(req.query.warehouseName ?? "").trim();
		const rows = await listWarehouseWiseReorderLevels(warehouseName);

		return res.status(200).json({
			success: true,
			data: (rows || []).map(mapWarehouseWiseRow),
		});
	} catch (error: any) {
		return res.status(error?.statusCode || 500).json({
			success: false,
			message: error.message || "Failed to list warehouse-wise reorder levels",
		});
	}
};

export const getWarehouseWiseReorderLevel = async (
	req: AuthRequest,
	res: Response,
) => {
	try {
		const row = await getWarehouseWiseReorderLevelById(String(req.params.id));

		return res.status(200).json({
			success: true,
			data: mapWarehouseWiseRow(row),
		});
	} catch (error: any) {
		return res.status(error?.statusCode || 500).json({
			success: false,
			message: error.message || "Failed to get warehouse-wise reorder level",
		});
	}
};

export const editWarehouseWiseReorderLevel = async (
	req: AuthRequest,
	res: Response,
) => {
	try {
		const row = await updateWarehouseWiseReorderLevel(
			String(req.params.id),
			req.body,
			req.userId,
		);

		return res.status(200).json({
			success: true,
			message: "Warehouse-wise reorder level updated successfully",
			data: mapWarehouseWiseRow(row),
		});
	} catch (error: any) {
		return res.status(error?.statusCode || 500).json({
			success: false,
			message: error.message || "Failed to update warehouse-wise reorder level",
		});
	}
};

export const removeWarehouseWiseReorderLevel = async (
	req: AuthRequest,
	res: Response,
) => {
	try {
		await deleteWarehouseWiseReorderLevel(String(req.params.id));

		return res.status(200).json({
			success: true,
			message: "Warehouse-wise reorder level deleted successfully",
		});
	} catch (error: any) {
		return res.status(error?.statusCode || 500).json({
			success: false,
			message: error.message || "Failed to delete warehouse-wise reorder level",
		});
	}
};
