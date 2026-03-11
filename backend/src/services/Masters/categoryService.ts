import mongoose from "mongoose";
import { Category } from "../../models/Masters/Category";
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

export const createCategory = async (
	payload: { name: string; remark?: string },
	userId?: string,
) => {
	const name = payload.name.trim();
	const remark = payload.remark?.trim() || "";

	const exists = await Category.findOne({ name }).lean();
	if (exists) {
		throw Object.assign(new Error("Category already exists"), {
			statusCode: 409,
		});
	}

	const srNo = await getNextSequence("category_srno");

	const category = await Category.create({
		srNo,
		name,
		remark,
		createdBy: userId ? new mongoose.Types.ObjectId(userId) : undefined,
		updatedBy: userId ? new mongoose.Types.ObjectId(userId) : undefined,
	});

	return category;
};

export const listCategories = async () => {
	return Category.find()
		.sort({ srNo: 1 })
		.populate("createdBy", "firstName lastName userName email phone")
		.populate("updatedBy", "firstName lastName userName email phone")
		.lean();
};

export const getCategoryById = async (id: string) => {
	ensureObjectId(id, "category id");

	const category = await Category.findById(id)
		.populate("createdBy", "firstName lastName userName email phone")
		.populate("updatedBy", "firstName lastName userName email phone")
		.lean();

	if (!category)
		throw Object.assign(new Error("Category not found"), { statusCode: 404 });
	return category;
};

export const updateCategory = async (
	id: string,
	payload: { name?: string; remark?: string },
	userId?: string,
) => {
	ensureObjectId(id, "category id");

	if (payload.name) {
		const name = payload.name.trim();
		const exists = await Category.findOne({ name, _id: { $ne: id } }).lean();
		if (exists) {
			throw Object.assign(new Error("Category already exists"), {
				statusCode: 409,
			});
		}
	}

	const updated = await Category.findByIdAndUpdate(
		id,
		{
			...(payload.name !== undefined ? { name: payload.name.trim() } : {}),
			...(payload.remark !== undefined
				? { remark: payload.remark.trim() }
				: {}),
			...(userId ? { updatedBy: new mongoose.Types.ObjectId(userId) } : {}),
		},
		{ new: true },
	)
		.populate("createdBy", "firstName lastName userName email phone")
		.populate("updatedBy", "firstName lastName userName email phone");

	if (!updated)
		throw Object.assign(new Error("Category not found"), { statusCode: 404 });
	return updated;
};

export const deleteCategory = async (id: string) => {
	ensureObjectId(id, "category id");

	const deleted = await Category.findByIdAndDelete(id);
	if (!deleted)
		throw Object.assign(new Error("Category not found"), { statusCode: 404 });

	return true;
};
