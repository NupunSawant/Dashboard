import mongoose, { HydratedDocument } from "mongoose";

export interface IInventoryReservation {
	orderId: mongoose.Types.ObjectId;
	orderNo: string;
	qty: number;
	createdAt: Date;
}

export interface IInventory extends mongoose.Document {
	srNo?: number;

	itemName: string;
	warehouseName: string;

	category?: string;
	subCategory?: string;
	unit?: string;

	//   normalized matching keys
	itemKey: string;
	warehouseKey: string;
	categoryKey: string;
	subCategoryKey: string;
	unitKey: string;

	receivedQuantity?: number; //   total inward received (net)
	reservedQuantity?: number; //   reserved for pending dispatch
	availableQuantity?: number; //   sellable now (received - reserved)

	//   NEW: track per-order reservations
	reservations?: IInventoryReservation[];
}

const norm = (v: unknown) =>
	String(v ?? "")
		.trim()
		.toLowerCase();

const ReservationSchema = new mongoose.Schema<IInventoryReservation>(
	{
		orderId: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
		},
		orderNo: { type: String, required: true, trim: true },
		qty: { type: Number, required: true, min: 0 },
		createdAt: { type: Date, default: Date.now },
	},
	{ _id: false },
);

const InventorySchema = new mongoose.Schema<IInventory>(
	{
		srNo: { type: Number, required: true, index: true },

		itemName: { type: String, required: true, trim: true },
		warehouseName: { type: String, required: true, trim: true },

		category: { type: String, trim: true, default: "" },
		subCategory: { type: String, trim: true, default: "" },
		unit: { type: String, trim: true, default: "" },

		itemKey: { type: String, required: true, index: true },
		warehouseKey: { type: String, required: true, index: true },
		categoryKey: { type: String, required: true, index: true, default: "" },
		subCategoryKey: { type: String, required: true, index: true, default: "" },
		unitKey: { type: String, required: true, index: true, default: "" },

		receivedQuantity: { type: Number, default: 0, min: 0 },
		reservedQuantity: { type: Number, default: 0, min: 0 },
		availableQuantity: { type: Number, default: 0, min: 0 },

		//   NEW
		reservations: { type: [ReservationSchema], default: [] },
	},
	{ timestamps: true },
);

//   no next() -> no TS error
InventorySchema.pre("validate", function (this: HydratedDocument<IInventory>) {
	(this as any).itemKey = norm(this.itemName);
	(this as any).warehouseKey = norm(this.warehouseName);
	(this as any).categoryKey = norm(this.category);
	(this as any).subCategoryKey = norm(this.subCategory);
	(this as any).unitKey = norm(this.unit);
});

//   uniqueness (warehouse + item + category + subCategory + unit)
InventorySchema.index(
	{
		warehouseKey: 1,
		itemKey: 1,
		categoryKey: 1,
		subCategoryKey: 1,
		unitKey: 1,
	},
	{ unique: true },
);

//   helpful for fast revert/consume by order
InventorySchema.index({ "reservations.orderId": 1 });

export const Inventory = mongoose.model<IInventory>(
	"Inventory",
	InventorySchema,
);
