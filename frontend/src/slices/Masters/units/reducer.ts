import { createSlice } from "@reduxjs/toolkit";
import type { Unit } from "../../../types/Masters/unit";
import {
	fetchUnitsThunk,
	getUnitThunk,
	createUnitThunk,
	updateUnitThunk,
} from "./thunks";

type UnitsState = {
	units: Unit[];
	selected: Unit | null;
	loadingList: boolean;
	loadingOne: boolean;
	saving: boolean;
	error: string | null;
};

const initialState: UnitsState = {
	units: [],
	selected: null,
	loadingList: false,
	loadingOne: false,
	saving: false,
	error: null,
};

const slice = createSlice({
	name: "units",
	initialState,
	reducers: {
		clearSelectedUnit(s) {
			s.selected = null;
		},
	},
	extraReducers: (b) => {
		(b.addCase(fetchUnitsThunk.pending, (s) => {
			s.loadingList = true;
			s.error = null;
		}),
			b.addCase(fetchUnitsThunk.fulfilled, (s, a) => {
				s.loadingList = false;
				s.units = a.payload || [];
			}),
			b.addCase(fetchUnitsThunk.rejected, (s, a) => {
				s.loadingList = false;
				s.error = (a.payload as string) || "Failed to load units";
			}),
			b.addCase(getUnitThunk.pending, (s) => {
				s.loadingOne = true;
				s.error = null;
			}),
			b.addCase(getUnitThunk.fulfilled, (s, a) => {
				s.loadingOne = false;
				s.selected = a.payload;
			}),
			b.addCase(getUnitThunk.rejected, (s, a) => {
				s.loadingOne = false;
				s.error = (a.payload as string) || "Failed to load unit";
			}),
			b.addCase(createUnitThunk.pending, (s) => {
				s.saving = true;
				s.error = null;
			}),
			b.addCase(createUnitThunk.fulfilled, (s) => {
				s.saving = false;
			}),
			b.addCase(createUnitThunk.rejected, (s, a) => {
				s.saving = false;
				s.error = (a.payload as string) || "Failed to create unit";
			}),
			b.addCase(updateUnitThunk.pending, (s) => {
				s.saving = true;
				s.error = null;
			}),
			b.addCase(updateUnitThunk.fulfilled, (s) => {
				s.saving = false;
			}),
			b.addCase(updateUnitThunk.rejected, (s, a) => {
				s.saving = false;
				s.error = (a.payload as string) || "Failed to update unit";
			}));
	},
});

export const { clearSelectedUnit } = slice.actions;
export default slice.reducer;
