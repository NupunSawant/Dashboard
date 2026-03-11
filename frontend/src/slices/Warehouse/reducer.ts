import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { WarehouseInward } from "../../types/Warehouses/warehouseInward";
import {
    fetchWarehouseInwardsThunk,
    getWarehouseInwardThunk,
    createWarehouseInwardThunk,
    updateWarehouseInwardThunk,
    deleteWarehouseInwardThunk,
} from "./thunks";

type WarehouseInwardState = {
    warehouseInwards: WarehouseInward[];
    selected: WarehouseInward | null;
    loadingList: boolean;
    loadingOne: boolean;
    saving: boolean;
    error: string | null;
};

const initialState: WarehouseInwardState = {
    warehouseInwards: [],
    selected: null,
    loadingList: false,
    loadingOne: false,
    saving: false,
    error: null,
};

const slice = createSlice({
    name: "warehouseInward",
    initialState,
    reducers: {
        clearSelectedWarehouseInward(s) {
            s.selected = null;
        },
        clearWarehouseInwardError(s) {
            s.error = null;
        },
    },
    extraReducers: (b) => {
        b.addCase(fetchWarehouseInwardsThunk.pending, (s) => {
            s.loadingList = true;
            s.error = null;
        });
        b.addCase(
            fetchWarehouseInwardsThunk.fulfilled,
            (s, a: PayloadAction<WarehouseInward[]>) => {
                s.loadingList = false;
                s.warehouseInwards = Array.isArray(a.payload) ? a.payload : [];
            },
        );
        b.addCase(fetchWarehouseInwardsThunk.rejected, (s, a) => {
            s.loadingList = false;
            s.error = (a.payload as string) || "Failed to load warehouse inwards";
        });

        b.addCase(getWarehouseInwardThunk.pending, (s) => {
            s.loadingOne = true;
            s.error = null;
        });
        b.addCase(
            getWarehouseInwardThunk.fulfilled,
            (s, a: PayloadAction<WarehouseInward>) => {
                s.loadingOne = false;
                s.selected = a.payload;
            },
        );
        b.addCase(getWarehouseInwardThunk.rejected, (s, a) => {
            s.loadingOne = false;
            s.error = (a.payload as string) || "Failed to load warehouse inward";
        });

        b.addCase(createWarehouseInwardThunk.pending, (s) => {
            s.saving = true;
            s.error = null;
        });
        b.addCase(createWarehouseInwardThunk.fulfilled, (s, a: any) => {
            s.saving = false;
            const created =
                a.payload?.data?.warehouseInward ??
                a.payload?.warehouseInward ??
                a.payload?.data ??
                a.payload;
            if (created) s.warehouseInwards = [created, ...s.warehouseInwards];
        });
        b.addCase(createWarehouseInwardThunk.rejected, (s, a) => {
            s.saving = false;
            s.error = (a.payload as string) || "Failed to create warehouse inward";
        });

        b.addCase(updateWarehouseInwardThunk.pending, (s) => {
            s.saving = true;
            s.error = null;
        });
        b.addCase(updateWarehouseInwardThunk.fulfilled, (s, a: any) => {
            s.saving = false;
            const updated =
                a.payload?.data?.warehouseInward ??
                a.payload?.warehouseInward ??
                a.payload?.data ??
                a.payload;

            if (!updated) return;

            const uid = updated?.id || updated?._id;
            s.warehouseInwards = s.warehouseInwards.map((row: any) => {
                const rid = row?.id || row?._id;
                return String(rid) === String(uid) ? updated : row;
            });

            if (s.selected) {
                const sid = (s.selected as any)?.id || (s.selected as any)?._id;
                if (String(sid) === String(uid)) s.selected = updated;
            }
        });
        b.addCase(updateWarehouseInwardThunk.rejected, (s, a) => {
            s.saving = false;
            s.error = (a.payload as string) || "Failed to update warehouse inward";
        });

        b.addCase(deleteWarehouseInwardThunk.pending, (s) => {
            s.saving = true;
            s.error = null;
        });
        b.addCase(deleteWarehouseInwardThunk.fulfilled, (s, a: any) => {
            s.saving = false;
            const deletedId =
                a.payload?.data?.id ??
                a.payload?.id ??
                a.payload?._id ??
                a.meta?.arg;

            if (deletedId) {
                s.warehouseInwards = s.warehouseInwards.filter((row: any) => {
                    const rid = row?.id || row?._id;
                    return String(rid) !== String(deletedId);
                });
            }
        });
        b.addCase(deleteWarehouseInwardThunk.rejected, (s, a) => {
            s.saving = false;
            s.error = (a.payload as string) || "Failed to delete warehouse inward";
        });
    },
});

export const { clearSelectedWarehouseInward, clearWarehouseInwardError } =
    slice.actions;

export default slice.reducer;