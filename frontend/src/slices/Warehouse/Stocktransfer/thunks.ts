import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api/axios";
import { API } from "../../../helpers/api_url";
import { getErrorMessage } from "../../../helpers/error_helper";
import type { StockTransfer } from "../../../types/Warehouses/stocktransfer"

export const fetchStockTransfersThunk = createAsyncThunk(
	"stockTransfer/list",
	async (_, thunkAPI) => {
		try {
			const { data } = await api.get(API.STOCK_TRANSFER.LIST);
			const list =
				data?.data?.stockTransfers ??
				data?.stockTransfers ??
				data?.data ??
				data;
			return Array.isArray(list) ? (list as StockTransfer[]) : [];
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to load stock transfers"),
			);
		}
	},
);

export const fetchPendingStockTransfersThunk = createAsyncThunk(
	"stockTransfer/pending",
	async (_, thunkAPI) => {
		try {
			const { data } = await api.get(API.STOCK_TRANSFER.PENDING);
			const list =
				data?.data?.stockTransfers ??
				data?.stockTransfers ??
				data?.data ??
				data;
			return Array.isArray(list) ? (list as StockTransfer[]) : [];
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to load pending stock transfers"),
			);
		}
	},
);

export const getStockTransferThunk = createAsyncThunk(
	"stockTransfer/getOne",
	async (id: string, thunkAPI) => {
		try {
			const { data } = await api.get(API.STOCK_TRANSFER.GET_ONE(id));
			const item =
				data?.data?.stockTransfer ??
				data?.stockTransfer ??
				data?.data ??
				data;
			return item as StockTransfer;
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to load stock transfer"),
			);
		}
	},
);

export const createStockTransferThunk = createAsyncThunk(
	"stockTransfer/create",
	async (payload: Partial<StockTransfer>, thunkAPI) => {
		try {
			const { data } = await api.post(API.STOCK_TRANSFER.CREATE, payload);
			return data;
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to create stock transfer"),
			);
		}
	},
);

export const updateStockTransferThunk = createAsyncThunk(
	"stockTransfer/update",
	async ({ id, payload }: { id: string; payload: Partial<StockTransfer> }, thunkAPI) => {
		try {
			const { data } = await api.put(API.STOCK_TRANSFER.UPDATE(id), payload);
			return data;
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to update stock transfer"),
			);
		}
	},
);

export const revertStockTransferThunk = createAsyncThunk(
	"stockTransfer/revert",
	async (id: string, thunkAPI) => {
		try {
			const { data } = await api.patch(API.STOCK_TRANSFER.REVERT(id));
			return data;
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to revert stock transfer"),
			);
		}
	},
);

export const completeStockTransferThunk = createAsyncThunk(
	"stockTransfer/complete",
	async (id: string, thunkAPI) => {
		try {
			const { data } = await api.patch(API.STOCK_TRANSFER.COMPLETE(id));
			return data;
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to complete stock transfer"),
			);
		}
	},
);