// models/Enquiries/Enquiry.ts

import mongoose, { Schema, Document, Types } from "mongoose";

export type EnquiryStage =
	| "PENDING"
	| "QUOTATION_CREATED"
	| "REQUEST_FOR_QUOTATION"
	| "CLOSED";

export interface IEnquiryItem {
	itemsCategory: string;
	itemsSubCategory: string;
	itemsName: string;
	itemsCode: string;
	itemsUnit: string;
	itemsRemark?: string;
}

export interface IEnquiry extends Document {
	srNo: number;
	enquiryNo: string;

	enquiryDate: Date;
	sourceOfEnquiry: string;

	customerName: string;
	contactPersonName: string;
	contactPersonPhone: number;

	staffName: string;
	stage: EnquiryStage;

	remarks?: string;

	items: IEnquiryItem[];

	createdBy: Types.ObjectId;
	updatedBy?: Types.ObjectId;

	createdAt: Date;
	updatedAt: Date;
}

const EnquiryItemSchema = new Schema<IEnquiryItem>(
	{
		itemsCategory: { type: String, required: true, trim: true },
		itemsSubCategory: { type: String, required: true, trim: true },
		itemsName: { type: String, required: true, trim: true },
		itemsCode: { type: String, required: true, trim: true },
		itemsUnit: { type: String, required: true, trim: true },
		itemsRemark: { type: String, trim: true },
	},
	{ _id: false },
);

const EnquirySchema = new Schema<IEnquiry>(
	{
		srNo: { type: Number, required: true, index: true },

		//   unique index is already created from "unique: true"
		enquiryNo: { type: String, required: true, unique: true, trim: true },

		enquiryDate: { type: Date, required: true },
		sourceOfEnquiry: { type: String, required: true, trim: true },

		customerName: { type: String, required: true, trim: true },
		contactPersonName: { type: String, required: true, trim: true },
		contactPersonPhone: { type: Number, required: true },

		staffName: { type: String, required: true, trim: true },

		stage: {
			type: String,
			enum: ["PENDING", "QUOTATION_CREATED", "REQUEST_FOR_QUOTATION", "CLOSED"],
			default: "PENDING",
			required: true,
			index: true,
		},

		remarks: { type: String, trim: true },

		items: { type: [EnquiryItemSchema], required: true, default: [] },

		createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
		updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
	},
	{ timestamps: true },
);

// ❌ Removed duplicate index:
// EnquirySchema.index({ enquiryNo: 1 }, { unique: true });

export const Enquiry = mongoose.model<IEnquiry>("Enquiry", EnquirySchema);
