import { createSlice } from "@reduxjs/toolkit";
import {
	fetchItemsThunk,
    getItemThunk,
    createItemThunk,
    updateItemThunk,
} from "./thunks";
import type { Item } from "../../../types/Masters/item";

type ItemState = {
	items: Item[];
	selected: Item | null;
	loadingList: boolean;
	loadingOne: boolean;
	saving: boolean;
	error: string | null;
};

const initialState: ItemState = {
	items: [],
	selected: null,
	loadingList: false,
	loadingOne: false,
	saving: false,
	error: null,
};

const slice = createSlice({
	name: "items",
	initialState,
	reducers: {
		clearSelected(s) {
			s.selected = null;
		},
	},
	extraReducers: (b) => {
		b.addCase(fetchItemsThunk.pending, (s) => {
			s.loadingList = true;
			s.error = null;
		});
		b.addCase(fetchItemsThunk.fulfilled, (s, a) => {
			s.loadingList = false;
			s.items = a.payload || [];
		});
		b.addCase(fetchItemsThunk.rejected, (s, a) => {
			s.loadingList = false;
			s.error = (a.payload as string) || "Failed to load items";
		});

		b.addCase(getItemThunk.pending, (s) => {
			s.loadingOne = true;
			s.error = null;
		});
		b.addCase(getItemThunk.fulfilled, (s, a) => {
			s.loadingOne = false;
			s.selected = a.payload;
		});
		b.addCase(getItemThunk.rejected, (s, a) => {
			s.loadingOne = false;
			s.error = (a.payload as string) || "Failed to load item";
		});

		b.addCase(createItemThunk.pending, (s) => {
			s.saving = true;
			s.error = null;
		});
		b.addCase(createItemThunk.fulfilled, (s) => {
			s.saving = false;
		});
		b.addCase(createItemThunk.rejected, (s, a) => {
			s.saving = false;
			s.error = (a.payload as string) || "Failed to create item";
		});

		b.addCase(updateItemThunk.pending, (s) => {
			s.saving = true;
			s.error = null;
		});
		b.addCase(updateItemThunk.fulfilled, (s) => {
			s.saving = false;
		});
		b.addCase(updateItemThunk.rejected, (s, a) => {
			s.saving = false;
			s.error = (a.payload as string) || "Failed to update item";
		});
	},
});

export const { clearSelected } = slice.actions;
export default slice.reducer;
