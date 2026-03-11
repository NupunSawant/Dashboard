import { Response } from "express";
import { AuthRequest } from "../../middleware/auth";
import {
	createSupplier,
	getSupplierById,
	listSuppliers,
	updateSupplier,
	deleteSupplier,
} from "../../services/Masters/supplierService";
import { success } from "zod";
import { formatUser } from "../../utils/formatUser";

export const addSupplier = async (req: AuthRequest, res: Response) => {
	const supplier = await createSupplier(req.body, req.userId);

	return res.status(201).json({
		success: true,
		message: "Supplier created successfully",
		data: {
			id: supplier._id,
			name: supplier.supplierName,
			code: supplier.supplierCode,
			email: supplier.supplierEmail,
			phone: supplier.supplierPhone,
			gstNo: supplier.supplierGstNo,
			address: supplier.supplierAddress,
			city: supplier.supplierCity,
			state: supplier.supplierState,
			pincode: supplier.supplierPincode,
			country: supplier.supplierCountry,
			contactPerson: supplier.supplierContactPerson,
			contactPersonPhone: supplier.supplierContactPersonPhone,
			transporterName1: supplier.supplierTransporterName1 || "",
			transporterPhone1: supplier.supplierTransporterPhone1 || "",
			transporterContactPerson1:
				supplier.supplierTransporterContactPerson1 || "",
			transporterContactPerson1Phone:
				supplier.supplierTransporterContactPerson1Phone || "",
			transporterName2: supplier.supplierTransporterName2 || "",
			transporterPhone2: supplier.supplierTransporterPhone2 || "",
			transporterContactPerson2:
				supplier.supplierTransporterContactPerson2 || "",
			transporterContactPerson2Phone:
				supplier.supplierTransporterContactPerson2Phone || "",
			createdAt: supplier.createdAt,
			updatedAt: supplier.updatedAt,
			createdBy: formatUser(supplier.createdBy),
			updatedBy: formatUser(supplier.updatedBy),
		},
	});
};

export const getSuppliers = async (_req: AuthRequest, res: Response) => {
	const suppliers = await listSuppliers();

	return res.status(200).json({
		success: true,
		data: suppliers.map((s: any) => ({
			id: s._id,
			name: s.supplierName,
			code: s.supplierCode,
			email: s.supplierEmail,
			phone: s.supplierPhone,
			gstNo: s.supplierGstNo,
			address: s.supplierAddress,
			city: s.supplierCity,
			state: s.supplierState,
			pincode: s.supplierPincode,
			country: s.supplierCountry,
			contactPerson: s.supplierContactPerson,
			contactPersonPhone: s.supplierContactPersonPhone,
			transporterName1: s.supplierTransporterName1 || "",
			transporterPhone1: s.supplierTransporterPhone1 || "",
			transporterContactPerson1: s.supplierTransporterContactPerson1 || "",
			transporterContactPerson1Phone:
				s.supplierTransporterContactPerson1Phone || "",
			transporterName2: s.supplierTransporterName2 || "",
			transporterPhone2: s.supplierTransporterPhone2 || "",
			transporterContactPerson2: s.supplierTransporterContactPerson2 || "",
			transporterContactPerson2Phone:
				s.supplierTransporterContactPerson2Phone || "",
			createdAt: s.createdAt,
			updatedAt: s.updatedAt,
			createdBy: formatUser(s.createdBy),
			updatedBy: formatUser(s.updatedBy),
		})),
	});
};

export const getSupplier = async (req: AuthRequest, res: Response) => {
	const supplier = await getSupplierById(String(req.params.id));

	return res.status(200).json({
		success: true,
		data: {
			id: supplier._id,
			name: supplier.supplierName,
			code: supplier.supplierCode,
			email: supplier.supplierEmail,
			phone: supplier.supplierPhone,
			gstNo: supplier.supplierGstNo,
			address: supplier.supplierAddress,
			city: supplier.supplierCity,
			state: supplier.supplierState,
			pincode: supplier.supplierPincode,
			country: supplier.supplierCountry,
			contactPerson: supplier.supplierContactPerson,
			contactPersonPhone: supplier.supplierContactPersonPhone,
			transporterName1: supplier.supplierTransporterName1 || "",
			transporterPhone1: supplier.supplierTransporterPhone1 || "",
			transporterContactPerson1:
				supplier.supplierTransporterContactPerson1 || "",
			transporterContactPerson1Phone:
				supplier.supplierTransporterContactPerson1Phone || "",
			transporterName2: supplier.supplierTransporterName2 || "",
			transporterPhone2: supplier.supplierTransporterPhone2 || "",
			transporterContactPerson2:
				supplier.supplierTransporterContactPerson2 || "",
			transporterContactPerson2Phone:
				supplier.supplierTransporterContactPerson2Phone || "",
			createdAt: supplier.createdAt,
			updatedAt: supplier.updatedAt,
			createdBy: formatUser(supplier.createdBy),
			updatedBy: formatUser(supplier.updatedBy),
		},
	});
};

export const editSupplier = async (req: AuthRequest, res: Response) => {
	const supplier = await updateSupplier(
		String(req.params.id),
		req.body,
		req.userId,
	);

	return res.status(200).json({
		success: true,
		message: "Supplier updated successfully",
		data: {
			id: supplier._id,
			name: supplier.supplierName,
			code: supplier.supplierCode,
			email: supplier.supplierEmail,
			phone: supplier.supplierPhone,
			gstNo: supplier.supplierGstNo,
			address: supplier.supplierAddress,
			city: supplier.supplierCity,
			state: supplier.supplierState,
			pincode: supplier.supplierPincode,
			country: supplier.supplierCountry,
			contactPerson: supplier.supplierContactPerson,
			contactPersonPhone: supplier.supplierContactPersonPhone,
			transporterName1: supplier.supplierTransporterName1 || "",
			transporterPhone1: supplier.supplierTransporterPhone1 || "",
			transporterContactPerson1:
				supplier.supplierTransporterContactPerson1 || "",
			transporterContactPerson1Phone:
				supplier.supplierTransporterContactPerson1Phone || "",
			transporterName2: supplier.supplierTransporterName2 || "",
			transporterPhone2: supplier.supplierTransporterPhone2 || "",
			transporterContactPerson2:
				supplier.supplierTransporterContactPerson2 || "",
			transporterContactPerson2Phone:
				supplier.supplierTransporterContactPerson2Phone || "",
			createdAt: supplier.createdAt,
			updatedAt: supplier.updatedAt,
			createdBy: formatUser(supplier.createdBy),
			updatedBy: formatUser(supplier.updatedBy),
		},
	});
};

export const removeSupplier = async (req: AuthRequest, res: Response) => {
	await deleteSupplier(String(req.params.id));

	return res.status(200).json({
		success: true,
		message: "Supplier deleted successfully",
	});
};
