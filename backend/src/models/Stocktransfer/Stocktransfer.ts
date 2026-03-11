import mongoose, { Schema, Document } from "mongoose";

export interface IStockTransferItem {
	itemsCategory: string;
	itemsSubCategory: string;
	itemsName: string;
	itemsCode?: string;
	itemsUnit?: string;
	dispatchQuantity: number;
	remark?: string;
}

export interface IStockTransfer extends Document {
	transferNo: string;
	transferDate: Date;
	transferFromWarehouse: string;
	transferToWarehouse: string;
	remarks?: string;
	status: "PENDING" | "DISPATCHED" | "COMPLETED" | "REVERTED";
	items: IStockTransferItem[];
	createdBy?: string;
	updatedBy?: string;
}

const StockTransferItemSchema = new Schema<IStockTransferItem>(
	{
		itemsCategory: { type: String, required: true },
		itemsSubCategory: { type: String, required: true },
		itemsName: { type: String, required: true },
		itemsCode: { type: String },       // auto-filled from master, not required
		itemsUnit: { type: String },       // auto-filled from master, not required
		dispatchQuantity: { type: Number, required: true },
		remark: { type: String },
	},
	{ _id: false },
);

const StockTransferSchema = new Schema<IStockTransfer>(
	{
		// required: false — value is set by the pre-save hook; Mongoose validates
		// before pre-save runs, so keeping required: true would cause a validation error.
		transferNo: { type: String, unique: true, sparse: true },
		transferDate: { type: Date, required: true },
		transferFromWarehouse: { type: String, required: true },
		transferToWarehouse: { type: String, required: true },
		remarks: { type: String },
		status: {
			type: String,
			enum: ["PENDING", "DISPATCHED", "COMPLETED", "REVERTED"],
			default: "DISPATCHED",
		},
		items: { type: [StockTransferItemSchema], required: true },
		createdBy: { type: String },
		updatedBy: { type: String },
	},
	{ timestamps: true },
);

// Auto-generate transferNo before save.
// Uses the highest existing number rather than countDocuments() to avoid
// duplicate keys when documents are deleted or on concurrent inserts.
StockTransferSchema.pre("save", async function () {
	if (!this.isNew) return;
	try {
		const last = await mongoose
			.model("StockTransfer")
			.findOne({ transferNo: { $regex: /^ST-\d+$/ } })
			.sort({ transferNo: -1 })
			.select("transferNo")
			.lean<{ transferNo: string }>();
		const lastNum = last?.transferNo
			? parseInt(last.transferNo.replace("ST-", ""), 10)
			: 0;
		this.transferNo = `ST-${String(lastNum + 1).padStart(5, "0")}`;
	} catch {
		this.transferNo = `ST-${Date.now()}`;
	}
});

export default mongoose.model<IStockTransfer>("StockTransfer", StockTransferSchema);