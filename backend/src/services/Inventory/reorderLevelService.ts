// services/Inventory/ReorderLevel/reorderLevelService.ts

import mongoose from "mongoose";
import { Counter } from "../../models/Counter";
import { Inventory } from "../../models/Inventory/Inventory";
import { ItemWiseReorderLevel } from "../../models/Inventory/itemWiseReorderLevel";
import { WarehouseWiseReorderLevel } from "../../models/Inventory/warehouseWiseReorderLevel";

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

const mustTrim = (v: unknown) => String(v ?? "").trim();
const norm = (v: unknown) =>
	String(v ?? "")
		.trim()
		.toLowerCase();

const getStockStatus = (stock: number, reorderLevel: number) => {
	if (stock <= 0) return "OUT_OF_STOCK";
	if (stock <= reorderLevel) return "LOW_STOCK";
	return "IN_STOCK";
};

const makeItemWiseKeys = (args: {
	category?: string;
	subCategory?: string;
	itemName: string;
	unit?: string;
}) => {
	const category = mustTrim(args.category ?? "");
	const subCategory = mustTrim(args.subCategory ?? "");
	const itemName = mustTrim(args.itemName);
	const unit = mustTrim(args.unit ?? "");

	if (!itemName) {
		throw Object.assign(new Error("Item Name is required"), {
			statusCode: 400,
		});
	}

	return {
		category,
		subCategory,
		itemName,
		unit,
		categoryKey: norm(category),
		subCategoryKey: norm(subCategory),
		itemKey: norm(itemName),
		unitKey: norm(unit),
	};
};

const makeWarehouseWiseKeys = (args: {
	warehouseName: string;
	category?: string;
	subCategory?: string;
	itemName: string;
	unit?: string;
}) => {
	const warehouseName = mustTrim(args.warehouseName);
	if (!warehouseName) {
		throw Object.assign(new Error("Warehouse Name is required"), {
			statusCode: 400,
		});
	}

	const itemKeys = makeItemWiseKeys({
		category: args.category,
		subCategory: args.subCategory,
		itemName: args.itemName,
		unit: args.unit,
	});

	return {
		warehouseName,
		warehouseKey: norm(warehouseName),
		...itemKeys,
	};
};

const itemStockMapKey = (args: {
	categoryKey: string;
	subCategoryKey: string;
	itemKey: string;
	unitKey: string;
}) =>
	[
		args.categoryKey ?? "",
		args.subCategoryKey ?? "",
		args.itemKey ?? "",
		args.unitKey ?? "",
	].join("||");

const warehouseStockMapKey = (args: {
	warehouseKey: string;
	categoryKey: string;
	subCategoryKey: string;
	itemKey: string;
	unitKey: string;
}) =>
	[
		args.warehouseKey ?? "",
		args.categoryKey ?? "",
		args.subCategoryKey ?? "",
		args.itemKey ?? "",
		args.unitKey ?? "",
	].join("||");

const buildCreatedByUpdatedByPopulate = (query: any) =>
	query
		.populate("createdBy", "firstName lastName userName email phone")
		.populate("updatedBy", "firstName lastName userName email phone");

const formatItemWiseRow = (doc: any, totalStock: number, srNo: number) => ({
	id: String(doc._id),
	srNo,
	itemName: doc.itemName ?? "",
	itemCode: doc.itemCode ?? "",
	category: doc.category ?? "",
	subCategory: doc.subCategory ?? "",
	unit: doc.unit ?? "",
	totalStock,
	reorderLevel: Number(doc.reorderLevel ?? 0),
	status: getStockStatus(totalStock, Number(doc.reorderLevel ?? 0)),
	createdBy: doc.createdBy ?? null,
	updatedBy: doc.updatedBy ?? null,
	createdAt: doc.createdAt,
	updatedAt: doc.updatedAt,
});

const formatWarehouseWiseRow = (
	doc: any,
	warehouseStock: number,
	srNo: number,
) => ({
	id: String(doc._id),
	srNo,
	itemName: doc.itemName ?? "",
	itemCode: doc.itemCode ?? "",
	category: doc.category ?? "",
	subCategory: doc.subCategory ?? "",
	unit: doc.unit ?? "",
	warehouseName: doc.warehouseName ?? "",
	warehouseStock,
	reorderLevel: Number(doc.reorderLevel ?? 0),
	status: getStockStatus(warehouseStock, Number(doc.reorderLevel ?? 0)),
	createdBy: doc.createdBy ?? null,
	updatedBy: doc.updatedBy ?? null,
	createdAt: doc.createdAt,
	updatedAt: doc.updatedAt,
});

// ======================================================
// ITEM WISE
// ======================================================

export const createItemWiseReorderLevel = async (
	payload: {
		category?: string;
		subCategory?: string;
		itemName: string;
		itemCode: string;
		unit?: string;
		reorderLevel: number;
	},
	userId?: string,
) => {
	const itemCode = mustTrim(payload.itemCode);
	if (!itemCode) {
		throw Object.assign(new Error("Item Code is required"), {
			statusCode: 400,
		});
	}

	const reorderLevel = Number(payload.reorderLevel ?? 0);
	if (!Number.isFinite(reorderLevel) || reorderLevel < 0) {
		throw Object.assign(new Error("Valid reorder level is required"), {
			statusCode: 400,
		});
	}

	const keys = makeItemWiseKeys({
		category: payload.category,
		subCategory: payload.subCategory,
		itemName: payload.itemName,
		unit: payload.unit,
	});

	const exists = await ItemWiseReorderLevel.findOne({
		categoryKey: keys.categoryKey,
		subCategoryKey: keys.subCategoryKey,
		itemKey: keys.itemKey,
		unitKey: keys.unitKey,
	}).lean();

	if (exists) {
		throw Object.assign(
			new Error("Item-wise reorder level already exists for this item"),
			{ statusCode: 400 },
		);
	}

	const srNo = await getNextSequence("itemwise_reorderlevel_srno");

	const created = await ItemWiseReorderLevel.create({
		srNo,
		category: keys.category,
		subCategory: keys.subCategory,
		itemName: keys.itemName,
		itemCode,
		unit: keys.unit,
		categoryKey: keys.categoryKey,
		subCategoryKey: keys.subCategoryKey,
		itemKey: keys.itemKey,
		unitKey: keys.unitKey,
		reorderLevel,
		createdBy: userId ? new mongoose.Types.ObjectId(userId) : undefined,
		updatedBy: userId ? new mongoose.Types.ObjectId(userId) : undefined,
	} as any);

	const row = await buildCreatedByUpdatedByPopulate(
		ItemWiseReorderLevel.findById(created._id),
	).lean();

	if (!row) {
		throw Object.assign(new Error("Item-wise reorder level not found"), {
			statusCode: 404,
		});
	}

	const inventories = await Inventory.find({
		categoryKey: (row as any).categoryKey ?? "",
		subCategoryKey: (row as any).subCategoryKey ?? "",
		itemKey: (row as any).itemKey ?? "",
		unitKey: (row as any).unitKey ?? "",
	}).lean();

	const totalStock = (inventories as any[]).reduce(
		(sum, inv) => sum + Number(inv.availableQuantity ?? 0),
		0,
	);

	return formatItemWiseRow(row, totalStock, Number((row as any).srNo ?? 0));
};

export const listItemWiseReorderLevels = async () => {
	const [rows, inventories] = await Promise.all([
		buildCreatedByUpdatedByPopulate(
			ItemWiseReorderLevel.find().sort({ srNo: 1 }),
		).lean(),
		Inventory.find().lean(),
	]);

	const stockMap = new Map<string, number>();

	for (const inv of inventories as any[]) {
		const key = itemStockMapKey({
			categoryKey: inv.categoryKey ?? "",
			subCategoryKey: inv.subCategoryKey ?? "",
			itemKey: inv.itemKey ?? "",
			unitKey: inv.unitKey ?? "",
		});

		const prev = stockMap.get(key) ?? 0;
		stockMap.set(key, prev + Number(inv.availableQuantity ?? 0));
	}

	return (rows as any[]).map((row, index) => {
		const key = itemStockMapKey({
			categoryKey: row.categoryKey ?? "",
			subCategoryKey: row.subCategoryKey ?? "",
			itemKey: row.itemKey ?? "",
			unitKey: row.unitKey ?? "",
		});

		const totalStock = Number(stockMap.get(key) ?? 0);
		return formatItemWiseRow(row, totalStock, index + 1);
	});
};

export const getItemWiseReorderLevelById = async (id: string) => {
	ensureObjectId(id, "Item Wise Reorder Level ID");

	const row = await buildCreatedByUpdatedByPopulate(
		ItemWiseReorderLevel.findById(id),
	).lean();

	if (!row) {
		throw Object.assign(new Error("Item-wise reorder level not found"), {
			statusCode: 404,
		});
	}

	const inventories = await Inventory.find({
		categoryKey: (row as any).categoryKey ?? "",
		subCategoryKey: (row as any).subCategoryKey ?? "",
		itemKey: (row as any).itemKey ?? "",
		unitKey: (row as any).unitKey ?? "",
	}).lean();

	const totalStock = (inventories as any[]).reduce(
		(sum, inv) => sum + Number(inv.availableQuantity ?? 0),
		0,
	);

	return formatItemWiseRow(row, totalStock, Number((row as any).srNo ?? 0));
};

export const updateItemWiseReorderLevel = async (
	id: string,
	payload: {
		category?: string;
		subCategory?: string;
		itemName?: string;
		itemCode?: string;
		unit?: string;
		reorderLevel?: number;
	},
	userId?: string,
) => {
	ensureObjectId(id, "Item Wise Reorder Level ID");

	const old: any = await ItemWiseReorderLevel.findById(id).lean();
	if (!old) {
		throw Object.assign(new Error("Item-wise reorder level not found"), {
			statusCode: 404,
		});
	}

	const nextCategory =
		payload.category !== undefined
			? mustTrim(payload.category)
			: mustTrim(old.category ?? "");
	const nextSubCategory =
		payload.subCategory !== undefined
			? mustTrim(payload.subCategory)
			: mustTrim(old.subCategory ?? "");
	const nextItemName =
		payload.itemName !== undefined
			? mustTrim(payload.itemName)
			: mustTrim(old.itemName ?? "");
	const nextItemCode =
		payload.itemCode !== undefined
			? mustTrim(payload.itemCode)
			: mustTrim(old.itemCode ?? "");
	const nextUnit =
		payload.unit !== undefined ? mustTrim(payload.unit) : mustTrim(old.unit ?? "");

	if (!nextItemCode) {
		throw Object.assign(new Error("Item Code is required"), {
			statusCode: 400,
		});
	}

	const nextReorderLevel =
		payload.reorderLevel !== undefined
			? Number(payload.reorderLevel)
			: Number(old.reorderLevel ?? 0);

	if (!Number.isFinite(nextReorderLevel) || nextReorderLevel < 0) {
		throw Object.assign(new Error("Valid reorder level is required"), {
			statusCode: 400,
		});
	}

	const keys = makeItemWiseKeys({
		category: nextCategory,
		subCategory: nextSubCategory,
		itemName: nextItemName,
		unit: nextUnit,
	});

	const exists = await ItemWiseReorderLevel.findOne({
		categoryKey: keys.categoryKey,
		subCategoryKey: keys.subCategoryKey,
		itemKey: keys.itemKey,
		unitKey: keys.unitKey,
		_id: { $ne: id },
	}).lean();

	if (exists) {
		throw Object.assign(
			new Error("Item-wise reorder level already exists for this item"),
			{ statusCode: 400 },
		);
	}

	const updated = await buildCreatedByUpdatedByPopulate(
		ItemWiseReorderLevel.findByIdAndUpdate(
			id,
			{
				category: nextCategory,
				subCategory: nextSubCategory,
				itemName: nextItemName,
				itemCode: nextItemCode,
				unit: nextUnit,
				categoryKey: keys.categoryKey,
				subCategoryKey: keys.subCategoryKey,
				itemKey: keys.itemKey,
				unitKey: keys.unitKey,
				reorderLevel: nextReorderLevel,
				updatedBy: userId ? new mongoose.Types.ObjectId(userId) : undefined,
			},
			{ new: true },
		),
	).lean();

	if (!updated) {
		throw Object.assign(new Error("Item-wise reorder level not found"), {
			statusCode: 404,
		});
	}

	const inventories = await Inventory.find({
		categoryKey: (updated as any).categoryKey ?? "",
		subCategoryKey: (updated as any).subCategoryKey ?? "",
		itemKey: (updated as any).itemKey ?? "",
		unitKey: (updated as any).unitKey ?? "",
	}).lean();

	const totalStock = (inventories as any[]).reduce(
		(sum, inv) => sum + Number(inv.availableQuantity ?? 0),
		0,
	);

	return formatItemWiseRow(updated, totalStock, Number((updated as any).srNo ?? 0));
};

export const deleteItemWiseReorderLevel = async (id: string) => {
	ensureObjectId(id, "Item Wise Reorder Level ID");

	const deleted = await ItemWiseReorderLevel.findByIdAndDelete(id);
	if (!deleted) {
		throw Object.assign(new Error("Item-wise reorder level not found"), {
			statusCode: 404,
		});
	}

	return true;
};

// ======================================================
// WAREHOUSE WISE
// ======================================================

export const createWarehouseWiseReorderLevel = async (
	payload: {
		warehouseName: string;
		category?: string;
		subCategory?: string;
		itemName: string;
		itemCode: string;
		unit?: string;
		reorderLevel: number;
	},
	userId?: string,
) => {
	const itemCode = mustTrim(payload.itemCode);
	if (!itemCode) {
		throw Object.assign(new Error("Item Code is required"), {
			statusCode: 400,
		});
	}

	const reorderLevel = Number(payload.reorderLevel ?? 0);
	if (!Number.isFinite(reorderLevel) || reorderLevel < 0) {
		throw Object.assign(new Error("Valid reorder level is required"), {
			statusCode: 400,
		});
	}

	const keys = makeWarehouseWiseKeys({
		warehouseName: payload.warehouseName,
		category: payload.category,
		subCategory: payload.subCategory,
		itemName: payload.itemName,
		unit: payload.unit,
	});

	const exists = await WarehouseWiseReorderLevel.findOne({
		warehouseKey: keys.warehouseKey,
		categoryKey: keys.categoryKey,
		subCategoryKey: keys.subCategoryKey,
		itemKey: keys.itemKey,
		unitKey: keys.unitKey,
	}).lean();

	if (exists) {
		throw Object.assign(
			new Error(
				"Warehouse-wise reorder level already exists for this warehouse item",
			),
			{ statusCode: 400 },
		);
	}

	const srNo = await getNextSequence("warehousewise_reorderlevel_srno");

	const created = await WarehouseWiseReorderLevel.create({
		srNo,
		warehouseName: keys.warehouseName,
		category: keys.category,
		subCategory: keys.subCategory,
		itemName: keys.itemName,
		itemCode,
		unit: keys.unit,
		warehouseKey: keys.warehouseKey,
		categoryKey: keys.categoryKey,
		subCategoryKey: keys.subCategoryKey,
		itemKey: keys.itemKey,
		unitKey: keys.unitKey,
		reorderLevel,
		createdBy: userId ? new mongoose.Types.ObjectId(userId) : undefined,
		updatedBy: userId ? new mongoose.Types.ObjectId(userId) : undefined,
	} as any);

	const row = await buildCreatedByUpdatedByPopulate(
		WarehouseWiseReorderLevel.findById(created._id),
	).lean();

	if (!row) {
		throw Object.assign(new Error("Warehouse-wise reorder level not found"), {
			statusCode: 404,
		});
	}

	const inventory = await Inventory.findOne({
		warehouseKey: (row as any).warehouseKey ?? "",
		categoryKey: (row as any).categoryKey ?? "",
		subCategoryKey: (row as any).subCategoryKey ?? "",
		itemKey: (row as any).itemKey ?? "",
		unitKey: (row as any).unitKey ?? "",
	}).lean();

	const warehouseStock = Number((inventory as any)?.availableQuantity ?? 0);

	return formatWarehouseWiseRow(
		row,
		warehouseStock,
		Number((row as any).srNo ?? 0),
	);
};

export const listWarehouseWiseReorderLevels = async (warehouseName?: string) => {
	const warehouseNameRaw = mustTrim(warehouseName ?? "");
	const warehouseKey = norm(warehouseNameRaw);

	const where =
		warehouseNameRaw.length > 0
			? {
					warehouseKey,
				}
			: {};

	const [rows, inventories] = await Promise.all([
		buildCreatedByUpdatedByPopulate(
			WarehouseWiseReorderLevel.find(where).sort({ srNo: 1 }),
		).lean(),
		warehouseNameRaw.length > 0
			? Inventory.find({ warehouseKey }).lean()
			: Inventory.find().lean(),
	]);

	const stockMap = new Map<string, number>();

	for (const inv of inventories as any[]) {
		const key = warehouseStockMapKey({
			warehouseKey: inv.warehouseKey ?? "",
			categoryKey: inv.categoryKey ?? "",
			subCategoryKey: inv.subCategoryKey ?? "",
			itemKey: inv.itemKey ?? "",
			unitKey: inv.unitKey ?? "",
		});

		stockMap.set(key, Number(inv.availableQuantity ?? 0));
	}

	return (rows as any[]).map((row, index) => {
		const key = warehouseStockMapKey({
			warehouseKey: row.warehouseKey ?? "",
			categoryKey: row.categoryKey ?? "",
			subCategoryKey: row.subCategoryKey ?? "",
			itemKey: row.itemKey ?? "",
			unitKey: row.unitKey ?? "",
		});

		const warehouseStock = Number(stockMap.get(key) ?? 0);
		return formatWarehouseWiseRow(row, warehouseStock, index + 1);
	});
};

export const getWarehouseWiseReorderLevelById = async (id: string) => {
	ensureObjectId(id, "Warehouse Wise Reorder Level ID");

	const row = await buildCreatedByUpdatedByPopulate(
		WarehouseWiseReorderLevel.findById(id),
	).lean();

	if (!row) {
		throw Object.assign(new Error("Warehouse-wise reorder level not found"), {
			statusCode: 404,
		});
	}

	const inventory = await Inventory.findOne({
		warehouseKey: (row as any).warehouseKey ?? "",
		categoryKey: (row as any).categoryKey ?? "",
		subCategoryKey: (row as any).subCategoryKey ?? "",
		itemKey: (row as any).itemKey ?? "",
		unitKey: (row as any).unitKey ?? "",
	}).lean();

	const warehouseStock = Number((inventory as any)?.availableQuantity ?? 0);

	return formatWarehouseWiseRow(
		row,
		warehouseStock,
		Number((row as any).srNo ?? 0),
	);
};

export const updateWarehouseWiseReorderLevel = async (
	id: string,
	payload: {
		warehouseName?: string;
		category?: string;
		subCategory?: string;
		itemName?: string;
		itemCode?: string;
		unit?: string;
		reorderLevel?: number;
	},
	userId?: string,
) => {
	ensureObjectId(id, "Warehouse Wise Reorder Level ID");

	const old: any = await WarehouseWiseReorderLevel.findById(id).lean();
	if (!old) {
		throw Object.assign(new Error("Warehouse-wise reorder level not found"), {
			statusCode: 404,
		});
	}

	const nextWarehouseName =
		payload.warehouseName !== undefined
			? mustTrim(payload.warehouseName)
			: mustTrim(old.warehouseName ?? "");
	const nextCategory =
		payload.category !== undefined
			? mustTrim(payload.category)
			: mustTrim(old.category ?? "");
	const nextSubCategory =
		payload.subCategory !== undefined
			? mustTrim(payload.subCategory)
			: mustTrim(old.subCategory ?? "");
	const nextItemName =
		payload.itemName !== undefined
			? mustTrim(payload.itemName)
			: mustTrim(old.itemName ?? "");
	const nextItemCode =
		payload.itemCode !== undefined
			? mustTrim(payload.itemCode)
			: mustTrim(old.itemCode ?? "");
	const nextUnit =
		payload.unit !== undefined ? mustTrim(payload.unit) : mustTrim(old.unit ?? "");

	if (!nextItemCode) {
		throw Object.assign(new Error("Item Code is required"), {
			statusCode: 400,
		});
	}

	const nextReorderLevel =
		payload.reorderLevel !== undefined
			? Number(payload.reorderLevel)
			: Number(old.reorderLevel ?? 0);

	if (!Number.isFinite(nextReorderLevel) || nextReorderLevel < 0) {
		throw Object.assign(new Error("Valid reorder level is required"), {
			statusCode: 400,
		});
	}

	const keys = makeWarehouseWiseKeys({
		warehouseName: nextWarehouseName,
		category: nextCategory,
		subCategory: nextSubCategory,
		itemName: nextItemName,
		unit: nextUnit,
	});

	const exists = await WarehouseWiseReorderLevel.findOne({
		warehouseKey: keys.warehouseKey,
		categoryKey: keys.categoryKey,
		subCategoryKey: keys.subCategoryKey,
		itemKey: keys.itemKey,
		unitKey: keys.unitKey,
		_id: { $ne: id },
	}).lean();

	if (exists) {
		throw Object.assign(
			new Error(
				"Warehouse-wise reorder level already exists for this warehouse item",
			),
			{ statusCode: 400 },
		);
	}

	const updated = await buildCreatedByUpdatedByPopulate(
		WarehouseWiseReorderLevel.findByIdAndUpdate(
			id,
			{
				warehouseName: keys.warehouseName,
				category: keys.category,
				subCategory: keys.subCategory,
				itemName: keys.itemName,
				itemCode: nextItemCode,
				unit: keys.unit,
				warehouseKey: keys.warehouseKey,
				categoryKey: keys.categoryKey,
				subCategoryKey: keys.subCategoryKey,
				itemKey: keys.itemKey,
				unitKey: keys.unitKey,
				reorderLevel: nextReorderLevel,
				updatedBy: userId ? new mongoose.Types.ObjectId(userId) : undefined,
			},
			{ new: true },
		),
	).lean();

	if (!updated) {
		throw Object.assign(new Error("Warehouse-wise reorder level not found"), {
			statusCode: 404,
		});
	}

	const inventory = await Inventory.findOne({
		warehouseKey: (updated as any).warehouseKey ?? "",
		categoryKey: (updated as any).categoryKey ?? "",
		subCategoryKey: (updated as any).subCategoryKey ?? "",
		itemKey: (updated as any).itemKey ?? "",
		unitKey: (updated as any).unitKey ?? "",
	}).lean();

	const warehouseStock = Number((inventory as any)?.availableQuantity ?? 0);

	return formatWarehouseWiseRow(
		updated,
		warehouseStock,
		Number((updated as any).srNo ?? 0),
	);
};

export const deleteWarehouseWiseReorderLevel = async (id: string) => {
	ensureObjectId(id, "Warehouse Wise Reorder Level ID");

	const deleted = await WarehouseWiseReorderLevel.findByIdAndDelete(id);
	if (!deleted) {
		throw Object.assign(new Error("Warehouse-wise reorder level not found"), {
			statusCode: 404,
		});
	}

	return true;
};