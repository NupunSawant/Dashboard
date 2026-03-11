// models/Inventory/ReorderLevel/warehouseWiseReorderLevelModel.ts

import mongoose, { Document, HydratedDocument, Schema } from "mongoose";

export interface IWarehouseWiseReorderLevel extends Document {
	srNo?: number;

	warehouseName: string;
	category?: string;
	subCategory?: string;

	itemName: string;
	itemCode: string;
	unit?: string;

	warehouseKey: string;
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

const WarehouseWiseReorderLevelSchema =
	new Schema<IWarehouseWiseReorderLevel>(
		{
			srNo: { type: Number, required: true, unique: true, index: true },

			warehouseName: { type: String, required: true, trim: true },
			category: { type: String, default: "", trim: true },
			subCategory: { type: String, default: "", trim: true },

			itemName: { type: String, required: true, trim: true },
			itemCode: { type: String, required: true, trim: true },
			unit: { type: String, default: "", trim: true },

			warehouseKey: { type: String, required: true, index: true },
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

WarehouseWiseReorderLevelSchema.pre(
	"validate",
	function (this: HydratedDocument<IWarehouseWiseReorderLevel>) {
		(this as any).warehouseKey = norm(this.warehouseName);
		(this as any).categoryKey = norm(this.category);
		(this as any).subCategoryKey = norm(this.subCategory);
		(this as any).itemKey = norm(this.itemName);
		(this as any).unitKey = norm(this.unit);
	},
);

// one warehouse-wise reorder level per warehouse + item/category/subcategory/unit combo
WarehouseWiseReorderLevelSchema.index(
	{
		warehouseKey: 1,
		categoryKey: 1,
		subCategoryKey: 1,
		itemKey: 1,
		unitKey: 1,
	},
	{ unique: true },
);

export const WarehouseWiseReorderLevel =
	mongoose.model<IWarehouseWiseReorderLevel>(
		"WarehouseWiseReorderLevel",
		WarehouseWiseReorderLevelSchema,
	);