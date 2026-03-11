import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { StockTransfer } from "../../../types/Warehouses/stocktransfer";
import {
	fetchStockTransfersThunk,
	fetchPendingStockTransfersThunk,
	getStockTransferThunk,
	createStockTransferThunk,
	updateStockTransferThunk,
	revertStockTransferThunk,
	completeStockTransferThunk,
} from "./thunks";

type StockTransferState = {
	stockTransfers: StockTransfer[];
	pendingTransfers: StockTransfer[];
	selected: StockTransfer | null;
	loadingList: boolean;
	loadingPending: boolean;
	loadingOne: boolean;
	saving: boolean;
	error: string | null;
};

const initialState: StockTransferState = {
	stockTransfers: [],
	pendingTransfers: [],
	selected: null,
	loadingList: false,
	loadingPending: false,
	loadingOne: false,
	saving: false,
	error: null,
};

const extractTransfer = (payload: any): StockTransfer | null =>
	payload?.data?.stockTransfer ??
	payload?.stockTransfer ??
	payload?.data ??
	payload ??
	null;

const slice = createSlice({
	name: "stockTransfer",
	initialState,
	reducers: {
		clearSelectedStockTransfer(s) {
			s.selected = null;
		},
		clearStockTransferError(s) {
			s.error = null;
		},
	},
	extraReducers: (b) => {
		// LIST
		b.addCase(fetchStockTransfersThunk.pending, (s) => {
			s.loadingList = true;
			s.error = null;
		});
		b.addCase(fetchStockTransfersThunk.fulfilled, (s, a: PayloadAction<StockTransfer[]>) => {
			s.loadingList = false;
			s.stockTransfers = Array.isArray(a.payload) ? a.payload : [];
		});
		b.addCase(fetchStockTransfersThunk.rejected, (s, a) => {
			s.loadingList = false;
			s.error = (a.payload as string) || "Failed to load stock transfers";
		});

		// PENDING
		b.addCase(fetchPendingStockTransfersThunk.pending, (s) => {
			s.loadingPending = true;
			s.error = null;
		});
		b.addCase(fetchPendingStockTransfersThunk.fulfilled, (s, a: PayloadAction<StockTransfer[]>) => {
			s.loadingPending = false;
			s.pendingTransfers = Array.isArray(a.payload) ? a.payload : [];
		});
		b.addCase(fetchPendingStockTransfersThunk.rejected, (s, a) => {
			s.loadingPending = false;
			s.error = (a.payload as string) || "Failed to load pending transfers";
		});

		// GET ONE
		b.addCase(getStockTransferThunk.pending, (s) => {
			s.loadingOne = true;
			s.error = null;
		});
		b.addCase(getStockTransferThunk.fulfilled, (s, a: PayloadAction<StockTransfer>) => {
			s.loadingOne = false;
			s.selected = a.payload;
		});
		b.addCase(getStockTransferThunk.rejected, (s, a) => {
			s.loadingOne = false;
			s.error = (a.payload as string) || "Failed to load stock transfer";
		});

		// CREATE
		b.addCase(createStockTransferThunk.pending, (s) => {
			s.saving = true;
			s.error = null;
		});
		b.addCase(createStockTransferThunk.fulfilled, (s, a: any) => {
			s.saving = false;
			const created = extractTransfer(a.payload);
			if (created) s.stockTransfers = [created, ...s.stockTransfers];
		});
		b.addCase(createStockTransferThunk.rejected, (s, a) => {
			s.saving = false;
			s.error = (a.payload as string) || "Failed to create stock transfer";
		});

		// UPDATE
		b.addCase(updateStockTransferThunk.pending, (s) => {
			s.saving = true;
			s.error = null;
		});
		b.addCase(updateStockTransferThunk.fulfilled, (s, a: any) => {
			s.saving = false;
			const updated = extractTransfer(a.payload);
			if (!updated) return;
			const uid = (updated as any)?.id || (updated as any)?._id;
			s.stockTransfers = s.stockTransfers.map((row: any) => {
				const rid = row?.id || row?._id;
				return String(rid) === String(uid) ? updated : row;
			});
			if (s.selected) {
				const sid = (s.selected as any)?.id || (s.selected as any)?._id;
				if (String(sid) === String(uid)) s.selected = updated;
			}
		});
		b.addCase(updateStockTransferThunk.rejected, (s, a) => {
			s.saving = false;
			s.error = (a.payload as string) || "Failed to update stock transfer";
		});

		// REVERT
		b.addCase(revertStockTransferThunk.pending, (s) => {
			s.saving = true;
			s.error = null;
		});
		b.addCase(revertStockTransferThunk.fulfilled, (s, a: any) => {
			s.saving = false;
			const updated = extractTransfer(a.payload);
			if (!updated) return;
			const uid = (updated as any)?.id || (updated as any)?._id;
			s.stockTransfers = s.stockTransfers.map((row: any) => {
				const rid = row?.id || row?._id;
				return String(rid) === String(uid) ? updated : row;
			});
			s.pendingTransfers = s.pendingTransfers.filter((row: any) => {
				const rid = row?.id || row?._id;
				return String(rid) !== String(uid);
			});
		});
		b.addCase(revertStockTransferThunk.rejected, (s, a) => {
			s.saving = false;
			s.error = (a.payload as string) || "Failed to revert stock transfer";
		});

		// COMPLETE
		b.addCase(completeStockTransferThunk.pending, (s) => {
			s.saving = true;
			s.error = null;
		});
		b.addCase(completeStockTransferThunk.fulfilled, (s, a: any) => {
			s.saving = false;
			const updated = extractTransfer(a.payload);
			if (!updated) return;
			const uid = (updated as any)?.id || (updated as any)?._id;
			s.stockTransfers = s.stockTransfers.map((row: any) => {
				const rid = row?.id || row?._id;
				return String(rid) === String(uid) ? updated : row;
			});
			s.pendingTransfers = s.pendingTransfers.filter((row: any) => {
				const rid = row?.id || row?._id;
				return String(rid) !== String(uid);
			});
		});
		b.addCase(completeStockTransferThunk.rejected, (s, a) => {
			s.saving = false;
			s.error = (a.payload as string) || "Failed to complete stock transfer";
		});
	},
});

export const { clearSelectedStockTransfer, clearStockTransferError } = slice.actions;
export default slice.reducer;