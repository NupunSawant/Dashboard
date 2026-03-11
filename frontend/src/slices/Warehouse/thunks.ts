// src/store/slices/warehouseInward/thunks.ts

import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";
import { API } from "../../helpers/api_url";
import { getErrorMessage } from "../../helpers/error_helper";
import type { WarehouseInward } from "../../types/Warehouses/warehouseInward";

/* ================================
   LIST WAREHOUSE INWARDS
================================ */
export const fetchWarehouseInwardsThunk = createAsyncThunk(
	"warehouseInward/list",
	async (_, thunkAPI) => {
		try {
			const { data } = await api.get(API.WAREHOUSE_INWARD.LIST);

			const list =
				data?.data?.warehouseInwards ??
				data?.warehouseInwards ??
				data?.data ??
				data;

			return Array.isArray(list) ? (list as WarehouseInward[]) : [];
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to load warehouse inwards"),
			);
		}
	},
);

/* ================================
   GET ONE WAREHOUSE INWARD
================================ */
export const getWarehouseInwardThunk = createAsyncThunk(
	"warehouseInward/getOne",
	async (id: string, thunkAPI) => {
		try {
			const { data } = await api.get(API.WAREHOUSE_INWARD.GET_ONE(id));

			const inward =
				data?.data?.warehouseInward ??
				data?.warehouseInward ??
				data?.data ??
				data;

			return inward as WarehouseInward;
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to load warehouse inward"),
			);
		}
	},
);

/* ================================
   CREATE WAREHOUSE INWARD
================================ */
export const createWarehouseInwardThunk = createAsyncThunk(
	"warehouseInward/create",
	async (
		payload: {
			
			inwardType: string;
			inwardDate: Date;
			receivedBy: string;
			remarks?: string;
			invoiceNo: string;
			supplierName: string;
			warehouseName: string;

			sourceDispatchId?: string;
			dispatchNo?: string;

			items: Array<{
				itemsCategory: string;
				itemsSubCategory: string;
				itemsName: string;
				itemsCode: string;
				itemsQuantity: number;
				itemsUnit: string;
				itemsRate: number;
				itemsAmount: number;
				itemsRemark?: string;
			}>;
		},
		thunkAPI,
	) => {
		try {
			const { data } = await api.post(API.WAREHOUSE_INWARD.CREATE, payload);
			return data;
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to create warehouse inward"),
			);
		}
	},
);

export const updateWarehouseInwardThunk = createAsyncThunk(
	"warehouseInward/update",
	async (
		{
			id,
			payload,
		}: {
			id: string;
			payload: {
				inwardType?: string;
				inwardDate?: Date;
				receivedBy?: string;
				remarks?: string;
				invoiceNo?: string;
				supplierName?: string;
				warehouseName?: string;
				items?: Array<{
					itemsCategory: string;
					itemsSubCategory: string;
					itemsName: string;
					itemsCode: string;
					itemsQuantity: number;
					itemsUnit: string;
					itemsRate: number;
					itemsAmount: number;
					itemsRemark?: string;
				}>;
			};
		},
		thunkAPI,
	) => {
		try {
			const { data } = await api.put(API.WAREHOUSE_INWARD.UPDATE(id), payload);
			return data;
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to update warehouse inward"),
			);
		}
	},
);

/* ================================
   DELETE WAREHOUSE INWARD
================================ */
export const deleteWarehouseInwardThunk = createAsyncThunk(
	"warehouseInward/delete",
	async (id: string, thunkAPI) => {
		try {
			const { data } = await api.delete(API.WAREHOUSE_INWARD.DELETE(id));
			return data;
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to delete warehouse inward"),
			);
		}
	},
);
