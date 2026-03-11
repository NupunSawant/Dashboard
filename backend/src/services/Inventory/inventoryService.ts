// src/services/Inventory/inventoryService.ts
import mongoose from "mongoose";
import { Inventory } from "../../models/Inventory/Inventory";
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

const mustTrim = (v: unknown) => String(v ?? "").trim();
const norm = (v: unknown) =>
	String(v ?? "")
		.trim()
		.toLowerCase();

const assertKeys = (warehouseName: string, itemName: string) => {
	if (!warehouseName) {
		throw Object.assign(new Error("Warehouse Name is required"), {
			statusCode: 400,
		});
	}
	if (!itemName) {
		throw Object.assign(new Error("Item Name is required"), {
			statusCode: 400,
		});
	}
};

/**
 * Used by WarehouseInward service:
 * Upserts inventory row (warehouse + item + category + subCategory + unit)
 * and applies delta quantity.
 * Prevents negative stock.
 */
export const applyInventoryDelta = async (args: {
	warehouseName: string;
	itemName: string;
	deltaQty: number;

	category?: string;
	subCategory?: string;
	unit?: string;

	userId?: string;
}) => {
	const warehouseNameRaw = mustTrim(args.warehouseName);
	const itemNameRaw = mustTrim(args.itemName);
	assertKeys(warehouseNameRaw, itemNameRaw);

	const deltaQty = Number(args.deltaQty ?? 0);
	if (!Number.isFinite(deltaQty) || deltaQty === 0) return;

	const warehouseKey = norm(warehouseNameRaw);
	const itemKey = norm(itemNameRaw);
	const categoryKey = norm(args.category ?? "");
	const subCategoryKey = norm(args.subCategory ?? "");
	const unitKey = norm(args.unit ?? "");

	const where = { warehouseKey, itemKey, categoryKey, subCategoryKey, unitKey };

	const updatedBy = args.userId
		? new mongoose.Types.ObjectId(args.userId)
		: undefined;

	// CASE 1: Positive delta (Inward Add)
	if (deltaQty > 0) {
		const update: any = {
			$inc: {
				receivedQuantity: deltaQty,
				availableQuantity: deltaQty,
			},
			$set: {
				warehouseName: warehouseNameRaw,
				itemName: itemNameRaw,
				category: mustTrim(args.category ?? ""),
				subCategory: mustTrim(args.subCategory ?? ""),
				unit: mustTrim(args.unit ?? ""),
				warehouseKey,
				itemKey,
				categoryKey,
				subCategoryKey,
				unitKey,
				...(updatedBy ? { updatedBy } : {}),
			},
			$setOnInsert: {
				srNo: await getNextSequence("inventory_srno"),
				reservedQuantity: 0,
				...(updatedBy ? { createdBy: updatedBy } : {}),
			},
		};

		await Inventory.findOneAndUpdate(where, update, {
			new: true,
			upsert: true,
		}).lean();

		return;
	}

	// CASE 2: Negative delta (Reverse inward)
	const dec = Math.abs(deltaQty);

	const updated = await Inventory.findOneAndUpdate(
		{
			...where,
			availableQuantity: { $gte: dec },
			$expr: {
				$gte: ["$receivedQuantity", { $add: ["$reservedQuantity", dec] }],
			},
		},
		{
			$inc: {
				receivedQuantity: -dec,
				availableQuantity: -dec,
			},
			...(updatedBy ? { $set: { updatedBy } } : {}),
		},
		{ new: true },
	).lean();

	if (!updated) {
		throw Object.assign(
			new Error(
				`Cannot reduce stock. Either insufficient available stock or quantity is reserved.`,
			),
			{ statusCode: 400 },
		);
	}
};

export const createInventory = async (
	payload: {
		itemName: string;
		warehouseName: string;
		category?: string;
		subCategory?: string;
		unit?: string;
		availableQuantity?: number;
	},
	userId?: string,
) => {
	const itemName = mustTrim(payload.itemName);
	const warehouseName = mustTrim(payload.warehouseName);
	const category =
		payload.category !== undefined ? mustTrim(payload.category) : "";
	const subCategory =
		payload.subCategory !== undefined ? mustTrim(payload.subCategory) : "";
	const unit = payload.unit !== undefined ? mustTrim(payload.unit) : "";

	assertKeys(warehouseName, itemName);

	const warehouseKey = norm(warehouseName);
	const itemKey = norm(itemName);
	const categoryKey = norm(category);
	const subCategoryKey = norm(subCategory);
	const unitKey = norm(unit);

	const exists = await Inventory.findOne({
		warehouseKey,
		itemKey,
		categoryKey,
		subCategoryKey,
		unitKey,
	}).lean();

	if (exists) {
		throw Object.assign(
			new Error("Inventory item already exists for this warehouse"),
			{
				statusCode: 400,
			},
		);
	}

	const srNo = await getNextSequence("inventory_srno");

	const inventory = await Inventory.create({
		srNo,
		itemName,
		warehouseName,
		category,
		subCategory,
		unit,
		warehouseKey,
		itemKey,
		categoryKey,
		subCategoryKey,
		unitKey,
		receivedQuantity:
			typeof payload.availableQuantity === "number"
				? payload.availableQuantity
				: 0,
		reservedQuantity: 0,
		availableQuantity:
			typeof payload.availableQuantity === "number"
				? payload.availableQuantity
				: 0,
		createdBy: userId ? new mongoose.Types.ObjectId(userId) : undefined,
		updatedBy: userId ? new mongoose.Types.ObjectId(userId) : undefined,
	} as any);

	return inventory;
};

export const listInventories = async () => {
	return Inventory.find().sort({ srNo: 1 }).lean();
};

export const getInventoryById = async (id: string) => {
	ensureObjectId(id, "Inventory ID");

	const inventory = await Inventory.findById(id).lean();

	if (!inventory) {
		throw Object.assign(new Error("Inventory not found"), { statusCode: 404 });
	}
	return inventory;
};

export const updateInventory = async (
	id: string,
	payload: {
		itemName?: string;
		warehouseName?: string;
		category?: string;
		subCategory?: string;
		unit?: string;
		availableQuantity?: number;
	},
	userId?: string,
) => {
	ensureObjectId(id, "Inventory ID");

	const inv: any = await Inventory.findById(id).lean();
	if (!inv)
		throw Object.assign(new Error("Inventory not found"), { statusCode: 404 });

	const nextItemName =
		payload.itemName !== undefined
			? mustTrim(payload.itemName)
			: mustTrim(inv.itemName);
	const nextWarehouseName =
		payload.warehouseName !== undefined
			? mustTrim(payload.warehouseName)
			: mustTrim(inv.warehouseName);

	const nextCategory =
		payload.category !== undefined
			? mustTrim(payload.category)
			: mustTrim(inv.category ?? "");
	const nextSubCategory =
		payload.subCategory !== undefined
			? mustTrim(payload.subCategory)
			: mustTrim(inv.subCategory ?? "");
	const nextUnit =
		payload.unit !== undefined
			? mustTrim(payload.unit)
			: mustTrim(inv.unit ?? "");

	assertKeys(nextWarehouseName, nextItemName);

	const warehouseKey = norm(nextWarehouseName);
	const itemKey = norm(nextItemName);
	const categoryKey = norm(nextCategory);
	const subCategoryKey = norm(nextSubCategory);
	const unitKey = norm(nextUnit);

	const exists = await Inventory.findOne({
		warehouseKey,
		itemKey,
		categoryKey,
		subCategoryKey,
		unitKey,
		_id: { $ne: id },
	}).lean();

	if (exists) {
		throw Object.assign(
			new Error("Inventory item already exists for this warehouse"),
			{
				statusCode: 400,
			},
		);
	}

	const updated = await Inventory.findByIdAndUpdate(
		id,
		{
			...(payload.itemName !== undefined ? { itemName: nextItemName } : {}),
			...(payload.warehouseName !== undefined
				? { warehouseName: nextWarehouseName }
				: {}),
			...(payload.category !== undefined ? { category: nextCategory } : {}),
			...(payload.subCategory !== undefined
				? { subCategory: nextSubCategory }
				: {}),
			...(payload.unit !== undefined ? { unit: nextUnit } : {}),
			...(typeof payload.availableQuantity === "number"
				? { availableQuantity: payload.availableQuantity }
				: {}),
			warehouseKey,
			itemKey,
			categoryKey,
			subCategoryKey,
			unitKey,
			updatedBy: userId ? new mongoose.Types.ObjectId(userId) : undefined,
		},
		{ new: true },
	).lean();

	if (!updated)
		throw Object.assign(new Error("Inventory not found"), { statusCode: 404 });

	return updated;
};

export const deleteInventory = async (id: string) => {
	ensureObjectId(id, "Inventory ID");

	const deleted = await Inventory.findByIdAndDelete(id);
	if (!deleted)
		throw Object.assign(new Error("Inventory not found"), { statusCode: 404 });

	return true;
};

// ===============================
// STOCK OVERVIEW / WAREHOUSE-WISE
// ===============================

const stockGroupId = {
	itemKey: "$itemKey",
	categoryKey: "$categoryKey",
	subCategoryKey: "$subCategoryKey",
	unitKey: "$unitKey",
};

export const getStockOverview = async () => {
	const rows = await Inventory.aggregate([
		{
			$group: {
				_id: stockGroupId,
				itemName: { $first: "$itemName" },
				category: { $first: "$category" },
				subCategory: { $first: "$subCategory" },
				unit: { $first: "$unit" },
				receivedQuantity: { $sum: { $ifNull: ["$receivedQuantity", 0] } },
				reservedQuantity: { $sum: { $ifNull: ["$reservedQuantity", 0] } },
				availableQuantity: { $sum: { $ifNull: ["$availableQuantity", 0] } },
			},
		},
		{
			$project: {
				_id: 0,
				itemId: "$_id.itemKey",
				itemKey: "$_id.itemKey",
				categoryKey: "$_id.categoryKey",
				subCategoryKey: "$_id.subCategoryKey",
				unitKey: "$_id.unitKey",
				itemName: 1,
				category: 1,
				subCategory: 1,
				unit: 1,
				receivedQuantity: 1,
				reservedQuantity: 1,
				availableQuantity: 1,
			},
		},
		{
			$sort: {
				itemName: 1,
				category: 1,
				subCategory: 1,
				unit: 1,
			},
		},
	]);

	return rows.map((row: any, index: number) => ({
		id: `${row.itemKey}__${row.categoryKey}__${row.subCategoryKey}__${row.unitKey}`,
		itemId: row.itemId,
		srNo: index + 1,
		itemName: row.itemName || "",
		category: row.category || "",
		subCategory: row.subCategory || "",
		unit: row.unit || "",
		receivedQuantity: Number(row.receivedQuantity ?? 0),
		reservedQuantity: Number(row.reservedQuantity ?? 0),
		availableQuantity: Number(row.availableQuantity ?? 0),
	}));
};

export const getWarehouseStockList = async () => {
	const rows = await Inventory.aggregate([
		{
			$group: {
				_id: stockGroupId,
				itemName: { $first: "$itemName" },
				category: { $first: "$category" },
				subCategory: { $first: "$subCategory" },
				unit: { $first: "$unit" },
				availableQuantity: { $sum: { $ifNull: ["$availableQuantity", 0] } },
			},
		},
		{
			$project: {
				_id: 0,
				itemId: "$_id.itemKey",
				itemKey: "$_id.itemKey",
				categoryKey: "$_id.categoryKey",
				subCategoryKey: "$_id.subCategoryKey",
				unitKey: "$_id.unitKey",
				itemName: 1,
				category: 1,
				subCategory: 1,
				unit: 1,
				availableQuantity: 1,
			},
		},
		{
			$sort: {
				itemName: 1,
				category: 1,
				subCategory: 1,
				unit: 1,
			},
		},
	]);

	return rows.map((row: any, index: number) => ({
		id: `${row.itemKey}__${row.categoryKey}__${row.subCategoryKey}__${row.unitKey}`,
		itemId: row.itemId,
		srNo: index + 1,
		itemName: row.itemName || "",
		category: row.category || "",
		subCategory: row.subCategory || "",
		unit: row.unit || "",
		availableQuantity: Number(row.availableQuantity ?? 0),
	}));
};

export const getWarehouseStockByItem = async (itemId: string) => {
	const itemKey = norm(itemId);
	if (!itemKey) {
		throw Object.assign(new Error("Item ID is required"), { statusCode: 400 });
	}

	const rows = await Inventory.aggregate([
		{
			$match: {
				itemKey,
			},
		},
		{
			$group: {
				_id: {
					warehouseKey: "$warehouseKey",
					itemKey: "$itemKey",
					categoryKey: "$categoryKey",
					subCategoryKey: "$subCategoryKey",
					unitKey: "$unitKey",
				},
				warehouseName: { $first: "$warehouseName" },
				itemName: { $first: "$itemName" },
				category: { $first: "$category" },
				subCategory: { $first: "$subCategory" },
				unit: { $first: "$unit" },
				receivedQuantity: { $sum: { $ifNull: ["$receivedQuantity", 0] } },
				reservedQuantity: { $sum: { $ifNull: ["$reservedQuantity", 0] } },
				availableQuantity: { $sum: { $ifNull: ["$availableQuantity", 0] } },
			},
		},
		{
			$project: {
				_id: 0,
				warehouseKey: "$_id.warehouseKey",
				itemKey: "$_id.itemKey",
				categoryKey: "$_id.categoryKey",
				subCategoryKey: "$_id.subCategoryKey",
				unitKey: "$_id.unitKey",
				warehouseName: 1,
				itemName: 1,
				category: 1,
				subCategory: 1,
				unit: 1,
				receivedQuantity: 1,
				reservedQuantity: 1,
				availableQuantity: 1,
			},
		},
		{
			$sort: {
				warehouseName: 1,
				category: 1,
				subCategory: 1,
				unit: 1,
			},
		},
	]);

	if (!rows.length) {
		throw Object.assign(new Error("Inventory item not found"), {
			statusCode: 404,
		});
	}

	const first = rows[0] as any;

	return {
		item: {
			id: first.itemKey,
			itemName: first.itemName || "",
			category: first.category || "",
			subCategory: first.subCategory || "",
			unit: first.unit || "",
		},
		warehouses: rows.map((row: any, index: number) => ({
			id: `${row.itemKey}__${row.warehouseKey}__${row.categoryKey}__${row.subCategoryKey}__${row.unitKey}`,
			srNo: index + 1,
			warehouseName: row.warehouseName || "",
			receivedQuantity: Number(row.receivedQuantity ?? 0),
			reservedQuantity: Number(row.reservedQuantity ?? 0),
			availableQuantity: Number(row.availableQuantity ?? 0),
		})),
	};
};

// ===============================
// DISPATCH RESERVATION HELPERS
// ===============================

type ReserveLine = {
	itemName: string;
	category?: string;
	subCategory?: string;
	unit?: string;
	qty: number;
};

const makeKeys = (args: {
	warehouseName: string;
	itemName: string;
	category?: string;
	subCategory?: string;
	unit?: string;
}) => {
	const warehouseNameRaw = mustTrim(args.warehouseName);
	const itemNameRaw = mustTrim(args.itemName);
	assertKeys(warehouseNameRaw, itemNameRaw);

	const warehouseKey = norm(warehouseNameRaw);
	const itemKey = norm(itemNameRaw);
	const categoryKey = norm(args.category ?? "");
	const subCategoryKey = norm(args.subCategory ?? "");
	const unitKey = norm(args.unit ?? "");

	return {
		warehouseNameRaw,
		itemNameRaw,
		categoryRaw: mustTrim(args.category ?? ""),
		subCategoryRaw: mustTrim(args.subCategory ?? ""),
		unitRaw: mustTrim(args.unit ?? ""),
		where: { warehouseKey, itemKey, categoryKey, subCategoryKey, unitKey },
		keys: { warehouseKey, itemKey, categoryKey, subCategoryKey, unitKey },
	};
};

/**
 * Reserve stock when Order -> REQUESTED_FOR_DISPATCH
 * Moves qty: availableQuantity -= qty, reservedQuantity += qty
 * Also stores per-order reservation so revert/consume is exact.
 *
 * Idempotent: if the same order tries to reserve again for the same inventory row,
 * it will skip (won't double reserve).
 */
export const reserveInventoryForOrder = async (args: {
	orderId: string;
	orderNo: string;
	warehouseName: string;
	lines: ReserveLine[];
	userId?: string;
}) => {
	ensureObjectId(args.orderId, "Order ID");

	const orderObjId = new mongoose.Types.ObjectId(args.orderId);
	const updatedBy = args.userId
		? new mongoose.Types.ObjectId(args.userId)
		: undefined;

	if (!args.lines?.length) return;

	for (const line of args.lines) {
		const qty = Number(line.qty ?? 0);
		if (!Number.isFinite(qty) || qty <= 0) continue;

		const { where } = makeKeys({
			warehouseName: args.warehouseName,
			itemName: line.itemName,
			category: line.category,
			subCategory: line.subCategory,
			unit: line.unit,
		});

		const reserved = await Inventory.findOneAndUpdate(
			{
				...where,
				availableQuantity: { $gte: qty },
				"reservations.orderId": { $ne: orderObjId },
			},
			{
				$inc: {
					availableQuantity: -qty,
					reservedQuantity: qty,
				},
				$push: {
					reservations: {
						orderId: orderObjId,
						orderNo: args.orderNo,
						qty,
						createdAt: new Date(),
					},
				},
				...(updatedBy ? { $set: { updatedBy } } : {}),
			},
			{ new: true },
		).lean();

		if (reserved) continue;

		const alreadyReserved = await Inventory.findOne({
			...where,
			"reservations.orderId": orderObjId,
		}).lean();

		if (alreadyReserved) continue;

		throw Object.assign(
			new Error(
				`Insufficient available stock to reserve for item "${line.itemName}" in warehouse "${args.warehouseName}".`,
			),
			{ statusCode: 400 },
		);
	}
};

/**
 * Revert REQUESTED_FOR_DISPATCH -> PENDING
 * Releases reservation for this order:
 * availableQuantity += reservedQtyForOrder
 * reservedQuantity  -= reservedQtyForOrder
 * pulls reservation entry
 */
export const releaseInventoryReservation = async (args: {
	orderId: string;
	userId?: string;
}) => {
	ensureObjectId(args.orderId, "Order ID");

	const orderObjId = new mongoose.Types.ObjectId(args.orderId);
	const updatedBy = args.userId
		? new mongoose.Types.ObjectId(args.userId)
		: undefined;

	const docs = await Inventory.find({
		"reservations.orderId": orderObjId,
	}).lean();

	for (const d of docs as any[]) {
		const match = (d.reservations || []).find(
			(r: any) => String(r.orderId) === String(orderObjId),
		);
		const qty = Number(match?.qty ?? 0);
		if (!Number.isFinite(qty) || qty <= 0) continue;

		await Inventory.updateOne(
			{ _id: d._id, "reservations.orderId": orderObjId },
			{
				$inc: {
					availableQuantity: qty,
					reservedQuantity: -qty,
				},
				$pull: { reservations: { orderId: orderObjId } },
				...(updatedBy ? { $set: { updatedBy } } : {}),
			},
		);
	}
};

/**
 * When dispatch is created (Order becomes DISPATCHED)
 * Consume the reserved qty (clears reservation):
 * reservedQuantity -= reservedQtyForOrder
 * availableQuantity stays as-is (it was reduced at reservation time)
 */
export const consumeReservedForOrder = async (args: {
	orderId: string;
	userId?: string;
}) => {
	ensureObjectId(args.orderId, "Order ID");

	const orderObjId = new mongoose.Types.ObjectId(args.orderId);
	const updatedBy = args.userId
		? new mongoose.Types.ObjectId(args.userId)
		: undefined;

	const docs = await Inventory.find({
		"reservations.orderId": orderObjId,
	}).lean();

	for (const d of docs as any[]) {
		const match = (d.reservations || []).find(
			(r: any) => String(r.orderId) === String(orderObjId),
		);
		const qty = Number(match?.qty ?? 0);
		if (!Number.isFinite(qty) || qty <= 0) continue;

		await Inventory.updateOne(
			{ _id: d._id, "reservations.orderId": orderObjId },
			{
				$inc: { reservedQuantity: -qty },
				$pull: { reservations: { orderId: orderObjId } },
				...(updatedBy ? { $set: { updatedBy } } : {}),
			},
		);
	}
};
