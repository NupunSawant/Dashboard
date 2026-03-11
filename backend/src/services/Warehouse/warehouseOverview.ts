// src/services/Inventory/warehouseOverviewService.ts

import { WarehouseInward } from "../../models/Warehouses/WarehouseInward";
import { Dispatch } from "../../models/Dispatch/Dispatch";
import { Inventory } from "../../models/Inventory/Inventory";

const norm = (v: unknown) =>
	String(v ?? "")
		.trim()
		.toLowerCase();

/**
 * Daily Log:
 * Per item in the selected warehouse:
 *   - todayIn  = sum of itemsQuantity from WarehouseInward where inwardDate = today
 *   - todayOut = sum of dispatchQuantity from Dispatch where dispatchDate = today
 *   - closingStock = current availableQuantity from Inventory
 */
export const getWarehouseOverviewDailyLog = async (
	warehouseName: string,
) => {
	const warehouseKey = norm(warehouseName);

	const todayStart = new Date();
	todayStart.setHours(0, 0, 0, 0);
	const todayEnd = new Date();
	todayEnd.setHours(23, 59, 59, 999);

	// ─── TODAY IN (WarehouseInward) ───────────────────────────────────────────
	const inwardDocs = await WarehouseInward.find({
		warehouseName: { $regex: new RegExp(`^${warehouseName}$`, "i") },
		inwardDate: { $gte: todayStart, $lte: todayEnd },
	}).lean();

	// Build a map: itemKey -> { todayIn, meta }
	const inwardMap = new Map<
		string,
		{
			itemName: string;
			itemCode: string;
			category: string;
			subCategory: string;
			unit: string;
			todayIn: number;
		}
	>();

	for (const doc of inwardDocs) {
		for (const item of (doc as any).items || []) {
			const key = norm(item.itemsName);
			const existing = inwardMap.get(key);
			if (existing) {
				existing.todayIn += Number(item.itemsQuantity ?? 0);
			} else {
				inwardMap.set(key, {
					itemName: item.itemsName,
					itemCode: item.itemsCode,
					category: item.itemsCategory,
					subCategory: item.itemsSubCategory,
					unit: item.itemsUnit,
					todayIn: Number(item.itemsQuantity ?? 0),
				});
			}
		}
	}

	// ─── TODAY OUT (Dispatch) ─────────────────────────────────────────────────
	const dispatchDocs = await Dispatch.find({
		issuedFromWarehouseName: { $regex: new RegExp(`^${warehouseName}$`, "i") },
		dispatchDate: { $gte: todayStart, $lte: todayEnd },
	}).lean();

	const outMap = new Map<string, number>();

	for (const doc of dispatchDocs) {
		for (const item of (doc as any).items || []) {
			const key = norm(item.itemsName);
			outMap.set(key, (outMap.get(key) ?? 0) + Number(item.dispatchQuantity ?? 0));
		}
	}

	// ─── CLOSING STOCK (Inventory) ────────────────────────────────────────────
	const inventoryDocs = await Inventory.find({ warehouseKey }).lean();

	const stockMap = new Map<
		string,
		{
			itemName: string;
			itemCode: string;
			category: string;
			subCategory: string;
			unit: string;
			availableQuantity: number;
		}
	>();

	for (const inv of inventoryDocs as any[]) {
		const key = norm(inv.itemName);
		const existing = stockMap.get(key);
		if (existing) {
			existing.availableQuantity += Number(inv.availableQuantity ?? 0);
		} else {
			stockMap.set(key, {
				itemName: inv.itemName,
				itemCode: inv.itemKey, // itemKey is normalized; use itemName for display
				category: inv.category ?? "",
				subCategory: inv.subCategory ?? "",
				unit: inv.unit ?? "",
				availableQuantity: Number(inv.availableQuantity ?? 0),
			});
		}
	}

	// ─── MERGE all item keys ──────────────────────────────────────────────────
	const allKeys = new Set([
		...inwardMap.keys(),
		...outMap.keys(),
		...stockMap.keys(),
	]);

	const result: {
		srNo: number;
		itemName: string;
		itemCode: string;
		category: string;
		subCategory: string;
		unit: string;
		todayIn: number;
		todayOut: number;
		closingStock: number;
	}[] = [];

	let srNo = 1;

	for (const key of allKeys) {
		const inward = inwardMap.get(key);
		const stock = stockMap.get(key);

		const itemName = inward?.itemName ?? stock?.itemName ?? key;
		const itemCode = inward?.itemCode ?? stock?.itemCode ?? "";
		const category = inward?.category ?? stock?.category ?? "";
		const subCategory = inward?.subCategory ?? stock?.subCategory ?? "";
		const unit = inward?.unit ?? stock?.unit ?? "";

		result.push({
			srNo: srNo++,
			itemName,
			itemCode,
			category,
			subCategory,
			unit,
			todayIn: inward?.todayIn ?? 0,
			todayOut: outMap.get(key) ?? 0,
			closingStock: stock?.availableQuantity ?? 0,
		});
	}

	return result;
};

/**
 * In Stock:
 * All inventory rows for the selected warehouse with availableQuantity > 0
 * Grouped by item (summed if multiple rows per item).
 */
export const getWarehouseOverviewInStock = async (warehouseName: string) => {
	const warehouseKey = norm(warehouseName);

	const inventoryDocs = await Inventory.find({ warehouseKey }).lean();

	// Group by itemKey and sum quantities
	const grouped = new Map<
		string,
		{
			srNo: number;
			itemName: string;
			itemCode: string;
			category: string;
			subCategory: string;
			unit: string;
			totalQuantity: number;
			inventoryIds: string[];
		}
	>();

	for (const inv of inventoryDocs as any[]) {
		const key = norm(inv.itemName);
		const existing = grouped.get(key);
		if (existing) {
			existing.totalQuantity += Number(inv.availableQuantity ?? 0);
			existing.inventoryIds.push(String(inv._id));
		} else {
			grouped.set(key, {
				srNo: 0, // filled below
				itemName: inv.itemName,
				itemCode: inv.itemKey ?? "",
				category: inv.category ?? "",
				subCategory: inv.subCategory ?? "",
				unit: inv.unit ?? "",
				totalQuantity: Number(inv.availableQuantity ?? 0),
				inventoryIds: [String(inv._id)],
			});
		}
	}

	let srNo = 1;
	return Array.from(grouped.values()).map((row) => ({
		...row,
		srNo: srNo++,
	}));
};