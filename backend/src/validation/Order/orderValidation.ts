// validation/Orders/orderValidation.ts

import { z } from "zod";


const orderStatusEnum = z.enum([
	"PENDING",
	"REQUESTED_FOR_DISPATCH",
	"DISPATCHED",
	"DELIVERED",
	"CANCELLED",
]);

const orderItemSchema = z.object({
	itemsCategory: z.string().min(1),
	itemsSubCategory: z.string().min(1),

	itemId: z.string().min(1),
	itemsName: z.string().min(1),
	itemsCode: z.string().min(1),
	itemsUnit: z.string().min(1),

	quantity: z.number().min(1),

	// optional (when created from quotation)
	rate: z.number().min(0).optional(),
	discountPercent: z.number().min(0).max(100).optional(),
	gstRate: z.number().min(0).optional(),

	remark: z.string().optional(),
});

export const createOrderSchema = z.object({
	orderDate: z.string().min(1),

	// Optional links (order can be created without quotation/enquiry)
	quotationId: z.string().min(1).optional(),
	quotationNo: z.string().min(1).optional(),
	enquiryId: z.string().min(1).optional(),
	enquiryNo: z.string().min(1).optional(),

	customerName: z.string().min(1),
	dispatchFromWarehouseName: z.string().min(1),

	orderStatus: orderStatusEnum.optional(), // default handled in model/service
	remarks: z.string().optional(),

	items: z.array(orderItemSchema).min(1),
});

export const updateOrderSchema = z.object({
	orderDate: z.string().min(1).optional(),

	quotationId: z.string().min(1).optional(),
	quotationNo: z.string().min(1).optional(),
	enquiryId: z.string().min(1).optional(),
	enquiryNo: z.string().min(1).optional(),

	customerName: z.string().min(1).optional(),
	dispatchFromWarehouseName: z.string().min(1).optional(),

	remarks: z.string().optional(),

	// optional: allow updating items (if you want edit order)
	items: z.array(orderItemSchema).min(1).optional(),
});

export const updateOrderStatusSchema = z.object({
	status: orderStatusEnum,
});