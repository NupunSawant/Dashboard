import { z } from "zod";

const issueToLabourItemSchema = z.object({
	itemsCategory: z.string().min(1, "Category is required"),
	itemsSubCategory: z.string().min(1, "Sub-category is required"),
	itemsName: z.string().min(1, "Item name is required"),
	itemsCode: z.string().min(1, "Item code is required"),
	itemsUnit: z.string().min(1, "Unit is required"),
	dispatchQuantity: z.coerce
		.number()
		.gt(0, "Dispatch quantity must be greater than 0"),
	itemsRemark: z.string().optional(),
});

export const createIssueToLabourSchema = z.object({
	issueDate: z.coerce.date(),
	issueFromWarehouse: z.string().min(1, "Issue from warehouse is required"),
	labourName: z.string().min(1, "Labour name is required"),
	remarks: z.string().optional(),
	items: z
		.array(issueToLabourItemSchema)
		.min(1, "At least one item is required"),
});

export const updateIssueToLabourSchema = z.object({
	issueDate: z.coerce.date().optional(),
	issueFromWarehouse: z
		.string()
		.min(1, "Issue from warehouse is required")
		.optional(),
	labourName: z.string().min(1, "Labour name is required").optional(),
	remarks: z.string().optional(),
	items: z.array(issueToLabourItemSchema).optional(),
});

const completedFinishedItemSchema = z.object({
	itemsCategory: z.string().min(1, "Category is required"),
	itemsSubCategory: z.string().min(1, "Sub-category is required"),
	itemsName: z.string().min(1, "Item name is required"),
	itemsCode: z.string().min(1, "Item code is required"),
	itemsUnit: z.string().min(1, "Unit is required"),
	itemsQuantity: z.coerce
		.number()
		.gt(0, "Received quantity must be greater than 0"),
	itemsRate: z.coerce.number().min(0).default(0),
	itemsAmount: z.coerce.number().min(0).default(0),
	itemsRemark: z.string().optional(),
});

const returnedRawItemSchema = z.object({
	itemsCategory: z.string().min(1, "Category is required"),
	itemsSubCategory: z.string().min(1, "Sub-category is required"),
	itemsName: z.string().min(1, "Item name is required"),
	itemsCode: z.string().min(1, "Item code is required"),
	itemsUnit: z.string().min(1, "Unit is required"),
	dispatchQuantity: z.coerce.number().min(0).default(0),
	returnQuantity: z.coerce.number().min(0).default(0),
	itemsRemark: z.string().optional(),
});

export const completeIssueToLabourSchema = z.object({
	inwardDate: z.coerce.date(),
	receivedByWarehouseName: z
		.string()
		.min(1, "Received by warehouse is required"),
	receivedBy: z.string().min(1, "Received by is required"),
	remarks: z.string().optional(),

	itemsDetails: z.array(completedFinishedItemSchema).default([]),
	labourReturnedItems: z.array(returnedRawItemSchema).default([]),
});
