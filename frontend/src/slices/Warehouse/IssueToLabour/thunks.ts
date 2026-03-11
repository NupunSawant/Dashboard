import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api/axios";
import { API } from "../../../helpers/api_url";
import { getErrorMessage } from "../../../helpers/error_helper";
import type {
	IssueToLabour,
	CompleteIssueToLabourPayload,
} from "../../../types/Warehouses/issueToLabour";

export const fetchIssueToLaboursThunk = createAsyncThunk(
	"issueToLabour/list",
	async (_, thunkAPI) => {
		try {
			const { data } = await api.get(API.ISSUE_TO_LABOUR.LIST);
			const list = data?.data?.data ?? data?.data ?? data;
			return Array.isArray(list) ? (list as IssueToLabour[]) : [];
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to load issue to labour list"),
			);
		}
	},
);

export const fetchPendingIssueToLaboursThunk = createAsyncThunk(
	"issueToLabour/pending",
	async (_, thunkAPI) => {
		try {
			const { data } = await api.get(API.ISSUE_TO_LABOUR.PENDING);
			const list = data?.data?.data ?? data?.data ?? data;
			return Array.isArray(list) ? (list as IssueToLabour[]) : [];
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to load pending issue to labour list"),
			);
		}
	},
);

export const getIssueToLabourThunk = createAsyncThunk(
	"issueToLabour/getOne",
	async (id: string, thunkAPI) => {
		try {
			const { data } = await api.get(API.ISSUE_TO_LABOUR.GET_ONE(id));
			const item = data?.data?.data ?? data?.data ?? data;
			return item as IssueToLabour;
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to load issue to labour"),
			);
		}
	},
);

export const createIssueToLabourThunk = createAsyncThunk(
	"issueToLabour/create",
	async (payload: Partial<IssueToLabour>, thunkAPI) => {
		try {
			const { data } = await api.post(API.ISSUE_TO_LABOUR.CREATE, payload);
			return data;
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to create issue to labour"),
			);
		}
	},
);

export const updateIssueToLabourThunk = createAsyncThunk(
	"issueToLabour/update",
	async (
		{ id, payload }: { id: string; payload: Partial<IssueToLabour> },
		thunkAPI,
	) => {
		try {
			const { data } = await api.put(API.ISSUE_TO_LABOUR.UPDATE(id), payload);
			return data;
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to update issue to labour"),
			);
		}
	},
);

export const revertIssueToLabourThunk = createAsyncThunk(
	"issueToLabour/revert",
	async (id: string, thunkAPI) => {
		try {
			const { data } = await api.patch(API.ISSUE_TO_LABOUR.REVERT(id));
			return data;
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to revert issue to labour"),
			);
		}
	},
);

export const completeIssueToLabourThunk = createAsyncThunk(
	"issueToLabour/complete",
	async (
		{ id, payload }: { id: string; payload: CompleteIssueToLabourPayload },
		thunkAPI,
	) => {
		try {
			const { data } = await api.patch(
				API.ISSUE_TO_LABOUR.COMPLETE(id),
				payload,
			);
			return data;
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to complete issue to labour"),
			);
		}
	},
);