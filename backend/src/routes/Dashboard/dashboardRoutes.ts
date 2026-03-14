import { Router } from "express";
import { authenticateToken } from "../../middleware/auth";
import {
	getDashboard,
	getDashboardInventoryTableController,
} from "../../controllers/Dashboard/dashboardController";

const router = Router();

router.use(authenticateToken);

router.get("/summary", getDashboard);
router.get("/inventory-table", getDashboardInventoryTableController);

export default router;
