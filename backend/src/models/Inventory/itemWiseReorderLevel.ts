// models/Inventory/ReorderLevel/itemWiseReorderLevelModel.ts

import mongoose, { Document, HydratedDocument, Schema } from "mongoose";

export interface IItemWiseReorderLevel extends Document {
	srNo?: number;

	category?: string;
	subCategory?: string;

	itemName: string;
	itemCode: string;
	unit?: string;

	categoryKey: string;
	subCategoryKey: string;
	itemKey: string;
	unitKey: string;

	reorderLevel: number;

	createdBy?: mongoose.Types.ObjectId;
	updatedBy?: mongoose.Types.ObjectId;

	createdAt?: Date;
	updatedAt?: Date;
}

const norm = (v: unknown) =>
	String(v ?? "")
		.trim()
		.toLowerCase();

const ItemWiseReorderLevelSchema = new Schema<IItemWiseReorderLevel>(
	{
		srNo: { type: Number, required: true, unique: true, index: true },

		category: { type: String, default: "", trim: true },
		subCategory: { type: String, default: "", trim: true },

		itemName: { type: String, required: true, trim: true },
		itemCode: { type: String, required: true, trim: true },
		unit: { type: String, default: "", trim: true },

		categoryKey: { type: String, required: true, index: true, default: "" },
		subCategoryKey: { type: String, required: true, index: true, default: "" },
		itemKey: { type: String, required: true, index: true },
		unitKey: { type: String, required: true, index: true, default: "" },

		reorderLevel: { type: Number, required: true, min: 0, default: 0 },

		createdBy: { type: Schema.Types.ObjectId, ref: "User" },
		updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
	},
	{ timestamps: true },
);

ItemWiseReorderLevelSchema.pre(
	"validate",
	function (this: HydratedDocument<IItemWiseReorderLevel>) {
		(this as any).categoryKey = norm(this.category);
		(this as any).subCategoryKey = norm(this.subCategory);
		(this as any).itemKey = norm(this.itemName);
		(this as any).unitKey = norm(this.unit);
	},
);

// one item-wise reorder level per item/category/subcategory/unit combo
ItemWiseReorderLevelSchema.index(
	{
		categoryKey: 1,
		subCategoryKey: 1,
		itemKey: 1,
		unitKey: 1,
	},
	{ unique: true },
);

export const ItemWiseReorderLevel = mongoose.model<IItemWiseReorderLevel>(
	"ItemWiseReorderLevel",
	ItemWiseReorderLevelSchema,
);