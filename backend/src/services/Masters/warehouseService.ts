import mongoose from "mongoose";
import { Warehouse } from "../../models/Masters/Warehouse";
import { Counter } from "../../models/Counter";

const ensureObjectId = (id: string, name: string) => {
	if (!mongoose.Types.ObjectId.isValid(id)) {
		throw Object.assign(new Error(`Invalid ${name}`), { statusCode: 400 });
	}
};

const getNextSequence = async (key: string): Promise<number> => {
	const doc = await Counter.findOneAndUpdate(
		{ key },
		{ $inc: { seq: 1 } },
		{ new: true, upsert: true },
	).lean();
	return doc!.seq;
};

export const createWarehouse = async (
	payload: {
		warehouseName: string;
		warehouseType?: string;
		warehouseAddress?: string;
		warehouseCity?: string;
		warehouseState?: string;
		warehouseCountry?: string;
		warehousePincode?: string;
		remarks?: string;
	},
	userId?: string,
) => {
	const warehouseName = payload.warehouseName.trim();
	const warehouseType = payload.warehouseType?.trim() || "";
	const warehouseAddress = payload.warehouseAddress?.trim() || "";
	const warehouseCity = payload.warehouseCity?.trim() || "";
	const warehouseState = payload.warehouseState?.trim() || "";
	const warehouseCountry = payload.warehouseCountry?.trim() || "";
	const warehousePincode = payload.warehousePincode?.trim() || "";
	const remarks = payload.remarks?.trim() || "";

	const exists = await Warehouse.findOne({ warehouseName }).lean();
	if (exists) {
		throw Object.assign(new Error("Warehouse name already exists"), {
			statusCode: 409,
		});
	}

	const srNo = await getNextSequence("warehouse_srno");

	const warehouse = await Warehouse.create({
		srNo,
		warehouseName,
		warehouseType,
		warehouseAddress,
		warehouseCity,
		warehouseState,
		warehouseCountry,
		warehousePincode,
		remarks,
		createdBy: userId ? new mongoose.Types.ObjectId(userId) : undefined,
		updatedBy: userId ? new mongoose.Types.ObjectId(userId) : undefined,
	});

	return warehouse;
};

export const listWarehouses = async () => {
	return Warehouse.find()
		.sort({ srNo: 1 })
		.populate("createdBy", "firstName lastName userName email phone")
		.populate("updatedBy", "firstName lastName userName email phone")
		.lean();
};

export const getWarehouseById = async (id: string) => {
	ensureObjectId(id, "warehouse id");

	const warehouse = await Warehouse.findById(id)
		.populate("createdBy", "firstName lastName userName email phone")
		.populate("updatedBy", "firstName lastName userName email phone")
		.lean();

	if (!warehouse)
		throw Object.assign(new Error("Warehouse not found"), { statusCode: 404 });
	return warehouse;
};

export const updateWarehouse = async (
	id: string,
	payload: {
		warehouseName?: string;
		warehouseType?: string;
		warehouseAddress?: string;
		warehouseCity?: string;
		warehouseState?: string;
		warehouseCountry?: string;
		warehousePincode?: string;
		remarks?: string;
	},
	userId?: string,
) => {
	ensureObjectId(id, "warehouse id");

	if (payload.warehouseName) {
		const warehouseName = payload.warehouseName.trim();
		const exists = await Warehouse.findOne({
			warehouseName,
			_id: { $ne: id },
		}).lean();
		if (exists) {
			throw Object.assign(new Error("Warehouse name already exists"), {
				statusCode: 409,
			});
		}
	}
	const updated = await Warehouse.findByIdAndUpdate(
		id,
		{
			...(payload.warehouseName !== undefined
				? { warehouseName: payload.warehouseName.trim() }
				: {}),
			...(payload.warehouseType !== undefined
				? { warehouseType: payload.warehouseType.trim() }
				: {}),
			...(payload.warehouseAddress !== undefined
				? { warehouseAddress: payload.warehouseAddress.trim() }
				: {}),
			...(payload.warehouseCity !== undefined
				? { warehouseCity: payload.warehouseCity.trim() }
				: {}),
			...(payload.warehouseState !== undefined
				? { warehouseState: payload.warehouseState.trim() }
				: {}),
			...(payload.warehouseCountry !== undefined
				? { warehouseCountry: payload.warehouseCountry.trim() }
				: {}),
			...(payload.warehousePincode !== undefined
				? { warehousePincode: payload.warehousePincode.trim() }
				: {}),
			...(payload.remarks !== undefined
				? { remarks: payload.remarks.trim() }
				: {}),
			...(userId ? { updatedBy: new mongoose.Types.ObjectId(userId) } : {}),
		},
		{ new: true },
	)
		.populate("createdBy", "firstName lastName userName email phone")
		.populate("updatedBy", "firstName lastName userName email phone");

	if (!updated)
		throw Object.assign(new Error("Warehouse not found"), { statusCode: 404 });
	return updated;
};

export const deleteWarehouse = async (id: string) => {
	ensureObjectId(id, "warehouse id");

	const deleted = await Warehouse.findByIdAndDelete(id);
	if (!deleted)
		throw Object.assign(new Error("Warehouse not found"), { statusCode: 404 });
	return true;
};
