// src/routes/Warehouse/WarehouseOverview/warehouseOverviewRoutes.ts

import { Router } from "express";
import { authenticateToken } from "../../../middleware/auth";
import {
	getDailyLog,
	getInStock,
} from "../../../controllers/Warehouse/warehouseOverviewController";

const router = Router();

// GET /warehouses/warehouse-overview/daily-log?warehouseName=XYZ
router.get("/daily-log", authenticateToken, getDailyLog);

// GET /warehouses/warehouse-overview/in-stock?warehouseName=XYZ
router.get("/in-stock", authenticateToken, getInStock);

export default router;
