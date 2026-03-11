import { Router } from "express";
import { authenticateToken } from "../../../middleware/auth";
import { validate } from "../../../middleware/validation";
import {
	createCustomerSchema,
	updateCustomerSchema,
} from "../../../validation/Masters/customerValidation";
import {
	addCustomer,
	editCustomer,
	getCustomer,
	getCustomers,
	removeCustomer,
} from "../../../controllers/Masters/customerController";

const router = Router();

router.use(authenticateToken);

router.post("/", validate(createCustomerSchema), addCustomer);
router.get("/", getCustomers);
router.get("/:id", getCustomer);
router.put("/:id", validate(updateCustomerSchema), editCustomer);

router.delete("/:id", removeCustomer);

export default router;