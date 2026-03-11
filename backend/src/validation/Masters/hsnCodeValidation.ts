import { z } from "zod";

export const createHsnCodeSchema = z.object({
	srNo: z.number().optional(),
	gstRate: z.string().min(1),
	hsnCode: z.string().min(1),
	hsnDescription: z.string().optional(),
});

export const updateHsnCodeSchema = z
	.object({
		gstRate: z.string().min(1).optional(),
		hsnCode: z.string().min(1).optional(),
		hsnDescription: z.string().optional(),
	})
	.refine((data) => Object.keys(data).length > 0, {
		message: "At least one field is required",
	});
