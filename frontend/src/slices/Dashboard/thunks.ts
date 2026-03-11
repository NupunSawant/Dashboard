import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

export const fetchDashboardThunk = createAsyncThunk(
	"dashboard/fetchDashboard",
	async (params?: { from?: string; to?: string; warehouseName?: string }) => {
		const res = await api.get("/dashboard/summary", { params });
		return res.data.data;
	},
);