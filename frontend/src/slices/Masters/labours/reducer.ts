import { createSlice } from "@reduxjs/toolkit";
import type { Labour } from "../../../types/Masters/labour";
import {
	fetchLaboursThunk,
	getLabourThunk,
	createLabourThunk,
	updateLabourThunk,
} from "./thunks";


type LabourState = {
	labours: Labour[];
	selected: Labour | null;
	loadingList: boolean;
	loadingOne: boolean;
	saving: boolean;
	error: string | null;
};

const initialState: LabourState = {
	labours: [],
	selected: null,
	loadingList: false,
	loadingOne: false,
	saving: false,
	error: null,
};

const slice = createSlice({
	name: "labours",
	initialState,
	reducers: {
		clearSelected(s) {
			s.selected = null;
		},
	},
	extraReducers: (b) => {
		b.addCase(fetchLaboursThunk.pending, (s) => {
			s.loadingList = true;
			s.error = null;
		});
		b.addCase(fetchLaboursThunk.fulfilled, (s, a) => {
			s.loadingList = false;
			s.labours = a.payload || [];
		});
		b.addCase(fetchLaboursThunk.rejected, (s, a) => {
			s.loadingList = false;
			s.error = (a.payload as string) || "Failed to load labours";
		});

		b.addCase(getLabourThunk.pending, (s) => {
			s.loadingOne = true;
			s.error = null;
		});
		b.addCase(getLabourThunk.fulfilled, (s, a) => {
			s.loadingOne = false;
			s.selected = a.payload;
		});
		b.addCase(getLabourThunk.rejected, (s, a) => {
			s.loadingOne = false;
			s.error = (a.payload as string) || "Failed to load labour";
		});

		b.addCase(createLabourThunk.pending, (s) => {
			s.saving = true;
			s.error = null;
		});
		b.addCase(createLabourThunk.fulfilled, (s) => {
			s.saving = false;
		});
		b.addCase(createLabourThunk.rejected, (s, a) => {
			s.saving = false;
			s.error = (a.payload as string) || "Failed to create labour";
		});

		b.addCase(updateLabourThunk.pending, (s) => {
			s.saving = true;
			s.error = null;
		});
		b.addCase(updateLabourThunk.fulfilled, (s) => {
			s.saving = false;
		});
		b.addCase(updateLabourThunk.rejected, (s, a) => {
			s.saving = false;
			s.error = (a.payload as string) || "Failed to update labour";
		});
	},
});

export const { clearSelected } = slice.actions;
export default slice.reducer;
