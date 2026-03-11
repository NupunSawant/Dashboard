// validation.ts
import { email, z } from "zod";

export const createUserSchema = z.object({
	firstName: z.string().min(1),
	lastName: z.string().min(1),
	userName: z.string().min(1),
	desgination: z.string().min(1),
	userType: z.string().min(1),
	phone: z.string().min(1),
	email: z.string().email(),
	address: z.string().min(1),
	country: z.string().min(1),
	state: z.string().min(1),
	city: z.string().min(1),
	pincode: z.string().min(1),
	password: z.string().min(6),
});

export const updateUserSchema = z
	.object({
		firstName: z.string().min(1).optional(),
		lastName: z.string().min(1).optional(),
		userName: z.string().min(1).optional(),
		desgination: z.string().min(1).optional(),
		userType: z.string().min(1).optional(),
		phone: z.string().min(1).optional(),
		email: z.string().email().optional(),
		address: z.string().min(1).optional(),
		country: z.string().min(1).optional(),
		state: z.string().min(1).optional(),
		city: z.string().min(1).optional(),
		pincode: z.string().min(1).optional(),
	})
	.refine((data) => Object.keys(data).length > 0, {
		message: "At least one field is required",
		path: [],
	});

export const updatePasswordSchema = z.object({
	password: z.string().min(6),
});