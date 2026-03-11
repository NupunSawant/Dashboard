// src/slices/Inventory/WarehouseOverview/reducer.ts

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { DailyLogRow, InStockRow } from "../../../types/Warehouses/warehouseOverview"
import { fetchDailyLogThunk, fetchInStockThunk } from "./thunks";

type WarehouseOverviewState = {
	selectedWarehouse: string;
	dailyLog: DailyLogRow[];
	inStock: InStockRow[];
	loadingDailyLog: boolean;
	loadingInStock: boolean;
	error: string | null;
};

const initialState: WarehouseOverviewState = {
	selectedWarehouse: "",
	dailyLog: [],
	inStock: [],
	loadingDailyLog: false,
	loadingInStock: false,
	error: null,
};

const slice = createSlice({
	name: "warehouseOverview",
	initialState,
	reducers: {
		setSelectedWarehouse(s, a: PayloadAction<string>) {
			s.selectedWarehouse = a.payload;
		},
		clearWarehouseOverview(s) {
			s.dailyLog = [];
			s.inStock = [];
			s.error = null;
		},
	},
	extraReducers: (b) => {
		// ─── DAILY LOG ──────────────────────────────────────────────────────────
		b.addCase(fetchDailyLogThunk.pending, (s) => {
			s.loadingDailyLog = true;
			s.error = null;
		});
		b.addCase(
			fetchDailyLogThunk.fulfilled,
			(s, a: PayloadAction<DailyLogRow[]>) => {
				s.loadingDailyLog = false;
				s.dailyLog = a.payload || [];
			},
		);
		b.addCase(fetchDailyLogThunk.rejected, (s, a) => {
			s.loadingDailyLog = false;
			s.error = (a.payload as string) || "Failed to load daily log";
		});

		// ─── IN STOCK ───────────────────────────────────────────────────────────
		b.addCase(fetchInStockThunk.pending, (s) => {
			s.loadingInStock = true;
			s.error = null;
		});
		b.addCase(
			fetchInStockThunk.fulfilled,
			(s, a: PayloadAction<InStockRow[]>) => {
				s.loadingInStock = false;
				s.inStock = a.payload || [];
			},
		);
		b.addCase(fetchInStockThunk.rejected, (s, a) => {
			s.loadingInStock = false;
			s.error = (a.payload as string) || "Failed to load in-stock data";
		});
	},
});

export const { setSelectedWarehouse, clearWarehouseOverview } = slice.actions;
export default slice.reducer;