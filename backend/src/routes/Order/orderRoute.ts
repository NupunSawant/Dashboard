// routes/Orders/orderRoutes.ts

import { Router } from "express";
import { authenticateToken } from "../../middleware/auth";
import { validate } from "../../middleware/validation";

import {
	createOrderSchema,
	updateOrderSchema,
	updateOrderStatusSchema,
} from "../../validation/Order/orderValidation";

import {
	addOrder,
	addOrderFromQuotation,
	editOrder,
	getOrder,
	getOrders,
	changeOrderStatus,
} from "../../controllers/Order/orderController";

const router = Router();

router.use(authenticateToken);

//   Create manual order
router.post("/", validate(createOrderSchema), addOrder);

//   Create order from WON quotation
router.post("/from-quotation/:quotationId", addOrderFromQuotation);

//   List orders (optional ?status=...)
router.get("/", getOrders);

//   Get single order
router.get("/:id", getOrder);

//   Update order (details/items)
router.put("/:id", validate(updateOrderSchema), editOrder);

//   Change order status (PENDING → REQUESTED_FOR_DISPATCH → ...)
router.patch(
	"/:id/status",
	validate(updateOrderStatusSchema),
	changeOrderStatus,
);

router.get("/ping", (_req, res) => res.json({ ok: true, module: "orders" }));

export default router;
