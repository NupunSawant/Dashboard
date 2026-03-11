import { Router } from "express";
import { authenticateToken } from "../../../middleware/auth";
import { validate } from "../../../middleware/validation";

import {
	createSubCategorySchema,
	updateSubCategorySchema,
} from "../../../validation/Masters/subCategoryValidation";

import {
	addSubCategory,
	editSubCategory,
	getSubCategories,
	getSubCategory,
	removeSubCategory,
} from "../../../controllers/Masters/subCategoryController";

const router = Router();

router.use(authenticateToken);

router.post("/", validate(createSubCategorySchema), addSubCategory);
router.get("/", getSubCategories);
router.get("/:id", getSubCategory);
router.put("/:id", validate(updateSubCategorySchema), editSubCategory);

router.delete("/:id", removeSubCategory);

export default router;
