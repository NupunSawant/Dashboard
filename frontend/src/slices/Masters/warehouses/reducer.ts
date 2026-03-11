import { createSlice } from "@reduxjs/toolkit";
import type { Warehouse } from "../../../types/Masters/warehouse";
import {
	fetchWarehousesThunk,
	getWarehouseThunk,
	createWarehouseThunk,
	updateWarehouseThunk,
} from "./thunks";

type WarehousesState = {
	warehouses: Warehouse[];
	selected: Warehouse | null;
	loadingList: boolean;
	loadingOne: boolean;
	saving: boolean;
	error: string | null;
};

const initialState: WarehousesState = {
	warehouses: [],
	selected: null,
	loadingList: false,
	loadingOne: false,
	saving: false,
	error: null,
};

const slice = createSlice({
	name: "warehouses",
	initialState,
	reducers: {
		clearSelected(s) {
			s.selected = null;
		},
	},
	extraReducers: (b) => {
		b.addCase(fetchWarehousesThunk.pending, (s) => {
			s.loadingList = true;
			s.error = null;
		});
		b.addCase(fetchWarehousesThunk.fulfilled, (s, a) => {
			s.loadingList = false;
			s.warehouses = a.payload || [];
		});
		b.addCase(fetchWarehousesThunk.rejected, (s, a) => {
			s.loadingList = false;
			s.error = (a.payload as string) || "Failed to load warehouses";
		});

		b.addCase(getWarehouseThunk.pending, (s) => {
			s.loadingOne = true;
			s.error = null;
		});
		b.addCase(getWarehouseThunk.fulfilled, (s, a) => {
			s.loadingOne = false;
			s.selected = a.payload;
		});
		b.addCase(getWarehouseThunk.rejected, (s, a) => {
			s.loadingOne = false;
			s.error = (a.payload as string) || "Failed to load warehouse";
		});

		b.addCase(createWarehouseThunk.pending, (s) => {
			s.saving = true;
			s.error = null;
		});
		b.addCase(createWarehouseThunk.fulfilled, (s) => {
			s.saving = false;
		});
		b.addCase(createWarehouseThunk.rejected, (s, a) => {
			s.saving = false;
			s.error = (a.payload as string) || "Failed to create warehouse";
		});

		b.addCase(updateWarehouseThunk.pending, (s) => {
			s.saving = true;
			s.error = null;
		});
		b.addCase(updateWarehouseThunk.fulfilled, (s) => {
			s.saving = false;
		});
		b.addCase(updateWarehouseThunk.rejected, (s, a) => {
			s.saving = false;
			s.error = (a.payload as string) || "Failed to update warehouse";
		});
	},
});

export const { clearSelected } = slice.actions;

export default slice.reducer;
