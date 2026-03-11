import mongoose from "mongoose";
import { Labour } from "../../models/Masters/Labour";
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

export const createLabour = async (
	payload: {
		labourName: string;
		contactNumber: string;
		panNumber?: string;
		panDocument?: File;
		aadharNumber?: string;
		aadharDocument?: File;
		remark?: string;
		address?: string;
		state?: string;
		city?: string;
		country?: string;
		pincode?: string;
	},
	userId?: string,
) => {
	const labourName = payload.labourName.trim();
	const remark = payload.remark?.trim() || "";
	const contactNumber = payload.contactNumber.trim();
	const address = payload.address?.trim() || "";
	const state = payload.state?.trim() || "";
	const city = payload.city?.trim() || "";
	const country = payload.country?.trim() || "";
	const pincode = payload.pincode?.trim() || "";
	const panNumber = payload.panNumber?.trim() || "";
	const panDocument = payload.panDocument;
	const aadharNumber = payload.aadharNumber?.trim() || "";
	const aadharDocument = payload.aadharDocument;

	const exists = await Labour.findOne({ labourName }).lean();
	if (exists) {
		throw Object.assign(new Error("Labour already exists"), {
			statusCode: 409,
		});
	}

	const srNo = await getNextSequence("labour_srno");

	const labour = await Labour.create({
		srNo,
		labourName,
		remark,
		contactNumber,
		address,
		state,
		city,
		country,
		pincode,
		createdBy: userId ? new mongoose.Types.ObjectId(userId) : undefined,
		updatedBy: userId ? new mongoose.Types.ObjectId(userId) : undefined,
		panNumber,
		panDocument,
		aadharNumber,
		aadharDocument,
	});

	return labour;
};

export const listLabours = async () => {
	return Labour.find()
		.sort({ srNo: 1 })
		.populate("createdBy", "firstName lastName userName email phone")
		.populate("updatedBy", "firstName lastName userName email phone")
		.lean();
};

export const getLabourById = async (id: string) => {
	ensureObjectId(id, "labour id");

	const labour = await Labour.findById(id)
		.populate("createdBy", "firstName lastName userName email phone")
		.populate("updatedBy", "firstName lastName userName email phone")
		.lean();

	if (!labour)
		throw Object.assign(new Error("Labour not found"), { statusCode: 404 });
	return labour;
};

export const updateLabour = async (
	id: string,
	payload: {
		labourName?: string;
		remark?: string;
		contactNumber?: string;
		address?: string;
		state?: string;
		city?: string;
		country?: string;
		pincode?: string;
		panNumber?: string;
		panDocument?: File;
		aadharNumber?: string;
		aadharDocument?: File;
	},
	userId?: string,
) => {
	ensureObjectId(id, "labour id");

	if (payload.labourName) {
		const labourName = payload.labourName.trim();
		const exists = await Labour.findOne({
			labourName,
			_id: { $ne: id },
		}).lean();
		if (exists) {
			throw Object.assign(new Error("Labour already exists"), {
				statusCode: 409,
			});
		}
	}

	const updated = await Labour.findByIdAndUpdate(
		id,
		{
			...(payload.labourName !== undefined
				? { labourName: payload.labourName.trim() }
				: {}),
			...(payload.remark !== undefined
				? { remark: payload.remark.trim() }
				: {}),
			...(payload.address !== undefined
				? { address: payload.address.trim() }
				: {}),
			...(payload.contactNumber !== undefined
				? { contactNumber: payload.contactNumber.trim() }
				: {}),
			...(payload.state !== undefined ? { state: payload.state.trim() } : {}),
			...(payload.city !== undefined ? { city: payload.city.trim() } : {}),
			...(payload.country !== undefined
				? { country: payload.country.trim() }
				: {}),
			...(payload.pincode !== undefined
				? { pincode: payload.pincode.trim() }
				: {}),
			...(payload.panNumber !== undefined
				? { panNumber: payload.panNumber.trim() }
				: {}),
			...(payload.panDocument !== undefined
				? { panDocument: payload.panDocument }
				: {}),
			...(payload.aadharNumber !== undefined
				? { aadharNumber: payload.aadharNumber.trim() }
				: {}),
			...(payload.aadharDocument !== undefined
				? { aadharDocument: payload.aadharDocument }
				: {}),
			...(userId ? { updatedBy: new mongoose.Types.ObjectId(userId) } : {}),
		},
		{ new: true },
	)
		.populate("createdBy", "firstName lastName userName email phone")
		.populate("updatedBy", "firstName lastName userName email phone");

	if (!updated)
		throw Object.assign(new Error("Labour not found"), { statusCode: 404 });
	return updated;
};

export const deleteLabour = async (id: string) => {
	ensureObjectId(id, "labour id");

	const deleted = await Labour.findByIdAndDelete(id);
	if (!deleted)
		throw Object.assign(new Error("Labour not found"), { statusCode: 404 });

	return true;
};
