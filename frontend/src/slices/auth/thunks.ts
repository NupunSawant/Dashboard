// slices/auth/thunks.ts
import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";
import { API } from "../../helpers/api_url";
import { getErrorMessage } from "../../helpers/error_helper";
import {
	setToken,
	setAuthUser,
	clearToken,
	clearAuthUser,
} from "../../helpers/auth_helper";
import type { AuthUser } from "../../types/auth";

/**
 * Backend contract:
 * register -> { success, message, data: { id, name, email, phone, permissions } }
 * login    -> { success, message, data: { accessToken, user: { id, name, email, phone, permissions } } }
 * refresh  -> { success, message, data: { accessToken } }
 * me       -> { success, data: { id, name, phone, email, permissions } }
 * logout   -> { success, message }
 */

export const registerThunk = createAsyncThunk(
	"auth/register",
	async (
		payload: { name: string; phone: string; email: string; password: string },
		thunkAPI,
	) => {
		try {
			const { data } = await api.post(API.AUTH.REGISTER, payload);

			const user = data?.data || null;

			return { user, message: data?.message || "Registered" };
		} catch (err: any) {
			console.log("REGISTER ERROR response data:", err?.response?.data);
			console.log("REGISTER ERROR status:", err?.response?.status);
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Registration failed"),
			);
		}
	},
);

export const loginThunk = createAsyncThunk(
	"auth/login",
	async (
		payload: {
			phoneOrEmail: string;
			password: string;
			rememberMe?: boolean;
		},
		thunkAPI,
	) => {
		try {
			const { data } = await api.post(API.AUTH.LOGIN, payload);

			const accessToken: string | undefined = data?.data?.accessToken;
			const user: AuthUser | undefined = data?.data?.user;

			if (!accessToken) {
				return thunkAPI.rejectWithValue("accessToken missing in response");
			}

			setToken(accessToken);
			if (user) setAuthUser(user);

			return { accessToken, user };
		} catch (err: any) {
			return thunkAPI.rejectWithValue(getErrorMessage(err, "Login failed"));
		}
	},
);

export const refreshThunk = createAsyncThunk(
	"auth/refresh",
	async (_, thunkAPI) => {
		try {
			const { data } = await api.post(API.AUTH.REFRESH);

			const accessToken: string | undefined =
				data?.data?.accessToken || data?.accessToken || data?.token;

			if (!accessToken) {
				return thunkAPI.rejectWithValue("No accessToken returned from refresh");
			}

			setToken(accessToken);

			return { accessToken };
		} catch (err: any) {
			return thunkAPI.rejectWithValue(getErrorMessage(err, "Refresh failed"));
		}
	},
);

export const logoutThunk = createAsyncThunk(
	"auth/logout",
	async (_, _thunkAPI) => {
		try {
			await api.post(API.AUTH.LOGOUT);
		} catch {
			// ignore
		} finally {
			clearToken();
			clearAuthUser();
		}
	},
);

export const meThunk = createAsyncThunk("auth/me", async (_, thunkAPI) => {
	try {
		const { data } = await api.get(API.AUTH.ME);

		const user: AuthUser = data?.data;

		if (user) setAuthUser(user);

		return user;
	} catch (err: any) {
		return thunkAPI.rejectWithValue(
			getErrorMessage(err, "Failed to load user"),
		);
	}
});