import mongoose, { Document, Schema } from "mongoose";

export interface ISubCategory extends Document {
	srNo?: number;
	name?: String;
	category?: string;
	remark?: String;
	createdAt?: Date;
	updatedAt?: Date;

	createdBy?: mongoose.Types.ObjectId;
	updatedBy?: mongoose.Types.ObjectId;
}

const SubCategorySchema = new Schema<ISubCategory>(
	{
		srNo: { type: Number, required: true, unique: true, index: true },
		name: { type: String, required: true, trim: true, unique: true },
		category: { type: String, required: true, trim: true },
		remark: { type: String, default: "", trim: true },

		createdBy: { type: Schema.Types.ObjectId, ref: "User" },
		updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
	},
	{ timestamps: true },
);

export const SubCategory = mongoose.model<ISubCategory>(
	"SubCategory",
	SubCategorySchema,
);
