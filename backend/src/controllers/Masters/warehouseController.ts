import { Response } from "express";
import { AuthRequest } from "../../middleware/auth";
import {
	createWarehouse,
	deleteWarehouse,
	getWarehouseById,
	listWarehouses,
	updateWarehouse,
} from "../../services/Masters/warehouseService";
import { id } from "zod/v4/locales";
import { success } from "zod";
import { formatUser } from "../../utils/formatUser";

export const addWarehouse = async (req: AuthRequest, res: Response) => {
	const warehouse = await createWarehouse(req.body, req.userId);

	res.status(201).json({
		success: true,
		message: "Warehouse created successfully",
		data: {
			id: warehouse._id,
			srNo: warehouse.srNo,
			warehouseName: warehouse.warehouseName,
			warehouseType: warehouse.warehouseType,
			warehouseAddress: warehouse.warehouseAddress,
			warehouseCity: warehouse.warehouseCity,
			warehouseState: warehouse.warehouseState,
			warehouseCountry: warehouse.warehouseCountry,
			warehousePincode: warehouse.warehousePincode,
			remarks: warehouse.remarks || "",
			createdAt: warehouse.createdAt,
			updatedAt: warehouse.updatedAt,
			createdBy: formatUser(warehouse.createdBy),
			updatedBy: formatUser(warehouse.updatedBy),
		},
	});
};

export const getWarehouses = async (_req: AuthRequest, res: Response) => {
	const warehouses = await listWarehouses();

	return res.status(200).json({
		success: true,
		data: warehouses.map((w: any) => ({
			id: w._id,
			srNo: w.srNo,
			warehouseName: w.warehouseName,
			warehouseType: w.warehouseType,
			warehouseAddress: w.warehouseAddress,
			warehouseCity: w.warehouseCity,
			warehouseState: w.warehouseState,
			warehouseCountry: w.warehouseCountry,
			warehousePincode: w.warehousePincode,
			remarks: w.remarks || "",
			createdAt: w.createdAt,
			updatedAt: w.updatedAt,
			createdBy: formatUser(w.createdBy),
			updatedBy: formatUser(w.updatedBy),
		})),
	});
};

export const getWarehouse = async (req: AuthRequest, res: Response) => {
	const warehouse = await getWarehouseById(String(req.params.id));

	return res.status(200).json({
		success: true,
		data: {
			id: warehouse._id,
			srNo: warehouse.srNo,
			warehouseName: warehouse.warehouseName,
			warehouseType: warehouse.warehouseType,
			warehouseAddress: warehouse.warehouseAddress,
			warehouseCity: warehouse.warehouseCity,
			warehouseState: warehouse.warehouseState,
			warehouseCountry: warehouse.warehouseCountry,
			warehousePincode: warehouse.warehousePincode,
			remarks: warehouse.remarks || "",
			createdAt: warehouse.createdAt,
			updatedAt: warehouse.updatedAt,
			createdBy: formatUser(warehouse.createdBy),
			updatedBy: formatUser(warehouse.updatedBy),
		},
	});
};

export const editWarehouse = async (req: AuthRequest, res: Response) => {
	const warehouse = await updateWarehouse(
		String(req.params.id),
		req.body,
		req.userId,
	);

	return res.status(200).json({
		success: true,
		message: "Warehouse updated successfully",
		data: {
			id: warehouse._id,
			srNo: warehouse.srNo,
			warehouseName: warehouse.warehouseName,
			warehouseType: warehouse.warehouseType,
			warehouseAddress: warehouse.warehouseAddress,
			warehouseCity: warehouse.warehouseCity,
			warehouseState: warehouse.warehouseState,
			warehouseCountry: warehouse.warehouseCountry,
			warehousePincode: warehouse.warehousePincode,
			remarks: warehouse.remarks || "",
			updatedAt: warehouse.updatedAt,
			updatedBy: formatUser(warehouse.updatedBy),
		},
	});
};

export const removeWarehouse = async (req: AuthRequest, res: Response) => {
	await deleteWarehouse(String(req.params.id));

	return res.status(200).json({
		success: true,
		message: "Warehouse deleted successfully",
	});
};
