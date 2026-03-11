import e, { Router } from "express";
import { authenticateToken } from "../../../middleware/auth";
import { validate } from "../../../middleware/validation";

import {
    createHsnCodeSchema,
    updateHsnCodeSchema,
} from "../../../validation/Masters/hsnCodeValidation";

import {
    addHSNCode,
    editHSNCode,
    getHSNCode,
    getHSNCodes,
    removeHSNCode,
} from "../../../controllers/Masters/HSNCodeController";

const router = Router();

router.use(authenticateToken);

router.post("/", validate(createHsnCodeSchema), addHSNCode);
router.get("/", getHSNCodes);
router.get("/:id", getHSNCode);
router.put("/:id", validate(updateHsnCodeSchema), editHSNCode);

router.delete("/:id", removeHSNCode);

export default router;