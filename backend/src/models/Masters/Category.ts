import mongoose, { Document, Schema } from "mongoose";

export interface ICategory extends Document {
	srNo?:number
	name?: String;
	remark?: String;

	createdBy?:mongoose.Types.ObjectId;
	updatedBy?:mongoose.Types.ObjectId;

	createdAt?: Date;
	updatedAt?: Date;
}

const CategorySchema = new Schema<ICategory>(
	{
		srNo: { type: Number, required: true, unique: true, index: true },
		name: { type: String, required: true, trim: true },
		remark: { type: String, default: "", trim: true },

		createdBy: {type:Schema.Types.ObjectId, ref:"User"},
		updatedBy: {type:Schema.Types.ObjectId, ref:"User"},	
	},
	{ timestamps: true },
);

export const Category = mongoose.model<ICategory>("Category", CategorySchema);
