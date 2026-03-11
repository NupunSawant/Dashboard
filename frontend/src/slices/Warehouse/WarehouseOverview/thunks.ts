// src/slices/Inventory/WarehouseOverview/thunks.ts

import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api/axios";
import { API } from "../../../helpers/api_url";
import { getErrorMessage } from "../../../helpers/error_helper";
import type {
	DailyLogRow,
	InStockRow,
} from "../../../types/Warehouses/warehouseOverview";

/* ================================
   FETCH DAILY LOG
================================ */
export const fetchDailyLogThunk = createAsyncThunk(
	"warehouseOverview/dailyLog",
	async (warehouseName: string, thunkAPI) => {
		try {
			const { data } = await api.get(
				(API as any).WAREHOUSE_OVERVIEW.DAILY_LOG(warehouseName),
			);

			const list = data?.data ?? data;
			return Array.isArray(list) ? (list as DailyLogRow[]) : [];
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to load daily log"),
			);
		}
	},
);

/* ================================
   FETCH IN STOCK
================================ */
export const fetchInStockThunk = createAsyncThunk(
	"warehouseOverview/inStock",
	async (warehouseName: string, thunkAPI) => {
		try {
			const { data } = await api.get(
				(API as any).WAREHOUSE_OVERVIEW.IN_STOCK(warehouseName),
			);

			const list = data?.data ?? data;
			return Array.isArray(list) ? (list as InStockRow[]) : [];
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to load in-stock data"),
			);
		}
	},
);
