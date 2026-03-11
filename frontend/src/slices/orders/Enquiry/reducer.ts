import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Enquiry } from "../../../types/Orders/Enquiry";
import {
	fetchEnquiriesThunk,
	createEnquiryThunk,
	getEnquiryThunk,
	updateEnquiryThunk,
	deleteEnquiryThunk,
	changeEnquiryStageThunk, //   ADD
} from "./thunks";

type EnquiriesState = {
	enquiries: Enquiry[];
	selected: Enquiry | null;

	loadingList: boolean;
	loadingOne: boolean;
	creating: boolean;
	updating: boolean;
	deleting: boolean;

	error: string | null;
};

const initialState: EnquiriesState = {
	enquiries: [],
	selected: null,

	loadingList: false,
	loadingOne: false,
	creating: false,
	updating: false,
	deleting: false,

	error: null,
};

const getId = (x: any) => x?.id || x?._id;

const enquiriesSlice = createSlice({
	name: "enquiries",
	initialState,
	reducers: {
		clearSelectedEnquiry: (state) => {
			state.selected = null;
		},
		clearEnquiriesError: (state) => {
			state.error = null;
		},
		setSelectedEnquiry: (state, action: PayloadAction<Enquiry | null>) => {
			state.selected = action.payload;
		},
	},
	extraReducers: (builder) => {
		// =========================
		// LIST
		// =========================
		builder.addCase(fetchEnquiriesThunk.pending, (state) => {
			state.loadingList = true;
			state.error = null;
		});
		builder.addCase(fetchEnquiriesThunk.fulfilled, (state, action) => {
			state.loadingList = false;
			state.enquiries = Array.isArray(action.payload) ? action.payload : [];
		});
		builder.addCase(fetchEnquiriesThunk.rejected, (state, action) => {
			state.loadingList = false;
			state.error = (action.payload as string) || "Failed to load enquiries";
		});

		// =========================
		// CREATE
		// =========================
		builder.addCase(createEnquiryThunk.pending, (state) => {
			state.creating = true;
			state.error = null;
		});
		builder.addCase(createEnquiryThunk.fulfilled, (state, action) => {
			state.creating = false;

			const created = action.payload as any;
			const createdId = getId(created);

			//   avoid duplicates
			if (createdId) {
				state.enquiries = state.enquiries.filter((e) => getId(e) !== createdId);
			}

			state.enquiries = [created, ...state.enquiries];
			state.selected = created;
		});
		builder.addCase(createEnquiryThunk.rejected, (state, action) => {
			state.creating = false;
			state.error = (action.payload as string) || "Failed to create enquiry";
		});

		// =========================
		// GET ONE
		// =========================
		builder.addCase(getEnquiryThunk.pending, (state) => {
			state.loadingOne = true;
			state.error = null;
		});
		builder.addCase(getEnquiryThunk.fulfilled, (state, action) => {
			state.loadingOne = false;
			state.selected = action.payload as any;
		});
		builder.addCase(getEnquiryThunk.rejected, (state, action) => {
			state.loadingOne = false;
			state.error = (action.payload as string) || "Failed to load enquiry";
		});

		// =========================
		// UPDATE
		// =========================
		builder.addCase(updateEnquiryThunk.pending, (state) => {
			state.updating = true;
			state.error = null;
		});
		builder.addCase(updateEnquiryThunk.fulfilled, (state, action) => {
			state.updating = false;

			const updated = action.payload as any;
			state.selected = updated;

			const updatedId = getId(updated);

			if (updatedId) {
				const idx = state.enquiries.findIndex((e) => getId(e) === updatedId);
				if (idx >= 0) {
					state.enquiries[idx] = updated;
				} else {
					state.enquiries = [updated, ...state.enquiries];
				}
			}
		});
		builder.addCase(updateEnquiryThunk.rejected, (state, action) => {
			state.updating = false;
			state.error = (action.payload as string) || "Failed to update enquiry";
		});

		// =========================
		// CHANGE STAGE (NEW)
		// =========================
		builder.addCase(changeEnquiryStageThunk.pending, (state) => {
			state.updating = true; // reuse updating state
			state.error = null;
		});
		builder.addCase(changeEnquiryStageThunk.fulfilled, (state, action) => {
			state.updating = false;

			const updated = action.payload as any;
			const updatedId = getId(updated);

			// update selected if same
			const selectedId = getId(state.selected);
			if (selectedId && updatedId && String(selectedId) === String(updatedId)) {
				state.selected = updated;
			}

			// update list
			if (updatedId) {
				const idx = state.enquiries.findIndex((e) => getId(e) === updatedId);
				if (idx >= 0) {
					state.enquiries[idx] = updated;
				} else {
					state.enquiries = [updated, ...state.enquiries];
				}
			}
		});
		builder.addCase(changeEnquiryStageThunk.rejected, (state, action) => {
			state.updating = false;
			state.error =
				(action.payload as string) || "Failed to update enquiry stage";
		});

		// =========================
		// DELETE
		// =========================
		builder.addCase(deleteEnquiryThunk.pending, (state) => {
			state.deleting = true;
			state.error = null;
		});
		builder.addCase(deleteEnquiryThunk.fulfilled, (state, action) => {
			state.deleting = false;

			const deletedId = String(action.payload);
			state.enquiries = state.enquiries.filter(
				(e) => String(getId(e)) !== deletedId,
			);

			const selectedId = getId(state.selected);
			if (selectedId && String(selectedId) === deletedId) {
				state.selected = null;
			}
		});
		builder.addCase(deleteEnquiryThunk.rejected, (state, action) => {
			state.deleting = false;
			state.error = (action.payload as string) || "Failed to delete enquiry";
		});
	},
});

export const { clearSelectedEnquiry, clearEnquiriesError, setSelectedEnquiry } =
	enquiriesSlice.actions;

export default enquiriesSlice.reducer;
