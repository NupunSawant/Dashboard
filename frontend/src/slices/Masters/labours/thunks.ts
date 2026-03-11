import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api/axios";
import { API } from "../../../helpers/api_url";
import { getErrorMessage } from "../../../helpers/error_helper";
import type { Labour } from "../../../types/Masters/labour";

export const fetchLaboursThunk = createAsyncThunk(
	"labours/list",
	async (_, thunkAPI) => {
		try {
			const { data } = await api.get(API.LABOURS.LIST);

			const labour = data?.data?.labours ?? data?.labours ?? data?.data ?? data;
			return Array.isArray(labour) ? (labour as Labour[]) : [];
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to load labours"),
			);
		}
	},
);

export const getLabourThunk = createAsyncThunk(
	"labours/getOne",
	async (id: string, thunkAPI) => {
		try {
			const { data } = await api.get(API.LABOURS.GET_ONE(id));

			const labour = data?.data?.labours ?? data?.labour ?? data?.data ?? data;
			return labour as Labour;
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to load labour"),
			);
		}
	},
);

export const createLabourThunk = createAsyncThunk(
	"labours/create",
	async (
		payload: {
			labourName?: string;
			contactNumber?: string;
			panNumber?: string;
			panDocument?: string;
			aadharNumber?: string;
			aadharDocument?: string;
			address?: string;
			state?: string;
			city?: string;
			country?: string;
			pincode?: string;
			remark?: string;
		},
		thunkAPI,
	) => {
		try {
			const { data } = await api.post(API.LABOURS.CREATE, payload);
			return data;
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to create labour"),
			);
		}
	},
);

export const updateLabourThunk = createAsyncThunk(
	"labours/update",
	async (
		{
			id,
			payload,
		}: {
			id: string;
			payload: {
				labourName?: string;
				contactNumber?: string;
				panNumber?: string;
				panDocument?: string;
				aadharNumber?: string;
				aadharDocument?: string;
				address?: string;
				state?: string;
				city?: string;
				country?: string;
				pincode?: string;
				remark?: string;
			};
		},
		thunkAPI,
	) => {
		try {
			//   backend uses PUT
			const { data } = await api.put(API.LABOURS.UPDATE(id), payload);
			return data;
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to update labour"),
			);
		}
	},
);
