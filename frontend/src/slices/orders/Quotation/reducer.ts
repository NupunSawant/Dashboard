// slices/orders/quotation/reducer.ts

import { createSlice } from "@reduxjs/toolkit";
import type { Enquiry } from "../../../types/Orders/Enquiry";
import type { Quotation } from "../../../types/Orders/quotation";
import {
	createQuotationThunk,
	fetchQuotationRequestsThunk,
	fetchQuotationsThunk,
	getQuotationThunk,
	revertQuotationRequestThunk,
	setQuotationStatusThunk,
	updateQuotationThunk,
} from "./thunks";

export interface QuotationState {
	quotationRequests: Enquiry[];
	quotations: Quotation[];

	selectedQuotation: Quotation | null;

	loadingList: boolean;
	loadingOne: boolean;
	saving: boolean;
	error: string | null;
}

const initialState: QuotationState = {
	quotationRequests: [],
	quotations: [],

	selectedQuotation: null,

	loadingList: false,
	loadingOne: false,
	saving: false,
	error: null,
};

const getId = (x: any) => String(x?.id || x?._id || "");

const quotationSlice = createSlice({
	name: "quotation",
	initialState,
	reducers: {
		clearSelectedQuotation: (state) => {
			state.selectedQuotation = null;
			state.error = null;
		},
	},
	extraReducers: (builder) => {
		// =========================
		// Quotation Requests
		// =========================
		builder
			.addCase(fetchQuotationRequestsThunk.pending, (state) => {
				state.loadingList = true;
				state.error = null;
			})
			.addCase(fetchQuotationRequestsThunk.fulfilled, (state, action) => {
				state.loadingList = false;
				state.quotationRequests = Array.isArray(action.payload)
					? action.payload
					: [];
			})
			.addCase(fetchQuotationRequestsThunk.rejected, (state, action) => {
				state.loadingList = false;
				state.error =
					(action.payload as any) || "Failed to fetch quotation requests";
			});

		builder
			.addCase(revertQuotationRequestThunk.pending, (state) => {
				state.saving = true;
				state.error = null;
			})
			.addCase(revertQuotationRequestThunk.fulfilled, (state, action) => {
				state.saving = false;

				//   thunk returns updated enquiry object
				const updated = action.payload as any;
				const updatedId = getId(updated);

				//   remove from request list automatically
				if (updatedId) {
					state.quotationRequests = state.quotationRequests.filter(
						(e) => getId(e) !== updatedId,
					);
				}
			})
			.addCase(revertQuotationRequestThunk.rejected, (state, action) => {
				state.saving = false;
				state.error =
					(action.payload as any) || "Failed to revert quotation request";
			});

		// =========================
		// Quotation List
		// =========================
		builder
			.addCase(fetchQuotationsThunk.pending, (state) => {
				state.loadingList = true;
				state.error = null;
			})
			.addCase(fetchQuotationsThunk.fulfilled, (state, action) => {
				state.loadingList = false;
				state.quotations = Array.isArray(action.payload) ? action.payload : [];
			})
			.addCase(fetchQuotationsThunk.rejected, (state, action) => {
				state.loadingList = false;
				state.error = (action.payload as any) || "Failed to fetch quotations";
			});

		// =========================
		// Get One
		// =========================
		builder
			.addCase(getQuotationThunk.pending, (state) => {
				state.loadingOne = true;
				state.error = null;
			})
			.addCase(getQuotationThunk.fulfilled, (state, action) => {
				state.loadingOne = false;
				state.selectedQuotation = action.payload as any;
			})
			.addCase(getQuotationThunk.rejected, (state, action) => {
				state.loadingOne = false;
				state.error = (action.payload as any) || "Failed to fetch quotation";
			});

		// =========================
		// Create
		// =========================
		builder
			.addCase(createQuotationThunk.pending, (state) => {
				state.saving = true;
				state.error = null;
			})
			.addCase(createQuotationThunk.fulfilled, (state, action) => {
				state.saving = false;
				state.selectedQuotation = action.payload as any;

				const created = action.payload as any;
				const createdId = getId(created);

				//   avoid duplicates + keep list in sync
				if (createdId) {
					state.quotations = state.quotations.filter(
						(q: any) => getId(q) !== createdId,
					);
				}
				state.quotations = [created, ...state.quotations];
			})
			.addCase(createQuotationThunk.rejected, (state, action) => {
				state.saving = false;
				state.error = (action.payload as any) || "Failed to create quotation";
			});

		// =========================
		// Update
		// =========================
		builder
			.addCase(updateQuotationThunk.pending, (state) => {
				state.saving = true;
				state.error = null;
			})
			.addCase(updateQuotationThunk.fulfilled, (state, action) => {
				state.saving = false;
				state.selectedQuotation = action.payload as any;

				const updated = action.payload as any;
				const updatedId = getId(updated);

				if (updatedId) {
					const idx = state.quotations.findIndex(
						(q: any) => getId(q) === updatedId,
					);
					if (idx >= 0) state.quotations[idx] = updated;
					else state.quotations = [updated, ...state.quotations];
				}
			})
			.addCase(updateQuotationThunk.rejected, (state, action) => {
				state.saving = false;
				state.error = (action.payload as any) || "Failed to update quotation";
			});

		// =========================
		// Status Update
		// =========================
		builder
			.addCase(setQuotationStatusThunk.pending, (state) => {
				state.saving = true;
				state.error = null;
			})
			.addCase(setQuotationStatusThunk.fulfilled, (state, action) => {
				state.saving = false;
				state.selectedQuotation = action.payload as any;

				const updated = action.payload as any;
				const updatedId = getId(updated);

				if (updatedId) {
					const idx = state.quotations.findIndex(
						(q: any) => getId(q) === updatedId,
					);
					if (idx >= 0) state.quotations[idx] = updated;
					else state.quotations = [updated, ...state.quotations];
				}
			})
			.addCase(setQuotationStatusThunk.rejected, (state, action) => {
				state.saving = false;
				state.error =
					(action.payload as any) || "Failed to update quotation status";
			});
	},
});

export const { clearSelectedQuotation } = quotationSlice.actions;
export default quotationSlice.reducer;
