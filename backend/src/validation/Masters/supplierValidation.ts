import { optional, z } from "zod";

export const createSupplierSchema = z.object({
	supplierName: z.string().min(1),
	supplierCode: z.string().min(1),
	supplierEmail: z.string().email().min(1),
	supplierPhone: z.string().min(1),
	supplierAddress: z.string().min(1),
	supplierCountry: z.string().min(1),
	supplierState: z.string().min(1),
	supplierCity: z.string().min(1),
	supplierPincode: z.string().min(1),
	supplierGstNo: z.string().min(1),
	supplierContactPerson: z.string().min(1),
	supplierContactPersonPhone: z.string().min(1),
	supplierTransporterName1: z.string().optional(),
	supplierTransporterContactPerson1: z.string().optional(),
	supplierTransporterContactPerson1Phone: z.string().optional(),
	supplierTransporterPhone1: z.string().optional(),
	supplierTransporterName2: z.string().optional(),
	supplierTransporterPhone2: z.string().optional(),
	supplierTransporterContactPerson2: z.string().optional(),
	supplierTransporterContactPerson2Phone: z.string().optional(),
});

export const updateSupplierSchema = z
	.object({
		supplierName: z.string().min(1).optional(),
		supplierCode: z.string().min(1).optional(),
		supplierEmail: z.string().email().min(1).optional(),
		supplierPhone: z.string().min(1).optional(),
		supplierAddress: z.string().min(1).optional(),
		supplierCountry: z.string().min(1).optional(),
		supplierState: z.string().min(1).optional(),
		supplierCity: z.string().min(1).optional(),
		supplierPincode: z.string().min(1).optional(),
		supplierGstNo: z.string().min(1).optional(),
		supplierContactPerson: z.string().min(1).optional(),
		supplierContactPersonPhone: z.string().min(1).optional(),
		supplierTransporterName1: z.string().optional(),
		supplierTransporterContactPerson1: z.string().optional(),
		supplierTransporterPhone1: z.string().optional(),
		supplierTransporterName2: z.string().optional(),
		supplierTransporterContactPerson2: z.string().optional(),
		supplierTransporterPhone2: z.string().optional(),
		supplierTransporterContactPerson1Phone: z.string().optional(),
		supplierTransporterContactPerson2Phone: z.string().optional(),
	})
	.refine((data) => Object.keys(data).length > 0, {
		message: "At least one field is required",
		path: [],
	});
