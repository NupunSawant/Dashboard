import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";
import { API } from "../../helpers/api_url";
import { getErrorMessage } from "../../helpers/error_helper";
import type { User, UserPermissions } from "../../types/user";

export const fetchUsersThunk = createAsyncThunk(
	"users/list",
	async (_, thunkAPI) => {
		try {
			const { data } = await api.get(API.USERS.LIST);
			const users = data?.data?.users ?? data?.data ?? data?.users ?? data;
			return Array.isArray(users) ? (users as User[]) : [];
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to load users"),
			);
		}
	},
);

export const getUserThunk = createAsyncThunk(
	"users/getOne",
	async (id: string, thunkAPI) => {
		try {
			const { data } = await api.get(API.USERS.GET_ONE(id));
			const user = data?.data?.user ?? data?.data ?? data?.user ?? data;
			return user as User;
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to load user"),
			);
		}
	},
);

export const createUserThunk = createAsyncThunk(
	"users/create",
	async (
		payload: {
			firstName: string;
			lastName: string;
			userName: string;
			desgination: string;
			userType: string;
			phone: string;
			email: string;
			address: string;
			country: string;
			state: string;
			city: string;
			pincode: string;
			password: string;
			permissions: UserPermissions;
		},
		thunkAPI,
	) => {
		try {
			const { data } = await api.post(API.USERS.CREATE, payload);
			const user = data?.data?.user ?? data?.data ?? data?.user ?? data;
			return user as User;
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to create user"),
			);
		}
	},
);

export const updateUserThunk = createAsyncThunk(
	"users/update",
	async (
		{
			id,
			payload,
		}: {
			id: string;
			payload: {
				firstName?: string;
				lastName?: string;
				userName?: string;
				desgination?: string;
				userType?: string;
				phone?: string;
				email?: string;
				address?: string;
				country?: string;
				state?: string;
				city?: string;
				pincode?: string;
				permissions?: UserPermissions;
			};
		},
		thunkAPI,
	) => {
		try {
			const { data } = await api.put(API.USERS.UPDATE(id), payload);
			const user = data?.data?.user ?? data?.data ?? data?.user ?? data;
			return user as User;
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to update user"),
			);
		}
	},
);

export const updatePasswordThunk = createAsyncThunk(
	"users/updatePassword",
	async (
		{ id, payload }: { id: string; payload: { password: string } },
		thunkAPI,
	) => {
		try {
			const { data } = await api.patch(API.USERS.UPDATE_PASSWORD(id), payload);
			return data;
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to update password"),
			);
		}
	},
);