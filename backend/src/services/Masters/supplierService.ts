import mongoose from "mongoose";
import { Supplier } from "../../models/Masters/Supplier";
import { Counter } from "../../models/Counter";
import e from "express";

const ensureObjectId = (id: string, name: string) => {
	if (!mongoose.Types.ObjectId.isValid(id)) {
		throw Object.assign(new Error(`Invalid ${name}`), { statusCode: 400 });
	}
};

const getNextSequence = async (key: string): Promise<number> => {
	const doc = await Counter.findOneAndUpdate(
		{ key },
		{ $inc: { seq: 1 } },
		{ new: true, upsert: true },
	).lean();
	return doc!.seq;
};

export const createSupplier = async (
	payload: {
		supplierName: string;
		supplierCode: string;
		supplierEmail?: string;
		supplierPhone?: string;
		supplierGstNo?: string;
		supplierAddress?: string;
		supplierCity?: string;
		supplierState?: string;
		supplierPincode?: string;
		supplierContactPerson?: string;
		supplierContactPersonPhone?: string;
		supplierCountry?: string;
		supplierTransporterName1?: string;
		supplierTransporterContactPerson1?: string;
		supplierTransporterPhone1?: string;
		supplierTransporterName2?: string;
		supplierTransporterContactPerson2?: string;
		supplierTransporterPhone2?: string;
		supplierTransporterContactPerson1Phone?: string;
		supplierTransporterContactPerson2Phone?: string;
	},
	userId?: string,
) => {
	const supplierName = payload.supplierName.trim();
	const supplierCode = payload.supplierCode.trim();
	const supplierEmail = payload.supplierEmail?.trim() || "";
	const supplierPhone = payload.supplierPhone?.trim() || "";
	const supplierGstNo = payload.supplierGstNo?.trim() || "";
	const supplierAddress = payload.supplierAddress?.trim() || "";
	const supplierCity = payload.supplierCity?.trim() || "";
	const supplierState = payload.supplierState?.trim() || "";
	const supplierPincode = payload.supplierPincode?.trim() || "";
	const supplierContactPerson = payload.supplierContactPerson?.trim() || "";
	const supplierContactPersonPhone =
		payload.supplierContactPersonPhone?.trim() || "";
	const supplierCountry = payload.supplierCountry?.trim() || "";
	const supplierTransporterName1 =
		payload.supplierTransporterName1?.trim() || "";
	const supplierTransporterContactPerson1 =
		payload.supplierTransporterContactPerson1?.trim() || "";
	const supplierTransporterPhone1 =
		payload.supplierTransporterPhone1?.trim() || "";
	const supplierTransporterName2 =
		payload.supplierTransporterName2?.trim() || "";
	const supplierTransporterContactPerson2 =
		payload.supplierTransporterContactPerson2?.trim() || "";
	const supplierTransporterPhone2 =
		payload.supplierTransporterPhone2?.trim() || "";
	const supplierTransporterContactPerson1Phone =
		payload.supplierTransporterContactPerson1Phone?.trim() || "";
	const supplierTransporterContactPerson2Phone =
		payload.supplierTransporterContactPerson2Phone?.trim() || "";

	const exists = await Supplier.findOne({ supplierName, supplierCode }).lean();
	if (exists) {
		throw Object.assign(new Error("Supplier already exists"), {
			statusCode: 409,
		});
	}

	const srNo = await getNextSequence("supplier_srNo");

	const supplier = new Supplier({
		srNo,
		supplierName,
		supplierCode,
		supplierEmail,
		supplierPhone,
		supplierGstNo,
		supplierAddress,
		supplierCity,
		supplierState,
		supplierPincode,
		supplierContactPerson,
		supplierContactPersonPhone,
		supplierCountry,
		supplierTransporterName1,
		supplierTransporterContactPerson1,
		supplierTransporterPhone1,
		supplierTransporterName2,
		supplierTransporterContactPerson2,
		supplierTransporterPhone2,
		supplierTransporterContactPerson1Phone,
		supplierTransporterContactPerson2Phone,
		createdBy: userId ? new mongoose.Types.ObjectId(userId) : undefined,
		updatedBy: userId ? new mongoose.Types.ObjectId(userId) : undefined,
	});

	await supplier.save();
	return supplier;
};

export const listSuppliers = async () => {
	return Supplier.find()
		.sort({ srNo: 1 })
		.populate("createdBy", "firstName lastName userName email phone")
		.populate("updatedBy", "firstName lastName userName email phone")
		.lean();
};

export const getSupplierById = async (id: string) => {
	ensureObjectId(id, "supplier id");

	const supplier = await Supplier.findById(id)
		.populate("createdBy", "firstName lastName userName email phone")
		.populate("updatedBy", "firstName lastName userName email phone")
		.lean();

	if (!supplier)
		throw Object.assign(new Error("Supplier not found"), { statusCode: 404 });
	return supplier;
};

export const updateSupplier = async (
	id: string,
	payload: {
		supplierName?: string;
		supplierCode?: string;
		supplierEmail?: string;
		supplierPhone?: string;
		supplierGstNo?: string;
		supplierAddress?: string;
		supplierCity?: string;
		supplierState?: string;
		supplierPincode?: string;
		supplierContactPerson?: string;
		supplierContactPersonPhone?: string;
		supplierCountry?: string;
		supplierTransporterName1?: string;
		supplierTransporterContactPerson1?: string;
		supplierTransporterPhone1?: string;
		supplierTransporterName2?: string;
		supplierTransporterContactPerson2?: string;
		supplierTransporterPhone2?: string;
		supplierTransporterContactPerson1Phone?: string;
		supplierTransporterContactPerson2Phone?: string;
	},
	userId?: string,
) => {
	ensureObjectId(id, "supplier id");

	if (payload.supplierName && payload.supplierCode) {
		const name = payload.supplierName.trim();
		const exists = await Supplier.findOne({
			supplierName: name,
			_id: { $ne: id },
		}).lean();
		if (exists) {
			throw Object.assign(new Error("Supplier already exists"), {
				statusCode: 409,
			});
		}
	}

	const updated = await Supplier.findByIdAndUpdate(
		id,
		{
			...(payload.supplierName !== undefined
				? { supplierName: payload.supplierName.trim() }
				: {}),
			...(payload.supplierCode !== undefined
				? { supplierCode: payload.supplierCode.trim() }
				: {}),
			...(payload.supplierEmail !== undefined
				? { supplierEmail: payload.supplierEmail.trim() }
				: {}),
			...(payload.supplierPhone !== undefined
				? { supplierPhone: payload.supplierPhone.trim() }
				: {}),
			...(payload.supplierGstNo !== undefined
				? { supplierGstNo: payload.supplierGstNo.trim() }
				: {}),
			...(payload.supplierAddress !== undefined
				? { supplierAddress: payload.supplierAddress.trim() }
				: {}),
			...(payload.supplierCity !== undefined
				? { supplierCity: payload.supplierCity.trim() }
				: {}),
			...(payload.supplierState !== undefined
				? { supplierState: payload.supplierState.trim() }
				: {}),
			...(payload.supplierPincode !== undefined
				? { supplierPincode: payload.supplierPincode.trim() }
				: {}),
			...(payload.supplierContactPerson !== undefined
				? { supplierContactPerson: payload.supplierContactPerson.trim() }
				: {}),
			...(payload.supplierContactPersonPhone !== undefined
				? {
						supplierContactPersonPhone:
							payload.supplierContactPersonPhone.trim(),
					}
				: {}),
			...(payload.supplierCountry !== undefined
				? { supplierCountry: payload.supplierCountry.trim() }
				: {}),
			...(payload.supplierTransporterName1 !== undefined
				? { supplierTransporterName1: payload.supplierTransporterName1.trim() }
				: {}),
			...(payload.supplierTransporterContactPerson1 !== undefined
				? {
						supplierTransporterContactPerson1:
							payload.supplierTransporterContactPerson1.trim(),
					}
				: {}),
			...(payload.supplierTransporterPhone1 !== undefined
				? {
						supplierTransporterPhone1: payload.supplierTransporterPhone1.trim(),
					}
				: {}),
			...(payload.supplierTransporterName2 !== undefined
				? { supplierTransporterName2: payload.supplierTransporterName2.trim() }
				: {}),
			...(payload.supplierTransporterContactPerson2 !== undefined
				? {
						supplierTransporterContactPerson2:
							payload.supplierTransporterContactPerson2.trim(),
					}
				: {}),
			...(payload.supplierTransporterPhone2 !== undefined
				? {
						supplierTransporterPhone2: payload.supplierTransporterPhone2.trim(),
					}
				: {}),
			...(payload.supplierTransporterContactPerson1Phone !== undefined
				? {
						supplierTransporterContactPerson1Phone:
							payload.supplierTransporterContactPerson1Phone.trim(),
					}
				: {}),
			...(payload.supplierTransporterContactPerson2Phone !== undefined
				? {
						supplierTransporterContactPerson2Phone:
							payload.supplierTransporterContactPerson2Phone.trim(),
					}
				: {}),
			...(userId ? { updatedBy: new mongoose.Types.ObjectId(userId) } : {}),
		},
		{ new: true },
	)
		.populate("createdBy", "firstName lastName userName email phone")
		.populate("updatedBy", "firstName lastName userName email phone");

	if (!updated)
		throw Object.assign(new Error("Supplier not found"), { statusCode: 404 });

	return updated;
};

export const deleteSupplier = async (id: string) => {
	ensureObjectId(id, "supplier id");

	const deleted = await Supplier.findByIdAndDelete(id);
	if (!deleted)
		throw Object.assign(new Error("Supplier not found"), { statusCode: 404 });
	return true;
};
