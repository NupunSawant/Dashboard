import { Router } from "express";
import { authenticateToken } from "../../middleware/auth";
import { validate } from "../../middleware/validation";
import {
	createEnquirySchema,
	updateEnquirySchema,
	updateEnquiryStageSchema, //   ADD
} from "../../validation/Order/enquiryValidation";
import {
	addEnquiry,
	editEnquiry,
	getEnquiry,
	getEnquiries,
	removeEnquiry,
	updateEnquiryStage, //   ADD
} from "../../controllers/Order/enquireController";

const router = Router();

router.post("/", authenticateToken, validate(createEnquirySchema), addEnquiry);
router.get("/", authenticateToken, getEnquiries);
router.get("/:id", authenticateToken, getEnquiry);

router.patch(
	"/:id/stage",
	authenticateToken,
	validate(updateEnquiryStageSchema),
	updateEnquiryStage,
);

router.put(
	"/:id",
	authenticateToken,
	validate(updateEnquirySchema),
	editEnquiry,
);
router.delete("/:id", authenticateToken, removeEnquiry);

export default router;
