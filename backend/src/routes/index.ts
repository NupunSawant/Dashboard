import { Router } from "express";
import authRouter from "./Usermanagement/authRoutes";
import masterRoutes from "./Masters";
import userRoutes from "./Usermanagement/userRoutes";
import inventoryRoutes from "./Inventory/inventoryRoutes";
import reorderLevelRoutes from "./Inventory/reorderLevelRoutes";
import warehouseRoutes from "./Warehouse";
import warehouseOverviewRoutes from "./Warehouse/WarehouseOverview/warehouseOverviewRoutes";
import orderRoutes from "./Order";
import dashboardRoutes from "./Dashboard/dashboardRoutes";

const router = Router();

router.use("/auth", authRouter);
router.use("/masters", masterRoutes);
router.use("/orders", orderRoutes);
router.use("/users", userRoutes);
router.use("/inventory", inventoryRoutes);
router.use("/warehouses", warehouseRoutes);
router.use("/warehouses/warehouse-overview", warehouseOverviewRoutes);
router.use("/inventory/reorder-level", reorderLevelRoutes);
router.use("/dashboard", dashboardRoutes);

export default router;
