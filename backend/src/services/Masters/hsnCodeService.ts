import mongoose from "mongoose";
import { HSNCode } from "../../models/Masters/HSNCode";
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
	return doc.seq;
};

export const createHSNCode = async (
	payload: { gstRate?: string; hsnCode: string; hsnDescription?: string },
	userId?: string,
) => {
	const hsnCode = payload.hsnCode.trim();
	const hsnDescription = payload.hsnDescription?.trim();
	const gstRate = payload.gstRate?.trim();

	const exists = await HSNCode.findOne({
		hsnCode,
		_id: { $ne: null },
	}).lean();

	if (exists) {
		throw Object.assign(new Error("HSN Code already exists"), {
			statusCode: 400,
		});
	}

	const srNo = await getNextSequence("hsncode_srno");

	const hsn = await HSNCode.create({
		srNo,
		hsnCode,
		hsnDescription,
		gstRate,
		createdBy: userId ? new mongoose.Types.ObjectId(userId) : undefined,
		updatedBy: userId ? new mongoose.Types.ObjectId(userId) : undefined,
	} as any);
	return hsn;
};

export const listHSNCodes = async () => {
	return HSNCode.find()
		.sort({ srNo: 1 })
		.populate("createdBy", "firstName lastName userName email phone")
		.populate("updatedBy", "firstName lastName userName email phone")
		.lean();
};

export const getHSNCodeById = async (id: string) => {
	ensureObjectId(id, "HSN Code ID");

	const hsn = await HSNCode.findById(id)
		.populate("createdBy", "firstName lastName userName email phone")
		.populate("updatedBy", "firstName lastName userName email phone")
		.lean();

	if (!hsn) {
		throw Object.assign(new Error("HSN Code not found"), { statusCode: 404 });
	}
	return hsn;
};

export const updateHSNCode = async (
	id: string,
	payload: { gstRate?: string; hsnCode?: string; hsnDescription?: string },
	userId?: string,
) => {
	ensureObjectId(id, "HSN Code ID");

	if (payload.hsnCode) {
		const hsnCode = payload.hsnCode.trim();

		const exists = await HSNCode.findOne({
			hsnCode,
			_id: { $ne: id },
		}).lean();
		if (exists) {
			throw Object.assign(new Error("HSN Code already exists"), {
				statusCode: 400,
			});
		}
	}

	const updated = await HSNCode.findByIdAndUpdate(
		id,
		{
			...(payload.gstRate && { gstRate: payload.gstRate.trim() }),
			...(payload.hsnCode && { hsnCode: payload.hsnCode.trim() }),
			...(payload.hsnDescription && {
				hsnDescription: payload.hsnDescription.trim(),
			}),
			updatedBy: userId ? new mongoose.Types.ObjectId(userId) : undefined,
		},
		{ new: true },
	)
		.populate("createdBy", "firstName lastName userName email phone")
		.populate("updatedBy", "firstName lastName userName email phone")
		.lean();

	if (!updated)
		throw Object.assign(new Error("HSN Code not found"), { statusCode: 404 });
	return updated;
};

export const deleteHSNCode = async (id: string) => {
	ensureObjectId(id, "HSN Code ID");

	const deleted = await HSNCode.findByIdAndDelete(id).lean();
	if (!deleted)
		throw Object.assign(new Error("HSN Code not found"), { statusCode: 404 });
	return true;
};
