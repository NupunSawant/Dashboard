// src/store/slices/customers/thunks.ts
import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api/axios";
import { API } from "../../../helpers/api_url";
import { getErrorMessage } from "../../../helpers/error_helper";
import type { Customer } from "../../../types/Masters/customer";

export const fetchCustomersThunk = createAsyncThunk(
	"customers/list",
	async (_, thunkAPI) => {
		try {
			const { data } = await api.get(API.CUSTOMERS.LIST);

			const list =
				data?.data?.customers ?? data?.customers ?? data?.data ?? data;
			return Array.isArray(list) ? (list as Customer[]) : [];
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to load customers"),
			);
		}
	},
);

export const getCustomerThunk = createAsyncThunk(
	"customers/getOne",
	async (id: string, thunkAPI) => {
		try {
			const { data } = await api.get(API.CUSTOMERS.GET_ONE(id));

			const customer =
				data?.data?.customer ?? data?.customer ?? data?.data ?? data;
			return customer as Customer;
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to load customer"),
			);
		}
	},
);

export const createCustomerThunk = createAsyncThunk(
	"customers/create",
	async (
		payload: {
			customerName: string;
			companyName?: string;
			customerType?: string;
			customerEmail: string;
			customerPhone: number;
			customerAadhar?: string;
			customerGst?: string;
			customerContactPersonName?: string;
			customerContactPersonPhone?: number;
			customerAddress?: string;
			customerState?: string;
			customerCity?: string;
			customerPincode?: string;
		},
		thunkAPI,
	) => {
		try {
			const { data } = await api.post(API.CUSTOMERS.CREATE, payload);
			return data;
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to create customer"),
			);
		}
	},
);

export const updateCustomerThunk = createAsyncThunk(
	"customers/update",
	async (
		{
			id,
			payload,
		}: {
			id: string;
			payload: {
				customerName?: string;
				companyName?: string;
				customerType?: string;
				customerEmail?: string;
				customerPhone?: number;
				customerAadhar?: string;
				customerGst?: string;
				customerContactPersonName?: string;
				customerContactPersonPhone?: number;
				customerAddress?: string;
				customerState?: string;
				customerCity?: string;
				customerPincode?: string;
			};
		},
		thunkAPI,
	) => {
		try {
			//   backend uses PUT
			const { data } = await api.put(API.CUSTOMERS.UPDATE(id), payload);
			return data;
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to update customer"),
			);
		}
	},
);

export const deleteCustomerThunk = createAsyncThunk(
	"customers/delete",
	async (id: string, thunkAPI) => {
		try {
			const { data } = await api.delete(API.CUSTOMERS.DELETE(id));
			return data;
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to delete customer"),
			);
		}
	},
);
