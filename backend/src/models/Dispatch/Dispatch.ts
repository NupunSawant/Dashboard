import mongoose, { Schema, Document } from "mongoose";

export type DispatchStatus = "PENDING" | "DELIVERED";
export type DispatchType = "ORDER" | "QUOTATION";

export type ReturnedItemStatus =
	| "NOT_RETURNED"
	| "PARTIALLY_RETURNED"
	| "FULLY_RETURNED";

export type SalesReturnInwardStatus = "NONE" | "PENDING" | "COMPLETED";

export interface IDispatchItem {
	itemsCategory: string;
	itemsSubCategory: string;

	itemId: mongoose.Types.ObjectId;
	itemsName: string;
	itemsCode: string;
	itemsUnit: string;

	orderQuantity: number;
	dispatchQuantity: number;

	rate?: number;

	discountPercent?: number;
	discountAmount?: number;

	gstRate?: number;
	gstAmount?: number;

	amount?: number;
	totalAmount?: number;

	status?: string;
	remark?: string;

	returnQty?: number;
	returnRemark?: string;
	returnInwardedQty?: number;
}

export interface IDispatch extends Document {
	dispatchNo: string;
	dispatchDate: Date;

	// ✅ ORDER flow (optional now)
	orderId?: mongoose.Types.ObjectId;
	orderNo?: string;

	// ✅ QUOTATION flow
	quotationId?: mongoose.Types.ObjectId;
	quotationNo?: string;

	dispatchType: DispatchType;

	issuedFromWarehouseName: string;

	customerName: string;
	customerNameForTransport?: string;

	transporterName?: string;
	contactPerson?: string;
	contactNumber?: number;

	address?: string;
	city?: string;
	state?: string;
	country?: string;
	pincode?: string;

	invoiceNo?: string;

	dispatchedBy?: string;

	dispatchStatus: DispatchStatus;

	returnedItemStatus: ReturnedItemStatus;
	salesReturnInwardStatus: SalesReturnInwardStatus;

	returnProcessedAt?: Date;
	returnProcessedBy?: mongoose.Types.ObjectId;

	returnInwardedAt?: Date;
	returnInwardedBy?: mongoose.Types.ObjectId;

	remark?: string;

	items: IDispatchItem[];

	subTotal?: number;
	totalDiscount?: number;
	totalGst?: number;
	grandTotal?: number;

	createdBy?: mongoose.Types.ObjectId;
	updatedBy?: mongoose.Types.ObjectId;

	createdAt: Date;
	updatedAt: Date;
}

const DispatchItemSchema = new Schema<IDispatchItem>(
	{
		itemsCategory: { type: String, required: true, trim: true },
		itemsSubCategory: { type: String, required: true, trim: true },

		itemId: { type: Schema.Types.ObjectId, ref: "Item", required: true },
		itemsName: { type: String, required: true, trim: true },
		itemsCode: { type: String, required: true, trim: true },
		itemsUnit: { type: String, required: true, trim: true },

		orderQuantity: { type: Number, required: true, min: 0 },
		dispatchQuantity: { type: Number, required: true, min: 0 },

		rate: { type: Number, min: 0 },

		discountPercent: { type: Number, min: 0, max: 100 },
		discountAmount: { type: Number, min: 0 },

		gstRate: { type: Number, min: 0 },
		gstAmount: { type: Number, min: 0 },

		amount: { type: Number, min: 0 },
		totalAmount: { type: Number, min: 0 },

		status: { type: String, default: "CREATED", trim: true },
		remark: { type: String, default: "", trim: true },

		returnQty: { type: Number, default: 0, min: 0 },
		returnRemark: { type: String, default: "", trim: true },
		returnInwardedQty: { type: Number, default: 0, min: 0 },
	},
	{ _id: false },
);

const DispatchSchema = new Schema<IDispatch>(
	{
		dispatchNo: { type: String, required: true, unique: true, trim: true },
		dispatchDate: { type: Date, required: true },

		// ✅ ORDER flow (optional)
		orderId: { type: Schema.Types.ObjectId, ref: "Order" },
		orderNo: { type: String, trim: true },

		// ✅ QUOTATION flow
		quotationId: { type: Schema.Types.ObjectId, ref: "Quotation" },
		quotationNo: { type: String, trim: true },

		dispatchType: {
			type: String,
			enum: ["ORDER", "QUOTATION"],
			default: "ORDER",
			required: true,
		},

		issuedFromWarehouseName: { type: String, required: true, trim: true },

		customerName: { type: String, required: true, trim: true },
		customerNameForTransport: { type: String, trim: true },

		transporterName: { type: String, trim: true },
		contactPerson: { type: String, trim: true },
		contactNumber: { type: Number },

		address: { type: String, trim: true },
		city: { type: String, trim: true },
		state: { type: String, trim: true },
		country: { type: String, trim: true },
		pincode: { type: String, trim: true },

		invoiceNo: { type: String, trim: true },
		dispatchedBy: { type: String, trim: true },

		dispatchStatus: {
			type: String,
			enum: ["PENDING", "DELIVERED"],
			default: "PENDING",
			required: true,
		},

		returnedItemStatus: {
			type: String,
			enum: ["NOT_RETURNED", "PARTIALLY_RETURNED", "FULLY_RETURNED"],
			default: "NOT_RETURNED",
			required: true,
		},

		salesReturnInwardStatus: {
			type: String,
			enum: ["NONE", "PENDING", "COMPLETED"],
			default: "NONE",
			required: true,
		},

		returnProcessedAt: { type: Date },
		returnProcessedBy: { type: Schema.Types.ObjectId, ref: "User" },

		returnInwardedAt: { type: Date },
		returnInwardedBy: { type: Schema.Types.ObjectId, ref: "User" },

		remark: { type: String, default: "", trim: true },

		items: { type: [DispatchItemSchema], required: true, default: [] },

		subTotal: { type: Number, default: 0, min: 0 },
		totalDiscount: { type: Number, default: 0, min: 0 },
		totalGst: { type: Number, default: 0, min: 0 },
		grandTotal: { type: Number, default: 0, min: 0 },

		createdBy: { type: Schema.Types.ObjectId, ref: "User" },
		updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
	},
	{ timestamps: true },
);

export const Dispatch = mongoose.model<IDispatch>("Dispatch", DispatchSchema);
