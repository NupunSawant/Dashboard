import mongoose, { Schema, Document } from "mongoose";

export interface IUnit extends Document {
	srNo?: number;
	unitName?: string;
	unitSymbol?: string;
	createdAt?: Date;
	updatedAt?: Date;

	createdBy?: mongoose.Types.ObjectId;
	updatedBy?: mongoose.Types.ObjectId;
}

const UnitSchema = new Schema<IUnit>(
	{
		srNo: { type: Number, required: true, unique: true, index: true },
		unitName: { type: String, required: true, trim: true, unique: true },
		unitSymbol: { type: String, required: true, trim: true, unique: true },
		createdBy: { type: Schema.Types.ObjectId, ref: "User" },
		updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
	},
	{ timestamps: true },
);

export const Unit = mongoose.model<IUnit>("Unit", UnitSchema);
