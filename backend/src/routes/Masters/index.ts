import { Router } from "express";
import itemRoutes from "./Item/itemRoutes";
import categoryRoute from "./Category/categoryRoutes";
import subCategoryRoutes from "./SubCategory/subCategoryRoutes";
import unitRoutes from "./Unit/unitRoutes";
import gstRoutes from "./GST/gstRoutes";
import supplierRoutes from "./Supplier/supplierRoutes";
import wahouseRoutes from "./Warehouse/warehouseRoutes";
import labourRoutes from "./Labour/labourRoutes";
import customerRoutes from "./Customer/customerRoutes";
import hsnCodeRoutes from "./HSNCode/hsnCodeRoutes";

const router = Router();

router.use("/items", itemRoutes);
router.use("/categories", categoryRoute);
router.use("/sub-categories", subCategoryRoutes);
router.use("/units", unitRoutes);
router.use("/gsts", gstRoutes);
router.use("/suppliers", supplierRoutes);
router.use("/warehouses", wahouseRoutes);
router.use("/labours", labourRoutes);
router.use("/customers", customerRoutes);
router.use("/hsn-codes", hsnCodeRoutes);

export default router;
