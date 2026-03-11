import { Router } from "express";
import { authenticateToken } from "../../../middleware/auth";
import { validate } from "../../../middleware/validation";
import {
	createWarehouseInwardSchema,
	updateWarehouseInwardSchema,
} from "../../../validation/Warehouse/warehouseInwardValidation";
import {
	addWarehouseInward,
	getWarehouseInwards,
	getWarehouseInward,
	editWarehouseInward,
	removeWarehouseInward,
} from "../../../controllers/Warehouse/warehouseInwardController";

import { getPendingSalesReturnDispatches } from "../../../controllers/Dispatch/dispatchController";

const router = Router();

// Protected
router.use(authenticateToken);

// Pending Sales Return Dispatches (for inward screen)
router.get("/pending-sales-return", getPendingSalesReturnDispatches);

// Warehouse inward list
router.get("/", getWarehouseInwards);

// Create inward
router.post("/", validate(createWarehouseInwardSchema), addWarehouseInward);

// View inward
router.get("/:id", getWarehouseInward);

// Update inward
router.put("/:id", validate(updateWarehouseInwardSchema), editWarehouseInward);

// Delete inward
router.delete("/:id", removeWarehouseInward);

export default router;
