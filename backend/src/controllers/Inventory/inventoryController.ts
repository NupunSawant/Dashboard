// src/controllers/Inventory/inventoryController.ts
import { Response } from "express";
import { AuthRequest } from "../../middleware/auth";
import {
	createInventory,
	deleteInventory,
	getInventoryById,
	getStockOverview,
	getWarehouseStockByItem,
	getWarehouseStockList,
	listInventories,
	updateInventory,
} from "../../services/Inventory/inventoryService";
import { formatUser } from "../../utils/formatUser";

export const addInventory = async (req: AuthRequest, res: Response) => {
	const {
		itemName,
		warehouseName,
		category,
		subCategory,
		unit,
		availableQuantity,
	} = req.body;

	const inventory = (await createInventory(
		{
			itemName,
			warehouseName,
			category,
			subCategory,
			unit,
			availableQuantity,
		},
		req.userId,
	)) as any;

	if (!inventory) {
		return res
			.status(500)
			.json({ success: false, message: "Failed to create Inventory" });
	}

	return res.status(201).json({
		success: true,
		message: "Inventory created successfully",
		data: {
			id: inventory._id,
			srNo: inventory.srNo,
			itemName: inventory.itemName,
			category: inventory.category,
			subCategory: inventory.subCategory,
			unit: inventory.unit,
			receivedQuantity: Number(inventory.receivedQuantity ?? 0),
			reservedQuantity: Number(inventory.reservedQuantity ?? 0),
			availableQuantity: Number(inventory.availableQuantity ?? 0),
			createdAt: inventory.createdAt,
			updatedAt: inventory.updatedAt,
			createdBy: formatUser(inventory.createdBy),
			updatedBy: formatUser(inventory.updatedBy),
		},
	});
};

export const getInventories = async (_req: AuthRequest, res: Response) => {
	const inventories = await listInventories();

	return res.status(200).json({
		success: true,
		data: inventories.map((i: any) => ({
			id: i._id,
			srNo: i.srNo,
			itemName: i.itemName,
			warehouseName: i.warehouseName,
			warehouseKey: i.warehouseKey,
			category: i.category,
			subCategory: i.subCategory,
			unit: i.unit,
			receivedQuantity: Number(i.receivedQuantity ?? 0),
			reservedQuantity: Number(i.reservedQuantity ?? 0),
			availableQuantity: Number(i.availableQuantity ?? 0),
			createdAt: i.createdAt,
			updatedAt: i.updatedAt,
			createdBy: formatUser(i.createdBy),
			updatedBy: formatUser(i.updatedBy),
		})),
	});
};

export const getInventory = async (req: AuthRequest, res: Response) => {
	const inventory: any = await getInventoryById(String(req.params.id));

	return res.status(200).json({
		success: true,
		data: {
			id: inventory._id,
			srNo: inventory.srNo,
			itemName: inventory.itemName,
			warehouseName: inventory.warehouseName,
			warehouseKey: inventory.warehouseKey,
			category: inventory.category,
			subCategory: inventory.subCategory,
			unit: inventory.unit,
			receivedQuantity: Number(inventory.receivedQuantity ?? 0),
			reservedQuantity: Number(inventory.reservedQuantity ?? 0),
			availableQuantity: Number(inventory.availableQuantity ?? 0),
		},
	});
};

export const getInventoryStockOverview = async (
	_req: AuthRequest,
	res: Response,
) => {
	const rows = await getStockOverview();

	return res.status(200).json({
		success: true,
		data: rows,
	});
};

export const getInventoryWarehouseStock = async (
	_req: AuthRequest,
	res: Response,
) => {
	const rows = await getWarehouseStockList();

	return res.status(200).json({
		success: true,
		data: rows,
	});
};

export const getInventoryWarehouseStockItem = async (
	req: AuthRequest,
	res: Response,
) => {
	const data = await getWarehouseStockByItem(String(req.params.itemId));

	return res.status(200).json({
		success: true,
		data,
	});
};

export const editInventory = async (req: AuthRequest, res: Response) => {
	const inventory: any = await updateInventory(
		String(req.params.id),
		req.body,
		req.userId,
	);

	return res.status(200).json({
		success: true,
		message: "Inventory updated successfully",
		data: {
			id: inventory._id,
			srNo: inventory.srNo,
			itemName: inventory.itemName,
			category: inventory.category,
			subCategory: inventory.subCategory,
			unit: inventory.unit,
			receivedQuantity: Number(inventory.receivedQuantity ?? 0),
			reservedQuantity: Number(inventory.reservedQuantity ?? 0),
			availableQuantity: Number(inventory.availableQuantity ?? 0),
		},
	});
};

export const removeInventory = async (req: AuthRequest, res: Response) => {
	await deleteInventory(String(req.params.id));

	return res.status(200).json({
		success: true,
		message: "Inventory deleted successfully",
	});
};
