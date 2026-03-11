// validation/Quotations/quotationValidation.ts

import { z } from "zod";

const mustTrim = (v: string) => v.trim();

/* =========================================================
     ENUMS
========================================================= */

export const quotationStatusEnum = z.enum(["PENDING", "SEND", "WON", "LOST"]);
export const quotationStatusUpdateEnum = z.enum(["SEND", "WON", "LOST"]);

const phone10Digits = z.coerce
	.number()
	.int()
	.refine((n) => /^\d{10}$/.test(String(n)), {
		message: "contactPersonPhone must be a 10-digit number",
	});

/* =========================================================
     ITEM SCHEMA
========================================================= */

const quotationItemSchema = z.object({
	itemsCategory: z.string().min(1).transform(mustTrim),
	itemsSubCategory: z.string().min(1).transform(mustTrim),
	itemsName: z.string().min(1).transform(mustTrim),
	itemsCode: z.string().min(1).transform(mustTrim),
	itemsUnit: z.string().min(1).transform(mustTrim),

	quantity: z.coerce.number().min(0.01, "Quantity must be greater than 0"),
	rate: z.coerce.number().min(0, "Rate cannot be negative"),

	discountPercent: z.coerce
		.number()
		.min(0, "Discount cannot be negative")
		.max(100, "Discount cannot exceed 100%")
		.optional()
		.default(0),

	gstRate: z.coerce
		.number()
		.min(0, "GST cannot be negative")
		.max(100, "GST cannot exceed 100%"),

	itemsRemark: z.string().transform(mustTrim).optional(),
});

/* =========================================================
     CREATE QUOTATION
========================================================= */

export const createQuotationSchema = z.object({
	quotationDate: z.coerce.date(),

	enquiryId: z.string().optional(),

	warehouseName: z.string().min(1).transform(mustTrim),

	customerName: z.string().min(1).transform(mustTrim),
	contactPersonName: z.string().min(1).transform(mustTrim),
	contactPersonPhone: phone10Digits,

	remarks: z.string().transform(mustTrim).optional(),

	items: z.array(quotationItemSchema).min(1, "At least 1 item is required"),
});

/* =========================================================
     UPDATE QUOTATION
========================================================= */

export const updateQuotationSchema = z.object({
	quotationDate: z.coerce.date().optional(),

	warehouseName: z.string().min(1).transform(mustTrim).optional(),

	customerName: z.string().min(1).transform(mustTrim).optional(),
	contactPersonName: z.string().min(1).transform(mustTrim).optional(),
	contactPersonPhone: phone10Digits.optional(),

	remarks: z.string().transform(mustTrim).optional(),

	items: z
		.array(quotationItemSchema)
		.min(1, "At least 1 item is required")
		.optional(),
});

/* =========================================================
     UPDATE STATUS (SEND / WON / LOST)
========================================================= */

export const updateQuotationStatusSchema = z.object({
	status: quotationStatusUpdateEnum,
});
