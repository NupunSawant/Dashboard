// src/controllers/Inventory/warehouseOverviewController.ts

import { Response } from "express";
import { AuthRequest } from "../../middleware/auth";
import {
	getWarehouseOverviewDailyLog,
	getWarehouseOverviewInStock,
} from "../../services/Warehouse/warehouseOverview";

/**
 * GET /warehouses/warehouse-overview/daily-log?warehouseName=XYZ
 */
export const getDailyLog = async (req: AuthRequest, res: Response) => {
	try {
		const warehouseName = String(req.query.warehouseName ?? "").trim();

		if (!warehouseName) {
			return res.status(400).json({
				success: false,
				message: "warehouseName query param is required",
			});
		}

		const data = await getWarehouseOverviewDailyLog(warehouseName);

		return res.status(200).json({
			success: true,
			data,
		});
	} catch (error: any) {
		return res.status(500).json({
			success: false,
			message: error.message || "Failed to fetch daily log",
		});
	}
};

/**
 * GET /warehouses/warehouse-overview/in-stock?warehouseName=XYZ
 */
export const getInStock = async (req: AuthRequest, res: Response) => {
	try {
		const warehouseName = String(req.query.warehouseName ?? "").trim();

		if (!warehouseName) {
			return res.status(400).json({
				success: false,
				message: "warehouseName query param is required",
			});
		}

		const data = await getWarehouseOverviewInStock(warehouseName);

		return res.status(200).json({
			success: true,
			data,
		});
	} catch (error: any) {
		return res.status(500).json({
			success: false,
			message: error.message || "Failed to fetch in-stock data",
		});
	}
};
