import type { SortOrder as MongooseSortOrder } from "mongoose";

import { Inventory } from "../../models/Inventory/Inventory";

type RequestedSortOrder = "asc" | "desc";

export type DashboardInventoryTableParams = {
	warehouseName?: string;
	category?: string;
	search?: string;
	page?: number;
	limit?: number;
	sortBy?: string;
	sortOrder?: RequestedSortOrder;
};

const norm = (value: unknown) =>
	String(value ?? "")
		.trim()
		.toLowerCase();

const escapeRegex = (value: string) =>
	value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getSafePage = (page?: number) => {
	const n = Number(page || 1);
	return Number.isFinite(n) && n > 0 ? Math.floor(n) : 1;
};

const getSafeLimit = (limit?: number) => {
	const n = Number(limit || 10);
	if (!Number.isFinite(n) || n <= 0) return 10;
	return Math.min(Math.floor(n), 100);
};

const getSafeSort = (sortBy?: string, sortOrder?: RequestedSortOrder) => {
	const allowedSortFields: Record<string, string> = {
		srNo: "srNo",
		itemName: "itemName",
		warehouseName: "warehouseName",
		category: "category",
		subCategory: "subCategory",
		unit: "unit",
		receivedQuantity: "receivedQuantity",
		reservedQuantity: "reservedQuantity",
		availableQuantity: "availableQuantity",
		createdAt: "createdAt",
		updatedAt: "updatedAt",
	};

	const field = allowedSortFields[String(sortBy || "").trim()] || "srNo";
	const direction: MongooseSortOrder = sortOrder === "desc" ? "desc" : "asc";

	return {
		sortField: field,
		sortDirection: direction,
		sortOrder: direction,
	};
};

export const getDashboardInventoryTable = async (
	params: DashboardInventoryTableParams,
) => {
	const page = getSafePage(params.page);
	const limit = getSafeLimit(params.limit);

	const warehouseName = String(params.warehouseName || "").trim();
	const category = String(params.category || "").trim();
	const search = String(params.search || "").trim();

	const { sortField, sortDirection, sortOrder } = getSafeSort(
		params.sortBy,
		params.sortOrder,
	);

	const match: Record<string, any> = {};

	if (warehouseName) {
		match.warehouseKey = norm(warehouseName);
	}

	if (category) {
		match.categoryKey = norm(category);
	}

	if (search) {
		const rx = new RegExp(escapeRegex(search), "i");
		match.$or = [
			{ itemName: rx },
			{ warehouseName: rx },
			{ category: rx },
			{ subCategory: rx },
			{ unit: rx },
		];
	}

	const categoryMatch: Record<string, any> = {};
	if (warehouseName) {
		categoryMatch.warehouseKey = norm(warehouseName);
	}

	const [total, rows, rawCategories] = await Promise.all([
		Inventory.countDocuments(match),
		Inventory.find(match)
			.select({
				_id: 1,
				srNo: 1,
				itemName: 1,
				warehouseName: 1,
				category: 1,
				subCategory: 1,
				unit: 1,
				receivedQuantity: 1,
				reservedQuantity: 1,
				availableQuantity: 1,
				createdAt: 1,
				updatedAt: 1,
			})
			.sort({ [sortField]: sortDirection, _id: 1 })
			.skip((page - 1) * limit)
			.limit(limit)
			.lean(),
		Inventory.distinct("category", categoryMatch),
	]);

	const categories = Array.from(
		new Set(
			(rawCategories || []).map((x) => String(x || "").trim()).filter(Boolean),
		),
	).sort((a, b) => a.localeCompare(b));

	const totalPages = Math.max(1, Math.ceil(total / limit));

	return {
		rows: rows.map((row: any) => ({
			id: String(row._id),
			srNo: Number(row.srNo ?? 0),
			itemName: String(row.itemName || ""),
			warehouseName: String(row.warehouseName || ""),
			category: String(row.category || ""),
			subCategory: String(row.subCategory || ""),
			unit: String(row.unit || ""),
			receivedQuantity: Number(row.receivedQuantity ?? 0),
			reservedQuantity: Number(row.reservedQuantity ?? 0),
			availableQuantity: Number(row.availableQuantity ?? 0),
			createdAt: row.createdAt || null,
			updatedAt: row.updatedAt || null,
		})),
		pagination: {
			page,
			limit,
			total,
			totalPages,
		},
		meta: {
			categories,
			appliedFilters: {
				warehouseName,
				category,
				search,
				sortBy: sortField,
				sortOrder,
			},
		},
	};
};
