import { Router } from "express";
import { authenticateToken } from "../../../middleware/auth";
import { validate } from "../../../middleware/validation";

import {
	createGstSchema,
	updateGstSchema,
} from "../../../validation/Masters/gstValidation";

import {
	addGST,
	editGST,
	getGST,
	getGSTs,
	removeGST,
} from "../../../controllers/Masters/gstController";

const router = Router();

router.use(authenticateToken);

router.post("/", validate(createGstSchema), addGST);
router.get("/", getGSTs);
router.get("/:id", getGST);
router.put("/:id", validate(updateGstSchema), editGST);

router.delete("/:id", removeGST);

export default router;