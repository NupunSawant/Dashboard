import { Router } from "express";
import warehouseInwardRoutes from "./WarehouseInward/warehouseInwardRoutes";
import dispatchRoutes from "./Dispatch/dispatchRoutes";
import stocktransferRoutes from "./Stocktransfer/stocktransferRoutes";
import issueToLabourRoutes from "./IssueToLabour/IssueToLabourRoutes";


const router = Router();

router.use("/inward", warehouseInwardRoutes);
router.use("/dispatch", dispatchRoutes);
router.use("/stock-transfer", stocktransferRoutes);
router.use("/issue-to-labour", issueToLabourRoutes);



export default router;