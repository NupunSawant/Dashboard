// slices/Inventory/ReorderLevel/reducer.ts

import { createSlice } from "@reduxjs/toolkit";
import type {
	ItemWiseReorderLevel,
	WarehouseWiseReorderLevel,
} from "../../../types/Inventory/reorderLevel";
import {
	fetchItemWiseReorderLevelsThunk,
	getItemWiseReorderLevelThunk,
	createItemWiseReorderLevelThunk,
	updateItemWiseReorderLevelThunk,
	deleteItemWiseReorderLevelThunk,
	fetchWarehouseWiseReorderLevelsThunk,
	getWarehouseWiseReorderLevelThunk,
	createWarehouseWiseReorderLevelThunk,
	updateWarehouseWiseReorderLevelThunk,
	deleteWarehouseWiseReorderLevelThunk,
} from "./thunks";

type ReorderLevelState = {
	itemWiseRows: ItemWiseReorderLevel[];
	warehouseWiseRows: WarehouseWiseReorderLevel[];

	selectedItemWise: ItemWiseReorderLevel | null;
	selectedWarehouseWise: WarehouseWiseReorderLevel | null;

	loadingItemWiseList: boolean;
	loadingWarehouseWiseList: boolean;
	loadingOne: boolean;
	saving: boolean;

	error: string | null;
};

const initialState: ReorderLevelState = {
	itemWiseRows: [],
	warehouseWiseRows: [],

	selectedItemWise: null,
	selectedWarehouseWise: null,

	loadingItemWiseList: false,
	loadingWarehouseWiseList: false,
	loadingOne: false,
	saving: false,

	error: null,
};

const slice = createSlice({
	name: "reorderLevel",
	initialState,
	reducers: {
		clearSelectedItemWise(s) {
			s.selectedItemWise = null;
		},
		clearSelectedWarehouseWise(s) {
			s.selectedWarehouseWise = null;
		},
		clearReorderLevelError(s) {
			s.error = null;
		},
	},
	extraReducers: (b) => {
		/* =========================================
		   ITEM WISE LIST
		========================================= */
		b.addCase(fetchItemWiseReorderLevelsThunk.pending, (s) => {
			s.loadingItemWiseList = true;
			s.error = null;
		});
		b.addCase(fetchItemWiseReorderLevelsThunk.fulfilled, (s, a) => {
			s.loadingItemWiseList = false;
			s.itemWiseRows = a.payload || [];
		});
		b.addCase(fetchItemWiseReorderLevelsThunk.rejected, (s, a) => {
			s.loadingItemWiseList = false;
			s.error =
				(a.payload as string) || "Failed to load item-wise reorder levels";
		});

		/* =========================================
		   ITEM WISE GET ONE
		========================================= */
		b.addCase(getItemWiseReorderLevelThunk.pending, (s) => {
			s.loadingOne = true;
			s.error = null;
		});
		b.addCase(getItemWiseReorderLevelThunk.fulfilled, (s, a) => {
			s.loadingOne = false;
			s.selectedItemWise = a.payload || null;
		});
		b.addCase(getItemWiseReorderLevelThunk.rejected, (s, a) => {
			s.loadingOne = false;
			s.error =
				(a.payload as string) || "Failed to load item-wise reorder level";
		});

		/* =========================================
		   ITEM WISE CREATE
		========================================= */
		b.addCase(createItemWiseReorderLevelThunk.pending, (s) => {
			s.saving = true;
			s.error = null;
		});
		b.addCase(createItemWiseReorderLevelThunk.fulfilled, (s, a) => {
			s.saving = false;

			const created = (a.payload as any)?.data ?? a.payload;
			if (created) {
				s.itemWiseRows = [created, ...s.itemWiseRows];
			}
		});
		b.addCase(createItemWiseReorderLevelThunk.rejected, (s, a) => {
			s.saving = false;
			s.error =
				(a.payload as string) || "Failed to create item-wise reorder level";
		});

		/* =========================================
		   ITEM WISE UPDATE
		========================================= */
		b.addCase(updateItemWiseReorderLevelThunk.pending, (s) => {
			s.saving = true;
			s.error = null;
		});
		b.addCase(updateItemWiseReorderLevelThunk.fulfilled, (s, a) => {
			s.saving = false;

			const updated = (a.payload as any)?.data ?? a.payload;
			if (!updated) return;

			s.itemWiseRows = s.itemWiseRows.map((row: any) =>
				String(row?.id || row?._id) ===
				String((updated as any)?.id || (updated as any)?._id)
					? updated
					: row,
			);

			if (
				s.selectedItemWise &&
				String((s.selectedItemWise as any)?.id || (s.selectedItemWise as any)?._id) ===
					String((updated as any)?.id || (updated as any)?._id)
			) {
				s.selectedItemWise = updated;
			}
		});
		b.addCase(updateItemWiseReorderLevelThunk.rejected, (s, a) => {
			s.saving = false;
			s.error =
				(a.payload as string) || "Failed to update item-wise reorder level";
		});

		/* =========================================
		   ITEM WISE DELETE
		========================================= */
		b.addCase(deleteItemWiseReorderLevelThunk.pending, (s) => {
			s.saving = true;
			s.error = null;
		});
		b.addCase(deleteItemWiseReorderLevelThunk.fulfilled, (s, a) => {
			s.saving = false;

			const deletedId =
				(a.meta as any)?.arg ||
				(a.payload as any)?.id ||
				(a.payload as any)?._id;

			if (deletedId) {
				s.itemWiseRows = s.itemWiseRows.filter(
					(row: any) =>
						String(row?.id || row?._id) !== String(deletedId),
				);
			}

			if (
				s.selectedItemWise &&
				deletedId &&
				String((s.selectedItemWise as any)?.id || (s.selectedItemWise as any)?._id) ===
					String(deletedId)
			) {
				s.selectedItemWise = null;
			}
		});
		b.addCase(deleteItemWiseReorderLevelThunk.rejected, (s, a) => {
			s.saving = false;
			s.error =
				(a.payload as string) || "Failed to delete item-wise reorder level";
		});

		/* =========================================
		   WAREHOUSE WISE LIST
		========================================= */
		b.addCase(fetchWarehouseWiseReorderLevelsThunk.pending, (s) => {
			s.loadingWarehouseWiseList = true;
			s.error = null;
		});
		b.addCase(fetchWarehouseWiseReorderLevelsThunk.fulfilled, (s, a) => {
			s.loadingWarehouseWiseList = false;
			s.warehouseWiseRows = a.payload || [];
		});
		b.addCase(fetchWarehouseWiseReorderLevelsThunk.rejected, (s, a) => {
			s.loadingWarehouseWiseList = false;
			s.error =
				(a.payload as string) ||
				"Failed to load warehouse-wise reorder levels";
		});

		/* =========================================
		   WAREHOUSE WISE GET ONE
		========================================= */
		b.addCase(getWarehouseWiseReorderLevelThunk.pending, (s) => {
			s.loadingOne = true;
			s.error = null;
		});
		b.addCase(getWarehouseWiseReorderLevelThunk.fulfilled, (s, a) => {
			s.loadingOne = false;
			s.selectedWarehouseWise = a.payload || null;
		});
		b.addCase(getWarehouseWiseReorderLevelThunk.rejected, (s, a) => {
			s.loadingOne = false;
			s.error =
				(a.payload as string) ||
				"Failed to load warehouse-wise reorder level";
		});

		/* =========================================
		   WAREHOUSE WISE CREATE
		========================================= */
		b.addCase(createWarehouseWiseReorderLevelThunk.pending, (s) => {
			s.saving = true;
			s.error = null;
		});
		b.addCase(createWarehouseWiseReorderLevelThunk.fulfilled, (s, a) => {
			s.saving = false;

			const created = (a.payload as any)?.data ?? a.payload;
			if (created) {
				s.warehouseWiseRows = [created, ...s.warehouseWiseRows];
			}
		});
		b.addCase(createWarehouseWiseReorderLevelThunk.rejected, (s, a) => {
			s.saving = false;
			s.error =
				(a.payload as string) ||
				"Failed to create warehouse-wise reorder level";
		});

		/* =========================================
		   WAREHOUSE WISE UPDATE
		========================================= */
		b.addCase(updateWarehouseWiseReorderLevelThunk.pending, (s) => {
			s.saving = true;
			s.error = null;
		});
		b.addCase(updateWarehouseWiseReorderLevelThunk.fulfilled, (s, a) => {
			s.saving = false;

			const updated = (a.payload as any)?.data ?? a.payload;
			if (!updated) return;

			s.warehouseWiseRows = s.warehouseWiseRows.map((row: any) =>
				String(row?.id || row?._id) ===
				String((updated as any)?.id || (updated as any)?._id)
					? updated
					: row,
			);

			if (
				s.selectedWarehouseWise &&
				String(
					(s.selectedWarehouseWise as any)?.id ||
						(s.selectedWarehouseWise as any)?._id,
				) === String((updated as any)?.id || (updated as any)?._id)
			) {
				s.selectedWarehouseWise = updated;
			}
		});
		b.addCase(updateWarehouseWiseReorderLevelThunk.rejected, (s, a) => {
			s.saving = false;
			s.error =
				(a.payload as string) ||
				"Failed to update warehouse-wise reorder level";
		});

		/* =========================================
		   WAREHOUSE WISE DELETE
		========================================= */
		b.addCase(deleteWarehouseWiseReorderLevelThunk.pending, (s) => {
			s.saving = true;
			s.error = null;
		});
		b.addCase(deleteWarehouseWiseReorderLevelThunk.fulfilled, (s, a) => {
			s.saving = false;

			const deletedId =
				(a.meta as any)?.arg ||
				(a.payload as any)?.id ||
				(a.payload as any)?._id;

			if (deletedId) {
				s.warehouseWiseRows = s.warehouseWiseRows.filter(
					(row: any) =>
						String(row?.id || row?._id) !== String(deletedId),
				);
			}

			if (
				s.selectedWarehouseWise &&
				deletedId &&
				String(
					(s.selectedWarehouseWise as any)?.id ||
						(s.selectedWarehouseWise as any)?._id,
				) === String(deletedId)
			) {
				s.selectedWarehouseWise = null;
			}
		});
		b.addCase(deleteWarehouseWiseReorderLevelThunk.rejected, (s, a) => {
			s.saving = false;
			s.error =
				(a.payload as string) ||
				"Failed to delete warehouse-wise reorder level";
		});
	},
});

export const {
	clearSelectedItemWise,
	clearSelectedWarehouseWise,
	clearReorderLevelError,
} = slice.actions;

export default slice.reducer;