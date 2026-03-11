import { createSlice } from "@reduxjs/toolkit";
import type { Supplier } from "../../../types/Masters/supplier";
import {
	fetchSuppliersThunk,
	getSupplierThunk,
	createSupplierThunk,
	updateSupplierThunk,
} from "./thunks";

type SuppliersState = {
	suppliers: Supplier[];
	selected: Supplier | null;
	loadingList: boolean;
	loadingOne: boolean;
	saving: boolean;
	error: string | null;
};

const initialState: SuppliersState = {
	suppliers: [],
	selected: null,
	loadingList: false,
	loadingOne: false,
	saving: false,
	error: null,
};

const slice = createSlice({
	name: "suppliers",
	initialState,
	reducers: {
		clearSelected(s) {
			s.selected = null;
		},
	},
	extraReducers: (b) => {
		b.addCase(fetchSuppliersThunk.pending, (s) => {
			s.loadingList = true;
			s.error = null;
		});
		b.addCase(fetchSuppliersThunk.fulfilled, (s, a) => {
			s.loadingList = false;
			s.suppliers = a.payload || [];
		});
		b.addCase(fetchSuppliersThunk.rejected, (s, a) => {
			s.loadingList = false;
			s.error = (a.payload as string) || "Failed to load suppliers";
		});

		b.addCase(getSupplierThunk.pending, (s) => {
			s.loadingOne = true;
			s.error = null;
		});
		b.addCase(getSupplierThunk.fulfilled, (s, a) => {
			s.loadingOne = false;
			s.selected = a.payload;
		});
		b.addCase(getSupplierThunk.rejected, (s, a) => {
			s.loadingOne = false;
			s.error = (a.payload as string) || "Failed to load supplier";
		});

		b.addCase(createSupplierThunk.pending, (s) => {
			s.saving = true;
			s.error = null;
		});
		b.addCase(createSupplierThunk.fulfilled, (s) => {
			s.saving = false;
		});
		b.addCase(createSupplierThunk.rejected, (s, a) => {
			s.saving = false;
			s.error = (a.payload as string) || "Failed to create supplier";
		});

		b.addCase(updateSupplierThunk.pending, (s) => {
			s.saving = true;
			s.error = null;
		});
		b.addCase(updateSupplierThunk.fulfilled, (s) => {
			s.saving = false;
		});
		b.addCase(updateSupplierThunk.rejected, (s, a) => {
			s.saving = false;
			s.error = (a.payload as string) || "Failed to update supplier";
		});
	},
});

export const { clearSelected } = slice.actions;
export default slice.reducer;
