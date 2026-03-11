import mongoose from "mongoose";
import { GST } from "../../models/Masters/GST";
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

export const createGST = async (
	payload: { gstRate: string; remark?: string },
	userId?: string,
) => {
	const gstRate = payload.gstRate;
	const remark = payload.remark?.trim();

	const exists = await GST.findOne({
		gstRate,
		_id: { $ne: null },
	}).lean();

	if (exists) {
		throw Object.assign(new Error("GST already exists"), { statusCode: 400 });
	}

	const srNo = await getNextSequence("gst_srno");

	const gst = await GST.create({
		srNo,
		gstRate,
		remark,
		createdBy: userId ? new mongoose.Types.ObjectId(userId) : undefined,
		updatedBy: userId ? new mongoose.Types.ObjectId(userId) : undefined,
	} as any);
	return gst;
};

export const listGSTs = async () => {
	return GST.find()
		.sort({ srNo: 1 })
		.populate("createdBy", "firstName lastName userName email phone")
		.populate("updatedBy", "firstName lastName userName email phone")
		.lean();
};

export const getGSTById = async (id: string) => {
	ensureObjectId(id, "GST ID");

	const gst = await GST.findById(id)
		.populate("createdBy", "firstName lastName userName email phone")
		.populate("updatedBy", "firstName lastName userName email phone")
		.lean();

	if (!gst) {
		throw Object.assign(new Error("GST not found"), { statusCode: 404 });
	}
	return gst;
};

export const updateGST = async (
	id: string,
	payload: { gstRate?: string; remark?: string },
	userId?: string,
) => {
	ensureObjectId(id, "GST ID");

	if (payload.gstRate && payload.remark) {
		const gstRate = payload.gstRate;
		const remark = payload.remark.trim();

		const exists = await GST.findOne({
			$or: [{ gstRate }, { remark }],
			_id: { $ne: id },
		}).lean();
		if (exists) {
			throw Object.assign(new Error("GST already exists"), { statusCode: 400 });
		}
	}

	const updated = await GST.findByIdAndUpdate(
		id,
		{
			...(payload.gstRate ? { gstRate: payload.gstRate } : {}),
			...(payload.remark ? { remark: payload.remark.trim() } : {}),
			updatedBy: userId ? new mongoose.Types.ObjectId(userId) : undefined,
		},
		{ new: true },
	)
		.populate("createdBy", "firstName lastName userName email phone")
		.populate("updatedBy", "firstName lastName userName email phone")
		.lean();

	if (!updated)
		throw Object.assign(new Error("GST not found"), { statusCode: 404 });
	return updated;
};

export const deleteGST = async (id: string) => {
	ensureObjectId(id, "GST ID");

	const deleted = await GST.findByIdAndDelete(id);
	if (!deleted)
		throw Object.assign(new Error("GST not found"), { statusCode: 404 });

	return true;
};
