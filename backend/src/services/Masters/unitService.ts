import mongoose from "mongoose";
import { Unit } from "../../models/Masters/Unit";
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

export const createUnit = async (
	payload: { unitName: string; unitSymbol: string },
	userId?: string,
) => {
	const unitName = payload.unitName.trim();
	const unitSymbol = payload.unitSymbol.trim();

	const exists = await Unit.findOne({
		$or: [{ unitName }, { unitSymbol }],
	}).lean();
	if (exists) {
		throw Object.assign(new Error("Unit already exists"), { statusCode: 400 });
	}

	const srNo = await getNextSequence("unit_srno");

	const unit = await Unit.create({
		srNo,
		unitName,
		unitSymbol,
		createdBy: userId ? new mongoose.Types.ObjectId(userId) : undefined,
		updatedBy: userId ? new mongoose.Types.ObjectId(userId) : undefined,
	} as any);
	return unit;
};

export const listUnits = async () => {
	return Unit.find()
		.sort({ srNo: 1 })
		.populate("createdBy", "firstName lastName userName email phone")
		.populate("updatedBy", "firstName lastName userName email phone")
		.lean();
};

export const getUnitById = async (id: string) => {
	ensureObjectId(id, "Unit ID");

	const unit = await Unit.findById(id)
		.populate("createdBy", "firstName lastName userName email phone")
		.populate("updatedBy", "firstName lastName userName email phone")
		.lean();

	if (!unit)
		throw Object.assign(new Error("Unit not found"), { statusCode: 404 });

	return unit;
};

export const updateUnit = async (
	id: string,
	payload: { unitName?: string; unitSymbol?: string },
	userId?: string,
) => {
	ensureObjectId(id, "Unit ID");

	if (payload.unitName && payload.unitSymbol) {
		const unit = payload.unitName.trim();
		const symbol = payload.unitSymbol.trim();
		const exists = await Unit.findOne({
			unitName: unit,
			unitSymbol: symbol,
			_id: { $ne: new mongoose.Types.ObjectId(id) },
		}).lean();
		if (exists) {
			throw Object.assign(new Error("Unit already exists"), {
				statusCode: 400,
			});
		}
	}

	const updated = await Unit.findByIdAndUpdate(
		id,
		{
			...(payload.unitName ? { unitName: payload.unitName.trim() } : {}),
			...(payload.unitSymbol ? { unitSymbol: payload.unitSymbol.trim() } : {}),
			updatedBy: userId ? new mongoose.Types.ObjectId(userId) : undefined,
		},
		{ new: true },
	)
		.populate("createdBy", "firstName lastName userName email phone")
		.populate("updatedBy", "firstName lastName userName email phone")
		.lean();

	if (!updated)
		throw Object.assign(new Error("Unit not found"), { statusCode: 404 });
	return updated;
};

export const deleteUnit = async (id: string) => {
	ensureObjectId(id, "Unit ID");

	const deleted = await Unit.findByIdAndDelete(id);
	if (!deleted)
		throw Object.assign(new Error("Unit not found"), { statusCode: 404 });

	return true;
};
