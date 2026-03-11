import mongoose, { Document, Schema } from "mongoose";

export type WarehouseInwardType =
	| "GRN"
	| "STOCK_TRANSFER"
	| "LABOUR_RETURN"
	| "SALES_RETURN";

export interface IWarehouseInward extends Document {
	srNo?: number;
	grnNo?: string;
	inwardType?: WarehouseInwardType;
	inwardDate?: Date;
	receivedBy?: string;
	remarks?: string;

	invoiceNo?: string;
	supplierName?: string;
	warehouseName?: string;

	sourceDispatchId?: mongoose.Types.ObjectId;
	dispatchNo?: string;

	items: Array<{
		itemsCategory: string;
		itemsSubCategory: string;
		itemsName: string;
		itemsCode: string;
		itemsQuantity: number;
		itemsUnit: string;
		itemsRate: number;
		itemsAmount: number;
		itemsRemark?: string;
	}>;

	createdBy?: mongoose.Types.ObjectId;
	updatedBy?: mongoose.Types.ObjectId;

	createdAt?: Date;
	updatedAt?: Date;
}

const WarehouseInwardSchema = new Schema<IWarehouseInward>(
	{
		srNo: { type: Number, required: true, unique: true, index: true },
		grnNo: { type: String, required: true, unique: true, index: true },
		inwardType: {
			type: String,
			required: true,
			trim: true,
			enum: ["GRN", "STOCK_TRANSFER", "LABOUR_RETURN", "SALES_RETURN"],
		},
		inwardDate: { type: Date, required: true },
		receivedBy: { type: String, required: true, trim: true },
		remarks: { type: String, default: "", trim: true },

		invoiceNo: { type: String, default: "", trim: true },
		supplierName: { type: String, default: "", trim: true },
		warehouseName: { type: String, default: "", trim: true },

		sourceDispatchId: { type: Schema.Types.ObjectId, ref: "Dispatch" },
		dispatchNo: { type: String, default: "", trim: true },

		items: [
			{
				itemsCategory: { type: String, required: true },
				itemsSubCategory: { type: String, required: true },
				itemsName: { type: String, required: true },
				itemsCode: { type: String, required: true },
				itemsQuantity: { type: Number, required: true },
				itemsUnit: { type: String, required: true },
				itemsRate: { type: Number, required: true },
				itemsAmount: { type: Number, required: true },
				itemsRemark: { type: String },
			},
		],

		createdBy: { type: Schema.Types.ObjectId, ref: "User" },
		updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
	},
	{ timestamps: true },
);

export const WarehouseInward = mongoose.model<IWarehouseInward>(
	"WarehouseInward",
	WarehouseInwardSchema,
);
