import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";
import { API } from "../../helpers/api_url";
import { getErrorMessage } from "../../helpers/error_helper";
import type {
	Inventory,
	StockOverviewRow,
	WarehouseStockItemDetail,
	WarehouseStockRow,
} from "../../types/Inventory/inventory";

/* ================================
   LIST INVENTORY
================================ */
export const fetchInventoriesThunk = createAsyncThunk(
	"inventory/list",
	async (_, thunkAPI) => {
		try {
			const { data } = await api.get(API.INVENTORY.LIST);

			const list =
				data?.data?.inventories ?? data?.inventories ?? data?.data ?? data;

			return Array.isArray(list) ? (list as Inventory[]) : [];
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to load inventory"),
			);
		}
	},
);

/* ================================
   STOCK OVERVIEW
================================ */
export const fetchStockOverviewThunk = createAsyncThunk(
	"inventory/stockOverview",
	async (_, thunkAPI) => {
		try {
			const { data } = await api.get(API.INVENTORY.STOCK_OVERVIEW);

			const list =
				data?.data?.stockOverview ?? data?.stockOverview ?? data?.data ?? data;

			return Array.isArray(list) ? (list as StockOverviewRow[]) : [];
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to load stock overview"),
			);
		}
	},
);

/* ================================
   WAREHOUSE STOCK LIST
================================ */
export const fetchWarehouseStockThunk = createAsyncThunk(
	"inventory/warehouseStock",
	async (_, thunkAPI) => {
		try {
			const { data } = await api.get(API.INVENTORY.WAREHOUSE_STOCK);

			const list =
				data?.data?.warehouseStock ??
				data?.warehouseStock ??
				data?.data ??
				data;

			return Array.isArray(list) ? (list as WarehouseStockRow[]) : [];
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to load warehouse-wise stock"),
			);
		}
	},
);

/* ================================
   WAREHOUSE STOCK ITEM DETAIL
================================ */
export const fetchWarehouseStockItemThunk = createAsyncThunk(
	"inventory/warehouseStockItem",
	async (itemId: string, thunkAPI) => {
		try {
			const { data } = await api.get(
				API.INVENTORY.WAREHOUSE_STOCK_ITEM(itemId),
			);

			const detail =
				data?.data?.warehouseItem ?? data?.warehouseItem ?? data?.data ?? data;

			return detail as WarehouseStockItemDetail;
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to load warehouse stock detail"),
			);
		}
	},
);

/* ================================
   GET ONE INVENTORY
================================ */
export const getInventoryThunk = createAsyncThunk(
	"inventory/getOne",
	async (id: string, thunkAPI) => {
		try {
			const { data } = await api.get(API.INVENTORY.GET_ONE(id));

			const inventory =
				data?.data?.inventory ?? data?.inventory ?? data?.data ?? data;

			return inventory as Inventory;
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to load inventory item"),
			);
		}
	},
);

/* ================================
   CREATE INVENTORY
================================ */
export const createInventoryThunk = createAsyncThunk(
	"inventory/create",
	async (
		payload: {
			itemName: string;
			warehouseName: string;
			category?: string;
			subCategory?: string;
			unit?: string;
			receivedQuantity?: number;
			reservedQuantity?: number;
			availableQuantity?: number;
		},
		thunkAPI,
	) => {
		try {
			const { data } = await api.post(API.INVENTORY.CREATE, payload);
			return data;
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to create inventory"),
			);
		}
	},
);

/* ================================
   UPDATE INVENTORY
================================ */
export const updateInventoryThunk = createAsyncThunk(
	"inventory/update",
	async (
		{
			id,
			payload,
		}: {
			id: string;
			payload: {
				itemName?: string;
				warehouseName?: string;
				category?: string;
				subCategory?: string;
				unit?: string;
				receivedQuantity?: number;
				reservedQuantity?: number;
				availableQuantity?: number;
			};
		},
		thunkAPI,
	) => {
		try {
			const { data } = await api.put(API.INVENTORY.UPDATE(id), payload);
			return data;
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to update inventory"),
			);
		}
	},
);

/* ================================
   DELETE INVENTORY
================================ */
export const deleteInventoryThunk = createAsyncThunk(
	"inventory/delete",
	async (id: string, thunkAPI) => {
		try {
			const { data } = await api.delete(API.INVENTORY.DELETE(id));
			return data;
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to delete inventory"),
			);
		}
	},
);
