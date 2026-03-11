import { Router } from "express";
import { authenticateToken } from "../../../middleware/auth";
import {
	addDispatch,
	getDispatch,
	getDispatches,
	getReadyToDispatch,
	deliverDispatch,
	revertReadyDispatch,
	getPendingSalesReturnDispatches,
	processDispatchSalesReturn,
	completeDispatchSalesReturnInward,
} from "../../../controllers/Dispatch/dispatchController";

const router = Router();
router.use(authenticateToken);

// Health
router.get("/ping", (_req, res) => res.json({ ok: true, module: "dispatch" }));

// Ready to dispatch (temporary order-like rows)
router.get("/ready", getReadyToDispatch);

// Revert ready to dispatch by READY ROW ID / temporary ORDER ID
router.patch("/ready-to-dispatch/revert/:id", revertReadyDispatch);

// Pending sales return dispatches
router.get("/pending-sales-return", getPendingSalesReturnDispatches);

// Dispatch list
router.get("/", getDispatches);

// Create dispatch
router.post("/", addDispatch);

// Process sales return
router.patch("/:id/process-sales-return", processDispatchSalesReturn);

// Complete sales return inward
router.patch(
	"/:id/complete-sales-return-inward",
	completeDispatchSalesReturnInward,
);

// Deliver dispatch
router.patch("/:id/deliver", deliverDispatch);

// Dispatch view
router.get("/:id", getDispatch);

export default router;
