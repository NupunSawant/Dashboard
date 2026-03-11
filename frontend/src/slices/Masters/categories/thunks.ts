import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api/axios";
import { API } from "../../../helpers/api_url";
import { getErrorMessage } from "../../../helpers/error_helper";
import type { Category } from "../../../types/Masters/category";

export const fetchCategoriesThunk = createAsyncThunk(
	"categories/list",
	async (_, thunkAPI) => {
		try {
			const { data } = await api.get(API.CATEGORIES.LIST);

			const list =
				data?.data?.categories ?? data?.categories ?? data?.data ?? data;
			return Array.isArray(list) ? (list as Category[]) : [];
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to load categories"),
			);
		}
	},
);

export const getCategoryThunk = createAsyncThunk(
	"categories/getOne",
	async (id: string, thunkAPI) => {
		try {
			const { data } = await api.get(API.CATEGORIES.GET_ONE(id));

			const cat = data?.data?.category ?? data?.category ?? data?.data ?? data;
			return cat as Category;
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to load category"),
			);
		}
	},
);

export const createCategoryThunk = createAsyncThunk(
	"categories/create",
	async (payload: { name: string; remark?: string }, thunkAPI) => {
		try {
			const { data } = await api.post(API.CATEGORIES.CREATE, payload);
			return data;
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to create category"),
			);
		}
	},
);

export const updateCategoryThunk = createAsyncThunk(
	"categories/update",
	async (
		{
			id,
			payload,
		}: { id: string; payload: { name?: string; remark?: string } },
		thunkAPI,
	) => {
		try {
			//   backend uses PUT
			const { data } = await api.put(API.CATEGORIES.UPDATE(id), payload);
			return data;
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to update category"),
			);
		}
	},
);
