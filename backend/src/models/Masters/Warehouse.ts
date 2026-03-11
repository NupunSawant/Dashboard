import mongoose, { Document, Schema } from "mongoose";

export interface IWarehouse extends Document {
	srNo?: number;
	warehouseName?: String;
	warehouseType?: String;
	warehouseAddress?: String;
	warehouseCity?: String;
	warehouseState?: String;
	warehouseCountry?: String;
	warehousePincode?: String;
	remarks?: String;
	createdBy?: mongoose.Types.ObjectId;
	updatedBy?: mongoose.Types.ObjectId;

	createdAt?: Date;
	updatedAt?: Date;
}

const WarehouseSchema = new Schema<IWarehouse>(
	{
		srNo: { type: Number, required: true, unique: true, index: true },
		warehouseName: { type: String, required: true, trim: true },
		warehouseType: { type: String, trim: true },
		warehouseAddress: { type: String, trim: true },
		warehouseCity: { type: String, trim: true },
		warehouseState: { type: String, trim: true },
		warehouseCountry: { type: String, trim: true },
		warehousePincode: { type: String, trim: true },
		remarks: { type: String, trim: true },
		createdBy: { type: Schema.Types.ObjectId, ref: "User" },
		updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
	},
	{ timestamps: true },
);

export const Warehouse = mongoose.model<IWarehouse>(
	"Warehouse",
	WarehouseSchema,
);
