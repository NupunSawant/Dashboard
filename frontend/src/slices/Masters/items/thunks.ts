import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api/axios";
import { API } from "../../../helpers/api_url";
import { getErrorMessage } from "../../../helpers/error_helper";
import type { Item } from "../../../types/Masters/item";

export const fetchItemsThunk = createAsyncThunk(
	"items/list",
	async (_, thunkAPI) => {
		try {
			const { data } = await api.get(API.ITEMS.LIST);

			const list = data?.data?.items ?? data?.items ?? data?.data ?? data;
			return Array.isArray(list) ? (list as Item[]) : [];
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to load items"),
			);
		}
	},
);

export const getItemThunk = createAsyncThunk(
	"items/getOne",
	async (id: string, thunkAPI) => {
		try {
			const { data } = await api.get(API.ITEMS.GET_ONE(id));

			const item = data?.data?.item ?? data?.item ?? data?.data ?? data;
			return item as Item;
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to load item"),
			);
		}
	},
);

export const createItemThunk = createAsyncThunk(
	"items/create",
	async (
		payload: {
			itemName: string;
			itemCode: string;
			category: string;
			subCategory?: string;
			gst?: string;
			unit: string;
			remark?: string;
		},
		thunkAPI,
	) => {
		try {
			const { data } = await api.post(API.ITEMS.CREATE, payload);
			return data;
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to create item"),
			);
		}
	},
);

export const updateItemThunk = createAsyncThunk(
	"items/update",
	async (
		{
			id,
			payload,
		}: {
			id: string;
			payload: {
				itemName: string;
				itemCode: string;
				category: string;
				subCategory?: string;
				gst?: string;
				unit: string;
				remark?: string;
			};
		},
		thunkAPI,
	) => {
		try {
			//   backend uses PUT
			const { data } = await api.put(API.ITEMS.UPDATE(id), payload);
			return data;
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to update item"),
			);
		}
	},
);
