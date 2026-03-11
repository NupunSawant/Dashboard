import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api/axios";
import { API } from "../../../helpers/api_url";
import { getErrorMessage } from "../../../helpers/error_helper";
import type { Unit } from "../../../types/Masters/unit";

export const fetchUnitsThunk = createAsyncThunk(
	"units/list",
	async (_, thunkAPI) => {
		try {
			const { data } = await api.get(API.UNITS.LIST);

			const list = data?.data?.units ?? data?.units ?? data?.data ?? data;
			return Array.isArray(list) ? (list as Unit[]) : [];
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to Load Units"),
			);
		}
	},
);

export const getUnitThunk = createAsyncThunk(
	"units/getOne",
	async (id: string, thunkAPI) => {
		try {
			const { data } = await api.get(API.UNITS.GET_ONE(id));

			const unit = data?.data?.unit ?? data?.unit ?? data?.data ?? data;
			return unit as Unit;
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to Load Unit"),
			);
		}
	},
);

export const createUnitThunk = createAsyncThunk(
	"units/create",
	async (payload: { unitName: string; unitSymbol?: string }, thunkAPI) => {
		try {
			const { data } = await api.post(API.UNITS.CREATE, payload);
			return data;
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to Create Unit"),
			);
		}
	},
);

export const updateUnitThunk = createAsyncThunk(
	"units/update",
	async (
		{
			id,
			payload,
		}: { id: string; payload: { unitName?: string; unitSymbol?: string } },
		thunkAPI,
	) => {
		try {
			const { data } = await api.put(API.UNITS.UPDATE(id), payload);
			return data;
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to Update Unit"),
			);
		}
	},
);
