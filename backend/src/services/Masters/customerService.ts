// src/services/Masters/customerService.ts
import mongoose from "mongoose";
import { Customer } from "../../models/Masters/Customer";
import { Counter } from "../../models/Counter";

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

export const createCustomer = async (
	payload: {
		customerName: string;
		companyName?: string;
		customerType?: string;
		customerEmail: string;
		customerPhone: number;
		customerAadhar?: string;
		customerGst?: string;
		customerContactPersonName?: string;
		customerContactPersonPhone?: number;
		customerAddress?: string;
		customerState?: string;
		customerCity?: string;
		customerPincode?: string;
	},
	userId?: string,
) => {
	const customerName = payload.customerName.trim();
	const companyName = payload.companyName?.trim() || "";
	const customerType = payload.customerType?.trim() || "";
	const customerEmail = payload.customerEmail.trim();
	const customerPhone = payload.customerPhone;

	const customerAadhar = payload.customerAadhar?.trim() || "";
	const customerGst = payload.customerGst?.trim() || "";

	const customerContactPersonName =
		payload.customerContactPersonName?.trim() || "";
	const customerContactPersonPhone = payload.customerContactPersonPhone;

	const customerAddress = payload.customerAddress?.trim() || "";
	const customerState = payload.customerState?.trim() || "";
	const customerCity = payload.customerCity?.trim() || "";
	const customerPincode = payload.customerPincode?.trim() || "";

	const exists = await Customer.findOne({ customerEmail }).lean();
	if (exists) {
		throw Object.assign(new Error("Customer already exists"), {
			statusCode: 409,
		});
	}

	const srNo = await getNextSequence("customer_srno");

	const customer = await Customer.create({
		srNo,
		customerName,
		companyName,
		customerType,
		customerEmail,
		customerPhone,
		customerAadhar,
		customerGst,
		customerContactPersonName,
		customerContactPersonPhone,
		customerAddress,
		customerState,
		customerCity,
		customerPincode,
		createdBy: userId ? new mongoose.Types.ObjectId(userId) : undefined,
		updatedBy: userId ? new mongoose.Types.ObjectId(userId) : undefined,
	});

	return customer;
};

export const listCustomers = async () => {
	return Customer.find()
		.sort({ srNo: 1 })
		.populate("createdBy", "firstName lastName userName email phone")
		.populate("updatedBy", "firstName lastName userName email phone")
		.lean();
};

export const getCustomerById = async (id: string) => {
	ensureObjectId(id, "customer id");

	const customer = await Customer.findById(id)
		.populate("createdBy", "firstName lastName userName email phone")
		.populate("updatedBy", "firstName lastName userName email phone")
		.lean();

	if (!customer)
		throw Object.assign(new Error("Customer not found"), { statusCode: 404 });
	return customer;
};

export const updateCustomer = async (
	id: string,
	payload: {
		customerName?: string;
		companyName?: string;
		customerType?: string;
		customerEmail?: string;
		customerPhone?: number;
		customerAadhar?: string;
		customerGst?: string;
		customerContactPersonName?: string;
		customerContactPersonPhone?: number;
		customerAddress?: string;
		customerState?: string;
		customerCity?: string;
		customerPincode?: string;
	},
	userId?: string,
) => {
	ensureObjectId(id, "customer id");

	if (payload.customerEmail) {
		const customerEmail = payload.customerEmail.trim();
		const exists = await Customer.findOne({
			customerEmail,
			_id: { $ne: id },
		}).lean();
		if (exists) {
			throw Object.assign(new Error("Customer already exists"), {
				statusCode: 409,
			});
		}
	}

	const updated = await Customer.findByIdAndUpdate(
		id,
		{
			...(payload.customerName !== undefined
				? { customerName: payload.customerName.trim() }
				: {}),
			...(payload.companyName !== undefined
				? { companyName: payload.companyName.trim() }
				: {}),
			...(payload.customerType !== undefined
				? { customerType: payload.customerType.trim() }
				: {}),
			...(payload.customerEmail !== undefined
				? { customerEmail: payload.customerEmail.trim() }
				: {}),
			...(payload.customerPhone !== undefined
				? { customerPhone: payload.customerPhone }
				: {}),
			...(payload.customerAadhar !== undefined
				? { customerAadhar: payload.customerAadhar.trim() }
				: {}),
			...(payload.customerGst !== undefined
				? { customerGst: payload.customerGst.trim() }
				: {}),
			...(payload.customerContactPersonName !== undefined
				? {
						customerContactPersonName: payload.customerContactPersonName.trim(),
					}
				: {}),
			...(payload.customerContactPersonPhone !== undefined
				? { customerContactPersonPhone: payload.customerContactPersonPhone }
				: {}),
			...(payload.customerAddress !== undefined
				? { customerAddress: payload.customerAddress.trim() }
				: {}),
			...(payload.customerState !== undefined
				? { customerState: payload.customerState.trim() }
				: {}),
			...(payload.customerCity !== undefined
				? { customerCity: payload.customerCity.trim() }
				: {}),
			...(payload.customerPincode !== undefined
				? { customerPincode: payload.customerPincode.trim() }
				: {}),
			...(userId ? { updatedBy: new mongoose.Types.ObjectId(userId) } : {}),
		},
		{ new: true },
	)
		.populate("createdBy", "firstName lastName userName email phone")
		.populate("updatedBy", "firstName lastName userName email phone");

	if (!updated)
		throw Object.assign(new Error("Customer not found"), { statusCode: 404 });
	return updated;
};

export const deleteCustomer = async (id: string) => {
	ensureObjectId(id, "customer id");

	const deleted = await Customer.findByIdAndDelete(id);
	if (!deleted)
		throw Object.assign(new Error("Customer not found"), { statusCode: 404 });

	return true;
};
