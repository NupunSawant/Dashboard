import { Router } from "express";
import { authenticateToken } from "../../../middleware/auth";
import { validate } from "../../../middleware/validation";
import {
	createLabourSchema,
	updateLabourSchema,
} from "../../../validation/Masters/labourValidation";
import {
	addLabour,
	getLabour,
	getLabours,
	editLabour,
	removeLabour,
} from "../../../controllers/Masters/labourController";
const router = Router();

router.use(authenticateToken);

router.post("/", validate(createLabourSchema), addLabour);
router.get("/", getLabours);
router.get("/:id", getLabour);
router.put("/:id", validate(updateLabourSchema), editLabour);

router.delete("/:id", removeLabour);

export default router;
