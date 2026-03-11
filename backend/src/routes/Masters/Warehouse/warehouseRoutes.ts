import { Router } from "express";
import { authenticateToken } from "../../../middleware/auth";
import { validate } from "../../../middleware/validation";
import {
	createWarehouseSchema,
	updateWarehouseSchema,
} from "../../../validation/Masters/warehouseValidation";

import {
	addWarehouse,
	editWarehouse,
	getWarehouse,
	getWarehouses,
	removeWarehouse,
} from "../../../controllers/Masters/warehouseController";

const router = Router();

router.use(authenticateToken);

router.post("/", validate(createWarehouseSchema), addWarehouse);
router.get("/", getWarehouses);
router.get("/:id", getWarehouse);
router.put("/:id", validate(updateWarehouseSchema), editWarehouse);

router.delete("/:id", removeWarehouse);

export default router;