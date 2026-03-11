import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api/axios";
import { API } from "../../../helpers/api_url";
import { getErrorMessage } from "../../../helpers/error_helper";
import type { Warehouse } from "../../../types/Masters/warehouse";

export const fetchWarehousesThunk = createAsyncThunk(
	"warehouses/list",
	async (_, thunkAPI) => {
		try {
			const { data } = await api.get(API.WAREHOUSES.LIST);

			const list =
				data?.data?.warehouses ?? data?.warehouses ?? data?.data ?? data;
			return Array.isArray(list) ? (list as Warehouse[]) : [];
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to load warehouses"),
			);
		}
	},
);

export const getWarehouseThunk = createAsyncThunk(
	"warehouses/getOne",
	async (id: string, thunkAPI) => {
		try {
			const { data } = await api.get(API.WAREHOUSES.GET_ONE(id));

			const warehouse =
				data?.data?.warehouse ?? data?.warehouse ?? data?.data ?? data;
			return warehouse as Warehouse;
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to load warehouse"),
			);
		}
	},
);

export const createWarehouseThunk = createAsyncThunk(
	"warehouses/create",
	async (
		payload: {
			warehouseName: string;
			warehouseType?: string;
			warehouseAddress?: string;
			warehouseCity?: string;
			warehouseState?: string;
			warehouseCountry?: string;
			warehousePincode?: string;
			remarks?: string;
		},
		thunkAPI,
	) => {
		try {
			const { data } = await api.post(API.WAREHOUSES.CREATE, payload);
			return data;
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to create warehouse"),
			);
		}
	},
);

export const updateWarehouseThunk = createAsyncThunk(
	"warehouses/update",
	async (
		{
			id,
			payload,
		}: {
			id: string;
			payload: {
				warehouseName?: string;
				warehouseType?: string;
				warehouseAddress?: string;
				warehouseCity?: string;
				warehouseState?: string;
				warehouseCountry?: string;
				warehousePincode?: string;
				remarks?: string;
			};
		},
		thunkAPI,
	) => {
		try {
			const { data } = await api.put(API.WAREHOUSES.UPDATE(id), payload);
			return data;
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to update warehouse"),
			);
		}
	},
);
