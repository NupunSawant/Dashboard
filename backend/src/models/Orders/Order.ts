// models/Orders/Order.ts

import mongoose, { Schema, Document } from "mongoose";
import { UnitType } from "../Masters/Item";

export type OrderStatus =
	| "PENDING"
	| "REQUESTED_FOR_DISPATCH"
	| "DISPATCHED"
	| "DELIVERED"
	| "CANCELLED";

export interface IOrderItem {
	itemsCategory: string;
	itemsSubCategory: string;

	itemId: mongoose.Types.ObjectId;
	itemsName: string; // snapshot
	itemsCode: string; // snapshot
	itemsUnit: UnitType; // snapshot

	quantity: number;

	// optional (if order created from quotation you can carry these)
	rate?: number;
	discountPercent?: number; // 0-100
	gstRate?: number;

	remark?: string;
}

export interface IOrder extends Document {
	orderNo: string;
	orderDate: Date;

	// Optional links (quotation/enquiry can be missing)
	quotationId?: mongoose.Types.ObjectId;
	quotationNo?: string;

	enquiryId?: mongoose.Types.ObjectId;
	enquiryNo?: string;

	customerName: string;
	customerContactPersonName?: string;
	customerContactPersonPhone?: number;
	customerAddress?: string;
	customerCity?: string;
	customerState?: string;
	customerPincode?: string;

	dispatchFromWarehouseName: string;

	orderStatus: OrderStatus;

	remarks?: string;

	items: IOrderItem[];

	createdBy?: mongoose.Types.ObjectId;
	updatedBy?: mongoose.Types.ObjectId;

	createdAt: Date;
	updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
	{
		itemsCategory: { type: String, required: true, trim: true },
		itemsSubCategory: { type: String, required: true, trim: true },

		itemId: { type: Schema.Types.ObjectId, ref: "Item", required: true },
		itemsName: { type: String, required: true, trim: true },
		itemsCode: { type: String, required: true, trim: true },
		itemsUnit: {
			type: String,
			required: true,
		},

		quantity: { type: Number, required: true, min: 1 },

		rate: { type: Number, min: 0 },
		discountPercent: { type: Number, min: 0, max: 100 },
		gstRate: { type: Number, min: 0 },

		remark: { type: String, default: "", trim: true },
	},
	{ _id: false },
);

const OrderSchema = new Schema<IOrder>(
	{
		orderNo: { type: String, required: true, unique: true, trim: true },

		orderDate: { type: Date, required: true },

		quotationId: { type: Schema.Types.ObjectId, ref: "Quotation" },
		quotationNo: { type: String, trim: true },

		enquiryId: { type: Schema.Types.ObjectId, ref: "Enquiry" },
		enquiryNo: { type: String, trim: true },

		customerName: { type: String, required: true, trim: true },
		customerContactPersonName: { type: String, trim: true },
		customerContactPersonPhone: { type: Number },
		customerAddress: { type: String, trim: true },
		customerCity: { type: String, trim: true },
		customerState: { type: String, trim: true },
		customerPincode: { type: String, trim: true },

		dispatchFromWarehouseName: { type: String, required: true, trim: true },

		orderStatus: {
			type: String,
			required: true,
			enum: [
				"PENDING",
				"REQUESTED_FOR_DISPATCH",
				"DISPATCHED",
				"DELIVERED",
				"CANCELLED",
			],
			default: "PENDING",
		},

		remarks: { type: String, default: "", trim: true },

		items: { type: [OrderItemSchema], required: true, default: [] },

		createdBy: { type: Schema.Types.ObjectId, ref: "User" },
		updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
	},
	{ timestamps: true },
);

export const Order = mongoose.model<IOrder>("Order", OrderSchema);
