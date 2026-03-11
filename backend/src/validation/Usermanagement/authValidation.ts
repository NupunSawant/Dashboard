import { z } from "zod";

export const registerSchema = z.object({
	name: z.string().trim().min(2, "Name must be at least 2 characters"),
	phone: z
		.string()
		.trim()
		.min(10, "Phone must be at least 10 digits")
		.max(15, "Phone must be at most 15 digits"),
	email: z.string().trim().toLowerCase().email("Invalid email"),
	password: z.string().min(6, "Password must be at least 6 characters"),
});

export const loginSchema = z.object({
	phoneOrEmail: z.string().trim().min(3, "Phone or Email is required"),
	password: z.string().min(6, "Password must be at least 6 characters"),
	rememberMe: z.boolean().optional().default(false),
});