import { z } from "zod";

export const createCategorySchema = z.object({
	name: z.string().min(1),
	remark: z.string().optional(),
});

export const updatedCategorySchema = z
	.object({
		name: z.string().min(1).optional(),
		remark: z.string().optional(),
		category: z.string().optional(),
	})
	.refine((data) => Object.keys(data).length > 0, {
		message: "At least one field is required",
		path: [],
	});
