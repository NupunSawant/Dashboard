import { Router } from "express";
import { authenticateToken } from "../../../middleware/auth";
import { validate } from "../../../middleware/validation";

import {
	createUnitSchema,
	updateUnitSchema,
} from "../../../validation/Masters/unitValidation";

import {
	addUnit,
	editUnit,
	getUnit,
	getUnits,
	removeUnit,
} from "../../../controllers/Masters/unitController";

const router = Router();

router.use(authenticateToken);

router.post("/",validate(createUnitSchema), addUnit);
router.get("/", getUnits);
router.get("/:id", getUnit);
router.put("/:id", validate(updateUnitSchema), editUnit);

router.delete("/:id", removeUnit);

export default router;
