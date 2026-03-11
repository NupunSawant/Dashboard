import { z } from "zod";

const mustTrim = (v: string) => v.trim();

export const stageEnum = z.enum([
	"PENDING",
	"QUOTATION_CREATED",
	"REQUEST_FOR_QUOTATION",
	"CLOSED",
]);

const phone10Digits = z.coerce
	.number()
	.int()
	.refine((n) => /^\d{10}$/.test(String(n)), {
		message: "contactPersonPhone must be a 10-digit number",
	});

const enquiryItemSchema = z.object({
	itemsCategory: z.string().min(1).transform(mustTrim),
	itemsSubCategory: z.string().min(1).transform(mustTrim),
	itemsName: z.string().min(1).transform(mustTrim),
	itemsCode: z.string().min(1).transform(mustTrim),
	itemsUnit: z.string().min(1).transform(mustTrim),
	itemsRemark: z.string().transform(mustTrim).optional(),
});

export const createEnquirySchema = z.object({
	enquiryDate: z.coerce.date(),
	sourceOfEnquiry: z.string().min(1).transform(mustTrim),

	customerName: z.string().min(1).transform(mustTrim),
	contactPersonName: z.string().min(1).transform(mustTrim),
	contactPersonPhone: phone10Digits,

	staffName: z.string().min(1).transform(mustTrim),

	stage: stageEnum.optional().default("PENDING"),
	remarks: z.string().transform(mustTrim).optional(),

	items: z.array(enquiryItemSchema).min(1, "At least 1 item is required"),
});

export const updateEnquirySchema = z.object({
	enquiryDate: z.coerce.date().optional(),
	sourceOfEnquiry: z.string().min(1).transform(mustTrim).optional(),

	customerName: z.string().min(1).transform(mustTrim).optional(),
	contactPersonName: z.string().min(1).transform(mustTrim).optional(),
	contactPersonPhone: phone10Digits.optional(),

	staffName: z.string().min(1).transform(mustTrim).optional(),

	stage: stageEnum.optional(),
	remarks: z.string().transform(mustTrim).optional(),

	items: z
		.array(enquiryItemSchema)
		.min(1, "At least 1 item is required")
		.optional(),
});

//   NEW: PATCH /api/enquiries/:id/stage
export const updateEnquiryStageSchema = z.object({
	stage: stageEnum,
});
