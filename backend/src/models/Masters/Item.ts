import mongoose, { Document } from "mongoose";

export type UnitType = "meter" | "millimeter" | "centimeter";

export interface IItem extends Document {
	srNo: number;
	itemName: string;
	itemCode: string;
	category: string;
	subCategory?: string;
	unit: string;
	gst?: string;
	remark?: string;
	createdAt: Date;
	updatedAt: Date;

	createdBy?: mongoose.Types.ObjectId;
	updatedBy?: mongoose.Types.ObjectId;
}

const ItemSchema = new mongoose.Schema<IItem>(
	{
		srNo: { type: Number, required: true, unique: true, index: true },
		itemName: { type: String, required: true, trim: true },
		itemCode: { type: String, required: true, unique: true, trim: true },
		category: { type: String, required: true, trim: true },
		subCategory: { type: String, default: "", trim: true },
		gst: { type: String, default: "0" },
		unit: { type: String, required: true, default: "", trim: true },
		remark: { type: String, default: "", trim: true },

		createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
		updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
	},
	{ timestamps: true },
);

export const Item = mongoose.model<IItem>("Item", ItemSchema);
