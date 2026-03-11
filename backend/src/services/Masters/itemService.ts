import mongoose from "mongoose";
import { Item } from "../../models/Masters/Item";
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

export const createitem = async (
	payload: {
		itemName: string;
		itemCode: string;
		category: string;
		subCategory?: string;
		unit: string;
		gst?: string;
		remark?: string;
	},
	userId?: string,
) => {
	const itemName = payload.itemName.trim();
	const itemCode = payload.itemCode.trim();
	const category = payload.category.trim();
	const subCategory = payload.subCategory?.trim() || "";
	const unit = payload.unit.trim();
	const gst = payload.gst?.trim() || "0";
	const remark = payload.remark?.trim() || "";

	const exists = await Item.findOne({ itemName, itemCode }).lean();
	if (exists) {
		throw Object.assign(new Error("Item already exists"), { statusCode: 409 });
	}

	const srNo = await getNextSequence("item_srno");

	const item = await Item.create({
		srNo,
		itemName,
		itemCode,
		category,
		subCategory,
		unit,
		gst,
		remark,
		createdBy: userId ? new mongoose.Types.ObjectId(userId) : undefined,
		updatedBy: userId ? new mongoose.Types.ObjectId(userId) : undefined,
	});

	return item;
};

export const listItems = async () => {
	return Item.find()
		.sort({ srNo: 1 })
		.populate("createdBy", "firstName lastName userName email phone")
		.populate("updatedBy", "firstName lastName userName email phone")
		.lean();
};

export const getItemById = async (id: string) => {
	ensureObjectId(id, "item id");

	const item = await Item.findById(id)
		.populate("createdBy", "firstName lastName userName email phone")
		.populate("updatedBy", "firstName lastName userName email phone")
		.lean();

	if (!item)
		throw Object.assign(new Error("Item not found"), { statusCode: 404 });
	return item;
};

export const updateItem = async (
	id: string,
	payload: {
		itemName?: string;
		itemCode?: string;
		category?: string;
		subCategory?: string;
		unit?: string;
		gst?: string;
		remark?: string;
	},
	userId?: string,
) => {
	ensureObjectId(id, "item id");

	if (payload.itemName || payload.itemCode) {
		const itemName = payload.itemName?.trim();
		const itemCode = payload.itemCode?.trim();
		const exists = await Item.findOne({
			itemName,
			itemCode,
			_id: { $ne: id },
		}).lean();
		if (exists) {
			throw Object.assign(new Error("Item already exists"), {
				statusCode: 409,
			});
		}
	}

	const updated = await Item.findByIdAndUpdate(
		id,
		{
			...(payload.itemName !== undefined
				? { itemName: payload.itemName.trim() }
				: {}),
			...(payload.itemCode !== undefined
				? { itemCode: payload.itemCode.trim() }
				: {}),
			...(payload.category !== undefined
				? { category: payload.category.trim() }
				: {}),
			...(payload.subCategory !== undefined
				? { subCategory: payload.subCategory.trim() }
				: {}),
			...(payload.unit !== undefined ? { unit: payload.unit.trim() } : {}),
			...(payload.gst !== undefined ? { gst: payload.gst.trim() } : {}),
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
		throw Object.assign(new Error("Item not found"), { statusCode: 404 });
	return updated;
};

export const deleteItem = async (id: string) => {
	ensureObjectId(id, "item id");

	const deleted = await Item.findByIdAndDelete(id);
	if (!deleted)
		throw Object.assign(new Error("Item not found"), { statusCode: 404 });

	return true;
};
