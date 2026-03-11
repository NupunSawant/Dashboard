// slices/orders/quotation/thunks.ts

import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api/axios";
import { API } from "../../../helpers/api_url";
import { getErrorMessage } from "../../../helpers/error_helper";

import type {
	CreateQuotationPayload,
	UpdateQuotationPayload,
	Quotation,
	QuotationStatus,
} from "../../../types/Orders/quotation";
import type { Enquiry } from "../../../types/Orders/Enquiry";

/* =========================================================
     1) FETCH QUOTATION REQUESTS (RFQ LIST)
   GET /orders/quotations/requests
========================================================= */
export const fetchQuotationRequestsThunk = createAsyncThunk(
	"quotation/fetchRequests",
	async (_, thunkAPI) => {
		try {
			const { data } = await api.get(API.QUOTATIONS.REQUESTS);

			// backend: { success, message, data: [] }
			const rows = data?.data ?? data;
			return Array.isArray(rows) ? (rows as Enquiry[]) : [];
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to fetch quotation requests"),
			);
		}
	},
);

/* =========================================================
     2) REVERT QUOTATION REQUEST
   PATCH /orders/quotations/requests/:enquiryId/revert
========================================================= */
export const revertQuotationRequestThunk = createAsyncThunk(
	"quotation/revertRequest",
	async (enquiryId: string, thunkAPI) => {
		try {
			const { data } = await api.patch(
				`/orders/quotations/requests/${enquiryId}/revert`,
			);

			// backend returns updated enquiry (your controller does)
			const updated = data?.data ?? data;

			// keep it flexible: reducers can use updated object OR id
			return updated as Enquiry;
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to revert quotation request"),
			);
		}
	},
);

/* =========================================================
     3) FETCH ALL QUOTATIONS
========================================================= */
export const fetchQuotationsThunk = createAsyncThunk(
	"quotation/fetchAll",
	async (_, thunkAPI) => {
		try {
			const { data } = await api.get(API.QUOTATIONS.LIST);
			const rows = data?.data ?? data;
			return Array.isArray(rows) ? (rows as Quotation[]) : [];
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to fetch quotations"),
			);
		}
	},
);

/* =========================================================
     4) GET SINGLE QUOTATION
========================================================= */
export const getQuotationThunk = createAsyncThunk(
	"quotation/getOne",
	async (id: string, thunkAPI) => {
		try {
			const { data } = await api.get(API.QUOTATIONS.GET_ONE(id));
			const row = data?.data ?? data;
			return row as Quotation;
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to fetch quotation"),
			);
		}
	},
);

/* =========================================================
     5) CREATE QUOTATION
========================================================= */
export const createQuotationThunk = createAsyncThunk(
	"quotation/create",
	async (payload: CreateQuotationPayload, thunkAPI) => {
		try {
			const { data } = await api.post(API.QUOTATIONS.CREATE, payload);
			const row = data?.data ?? data;
			return row as Quotation;
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to create quotation"),
			);
		}
	},
);

/* =========================================================
     6) UPDATE QUOTATION
========================================================= */
export const updateQuotationThunk = createAsyncThunk(
	"quotation/update",
	async (
		{ id, payload }: { id: string; payload: UpdateQuotationPayload },
		thunkAPI,
	) => {
		try {
			const { data } = await api.put(API.QUOTATIONS.UPDATE(id), payload);
			const row = data?.data ?? data;
			return row as Quotation;
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to update quotation"),
			);
		}
	},
);

/* =========================================================
     7) SET QUOTATION STATUS (SEND/WON/LOST)
   PATCH /orders/quotations/:id/status
========================================================= */
export const setQuotationStatusThunk = createAsyncThunk(
	"quotation/setStatus",
	async ({ id, status }: { id: string; status: QuotationStatus }, thunkAPI) => {
		try {
			const { data } = await api.patch(API.QUOTATIONS.UPDATE_STATUS(id), {
				status,
			});
			const row = data?.data ?? data;
			return row as Quotation;
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to update quotation status"),
			);
		}
	},
);

/* =========================================================
     8) QUOTATION -> REQUEST TO DISPATCH (READY QUEUE)
   POST /orders/quotations/:id/request-to-dispatch
========================================================= */
export const requestQuotationToDispatchThunk = createAsyncThunk(
	"quotation/requestToDispatch",
	async ({ id }: { id: string }, thunkAPI) => {
		try {
			const { data } = await api.post(
				`/orders/quotations/${id}/request-to-dispatch`,
			);

			// backend: { success, message, data }
			return data?.data ?? data;
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to request dispatch from quotation"),
			);
		}
	},
);

export const revertQuotationDispatchThunk = createAsyncThunk(
	"quotation/revertDispatch",
	async ({ id }: { id: string }, thunkAPI) => {
		try {
			const { data } = await api.post(
				`/orders/quotations/${id}/revert-dispatch-request`,
			);

			// backend: { success, message, data }
			return data?.data ?? data;
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to revert dispatch request"),
			);
		}
	},
);
