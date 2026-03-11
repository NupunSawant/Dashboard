import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api/axios";
import { API } from "../../../helpers/api_url";
import { getErrorMessage } from "../../../helpers/error_helper";
import type { HSNCode } from "../../../types/Masters/hsnCode";

export const fetchHSNCodesThunk = createAsyncThunk(
	"hsnCodes/list",
	async (_, thunkAPI) => {
		try {
			const { data } = await api.get(API.HSNCODES.LIST);

			const list = data?.hsnCodes ?? data?.data ?? data;
			return Array.isArray(list) ? (list as HSNCode[]) : [];
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to load HSN Codes"),
			);
		}
	},
);

export const getHSNCodeThunk = createAsyncThunk(
	"hsnCodes/getOne",
	async (id: string, thunkAPI) => {
		try {
			const { data } = await api.get(API.HSNCODES.GET_ONE(id));

			const hsnCode =
				data?.data?.hsnCode ?? data?.hsnCode ?? data?.data ?? data;
			return hsnCode as HSNCode;
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to Load HSN Code"),
			);
		}
	},
);

export const createHSNCodeThunk = createAsyncThunk(
	"hsnCodes/create",
	async (
		payload: {
			gstRate?: string;
			hsnCode: string;
			hsnDescription?: string;
		},
		thunkAPI,
	) => {
		try {
			const { data } = await api.post(API.HSNCODES.CREATE, payload);
			return data;
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to Create HSN Code"),
			);
		}
	},
);

export const updateHSNCodeThunk = createAsyncThunk(
	"hsnCodes/update",
	async (
		{
			id,
			payload,
		}: {
			id: string;
			payload: {
				gstRate?: string;
				hsnCode?: string;
				hsnDescription?: string;
			};
		},
		thunkAPI,
	) => {
		try {
			const { data } = await api.put(
				API.HSNCODES.UPDATE(id),
				payload,
			);
			return data;
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to Update HSN Code"),
			);
		}
	},
);