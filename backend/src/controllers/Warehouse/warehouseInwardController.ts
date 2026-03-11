import { Response } from "express";
import { AuthRequest } from "../../middleware/auth";
import {
	createWarehouseInward,
	deleteWarehouseInward,
	getWarehouseInwardById,
	listWarehouseInwards,
	updateWarehouseInward,
} from "../../services/Warehouse/warehouseInwardService";
import { formatUser } from "../../utils/formatUser";
import {
	createWarehouseInwardSchema,
	updateWarehouseInwardSchema,
} from "../../validation/Warehouse/warehouseInwardValidation";
import { z } from "zod";

export const addWarehouseInward = async (req: AuthRequest, res: Response) => {
	try {
		const payload = createWarehouseInwardSchema.parse(req.body);

		const inward = await createWarehouseInward(payload as any, req.userId);

		return res.status(201).json({
			success: true,
			message: "Warehouse inward created successfully",
			data: {
				id: inward._id,
				srNo: inward.srNo,
				grnNo: inward.grnNo,

				inwardType: inward.inwardType,
				inwardDate: inward.inwardDate,
				receivedBy: inward.receivedBy,
				remarks: inward.remarks || "",

				invoiceNo: inward.invoiceNo || "",
				supplierName: inward.supplierName || "",
				warehouseName: inward.warehouseName || "",

				sourceDispatchId: (inward as any).sourceDispatchId || null,
				dispatchNo: (inward as any).dispatchNo || "",

				items: (inward as any).items || [],

				createdAt: inward.createdAt,
				updatedAt: inward.updatedAt,
				createdBy: formatUser(inward.createdBy),
				updatedBy: formatUser(inward.updatedBy),
			},
		});
	} catch (error: any) {
		if (error instanceof z.ZodError) {
			return res.status(400).json({
				success: false,
				message: "Validation failed",
				errors: error.issues.map((e) => ({
					path: e.path.join("."),
					message: e.message,
				})),
			});
		}
		return res.status(500).json({
			success: false,
			message: error.message || "Failed to create warehouse inward",
		});
	}
};

export const getWarehouseInwards = async (_req: AuthRequest, res: Response) => {
	try {
		const inwards = await listWarehouseInwards();

		if (!inwards) {
			return res.status(200).json({
				success: true,
				data: [],
			});
		}

		return res.status(200).json({
			success: true,
			data: inwards.map((w: any) => ({
				id: w._id,
				srNo: w.srNo,
				grnNo: w.grnNo,

				inwardType: w.inwardType,
				inwardDate: w.inwardDate,
				receivedBy: w.receivedBy,
				remarks: w.remarks || "",

				invoiceNo: w.invoiceNo || "",
				supplierName: w.supplierName || "",
				warehouseName: w.warehouseName || "",

				sourceDispatchId:
					typeof w.sourceDispatchId === "object"
						? w.sourceDispatchId?._id || null
						: w.sourceDispatchId || null,
				dispatchNo:
					w.dispatchNo ||
					(typeof w.sourceDispatchId === "object"
						? w.sourceDispatchId?.dispatchNo || ""
						: ""),

				itemsCategory: w.itemsCategory || "",
				itemsSubCategory: w.itemsSubCategory || "",
				itemsName: w.itemsName || "",
				itemsCode: w.itemsCode || "",
				itemsQuantity: w.itemsQuantity || 0,
				itemsUnit: w.itemsUnit || "",
				itemsRate: w.itemsRate || 0,
				itemsAmount: w.itemsAmount || 0,
				itemsRemark: w.itemsRemark || "",

				createdAt: w.createdAt,
				updatedAt: w.updatedAt,
				createdBy: formatUser(w.createdBy),
				updatedBy: formatUser(w.updatedBy),
			})),
		});
	} catch (error: any) {
		return res.status(500).json({
			success: false,
			message: error.message || "Failed to list warehouse inwards",
		});
	}
};

export const getWarehouseInward = async (req: AuthRequest, res: Response) => {
	try {
		const inward = await getWarehouseInwardById(String(req.params.id));

		if (!inward) {
			return res.status(404).json({
				success: false,
				message: "Warehouse inward not found",
			});
		}

		return res.status(200).json({
			success: true,
			data: {
				id: inward._id,
				srNo: inward.srNo,
				grnNo: inward.grnNo,

				inwardType: inward.inwardType,
				inwardDate: inward.inwardDate,
				receivedBy: inward.receivedBy,
				remarks: inward.remarks || "",

				invoiceNo: inward.invoiceNo || "",
				supplierName: inward.supplierName || "",
				warehouseName: inward.warehouseName || "",

				sourceDispatchId:
					typeof (inward as any).sourceDispatchId === "object"
						? (inward as any).sourceDispatchId?._id || null
						: (inward as any).sourceDispatchId || null,
				dispatchNo:
					(inward as any).dispatchNo ||
					(typeof (inward as any).sourceDispatchId === "object"
						? (inward as any).sourceDispatchId?.dispatchNo || ""
						: ""),

				items: (inward as any).items || [],

				createdAt: inward.createdAt,
				updatedAt: inward.updatedAt,
				createdBy: formatUser(inward.createdBy),
				updatedBy: formatUser(inward.updatedBy),
			},
		});
	} catch (error: any) {
		return res.status(500).json({
			success: false,
			message: error.message || "Failed to get warehouse inward",
		});
	}
};

export const editWarehouseInward = async (req: AuthRequest, res: Response) => {
	try {
		const payload = updateWarehouseInwardSchema.parse(req.body);

		const inward = await updateWarehouseInward(
			String(req.params.id),
			payload as any,
			req.userId,
		);

		return res.status(200).json({
			success: true,
			message: "Warehouse inward updated",
			data: {
				id: inward._id,
				srNo: (inward as any).srNo,
				grnNo: (inward as any).grnNo,

				inwardType: (inward as any).inwardType,
				inwardDate: (inward as any).inwardDate,
				receivedBy: (inward as any).receivedBy,
				remarks: (inward as any).remarks || "",

				invoiceNo: (inward as any).invoiceNo || "",
				supplierName: (inward as any).supplierName || "",
				warehouseName: (inward as any).warehouseName || "",

				sourceDispatchId:
					typeof (inward as any).sourceDispatchId === "object"
						? (inward as any).sourceDispatchId?._id || null
						: (inward as any).sourceDispatchId || null,
				dispatchNo:
					(inward as any).dispatchNo ||
					(typeof (inward as any).sourceDispatchId === "object"
						? (inward as any).sourceDispatchId?.dispatchNo || ""
						: ""),

				items: (inward as any).items || [],

				updatedAt: (inward as any).updatedAt,
				updatedBy: formatUser((inward as any).updatedBy),
			},
		});
	} catch (error: any) {
		if (error instanceof z.ZodError) {
			return res.status(400).json({
				success: false,
				message: "Validation failed",
				errors: error.issues.map((e) => ({
					path: e.path.join("."),
					message: e.message,
				})),
			});
		}
		return res.status(500).json({
			success: false,
			message: error.message || "Failed to update warehouse inward",
		});
	}
};

export const removeWarehouseInward = async (
	req: AuthRequest,
	res: Response,
) => {
	try {
		await deleteWarehouseInward(String(req.params.id), req.userId);

		return res.status(200).json({
			success: true,
			message: "Warehouse inward deleted",
		});
	} catch (error: any) {
		return res.status(500).json({
			success: false,
			message: error.message || "Failed to delete warehouse inward",
		});
	}
};