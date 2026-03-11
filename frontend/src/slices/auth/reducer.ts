import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthUser } from "../../types/auth";
import {
	loginThunk,
	registerThunk,
	refreshThunk,
	logoutThunk,
	meThunk,
} from "./thunks";
import { getToken, getAuthUser } from "../../helpers/auth_helper";

type AuthState = {
	token: string | null;
	user: AuthUser | null;
	loading: boolean;
	error: string | null;
};

const initialState: AuthState = {
	token: getToken() || null,
	user: getAuthUser() || null, //   hydrate from storage if you store user
	loading: false,
	error: null,
};

const authSlice = createSlice({
	name: "auth",
	initialState,
	reducers: {
		hydrateAuth(
			state,
			action: PayloadAction<{ token: string | null; user: AuthUser | null }>,
		) {
			state.token = action.payload.token;
			state.user = action.payload.user;
		},
		clearAuth(state) {
			state.token = null;
			state.user = null;
			state.error = null;
			state.loading = false;
		},
		setAccessToken(state, action: PayloadAction<string | null>) {
			state.token = action.payload;
		},
	},
	extraReducers: (b) => {
		// Register ----------------------------------
		b.addCase(registerThunk.pending, (s) => {
			s.loading = true;
			s.error = null;
		});
		b.addCase(registerThunk.fulfilled, (s, a) => {
			s.loading = false;
			s.user = a.payload.user || null; //   set user after register
		});
		b.addCase(registerThunk.rejected, (s, a) => {
			s.loading = false;
			s.error = (a.payload as string) || "Registration failed";
		});

		// Login -----------------------------------
		b.addCase(loginThunk.pending, (s) => {
			s.loading = true;
			s.error = null;
		});
		b.addCase(loginThunk.fulfilled, (s, a) => {
			s.loading = false;
			s.token = a.payload.accessToken;
			s.user = a.payload.user || null;
		});
		b.addCase(loginThunk.rejected, (s, a) => {
			s.token = null;
			s.user = null;
			s.loading = false;
			s.error = (a.payload as string) || "Login failed"; //   keep error
		});

		// Refresh ---------------------------------
		b.addCase(refreshThunk.pending, (s) => {
			s.loading = true;
			s.error = null;
		});
		b.addCase(refreshThunk.fulfilled, (s, a) => {
			s.loading = false;
			s.token = a.payload.accessToken; //   refresh returns token only
			// s.user unchanged (kept from storage/me)
		});
		b.addCase(refreshThunk.rejected, (s) => {
			s.loading = false;
			// optional: if refresh fails, you can clear token/user
			// s.token = null;
			// s.user = null;
		});

		// Me --------------------------------------
		b.addCase(meThunk.pending, (s) => {
			s.loading = true;
			s.error = null;
		});
		b.addCase(meThunk.fulfilled, (s, a) => {
			s.loading = false;
			s.user = a.payload || null;
		});
		b.addCase(meThunk.rejected, (s, a) => {
			s.loading = false;
			s.error = (a.payload as string) || "Failed to load user";
		});

		// Logout ----------------------------------
		b.addCase(logoutThunk.fulfilled, (s) => {
			s.token = null;
			s.user = null;
			s.loading = false;
			s.error = null;
		});
		b.addCase(logoutThunk.rejected, (s) => {
			// even if logout API fails, we clear locally in thunk finally
			s.token = null;
			s.user = null;
			s.loading = false;
			s.error = null;
		});
	},
});

export const { hydrateAuth, clearAuth, setAccessToken } = authSlice.actions;
export default authSlice.reducer;
