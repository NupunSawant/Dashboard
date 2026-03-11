// src/store/slices/customers/slice.ts
import { createSlice } from "@reduxjs/toolkit";
import type { Customer } from "../../../types/Masters/customer";
import {
	fetchCustomersThunk,
	getCustomerThunk,
	createCustomerThunk,
	updateCustomerThunk,
	deleteCustomerThunk,
} from "./thunks";

type CustomersState = {
	customers: Customer[];
	selected: Customer | null;
	loadingList: boolean;
	loadingOne: boolean;
	saving: boolean;
	error: string | null;
};

const initialState: CustomersState = {
	customers: [],
	selected: null,
	loadingList: false,
	loadingOne: false,
	saving: false,
	error: null,
};

const slice = createSlice({
	name: "customers",
	initialState,
	reducers: {
		clearSelected(s) {
			s.selected = null;
		},
	},
	extraReducers: (b) => {
		b.addCase(fetchCustomersThunk.pending, (s) => {
			s.loadingList = true;
			s.error = null;
		});
		b.addCase(fetchCustomersThunk.fulfilled, (s, a) => {
			s.loadingList = false;
			s.customers = a.payload || [];
		});
		b.addCase(fetchCustomersThunk.rejected, (s, a) => {
			s.loadingList = false;
			s.error = (a.payload as string) || "Failed to load customers";
		});

		b.addCase(getCustomerThunk.pending, (s) => {
			s.loadingOne = true;
			s.error = null;
		});
		b.addCase(getCustomerThunk.fulfilled, (s, a) => {
			s.loadingOne = false;
			s.selected = a.payload;
		});
		b.addCase(getCustomerThunk.rejected, (s, a) => {
			s.loadingOne = false;
			s.error = (a.payload as string) || "Failed to load customer";
		});

		b.addCase(createCustomerThunk.pending, (s) => {
			s.saving = true;
			s.error = null;
		});
		b.addCase(createCustomerThunk.fulfilled, (s) => {
			s.saving = false;
		});
		b.addCase(createCustomerThunk.rejected, (s, a) => {
			s.saving = false;
			s.error = (a.payload as string) || "Failed to create customer";
		});

		b.addCase(updateCustomerThunk.pending, (s) => {
			s.saving = true;
			s.error = null;
		});
		b.addCase(updateCustomerThunk.fulfilled, (s) => {
			s.saving = false;
		});
		b.addCase(updateCustomerThunk.rejected, (s, a) => {
			s.saving = false;
			s.error = (a.payload as string) || "Failed to update customer";
		});

		b.addCase(deleteCustomerThunk.pending, (s) => {
			s.saving = true;
			s.error = null;
		});
		b.addCase(deleteCustomerThunk.fulfilled, (s) => {
			s.saving = false;
		});
		b.addCase(deleteCustomerThunk.rejected, (s, a) => {
			s.saving = false;
			s.error = (a.payload as string) || "Failed to delete customer";
		});
	},
});

export const { clearSelected } = slice.actions;
export default slice.reducer;
