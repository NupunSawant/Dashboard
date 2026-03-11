import { Router } from "express";
import { authenticateToken } from "../../../middleware/auth";
import { validate } from "../../../middleware/validation";
import {
	createIssueToLabourSchema,
	updateIssueToLabourSchema,
	completeIssueToLabourSchema,
} from "../../../validation/Warehouse/issueToLabourValidation";
import {
	getIssueToLabours,
	getIssueToLabour,
	addIssueToLabour,
	editIssueToLabour,
	revertIssueToLabourById,
	getPendingIssueToLabours,
	completeIssueToLabourById,
} from "../../../controllers/Warehouse/issueToLabourController";

const router = Router();

router.use(authenticateToken);

router.get("/ping", (_req, res) =>
	res.json({ ok: true, module: "issueToLabour" }),
);

// Pending list for Warehouse Inward pending labour inward tab
router.get("/pending", getPendingIssueToLabours);

// List all
router.get("/", getIssueToLabours);

// Create
router.post("/", validate(createIssueToLabourSchema), addIssueToLabour);

// Get one
router.get("/:id", getIssueToLabour);

// Edit
router.put("/:id", validate(updateIssueToLabourSchema), editIssueToLabour);

// Revert
router.patch("/:id/revert", revertIssueToLabourById);

// Complete / Create GRN
router.patch(
	"/:id/complete",
	validate(completeIssueToLabourSchema),
	completeIssueToLabourById,
);

export default router;