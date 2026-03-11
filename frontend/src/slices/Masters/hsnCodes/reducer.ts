import { createSlice } from "@reduxjs/toolkit";
import type { HSNCode } from "../../../types/Masters/hsnCode";
import {
	fetchHSNCodesThunk,
	getHSNCodeThunk,
	createHSNCodeThunk,
	updateHSNCodeThunk,
} from "./thunks";

type HSNCodeState = {
	hsnCodes: HSNCode[];
	selected: HSNCode | null;
	loadingList: boolean;
	loadingOne: boolean;
	saving: boolean;
	error: string | null;
};

const initialState: HSNCodeState = {
	hsnCodes: [],
	selected: null,
	loadingList: false,
	loadingOne: false,
	saving: false,
	error: null,
};

const slice = createSlice({
	name: " hsnCodes",
	initialState,
	reducers: {
		clearSelectedHSNCode(s) {
			s.selected = null;
		},
	},
	extraReducers: (b) => {
		b.addCase(fetchHSNCodesThunk.pending, (s) => {
			s.loadingList = true;
			s.error = null;
		});
		b.addCase(fetchHSNCodesThunk.fulfilled, (s, a) => {
			s.loadingList = false;
			s.hsnCodes = a.payload;
		});
		b.addCase(fetchHSNCodesThunk.rejected, (s, a) => {
			s.loadingList = false;
			s.error = a.payload as string;
		});
		b.addCase(getHSNCodeThunk.pending, (s) => {
			s.loadingOne = true;
			s.error = null;
		});
		b.addCase(getHSNCodeThunk.fulfilled, (s, a) => {
			s.loadingOne = false;
			s.selected = a.payload;
		});
		b.addCase(getHSNCodeThunk.rejected, (s, a) => {
			s.loadingOne = false;
			s.error = (a.payload as string) || "Failed to load HSN Code";
		});
		b.addCase(createHSNCodeThunk.pending, (s) => {
			s.saving = true;
			s.error = null;
		});
		b.addCase(createHSNCodeThunk.fulfilled, (s) => {
			s.saving = false;
		});
		b.addCase(createHSNCodeThunk.rejected, (s, a) => {
			s.saving = false;
			s.error = (a.payload as string) || "Failed to create HSN Code";
		});
		b.addCase(updateHSNCodeThunk.pending, (s) => {
			s.saving = true;
			s.error = null;
		});
		b.addCase(updateHSNCodeThunk.fulfilled, (s) => {
			s.saving = false;
		});
		b.addCase(updateHSNCodeThunk.rejected, (s, a) => {
			s.saving = false;
			s.error = a.payload as string;
		});
	},
});

export const { clearSelectedHSNCode } = slice.actions;
export default slice.reducer;