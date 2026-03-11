import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api/axios";
import { API } from "../../../helpers/api_url";
import { getErrorMessage } from "../../../helpers/error_helper";
import type {
	ItemWiseReorderLevel,
	WarehouseWiseReorderLevel,
	CreateItemWiseReorderPayload,
	CreateWarehouseWiseReorderPayload,
} from "../../../types/Inventory/reorderLevel";

/* ================================
   LIST ITEM-WISE REORDER LEVELS
================================ */
export const fetchItemWiseReorderLevelsThunk = createAsyncThunk(
	"reorderLevel/itemWise/list",
	async (_, thunkAPI) => {
		try {
			const { data } = await api.get(API.REORDER_ITEM_WISE.LIST);

			const list = data?.data ?? data;

			return Array.isArray(list) ? (list as ItemWiseReorderLevel[]) : [];
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to load item-wise reorder levels"),
			);
		}
	},
);

/* ================================
   GET ONE ITEM-WISE REORDER LEVEL
================================ */
export const getItemWiseReorderLevelThunk = createAsyncThunk(
	"reorderLevel/itemWise/getOne",
	async (id: string, thunkAPI) => {
		try {
			const { data } = await api.get(API.REORDER_ITEM_WISE.GET_ONE(id));

			const row = data?.data ?? data;

			return row as ItemWiseReorderLevel;
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to load item-wise reorder level"),
			);
		}
	},
);

/* ================================
   CREATE ITEM-WISE REORDER LEVEL
================================ */
export const createItemWiseReorderLevelThunk = createAsyncThunk(
	"reorderLevel/itemWise/create",
	async (payload: CreateItemWiseReorderPayload, thunkAPI) => {
		try {
			const { data } = await api.post(API.REORDER_ITEM_WISE.CREATE, payload);
			return data;
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to create item-wise reorder level"),
			);
		}
	},
);

/* ================================
   UPDATE ITEM-WISE REORDER LEVEL
================================ */
export const updateItemWiseReorderLevelThunk = createAsyncThunk(
	"reorderLevel/itemWise/update",
	async (
		{
			id,
			payload,
		}: {
			id: string;
			payload: Partial<CreateItemWiseReorderPayload>;
		},
		thunkAPI,
	) => {
		try {
			const { data } = await api.put(API.REORDER_ITEM_WISE.UPDATE(id), payload);
			return data;
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to update item-wise reorder level"),
			);
		}
	},
);

/* ================================
   DELETE ITEM-WISE REORDER LEVEL
================================ */
export const deleteItemWiseReorderLevelThunk = createAsyncThunk(
	"reorderLevel/itemWise/delete",
	async (id: string, thunkAPI) => {
		try {
			const { data } = await api.delete(API.REORDER_ITEM_WISE.DELETE(id));
			return data;
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to delete item-wise reorder level"),
			);
		}
	},
);

/* ================================
   LIST WAREHOUSE-WISE REORDER LEVELS
================================ */
export const fetchWarehouseWiseReorderLevelsThunk = createAsyncThunk(
	"reorderLevel/warehouseWise/list",
	async (warehouseName: string, thunkAPI) => {
		try {
			const url = warehouseName?.trim()
				? `${API.REORDER_WAREHOUSE_WISE.LIST}?warehouseName=${encodeURIComponent(
						warehouseName.trim(),
				  )}`
				: API.REORDER_WAREHOUSE_WISE.LIST;

			const { data } = await api.get(url);

			const list = data?.data ?? data;

			return Array.isArray(list) ? (list as WarehouseWiseReorderLevel[]) : [];
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to load warehouse-wise reorder levels"),
			);
		}
	},
);

/* ================================
   GET ONE WAREHOUSE-WISE REORDER LEVEL
================================ */
export const getWarehouseWiseReorderLevelThunk = createAsyncThunk(
	"reorderLevel/warehouseWise/getOne",
	async (id: string, thunkAPI) => {
		try {
			const { data } = await api.get(API.REORDER_WAREHOUSE_WISE.GET_ONE(id));

			const row = data?.data ?? data;

			return row as WarehouseWiseReorderLevel;
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to load warehouse-wise reorder level"),
			);
		}
	},
);

/* ================================
   CREATE WAREHOUSE-WISE REORDER LEVEL
================================ */
export const createWarehouseWiseReorderLevelThunk = createAsyncThunk(
	"reorderLevel/warehouseWise/create",
	async (payload: CreateWarehouseWiseReorderPayload, thunkAPI) => {
		try {
			const { data } = await api.post(
				API.REORDER_WAREHOUSE_WISE.CREATE,
				payload,
			);
			return data;
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(
					err,
					"Failed to create warehouse-wise reorder level",
				),
			);
		}
	},
);

/* ================================
   UPDATE WAREHOUSE-WISE REORDER LEVEL
================================ */
export const updateWarehouseWiseReorderLevelThunk = createAsyncThunk(
	"reorderLevel/warehouseWise/update",
	async (
		{
			id,
			payload,
		}: {
			id: string;
			payload: Partial<CreateWarehouseWiseReorderPayload>;
		},
		thunkAPI,
	) => {
		try {
			const { data } = await api.put(
				API.REORDER_WAREHOUSE_WISE.UPDATE(id),
				payload,
			);
			return data;
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(
					err,
					"Failed to update warehouse-wise reorder level",
				),
			);
		}
	},
);

/* ================================
   DELETE WAREHOUSE-WISE REORDER LEVEL
================================ */
export const deleteWarehouseWiseReorderLevelThunk = createAsyncThunk(
	"reorderLevel/warehouseWise/delete",
	async (id: string, thunkAPI) => {
		try {
			const { data } = await api.delete(
				API.REORDER_WAREHOUSE_WISE.DELETE(id),
			);
			return data;
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(
					err,
					"Failed to delete warehouse-wise reorder level",
				),
			);
		}
	},
);