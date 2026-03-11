import { z } from "zod";

const itemSchema = z.object({
	itemsCategory: z.string().min(1, "Category is required"),
	itemsSubCategory: z.string().min(1, "Sub-category is required"),
	itemsName: z.string().min(1, "Item name is required"),
	itemsCode: z.string().min(1, "Item code is required"),
	itemsQuantity: z.coerce.number().gt(0, "Quantity must be greater than 0"),
	itemsUnit: z.string().min(1, "Unit is required"),
	itemsRate: z.coerce.number().min(0),
	itemsAmount: z.coerce.number().min(0),
	itemsRemark: z.string().optional(),
});

export const createWarehouseInwardSchema = z
	.object({
		inwardType: z.string().min(1, "Inward type is required"),
		inwardDate: z.coerce.date(),
		receivedBy: z.string().min(1, "Received by is required"),
		remarks: z.string().optional(),
		invoiceNo: z.string().min(1, "Invoice number is required"),
		supplierName: z.string().min(1, "Supplier name is required"),
		warehouseName: z.string().min(1, "Warehouse is required"),

		sourceDispatchId: z.string().optional(),
		dispatchNo: z.string().optional(),

		items: z.array(itemSchema).min(1, "At least one item is required"),
	})
	.superRefine((data, ctx) => {
		if (data.inwardType === "SALES_RETURN") {
			if (!data.sourceDispatchId || !data.sourceDispatchId.trim()) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					path: ["sourceDispatchId"],
					message: "Source dispatch id is required for sales return inward",
				});
			}
		}
	});

export const updateWarehouseInwardSchema = z
	.object({
		inwardType: z.string().min(1, "Inward type is required").optional(),
		inwardDate: z.coerce.date().optional(),
		receivedBy: z.string().min(1, "Received by is required").optional(),
		remarks: z.string().optional(),
		invoiceNo: z.string().optional(),
		supplierName: z.string().optional(),
		warehouseName: z.string().optional(),

		sourceDispatchId: z.string().optional(),
		dispatchNo: z.string().optional(),

		items: z.array(itemSchema).optional(),
	})
	.superRefine((data, ctx) => {
		if (data.inwardType === "SALES_RETURN") {
			if (!data.sourceDispatchId || !data.sourceDispatchId.trim()) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					path: ["sourceDispatchId"],
					message: "Source dispatch id is required for sales return inward",
				});
			}
		}
	});
