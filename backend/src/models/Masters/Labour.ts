import mongoose, { Document, Schema } from "mongoose";

export interface ILabour extends Document {
	srNo?: number;
	labourName?: string;
	contactNumber?: string;
    panNumber?: string;
    panDocument?: File;
    aadharNumber?: string;
    aadharDocument?: File;
	remark?: string;
	address?: string;
	state?: string;
	city?: string;
	country?: string;
	pincode?: string;

	createdAt?: Date;
	updatedAt?: Date;

	createdBy?: mongoose.Types.ObjectId;
	updatedBy?: mongoose.Types.ObjectId;
}

const LabourSchema = new Schema<ILabour>(
	{
		srNo: { type: Number, required: true, unique: true, index: true },
		labourName: { type: String, required: true },
		contactNumber: { type: String, required: true },
		panNumber: { type: String, trim: true },
		panDocument: { type: String, trim: true },
		aadharNumber: { type: String, trim: true },
		aadharDocument: { type: String, trim: true },
		remark: { type: String, trim: true },
		address: { type: String, trim: true },
		state: { type: String, trim: true },
		city: { type: String, trim: true },
		country: { type: String, trim: true },
		pincode: { type: String, trim: true },
		createdBy: { type: Schema.Types.ObjectId, ref: "User" },
		updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
	},
	{ timestamps: true },
);

export const Labour = mongoose.model<ILabour>("Labour", LabourSchema);
