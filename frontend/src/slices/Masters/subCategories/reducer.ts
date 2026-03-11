import { createSlice } from "@reduxjs/toolkit";
import type { SubCategory } from "../../../types/Masters/subCategory";
import {
	fetchSubCategoriesThunk,
	getSubCategoryThunk,
	createSubCategoryThunk,
	updateSubCategoryThunk,
} from "./thunks";

type SubCategoriesState = {
    subCategories: SubCategory[];
    selected: SubCategory | null;
    loadingList: boolean;
    loadingOne: boolean;
    saving: boolean;
    error: string | null;
}

const initialState: SubCategoriesState = {
    subCategories: [],
    selected: null,
    loadingList: false,
    loadingOne: false,
    saving: false,
    error: null,
}

const slice = createSlice({
    name: "sub-categories",
    initialState,
    reducers: {
        clearSelectedSubCategory(s) {
            s.selected = null;
        }
    },
    extraReducers: (b) => {
        b.addCase(fetchSubCategoriesThunk.pending, (s) => {
            s.loadingList = true;
            s.error = null;
        }),
        b.addCase(fetchSubCategoriesThunk.fulfilled, (s, a) => {
            s.loadingList = false;
            s.subCategories = a.payload || [];
        }),
        b.addCase(fetchSubCategoriesThunk.rejected, (s, a) => {
            s.loadingList = false;
            s.error = (a.payload as string) || "Failed to load sub categories";
        }),

        b.addCase(getSubCategoryThunk.pending, (s) => {
            s.loadingOne = true;
            s.error = null;
        }),
        b.addCase(getSubCategoryThunk.fulfilled, (s, a) => {
            s.loadingOne = false;
            s.selected = a.payload;
        }),
        b.addCase(getSubCategoryThunk.rejected, (s, a) => {
            s.loadingOne = false;
            s.error = (a.payload as string) || "Failed to load sub category";
        }),

        b.addCase(createSubCategoryThunk.pending, (s) => {
            s.saving = true;
            s.error = null;
        }),
        b.addCase(createSubCategoryThunk.fulfilled, (s) => {
            s.saving = false;
        });
        b.addCase(createSubCategoryThunk.rejected, (s, a) => {
            s.saving = false;
            s.error = (a.payload as string) || "Failed to create sub category";
        });

        b.addCase(updateSubCategoryThunk.pending, (s) => {
            s.saving = true;
            s.error = null;
        }),
        b.addCase(updateSubCategoryThunk.fulfilled, (s) => {
            s.saving = false;
        });
        b.addCase(updateSubCategoryThunk.rejected, (s, a) => {
            s.saving = false;
            s.error = (a.payload as string) || "Failed to update sub category";
        });            
    }
})

export const {clearSelectedSubCategory} = slice.actions;
export default slice.reducer;