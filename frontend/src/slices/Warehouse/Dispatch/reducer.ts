// slices/warehouse/dispatch/dispatchSlice.ts

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
	Dispatch,
	ReadyToDispatchOrder,
} from "../../../types/Warehouses/dispatch";
import {
	fetchReadyToDispatchThunk,
	fetchDispatchesThunk,
	fetchDispatchByIdThunk,
	createDispatchThunk,
	deliverDispatchThunk,
	revertReadyDispatchThunk,
	processSalesReturnThunk,
	fetchPendingSalesReturnDispatchesThunk,
} from "../Dispatch/thunks";

type DispatchState = {
	ready: ReadyToDispatchOrder[];
	dispatches: Dispatch[];
	selected: Dispatch | null;
	pendingSalesReturns: Dispatch[];

	loadingReady: boolean;
	loadingList: boolean;
	loadingOne: boolean;
	loadingPendingSalesReturn: boolean;

	creating: boolean;
	delivering: boolean;
	revertingReady: boolean;
	processingSalesReturn: boolean;

	error: string | null;
};

const initialState: DispatchState = {
	ready: [],
	dispatches: [],
	selected: null,
	pendingSalesReturns: [],

	loadingReady: false,
	loadingList: false,
	loadingOne: false,
	loadingPendingSalesReturn: false,

	creating: false,
	delivering: false,
	revertingReady: false,
	processingSalesReturn: false,

	error: null,
};

const getDispatchRowId = (item: any) =>
	String(item?.id || item?._id || item?.dispatchId || item?.dispatchNo || "");

const upsertInList = (list: Dispatch[], item: Dispatch) => {
	const id = getDispatchRowId(item);
	if (!id) return [item, ...list];

	const idx = list.findIndex((x) => getDispatchRowId(x) === id);
	if (idx === -1) return [item, ...list];

	const copy = [...list];
	copy[idx] = item;
	return copy;
};

const getReadyRowId = (row: any) =>
	String(row?.id || row?._id || row?.orderId || row?.orderNo || "");

const dispatchSlice = createSlice({
	name: "warehouseDispatch",
	initialState,
	reducers: {
		clearSelected: (s) => {
			s.selected = null;
		},
		clearSelectedDispatch: (s) => {
			s.selected = null;
		},
		clearDispatchError: (s) => {
			s.error = null;
		},
	},
	extraReducers: (b) => {
		// ======================
		// READY LIST
		// ======================
		b.addCase(fetchReadyToDispatchThunk.pending, (s) => {
			s.loadingReady = true;
			s.error = null;
		});
		b.addCase(
			fetchReadyToDispatchThunk.fulfilled,
			(s, a: PayloadAction<ReadyToDispatchOrder[]>) => {
				s.loadingReady = false;
				s.ready = Array.isArray(a.payload) ? a.payload : [];
			},
		);
		b.addCase(fetchReadyToDispatchThunk.rejected, (s, a) => {
			s.loadingReady = false;
			s.error =
				(a.payload as string) || "Failed to load ready-to-dispatch orders";
		});

		// ======================
		// DISPATCH LIST
		// ======================
		b.addCase(fetchDispatchesThunk.pending, (s) => {
			s.loadingList = true;
			s.error = null;
		});
		b.addCase(
			fetchDispatchesThunk.fulfilled,
			(s, a: PayloadAction<Dispatch[]>) => {
				s.loadingList = false;
				s.dispatches = Array.isArray(a.payload) ? a.payload : [];
			},
		);
		b.addCase(fetchDispatchesThunk.rejected, (s, a) => {
			s.loadingList = false;
			s.error = (a.payload as string) || "Failed to load dispatch list";
		});

		// ======================
		// GET ONE
		// ======================
		b.addCase(fetchDispatchByIdThunk.pending, (s) => {
			s.loadingOne = true;
			s.error = null;
		});
		b.addCase(
			fetchDispatchByIdThunk.fulfilled,
			(s, a: PayloadAction<Dispatch>) => {
				s.loadingOne = false;
				s.selected = a.payload || null;

				if (a.payload) {
					s.dispatches = upsertInList(s.dispatches, a.payload);
					s.pendingSalesReturns = upsertInList(
						s.pendingSalesReturns,
						a.payload,
					);
				}
			},
		);
		b.addCase(fetchDispatchByIdThunk.rejected, (s, a) => {
			s.loadingOne = false;
			s.error = (a.payload as string) || "Failed to load dispatch details";
		});

		// ======================
		// CREATE DISPATCH
		// ======================
		b.addCase(createDispatchThunk.pending, (s) => {
			s.creating = true;
			s.error = null;
		});
		b.addCase(
			createDispatchThunk.fulfilled,
			(s, a: PayloadAction<Dispatch>) => {
				s.creating = false;

				if (a.payload) {
					s.dispatches = upsertInList(s.dispatches, a.payload);
					s.selected = a.payload;
				}
			},
		);
		b.addCase(createDispatchThunk.rejected, (s, a) => {
			s.creating = false;
			s.error = (a.payload as string) || "Failed to create dispatch";
		});

		// ======================
		// DELIVER DISPATCH
		// ======================
		b.addCase(deliverDispatchThunk.pending, (s) => {
			s.delivering = true;
			s.error = null;
		});
		b.addCase(
			deliverDispatchThunk.fulfilled,
			(s, a: PayloadAction<Dispatch>) => {
				s.delivering = false;

				if (a.payload) {
					s.dispatches = upsertInList(s.dispatches, a.payload);
					s.selected = a.payload;
				}
			},
		);
		b.addCase(deliverDispatchThunk.rejected, (s, a) => {
			s.delivering = false;
			s.error = (a.payload as string) || "Failed to mark dispatch delivered";
		});

		// ======================
		// PROCESS SALES RETURN
		// ======================
		b.addCase(processSalesReturnThunk.pending, (s) => {
			s.processingSalesReturn = true;
			s.error = null;
		});
		b.addCase(
			processSalesReturnThunk.fulfilled,
			(s, a: PayloadAction<Dispatch>) => {
				s.processingSalesReturn = false;

				if (a.payload) {
					s.dispatches = upsertInList(s.dispatches, a.payload);
					s.pendingSalesReturns = upsertInList(
						s.pendingSalesReturns,
						a.payload,
					);
					s.selected = a.payload;
				}
			},
		);
		b.addCase(processSalesReturnThunk.rejected, (s, a) => {
			s.processingSalesReturn = false;
			s.error = (a.payload as string) || "Failed to process sales return";
		});

		// ======================
		// PENDING SALES RETURN LIST
		// ======================
		b.addCase(fetchPendingSalesReturnDispatchesThunk.pending, (s) => {
			s.loadingPendingSalesReturn = true;
			s.error = null;
		});
		b.addCase(
			fetchPendingSalesReturnDispatchesThunk.fulfilled,
			(s, a: PayloadAction<Dispatch[]>) => {
				s.loadingPendingSalesReturn = false;
				s.pendingSalesReturns = Array.isArray(a.payload) ? a.payload : [];
			},
		);
		b.addCase(fetchPendingSalesReturnDispatchesThunk.rejected, (s, a) => {
			s.loadingPendingSalesReturn = false;
			s.error = (a.payload as string) || "Failed to load pending sales returns";
		});

		// ======================
		// REVERT READY TO DISPATCH
		// ======================
		b.addCase(revertReadyDispatchThunk.pending, (s) => {
			s.revertingReady = true;
			s.error = null;
		});
		b.addCase(
			revertReadyDispatchThunk.fulfilled,
			(s, a: PayloadAction<any>) => {
				s.revertingReady = false;

				const revertedId = String(a.payload?.id || "");
				if (revertedId) {
					s.ready = s.ready.filter((row) => getReadyRowId(row) !== revertedId);
				}
			},
		);
		b.addCase(revertReadyDispatchThunk.rejected, (s, a) => {
			s.revertingReady = false;
			s.error = (a.payload as string) || "Failed to revert ready dispatch";
		});
	},
});

export const { clearSelected, clearSelectedDispatch, clearDispatchError } =
	dispatchSlice.actions;

export default dispatchSlice.reducer;
