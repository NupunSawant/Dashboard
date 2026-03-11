import { createSlice } from "@reduxjs/toolkit";
import type {
	Inventory,
	StockOverviewRow,
	WarehouseStockItemDetail,
	WarehouseStockRow,
} from "../../types/Inventory/inventory";
import {
	createInventoryThunk,
	deleteInventoryThunk,
	fetchInventoriesThunk,
	fetchStockOverviewThunk,
	fetchWarehouseStockItemThunk,
	fetchWarehouseStockThunk,
	getInventoryThunk,
	updateInventoryThunk,
} from "./thunks";

type InventoryState = {
	inventories: Inventory[];
	selected: Inventory | null;

	stockOverview: StockOverviewRow[];
	warehouseStock: WarehouseStockRow[];
	warehouseStockItem: WarehouseStockItemDetail | null;

	loadingList: boolean;
	loadingOne: boolean;
	loadingOverview: boolean;
	loadingWarehouseStock: boolean;
	loadingWarehouseStockItem: boolean;

	saving: boolean;
	error: string | null;
};

const initialState: InventoryState = {
	inventories: [],
	selected: null,

	stockOverview: [],
	warehouseStock: [],
	warehouseStockItem: null,

	loadingList: false,
	loadingOne: false,
	loadingOverview: false,
	loadingWarehouseStock: false,
	loadingWarehouseStockItem: false,

	saving: false,
	error: null,
};

const slice = createSlice({
	name: "inventory",
	initialState,
	reducers: {
		clearSelected(s) {
			s.selected = null;
		},
		clearWarehouseStockItem(s) {
			s.warehouseStockItem = null;
		},
	},
	extraReducers: (b) => {
		b.addCase(fetchInventoriesThunk.pending, (s) => {
			s.loadingList = true;
			s.error = null;
		});
		b.addCase(fetchInventoriesThunk.fulfilled, (s, a) => {
			s.loadingList = false;
			s.inventories = a.payload || [];
		});
		b.addCase(fetchInventoriesThunk.rejected, (s, a) => {
			s.loadingList = false;
			s.error = (a.payload as string) || "Failed to load inventory";
		});

		b.addCase(fetchStockOverviewThunk.pending, (s) => {
			s.loadingOverview = true;
			s.error = null;
		});
		b.addCase(fetchStockOverviewThunk.fulfilled, (s, a) => {
			s.loadingOverview = false;
			s.stockOverview = a.payload || [];
		});
		b.addCase(fetchStockOverviewThunk.rejected, (s, a) => {
			s.loadingOverview = false;
			s.error = (a.payload as string) || "Failed to load stock overview";
		});

		b.addCase(fetchWarehouseStockThunk.pending, (s) => {
			s.loadingWarehouseStock = true;
			s.error = null;
		});
		b.addCase(fetchWarehouseStockThunk.fulfilled, (s, a) => {
			s.loadingWarehouseStock = false;
			s.warehouseStock = a.payload || [];
		});
		b.addCase(fetchWarehouseStockThunk.rejected, (s, a) => {
			s.loadingWarehouseStock = false;
			s.error = (a.payload as string) || "Failed to load warehouse stock";
		});

		b.addCase(fetchWarehouseStockItemThunk.pending, (s) => {
			s.loadingWarehouseStockItem = true;
			s.error = null;
		});
		b.addCase(fetchWarehouseStockItemThunk.fulfilled, (s, a) => {
			s.loadingWarehouseStockItem = false;
			s.warehouseStockItem = a.payload || null;
		});
		b.addCase(fetchWarehouseStockItemThunk.rejected, (s, a) => {
			s.loadingWarehouseStockItem = false;
			s.error =
				(a.payload as string) || "Failed to load warehouse stock detail";
		});

		b.addCase(getInventoryThunk.pending, (s) => {
			s.loadingOne = true;
			s.error = null;
		});
		b.addCase(getInventoryThunk.fulfilled, (s, a) => {
			s.loadingOne = false;
			s.selected = a.payload;
		});
		b.addCase(getInventoryThunk.rejected, (s, a) => {
			s.loadingOne = false;
			s.error = (a.payload as string) || "Failed to load inventory item";
		});

		b.addCase(createInventoryThunk.pending, (s) => {
			s.saving = true;
			s.error = null;
		});
		b.addCase(createInventoryThunk.fulfilled, (s) => {
			s.saving = false;
		});
		b.addCase(createInventoryThunk.rejected, (s, a) => {
			s.saving = false;
			s.error = (a.payload as string) || "Failed to create inventory";
		});

		b.addCase(updateInventoryThunk.pending, (s) => {
			s.saving = true;
			s.error = null;
		});
		b.addCase(updateInventoryThunk.fulfilled, (s) => {
			s.saving = false;
		});
		b.addCase(updateInventoryThunk.rejected, (s, a) => {
			s.saving = false;
			s.error = (a.payload as string) || "Failed to update inventory";
		});

		b.addCase(deleteInventoryThunk.pending, (s) => {
			s.saving = true;
			s.error = null;
		});
		b.addCase(deleteInventoryThunk.fulfilled, (s) => {
			s.saving = false;
		});
		b.addCase(deleteInventoryThunk.rejected, (s, a) => {
			s.saving = false;
			s.error = (a.payload as string) || "Failed to delete inventory";
		});
	},
});

export const { clearSelected, clearWarehouseStockItem } = slice.actions;
export default slice.reducer;