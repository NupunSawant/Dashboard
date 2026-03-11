import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api/axios";
import { API } from "../../../helpers/api_url";
import { getErrorMessage } from "../../../helpers/error_helper";
import type { Enquiry } from "../../../types/Orders/Enquiry";

/* =========================================================
     LIST
========================================================= */

export const fetchEnquiriesThunk = createAsyncThunk(
	"enquiries/list",
	async (_, thunkAPI) => {
		try {
			const { data } = await api.get(API.ENQUIRIES.LIST);
			const enquiries = data?.data ?? data;
			return Array.isArray(enquiries) ? (enquiries as Enquiry[]) : [];
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to load enquiries"),
			);
		}
	},
);

/* =========================================================
     CREATE
========================================================= */

export const createEnquiryThunk = createAsyncThunk(
	"enquiries/create",
	async (payload: Omit<Enquiry, "id" | "_id">, thunkAPI) => {
		try {
			const { data } = await api.post(API.ENQUIRIES.CREATE, payload);
			const enquiry = data?.data ?? data;
			return enquiry as Enquiry;
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to create enquiry"),
			);
		}
	},
);

/* =========================================================
     GET ONE
========================================================= */

export const getEnquiryThunk = createAsyncThunk(
	"enquiries/getOne",
	async (id: string, thunkAPI) => {
		try {
			const { data } = await api.get(API.ENQUIRIES.GET_ONE(id));
			const enquiry = data?.data ?? data;
			return enquiry as Enquiry;
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to load enquiry"),
			);
		}
	},
);

/* =========================================================
     UPDATE
========================================================= */

export const updateEnquiryThunk = createAsyncThunk(
	"enquiries/update",
	async (
		{ id, payload }: { id: string; payload: Omit<Enquiry, "id" | "_id"> },
		thunkAPI,
	) => {
		try {
			const { data } = await api.put(API.ENQUIRIES.UPDATE(id), payload);
			const enquiry = data?.data ?? data;
			return enquiry as Enquiry;
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to update enquiry"),
			);
		}
	},
);

/* =========================================================
     CHANGE STAGE (NEW)
   PATCH /api/enquiries/:id/stage
========================================================= */

export const changeEnquiryStageThunk = createAsyncThunk(
	"enquiries/changeStage",
	async ({ id, stage }: { id: string; stage: Enquiry["stage"] }, thunkAPI) => {
		try {
			const { data } = await api.patch(API.ENQUIRIES.UPDATE_STAGE(id), {
				stage,
			});

			const enquiry = data?.data ?? data;
			return enquiry as Enquiry;
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to update enquiry stage"),
			);
		}
	},
);

/* =========================================================
     DELETE
========================================================= */

export const deleteEnquiryThunk = createAsyncThunk(
	"enquiries/delete",
	async (id: string, thunkAPI) => {
		try {
			const { data } = await api.delete(API.ENQUIRIES.DELETE(id));

			const deletedId =
				data?.data?.id ?? data?.data?._id ?? data?.id ?? data?._id ?? id;

			return String(deletedId);
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to delete enquiry"),
			);
		}
	},
);
