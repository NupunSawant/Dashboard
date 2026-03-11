import mongoose, { Document, Schema } from "mongoose";

export interface IIssueToLabourItem {
	itemsCategory: string;
	itemsSubCategory: string;
	itemsName: string;
	itemsCode: string;
	itemsUnit: string;
	dispatchQuantity: number;
	itemsRemark?: string;
}

export interface IIssueToLabour extends Document {
	srNo: number;
	issueNo: string;

	issueDate: Date;
	issueFromWarehouse: string;
	labourName: string;

	status: "ISSUED" | "COMPLETED" | "REVERTED";
	remarks?: string;

	items: IIssueToLabourItem[];

	createdBy?: mongoose.Types.ObjectId;
	updatedBy?: mongoose.Types.ObjectId;

	createdAt: Date;
	updatedAt: Date;
}

const IssueToLabourItemSchema = new Schema<IIssueToLabourItem>(
	{
		itemsCategory: { type: String, required: true, trim: true },
		itemsSubCategory: { type: String, required: true, trim: true },
		itemsName: { type: String, required: true, trim: true },
		itemsCode: { type: String, required: true, trim: true },
		itemsUnit: { type: String, required: true, trim: true },
		dispatchQuantity: { type: Number, required: true, min: 0 },
		itemsRemark: { type: String, trim: true, default: "" },
	},
	{ _id: false },
);

const IssueToLabourSchema = new Schema<IIssueToLabour>(
	{
		srNo: { type: Number, required: true, unique: true, index: true },
		issueNo: { type: String, required: true, unique: true, trim: true },

		issueDate: { type: Date, required: true },
		issueFromWarehouse: { type: String, required: true, trim: true },
		labourName: { type: String, required: true, trim: true },

		status: {
			type: String,
			enum: ["ISSUED", "COMPLETED", "REVERTED"],
			default: "ISSUED",
			required: true,
		},

		remarks: { type: String, trim: true, default: "" },

		items: {
			type: [IssueToLabourItemSchema],
			required: true,
			default: [],
		},

		createdBy: { type: Schema.Types.ObjectId, ref: "User" },
		updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
	},
	{ timestamps: true },
);

export const IssueToLabour = mongoose.model<IIssueToLabour>(
	"IssueToLabour",
	IssueToLabourSchema,
);