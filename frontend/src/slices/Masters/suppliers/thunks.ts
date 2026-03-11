import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api/axios";
import { API } from "../../../helpers/api_url";
import { getErrorMessage } from "../../../helpers/error_helper";
import type { Supplier } from "../../../types/Masters/supplier";

export const fetchSuppliersThunk = createAsyncThunk(
	"suppliers/list",
	async (_, thunkAPI) => {
		try {
			const { data } = await api.get(API.SUPPLIERS.LIST);

			const list =
				data?.data?.suppliers ?? data?.suppliers ?? data?.data ?? data;
			return Array.isArray(list) ? (list as Supplier[]) : [];
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to load suppliers"),
			);
		}
	},
);

export const getSupplierThunk = createAsyncThunk(
	"suppliers/getOne",
	async (id: string, thunkAPI) => {
		try {
			const { data } = await api.get(API.SUPPLIERS.GET_ONE(id));

			const supplier =
				data?.data?.supplier ?? data?.supplier ?? data?.data ?? data;
			return supplier as Supplier;
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to load supplier"),
			);
		}
	},
);

export const createSupplierThunk = createAsyncThunk(
	"suppliers/create",
	async (
		payload: {
			supplierName: string;
			supplierCode: string;
			supplierEmail?: string;
			supplierPhone?: string;
			supplierGstNo?: string;
			supplierAddress?: string;
			supplierCity?: string;
			supplierState?: string;
			supplierPincode?: string;
			supplierCountry?: string;

			supplierContactPerson?: string;
			supplierContactPersonPhone?: string;

			supplierTransporterName1?: string;
			supplierTransporterPhone1?: string;
			supplierTransporterContactPerson1?: string;
			supplierTransporterContactPerson1Phone?: string;

			supplierTransporterName2?: string;
			supplierTransporterPhone2?: string;
			supplierTransporterContactPerson2?: string;
			supplierTransporterContactPerson2Phone?: string;
		},
		thunkAPI,
	) => {
		try {
			const { data } = await api.post(API.SUPPLIERS.CREATE, payload);
			return data;
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to create supplier"),
			);
		}
	},
);

export const updateSupplierThunk = createAsyncThunk(
	"suppliers/update",
	async (
		{
			id,
			payload,
		}: {
			id: string;
			payload: {
				supplierName: string;
				supplierCode: string;
				supplierEmail?: string;
				supplierPhone?: string;
				supplierGstNo?: string;
				supplierAddress?: string;
				supplierCity?: string;
				supplierState?: string;
				supplierPincode?: string;
				supplierCountry?: string;

				supplierContactPerson?: string;
				supplierContactPersonPhone?: string;

				supplierTransporterName1?: string;
				supplierTransporterPhone1?: string;
				supplierTransporterContactPerson1?: string;
				supplierTransporterContactPerson1Phone?: string;

				supplierTransporterName2?: string;
				supplierTransporterPhone2?: string;
				supplierTransporterContactPerson2?: string;
				supplierTransporterContactPerson2Phone?: string;
			};
		},
		thunkAPI,
	) => {
		try {
			const { data } = await api.put(API.SUPPLIERS.UPDATE(id), payload);
			return data;
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to update supplier"),
			);
		}
	},
);
