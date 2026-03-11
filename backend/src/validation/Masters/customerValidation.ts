// src/validations/customerValidation.ts
import { z } from "zod";

export const createCustomerSchema = z.object({
	customerName: z.string().min(1),
	companyName: z.string().min(1),
	customerType: z.string().min(1),

	customerEmail: z.string().min(1),
	customerPhone: z.number().min(1),

	customerAadhar: z.string().min(1),
	customerGst: z.string().min(1),

	customerContactPersonName: z.string().optional(),
	customerContactPersonPhone: z.number().optional(),

	customerAddress: z.string().min(1),
	customerState: z.string().min(1),
	customerCity: z.string().min(1),
	customerPincode: z.string().min(1),
});

export const updateCustomerSchema = z
	.object({
		customerName: z.string().min(1).optional(),
		companyName: z.string().optional(),
		customerType: z.string().optional(),

		customerEmail: z.string().optional(),
		customerPhone: z.number().optional(),

		customerAadhar: z.string().optional(),
		customerGst: z.string().optional(),

		customerContactPersonName: z.string().optional(),
		customerContactPersonPhone: z.number().optional(),

		customerAddress: z.string().optional(),
		customerState: z.string().optional(),
		customerCity: z.string().optional(),
		customerPincode: z.string().optional(),
	})
	.refine((data) => Object.keys(data).length > 0, {
		message: "At least one field is required",
		path: [],
	});
