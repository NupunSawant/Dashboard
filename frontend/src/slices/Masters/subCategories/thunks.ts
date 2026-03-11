import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api/axios";
import { API } from "../../../helpers/api_url";
import { getErrorMessage } from "../../../helpers/error_helper";
import type { SubCategory } from "../../../types/Masters/subCategory";

export const fetchSubCategoriesThunk = createAsyncThunk(
	"sub-categories/list",
	async (_, thunkAPI) => {
		try {
			const { data } = await api.get(API.SUB_CATEGORIES.LIST);

			const list =
				data?.data?.subCategories ?? data?.subCategories ?? data?.data ?? data;
			return Array.isArray(list) ? (list as SubCategory[]) : [];
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to Load Sub Categories"),
			);
		}
	},
);


export const getSubCategoryThunk = createAsyncThunk(
    "sub-categories/getOne",
    async( id:string, thunkAPI) => {
        try {
            const {data} = await api.get(API.SUB_CATEGORIES.GET_ONE(id));

            const subCat = data?.data?.subCategory ?? data?.subCategory ?? data?.data ?? data;
            return subCat as SubCategory;
        } catch (err: any) {
            return thunkAPI.rejectWithValue(
                getErrorMessage(err, "Failed to Load Sub Category"),
            );
        }
    }
)

export const createSubCategoryThunk = createAsyncThunk(
    "sub-categories/create",
    async(payload: { name: string; remark?: string; category: string }, thunkAPI) => {
        try {
            const {data} = await api.post(API.SUB_CATEGORIES.CREATE, payload);
            return data;
        } catch (err: any) {
            return thunkAPI.rejectWithValue(
                getErrorMessage(err, "Failed to Create Sub Category"),
            );
        }
    }
)

export const updateSubCategoryThunk = createAsyncThunk(
    "sub-categories/update",
    async(
        {
            id,
            payload,
        }: { id: string; payload: { name?: string; remark?: string; category?: string } },
        thunkAPI,
     ) => {

        try {
            const {data} = await api.put(API.SUB_CATEGORIES.UPDATE(id), payload);
            return data;
        } catch (err: any) {
            return thunkAPI.rejectWithValue(
                getErrorMessage(err, "Failed to Update Sub Category"),
            );
        }
    }
)