// controllers/Orders/orderController.ts

import { Request, Response } from "express";
import {
	createOrder,
	createOrderFromQuotation,
	getOrderById,
	listOrders,
	updateOrder,
	updateOrderStatus,
} from "../../services/Order/orderService";

//   helper formatter (keeps response clean + consistent)
const formatOrder = (o: any) => ({
	id: o._id,

	orderNo: o.orderNo,
	orderDate: o.orderDate,

	quotationId: o.quotationId || null,
	quotationNo: o.quotationNo || null,

	enquiryId: o.enquiryId || null,
	enquiryNo: o.enquiryNo || null,

	customerName: o.customerName,
	customerContactPersonName: o.customerContactPersonName || null,
	customerContactPersonPhone: o.customerContactPersonPhone || null,
	customerAddress: o.customerAddress || null,
	customerCity: o.customerCity || null,
	customerState: o.customerState || null,
	customerPincode: o.customerPincode || null,

	dispatchFromWarehouseName: o.dispatchFromWarehouseName,

	orderStatus: o.orderStatus,
	remarks: o.remarks || "",

	items: (o.items || []).map((it: any, idx: number) => ({
		srNo: idx + 1,
		itemsCategory: it.itemsCategory,
		itemsSubCategory: it.itemsSubCategory,

		itemId: it.itemId,
		itemsName: it.itemsName,
		itemsCode: it.itemsCode,
		itemsUnit: it.itemsUnit,

		quantity: it.quantity,

		rate: it.rate,
		discountPercent: it.discountPercent,
		gstRate: it.gstRate,

		remark: it.remark || "",
	})),

	createdAt: o.createdAt,
	updatedAt: o.updatedAt,
	createdBy: o.createdBy || null,
	updatedBy: o.updatedBy || null,
});

export const addOrder = async (req: Request, res: Response) => {
	const order = await createOrder(req.body);

	return res.status(201).json({
		success: true,
		message: "Order created successfully",
		data: formatOrder(order),
	});
};

//   Create order from WON quotation
export const addOrderFromQuotation = async (req: Request, res: Response) => {
	const quotationId = String(req.params.quotationId);

	// if you have auth middleware, use req.user._id (AuthRequest)
	const userId = (req as any)?.user?._id
		? String((req as any).user._id)
		: undefined;

	const order = await createOrderFromQuotation(quotationId, userId);

	return res.status(201).json({
		success: true,
		message: "Order created from quotation successfully",
		data: formatOrder(order),
	});
};

export const getOrders = async (req: Request, res: Response) => {
	const status = req.query.status ? String(req.query.status) : undefined;

	const orders = await listOrders({ status });

	return res.status(200).json({
		success: true,
		data: orders.map(formatOrder),
	});
};

export const getOrder = async (req: Request, res: Response) => {
	const id = String(req.params.id);
	const order = await getOrderById(id);

	return res.status(200).json({
		success: true,
		data: formatOrder(order),
	});
};

export const editOrder = async (req: Request, res: Response) => {
	const id = String(req.params.id);
	const order = await updateOrder(id, req.body);

	return res.status(200).json({
		success: true,
		message: "Order updated successfully",
		data: formatOrder(order),
	});
};

//   status update: PENDING -> REQUESTED_FOR_DISPATCH etc.
export const changeOrderStatus = async (req: any, res: any) => {
	const { id } = req.params;
	const { status } = req.body;

	const userId = req.user?._id ? String(req.user._id) : undefined; // based on your auth middleware

	const updated = await updateOrderStatus(id, String(status), userId);

	return res.status(200).json({
		success: true,
		message: "Order status updated",
		data: updated,
	});
};
