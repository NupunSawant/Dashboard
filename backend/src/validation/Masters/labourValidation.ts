import { z } from "zod";

export const createLabourSchema = z.object({
	labourName: z.string().min(1),
	contactNumber: z.string().min(1),
	panNumber: z.string().min(1),
	panDocument: z
		.string()
		.min(1, "PAN document filename is required")
		.regex(/\.(pdf|jpg|jpeg|png)$/i, "Invalid file format"),
	aadharNumber: z.string().min(1, "Aadhar number is required"),
	aadharDocument: z
		.string()
		.min(1, "Aadhar document filename is required")
		.regex(/\.(pdf|jpg|jpeg|png)$/i, "Invalid file format"),
	address: z.string().min(1),
	state: z.string().min(1),
	city: z.string().min(1),
	country: z.string().min(1),
	pincode: z.string().min(1),
	remark: z.string().min(1),
});

export const updateLabourSchema = z.object({
	labourName: z.string().min(1).min(1),
	contactNumber: z.string().min(1),
	panNumber: z.string().min(1),
	panDocument: z
		.string()
		.regex(/\.(pdf|jpg|jpeg|png)$/i, "Invalid file format")
		.optional(),
	aadharNumber: z.string().min(1, "Aadhar number is required"),
	aadharDocument: z
		.string()
		.regex(/\.(pdf|jpg|jpeg|png)$/i, "Invalid file format")
		.optional(),
	address: z.string().min(1),
	state: z.string().min(1),
	city: z.string().min(1),
	country: z.string().min(1),
	pincode: z.string().min(1),
	remark: z.string().min(1),
});
