import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api/axios";
import { API } from "../../../helpers/api_url";
import { getErrorMessage } from "../../../helpers/error_helper";
import type {
	ReadyToDispatchOrder,
	Dispatch,
	CreateDispatchPayload,
} from "../../../types/Warehouses/dispatch";

const pickData = (data: any) => data?.data ?? data;

const DISPATCH_API = ((API as any)?.WAREHOUSES?.DISPATCH as
	| {
			READY: string;
			LIST: string;
			CREATE: string;
			GET_ONE: (id: string) => string;
			DELIVER: (id: string) => string;
			REVERT_READY: (id: string) => string;
			PROCESS_RETURN: (id: string) => string;
			PENDING_RETURN: string;
	  }
	| undefined) ?? {
	READY: "/warehouses/dispatch/ready",
	LIST: "/warehouses/dispatch",
	CREATE: "/warehouses/dispatch",
	GET_ONE: (id: string) => `/warehouses/dispatch/${id}`,
	DELIVER: (id: string) => `/warehouses/dispatch/${id}/deliver`,
	REVERT_READY: (id: string) =>
		`/warehouses/dispatch/ready-to-dispatch/revert/${id}`,
	PROCESS_RETURN: (id: string) =>
		`/warehouses/dispatch/${id}/process-sales-return`,
	PENDING_RETURN: "/warehouses/dispatch/pending-sales-return",
};

// Ready To Dispatch Orders
export const fetchReadyToDispatchThunk = createAsyncThunk(
	"warehouseDispatch/ready",
	async (_, thunkAPI) => {
		try {
			const { data } = await api.get(DISPATCH_API.READY);

			const payload = pickData(data);
			const rows = payload?.data ?? payload;

			return Array.isArray(rows) ? (rows as ReadyToDispatchOrder[]) : [];
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to load ready-to-dispatch orders"),
			);
		}
	},
);

// Dispatch List
export const fetchDispatchesThunk = createAsyncThunk(
	"warehouseDispatch/list",
	async (_, thunkAPI) => {
		try {
			const { data } = await api.get(DISPATCH_API.LIST);

			const payload = pickData(data);
			const rows = payload?.data ?? payload;

			return Array.isArray(rows) ? (rows as Dispatch[]) : [];
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to load dispatch list"),
			);
		}
	},
);

// Dispatch Details
export const fetchDispatchByIdThunk = createAsyncThunk(
	"warehouseDispatch/getOne",
	async (id: string, thunkAPI) => {
		try {
			const { data } = await api.get(DISPATCH_API.GET_ONE(id));

			const payloadData = pickData(data);
			const dispatch = payloadData?.data ?? payloadData;

			return dispatch as Dispatch;
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to load dispatch details"),
			);
		}
	},
);

// Create Dispatch
export const createDispatchThunk = createAsyncThunk(
	"warehouseDispatch/create",
	async (payload: CreateDispatchPayload, thunkAPI) => {
		try {
			const { data } = await api.post(DISPATCH_API.CREATE, payload);

			const payloadData = pickData(data);
			const dispatch = payloadData?.data ?? payloadData;

			return dispatch as Dispatch;
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to create dispatch"),
			);
		}
	},
);

// Deliver Dispatch
export const deliverDispatchThunk = createAsyncThunk(
	"warehouseDispatch/deliver",
	async (id: string, thunkAPI) => {
		try {
			const { data } = await api.patch(DISPATCH_API.DELIVER(id), {});

			const payloadData = pickData(data);
			const dispatch = payloadData?.data ?? payloadData;

			return dispatch as Dispatch;
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to mark dispatch delivered"),
			);
		}
	},
);

// =============================
// PROCESS SALES RETURN
// =============================
export const processSalesReturnThunk = createAsyncThunk(
	"warehouseDispatch/processSalesReturn",
	async (
		{
			id,
			payload,
		}: {
			id: string;
			payload: {
				items: {
					itemId: string;
					returnQty: number;
					returnRemark?: string;
				}[];
			};
		},
		thunkAPI,
	) => {
		try {
			const { data } = await api.patch(
				DISPATCH_API.PROCESS_RETURN(id),
				payload,
			);

			const payloadData = pickData(data);
			const dispatch = payloadData?.data ?? payloadData;

			return dispatch as Dispatch;
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to process sales return"),
			);
		}
	},
);

// =============================
// PENDING SALES RETURN
// =============================
export const fetchPendingSalesReturnDispatchesThunk = createAsyncThunk(
	"warehouseDispatch/pendingSalesReturn",
	async (_, thunkAPI) => {
		try {
			const { data } = await api.get(DISPATCH_API.PENDING_RETURN);

			const payload = pickData(data);
			const rows = payload?.data ?? payload;

			return Array.isArray(rows) ? (rows as Dispatch[]) : [];
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to load pending sales returns"),
			);
		}
	},
);

// Revert Ready To Dispatch
export const revertReadyDispatchThunk = createAsyncThunk(
	"warehouseDispatch/revertReady",
	async (readyRowId: string, thunkAPI) => {
		try {
			const { data } = await api.patch(
				DISPATCH_API.REVERT_READY(readyRowId),
				{},
			);

			const payloadData = pickData(data);
			return payloadData?.data ?? payloadData;
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to revert ready-to-dispatch"),
			);
		}
	},
);
