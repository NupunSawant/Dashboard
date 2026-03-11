import { z } from "zod";

export const createWarehouseSchema = z.object({
	warehouseName: z.string().min(1),
	warehouseType: z.string().min(1),
	warehouseAddress: z.string().min(1),
	warehouseCountry: z.string().min(1),
	warehouseState: z.string().min(1),
	warehouseCity: z.string().min(1),
	warehousePincode: z.string().min(1),
	remarks: z.string().optional(),
});

export const updateWarehouseSchema = z
	.object({
		warehouseName: z.string().min(1).optional(),
		warehouseType: z.string().min(1).optional(),
		warehouseAddress: z.string().min(1).optional(),
		warehouseCountry: z.string().min(1).optional(),
		warehouseState: z.string().min(1).optional(),
		warehouseCity: z.string().min(1).optional(),
		warehousePincode: z.string().min(1).optional(),
		remarks: z.string().optional(),
	})
	.refine((data) => Object.keys(data).length > 0, {
		message: "At least one field is required",
		path: [],
	});
