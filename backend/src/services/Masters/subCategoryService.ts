import mongoose from "mongoose";
import { SubCategory } from "../../models/Masters/SubCategory";
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

export const createSubCategory = async (
	payload: { name: string; category: string; remark?: string },
	userId?: string,
) => {
	const name = payload.name.trim();
	const category = payload.category.trim();
	const remark = payload.remark?.trim() || "";

	const exists = await SubCategory.findOne({ name, category }).lean();
	if (exists) {
		throw Object.assign(
			new Error("Sub-category already exists in this category"),
			{ statusCode: 409 },
		);
	}

	const srNo = await getNextSequence("subcategory_srno");

	const subCategory = await SubCategory.create({
		srNo,
		name,
		category,
		remark,
		createdBy: userId ? new mongoose.Types.ObjectId(userId) : undefined,
		updatedBy: userId ? new mongoose.Types.ObjectId(userId) : undefined,
	} as any);

	return subCategory;
};

export const listSubCategories = async () => {
	return SubCategory.find()
		.sort({ srNo: 1 })
		.populate("createdBy", "firstName lastName userName email phone")
		.populate("updatedBy", "firstName lastName userName email phone")
		.lean();
};

export const getSubCategoryById = async (id: string) => {
	ensureObjectId(id, "subcategory id");

	const subCategory = await SubCategory.findById(id)
		.populate("createdBy", "firstName lastName userName email phone")
		.populate("updatedBy", "firstName lastName userName email phone")
		.lean();

	if (!subCategory)
		throw Object.assign(new Error("Sub-category not found"), {
			statusCode: 404,
		});
	return subCategory;
};

export const updateSubCategory = async (
	id: string,
	payload: { name?: string; category?: string; remark?: string },
	userId?: string,
) => {
	ensureObjectId(id, "subcategory id");

	if (payload.name && payload.category) {
		const name = payload.name.trim();
		const category = payload.category.trim();
		const exists = await SubCategory.findOne({
			name,
			category,
			_id: { $ne: id },
		}).lean();
		if (exists) {
			throw Object.assign(
				new Error("Sub-category already exists in this category"),
				{ statusCode: 409 },
			);
		}
	}
	const updated = await SubCategory.findByIdAndUpdate(
		id,
		{
			...(payload.name !== undefined ? { name: payload.name.trim() } : {}),
			...(payload.category !== undefined
				? { category: payload.category.trim() }
				: {}),
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
		throw Object.assign(new Error("Sub-category not found"), {
			statusCode: 404,
		});
	return updated;
};

export const deleteSubCategory = async (id: string) => {
	ensureObjectId(id, "subcategory id");

	const deleted = await SubCategory.findByIdAndDelete(id);
	if (!deleted)
		throw Object.assign(new Error("Sub-category not found"), {
			statusCode: 404,
		});

	return true;
};
