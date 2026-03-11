import { Router } from "express";
import { authenticateToken } from "../../../middleware/auth";
import { validate } from "../../../middleware/validation";
import {
	createItemSchema,
	updateItemSchema,
} from "../../../validation/Masters/itemValidation";
import {
	addItem,
	getItems,
	getItem,
	editItem,
	removeItem,
} from "../../../controllers/Masters/itemController";

const router = Router();

//   Protect everything (must be logged in)
router.use(authenticateToken);

router.post("/", validate(createItemSchema), addItem);
router.get("/", getItems);
router.get("/:id", getItem);
router.put("/:id", validate(updateItemSchema), editItem);

router.delete("/:id", removeItem);

router.get("/ping", (_req, res) =>
	res.json({ ok: true, module: "masters-items" }),
);

export default router;
