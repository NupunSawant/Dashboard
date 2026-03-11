// src/controllers/Masters/customerController.ts
import { Response } from "express";
import { AuthRequest } from "../../middleware/auth";
import {
	createCustomer,
	deleteCustomer,
	getCustomerById,
	listCustomers,
	updateCustomer,
} from "../../services/Masters/customerService";
import { formatUser } from "../../utils/formatUser";

export const addCustomer = async (req: AuthRequest, res: Response) => {
	const customer = await createCustomer(req.body, req.userId);

	return res.status(201).json({
		success: true,
		message: "Customer created successfully",
		data: {
			id: customer._id,
			srNo: customer.srNo,

			customerName: (customer as any).customerName,
			companyName: (customer as any).companyName || "",
			customerType: (customer as any).customerType || "",
			customerEmail: (customer as any).customerEmail,
			customerPhone: (customer as any).customerPhone,

			customerAadhar: (customer as any).customerAadhar || "",
			customerGst: (customer as any).customerGst || "",

			customerContactPersonName:
				(customer as any).customerContactPersonName || "",
			customerContactPersonPhone:
				(customer as any).customerContactPersonPhone || null,

			customerAddress: (customer as any).customerAddress || "",
			customerState: (customer as any).customerState || "",
			customerCity: (customer as any).customerCity || "",
			customerPincode: (customer as any).customerPincode || "",

			createdAt: customer.createdAt,
			updatedAt: customer.updatedAt,
			createdBy: formatUser(customer.createdBy),
			updatedBy: formatUser(customer.updatedBy),
		},
	});
};

export const getCustomers = async (_req: AuthRequest, res: Response) => {
	const customers = await listCustomers();

	return res.status(200).json({
		success: true,
		data: customers.map((c: any) => ({
			id: c._id,
			srNo: c.srNo,

			customerName: c.customerName,
			companyName: c.companyName || "",
			customerType: c.customerType || "",
			customerEmail: c.customerEmail,
			customerPhone: c.customerPhone,

			customerAadhar: c.customerAadhar || "",
			customerGst: c.customerGst || "",

			customerContactPersonName: c.customerContactPersonName || "",
			customerContactPersonPhone: c.customerContactPersonPhone || null,

			customerAddress: c.customerAddress || "",
			customerState: c.customerState || "",
			customerCity: c.customerCity || "",
			customerPincode: c.customerPincode || "",

			createdAt: c.createdAt,
			updatedAt: c.updatedAt,
			createdBy: formatUser(c.createdBy),
			updatedBy: formatUser(c.updatedBy),
		})),
	});
};

export const getCustomer = async (req: AuthRequest, res: Response) => {
	const customer = await getCustomerById(String(req.params.id));

	return res.status(200).json({
		success: true,
		data: {
			id: customer._id,
			srNo: (customer as any).srNo,

			customerName: (customer as any).customerName,
			companyName: (customer as any).companyName || "",
			customerType: (customer as any).customerType || "",
			customerEmail: (customer as any).customerEmail,
			customerPhone: (customer as any).customerPhone,

			customerAadhar: (customer as any).customerAadhar || "",
			customerGst: (customer as any).customerGst || "",

			customerContactPersonName:
				(customer as any).customerContactPersonName || "",
			customerContactPersonPhone:
				(customer as any).customerContactPersonPhone || null,

			customerAddress: (customer as any).customerAddress || "",
			customerState: (customer as any).customerState || "",
			customerCity: (customer as any).customerCity || "",
			customerPincode: (customer as any).customerPincode || "",

			createdAt: (customer as any).createdAt,
			updatedAt: (customer as any).updatedAt,
			createdBy: formatUser((customer as any).createdBy),
			updatedBy: formatUser((customer as any).updatedBy),
		},
	});
};

export const editCustomer = async (req: AuthRequest, res: Response) => {
	const customer = await updateCustomer(
		String(req.params.id),
		req.body,
		req.userId,
	);

	return res.status(200).json({
		success: true,
		message: "Customer updated",
		data: {
			id: (customer as any)._id,
			srNo: (customer as any).srNo,

			customerName: (customer as any).customerName,
			companyName: (customer as any).companyName || "",
			customerType: (customer as any).customerType || "",
			customerEmail: (customer as any).customerEmail,
			customerPhone: (customer as any).customerPhone,

			customerAadhar: (customer as any).customerAadhar || "",
			customerGst: (customer as any).customerGst || "",

			customerContactPersonName:
				(customer as any).customerContactPersonName || "",
			customerContactPersonPhone:
				(customer as any).customerContactPersonPhone || null,

			customerAddress: (customer as any).customerAddress || "",
			customerState: (customer as any).customerState || "",
			customerCity: (customer as any).customerCity || "",
			customerPincode: (customer as any).customerPincode || "",

			updatedAt: (customer as any).updatedAt,
			updatedBy: formatUser((customer as any).updatedBy),
		},
	});
};

export const removeCustomer = async (req: AuthRequest, res: Response) => {
	await deleteCustomer(String(req.params.id));

	return res.status(200).json({
		success: true,
		message: "Customer deleted",
	});
};
