import { Router } from "express";
import { authenticateToken } from "../../../middleware/auth"
import {
	getStockTransfers,
	getStockTransfer,
	addStockTransfer,
	editStockTransfer,
	revertStockTransfer,
	getPendingTransfers,
	completeStockTransferById,
} from '../../../controllers/Stocktransfer/stocktransferController'

const router = Router();
router.use(authenticateToken);

router.get("/ping", (_req, res) => res.json({ ok: true, module: "stockTransfer" }));

// Pending transfers (for WarehouseInward pending tab)
router.get("/pending", getPendingTransfers);

// List all
router.get("/", getStockTransfers);

// Create
router.post("/", addStockTransfer);

// Get one
router.get("/:id", getStockTransfer);

// Edit (only DISPATCHED)
router.put("/:id", editStockTransfer);

// Revert (DISPATCHED → REVERTED, restores inventory)
router.patch("/:id/revert", revertStockTransfer);

// Complete (DISPATCHED → COMPLETED, moves inventory to TO warehouse)
router.patch("/:id/complete", completeStockTransferById);

export default router;