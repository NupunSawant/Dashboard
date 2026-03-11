import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api/axios";
import { API } from "../../../helpers/api_url";
import { getErrorMessage } from "../../../helpers/error_helper";
import type { GST } from "../../../types/Masters/gst";

export const fetchGSTsThunk = createAsyncThunk(
	"gsts/list",
	async (_, thunkAPI) => {
		try {
			const { data } = await api.get(API.GSTS.LIST);

			const list = data?.gsts ?? data?.data ?? data
			return Array.isArray(list) ? (list as GST[]) : [];
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to load GSTs"),
			);
		}
	},
);

export const getGstThunk = createAsyncThunk(
	"gsts/getOne",
	async (id: string, thunkAPI) => {
		try {
			const { data } = await api.get(API.GSTS.GET_ONE(id));

			const gst = data?.data?.gst ?? data?.gst ?? data?.data ?? data;
			return gst as GST;
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to Load GST"),
			);
		}
	},
);

export const createGstThunk = createAsyncThunk(
	"gsts/create",
	async (payload: { gstRate: string; remark?: string }, thunkAPI) => {
		try {
			const { data } = await api.post(API.GSTS.CREATE, payload);
			return data;
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to Create GST"),
			);
		}
	},
);

export const updateGstThunk = createAsyncThunk(
	"gsts/update",
	async (
		{
			id,
			payload,
		}: { id: string; payload: { gstRate?: string; remark?: string } },
		thunkAPI,
	) => {
		try {
			const { data } = await api.put(API.GSTS.UPDATE(id), payload);
			return data;
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to Update GST"),
			);
		}
	},
);
