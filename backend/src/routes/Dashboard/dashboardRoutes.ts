import { Router } from "express";
import { authenticateToken } from "../../middleware/auth";
import { getDashboard } from "../../controllers/Dashboard/dashboardController";

const router = Router();

router.use(authenticateToken);

router.get("/summary", getDashboard);

export default router;