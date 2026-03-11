import { createSlice } from "@reduxjs/toolkit";
import type { Category } from "../../../types/Masters/category";
import {
	fetchCategoriesThunk,
	getCategoryThunk,
	createCategoryThunk,
	updateCategoryThunk,
} from "./thunks";

type CategoriesState = {
	categories: Category[];
	selected: Category | null;
	loadingList: boolean;
	loadingOne: boolean;
	saving: boolean;
	error: string | null;
};

const initialState: CategoriesState = {
	categories: [],
	selected: null,
	loadingList: false,
	loadingOne: false,
	saving: false,
	error: null,
};

const slice = createSlice({
	name: "categories",
	initialState,
	reducers: {
		clearSelected(s) {
			s.selected = null;
		},
	},
	extraReducers: (b) => {
		b.addCase(fetchCategoriesThunk.pending, (s) => {
			s.loadingList = true;
			s.error = null;
		});
		b.addCase(fetchCategoriesThunk.fulfilled, (s, a) => {
			s.loadingList = false;
			s.categories = a.payload || [];
		});
		b.addCase(fetchCategoriesThunk.rejected, (s, a) => {
			s.loadingList = false;
			s.error = (a.payload as string) || "Failed to load categories";
		});

		b.addCase(getCategoryThunk.pending, (s) => {
			s.loadingOne = true;
			s.error = null;
		});
		b.addCase(getCategoryThunk.fulfilled, (s, a) => {
			s.loadingOne = false;
			s.selected = a.payload;
		});
		b.addCase(getCategoryThunk.rejected, (s, a) => {
			s.loadingOne = false;
			s.error = (a.payload as string) || "Failed to load category";
		});

		b.addCase(createCategoryThunk.pending, (s) => {
			s.saving = true;
			s.error = null;
		});
		b.addCase(createCategoryThunk.fulfilled, (s) => {
			s.saving = false;
		});
		b.addCase(createCategoryThunk.rejected, (s, a) => {
			s.saving = false;
			s.error = (a.payload as string) || "Failed to create category";
		});

		b.addCase(updateCategoryThunk.pending, (s) => {
			s.saving = true;
			s.error = null;
		});
		b.addCase(updateCategoryThunk.fulfilled, (s) => {
			s.saving = false;
		});
		b.addCase(updateCategoryThunk.rejected, (s, a) => {
			s.saving = false;
			s.error = (a.payload as string) || "Failed to update category";
		});
	},
});

export const { clearSelected } = slice.actions;
export default slice.reducer;
