import { createSlice } from "@reduxjs/toolkit";
import type { GST } from "../../../types/Masters/gst";
import {
	fetchGSTsThunk,
	getGstThunk,
	createGstThunk,
	updateGstThunk,
} from "./thunks";

type GSTState = {
	gsts: GST[];
	selected: GST | null;
	loadingList: boolean;
	loadingOne: boolean;
	saving: boolean;
	error: string | null;
};

const initialState: GSTState = {
	gsts: [],
	selected: null,
	loadingList: false,
	loadingOne: false,
	saving: false,
	error: null,
};

const slice = createSlice({
	name: " gsts",
	initialState,
	reducers: {
		clearSelectedGst(s) {
			s.selected = null;
		},
	},
	extraReducers: (b) => {
		b.addCase(fetchGSTsThunk.pending, (s) => {
			s.loadingList = true;
			s.error = null;
		});
		b.addCase(fetchGSTsThunk.fulfilled, (s, a) => {
			s.loadingList = false;
			s.gsts = a.payload;
		});
		b.addCase(fetchGSTsThunk.rejected, (s, a) => {
			s.loadingList = false;
			s.error = a.payload as string;
		});
		b.addCase(getGstThunk.pending, (s) => {
			s.loadingOne = true;
			s.error = null;
		});
		b.addCase(getGstThunk.fulfilled, (s, a) => {
			s.loadingOne = false;
			s.selected = a.payload;
		});
		b.addCase(getGstThunk.rejected, (s, a) => {
			s.loadingOne = false;
			s.error = (a.payload as string) || "Failed to load GST";
		});
		b.addCase(createGstThunk.pending, (s) => {
			s.saving = true;
			s.error = null;
		});
		b.addCase(createGstThunk.fulfilled, (s) => {
			s.saving = false;
		});
		b.addCase(createGstThunk.rejected, (s, a) => {
			s.saving = false;
			s.error = (a.payload as string) || "Failed to create GST";
		});
		b.addCase(updateGstThunk.pending, (s) => {
			s.saving = true;
			s.error = null;
		});
		b.addCase(updateGstThunk.fulfilled, (s) => {
			s.saving = false;
		});
		b.addCase(updateGstThunk.rejected, (s, a) => {
			s.saving = false;
			s.error = a.payload as string;
		});
	},
});

export const { clearSelectedGst } = slice.actions;
export default slice.reducer;
