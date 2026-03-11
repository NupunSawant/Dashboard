import { createSlice } from "@reduxjs/toolkit";
import type { DashboardResponse } from "../../types/Dashboard/dashboard";
import { fetchDashboardThunk } from "./thunks";

type DashboardState = {
	data: DashboardResponse | null;
	loading: boolean;
	error: string | null;
};

const initialState: DashboardState = {
	data: null,
	loading: false,
	error: null,
};

const slice = createSlice({
	name: "dashboard",
	initialState,
	reducers: {
		clearDashboard(s) {
			s.data = null;
		},
	},
	extraReducers: (b) => {
		b.addCase(fetchDashboardThunk.pending, (s) => {
			s.loading = true;
			s.error = null;
		});

		b.addCase(fetchDashboardThunk.fulfilled, (s, a) => {
			s.loading = false;
			s.data = a.payload || null;
		});

		b.addCase(fetchDashboardThunk.rejected, (s, a) => {
			s.loading = false;
			s.error = (a.payload as string) || "Failed to load dashboard";
		});
	},
});

export const { clearDashboard } = slice.actions;
export default slice.reducer;
