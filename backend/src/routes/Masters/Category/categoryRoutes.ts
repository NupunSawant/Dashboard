import { Router } from "express";
import { authenticateToken } from "../../../middleware/auth";
import { validate } from "../../../middleware/validation";
import {
	createCategorySchema,
	updatedCategorySchema,
} from "../../../validation/Masters/categoryValidation";
import {
	addCategory,
	editCategory,
	getCategory,
	getCategories,
	removeCategory,
} from "../../../controllers/Masters/categoryController";

const router = Router();

router.use(authenticateToken);

router.post("/", validate(createCategorySchema), addCategory);
router.get("/", getCategories);
router.get("/:id", getCategory);
router.put("/:id", validate(updatedCategorySchema), editCategory);

router.delete("/:id", removeCategory);

export default router;
