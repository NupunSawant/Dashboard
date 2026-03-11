import { Router } from "express";
import { authenticateToken } from "../../../middleware/auth";
import { validate } from "../../../middleware/validation";
import {
	createSupplierSchema,
	updateSupplierSchema,
} from "../../../validation/Masters/supplierValidation";
import {
	addSupplier,
	editSupplier,
	getSupplier,
	getSuppliers,
	removeSupplier,
} from "../../../controllers/Masters/supplierController";

const router = Router();

router.use(authenticateToken);

router.post("/", validate(createSupplierSchema), addSupplier);
router.get("/", getSuppliers);
router.get("/:id", getSupplier);
router.put("/:id", validate(updateSupplierSchema), editSupplier);

router.delete("/:id", removeSupplier);

export default router;
