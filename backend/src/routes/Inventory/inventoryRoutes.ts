import { Router } from "express";
import { authenticateToken } from "../../middleware/auth";
import { validate } from "../../middleware/validation";

import {
	createInventorySchema,
	updateInventorySchema,
} from "../../validation/Inventory/inventoryValidation";

import {
	addInventory,
	editInventory,
	getInventories,
	getInventory,
	getInventoryStockOverview,
	getInventoryWarehouseStock,
	getInventoryWarehouseStockItem,
	removeInventory,
} from "../../controllers/Inventory/inventoryController";

const router = Router();

router.use(authenticateToken);

router.post("/", validate(createInventorySchema), addInventory);

// new grouped stock routes
router.get("/stock-overview", getInventoryStockOverview);
router.get("/warehouse-stock", getInventoryWarehouseStock);
router.get("/warehouse-stock/:itemId", getInventoryWarehouseStockItem);

// existing routes
router.get("/", getInventories);
router.get("/:id", getInventory);
router.put("/:id", validate(updateInventorySchema), editInventory);
router.delete("/:id", removeInventory);

export default router;
