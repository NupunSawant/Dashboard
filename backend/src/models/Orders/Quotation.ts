// models/Quotations/Quotation.ts

import mongoose, { Schema, Document, Types } from "mongoose";

export type QuotationStatus = "PENDING" | "SEND" | "WON" | "LOST";

export interface IQuotationItem {
	itemsCategory: string;
	itemsSubCategory: string;
	itemsName: string;
	itemsCode: string;
	itemsUnit: string;

	quantity: number;
	rate: number;

	amount: number;

	discountPercent?: number;
	discountPrice?: number;
	discountedAmount?: number;

	gstRate: number;
	gstAmount: number;

	totalAmount: number;

	itemsRemark?: string;
}

export interface IQuotation extends Document {
	srNo: number;
	quotationNo: string;

	quotationDate: Date;

	// optional if created from enquiry
	enquiryId?: Types.ObjectId;
	enquiryNo?: string;

	warehouseName: string;

	customerName: string;
	contactPersonName: string;
	contactPersonPhone: number;

	status: QuotationStatus;

	remarks?: string;

	//   track dispatch request state
	dispatchRequested?: boolean;
	readyToDispatch?: boolean;

	items: IQuotationItem[];

	createdBy: Types.ObjectId;
	updatedBy?: Types.ObjectId;

	createdAt: Date;
	updatedAt: Date;
}

const QuotationItemSchema = new Schema<IQuotationItem>(
	{
		itemsCategory: { type: String, required: true, trim: true },
		itemsSubCategory: { type: String, required: true, trim: true },
		itemsName: { type: String, required: true, trim: true },
		itemsCode: { type: String, required: true, trim: true },
		itemsUnit: { type: String, required: true, trim: true },

		quantity: { type: Number, required: true, min: 0 },
		rate: { type: Number, required: true, min: 0 },

		amount: { type: Number, required: true, min: 0 },

		discountPercent: { type: Number, min: 0, max: 100, default: 0 },
		discountPrice: { type: Number, min: 0, default: 0 },
		discountedAmount: { type: Number, min: 0, default: 0 },

		gstRate: { type: Number, required: true, min: 0, default: 0 },
		gstAmount: { type: Number, required: true, min: 0, default: 0 },

		totalAmount: { type: Number, required: true, min: 0 },

		itemsRemark: { type: String, trim: true },
	},
	{ _id: false },
);

const QuotationSchema = new Schema<IQuotation>(
	{
		srNo: { type: Number, required: true, index: true },

		quotationNo: { type: String, required: true, unique: true, trim: true },

		quotationDate: { type: Date, required: true },

		enquiryId: { type: Schema.Types.ObjectId, ref: "Enquiry", index: true },
		enquiryNo: { type: String, trim: true },

		warehouseName: { type: String, required: true, trim: true },

		customerName: { type: String, required: true, trim: true },
		contactPersonName: { type: String, required: true, trim: true },
		contactPersonPhone: { type: Number, required: true },

		status: {
			type: String,
			enum: ["PENDING", "SEND", "WON", "LOST"],
			default: "PENDING",
			required: true,
			index: true,
		},

		remarks: { type: String, trim: true },

		//   track dispatch request state
		dispatchRequested: { type: Boolean, default: false },
		readyToDispatch: { type: Boolean, default: false },

		items: { type: [QuotationItemSchema], required: true, default: [] },

		createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
		updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
	},
	{ timestamps: true },
);

export const Quotation = mongoose.model<IQuotation>(
	"Quotation",
	QuotationSchema,
);
