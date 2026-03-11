import { Router } from "express";
import enquiryRoute from "./enquiryRoute";
import orderlistRoutes from "./orderRoute";
import quotationRoute from "./quotationRoute";


const router = Router();

router.use("/order-list", orderlistRoutes);
router.use("/enquiries", enquiryRoute);
router.use("/quotations", quotationRoute);

export default router;
