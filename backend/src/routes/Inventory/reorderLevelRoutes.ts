import { Router } from "express";
import { authenticateToken } from "../../middleware/auth";

import {
	addItemWiseReorderLevel,
	editItemWiseReorderLevel,
	getItemWiseReorderLevels,
	getItemWiseReorderLevel,
	removeItemWiseReorderLevel,
	addWarehouseWiseReorderLevel,
	editWarehouseWiseReorderLevel,
	getWarehouseWiseReorderLevels,
	getWarehouseWiseReorderLevel,
	removeWarehouseWiseReorderLevel,
} from "../../controllers/Inventory/reorderLevelController"

const router = Router();

router.use(authenticateToken);

// ======================================================
// ITEM WISE
// ======================================================

router.post("/item-wise", addItemWiseReorderLevel);

router.get("/item-wise", getItemWiseReorderLevels);

router.get("/item-wise/:id", getItemWiseReorderLevel);

router.put("/item-wise/:id", editItemWiseReorderLevel);

router.delete("/item-wise/:id", removeItemWiseReorderLevel);

// ======================================================
// WAREHOUSE WISE
// ======================================================

router.post("/warehouse-wise", addWarehouseWiseReorderLevel);

router.get("/warehouse-wise", getWarehouseWiseReorderLevels);

router.get("/warehouse-wise/:id", getWarehouseWiseReorderLevel);

router.put("/warehouse-wise/:id", editWarehouseWiseReorderLevel);

router.delete("/warehouse-wise/:id", removeWarehouseWiseReorderLevel);

export default router;
