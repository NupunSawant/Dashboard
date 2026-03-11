import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { IssueToLabour } from "../../../types/Warehouses/issueToLabour";
import {
	fetchIssueToLaboursThunk,
	fetchPendingIssueToLaboursThunk,
	getIssueToLabourThunk,
	createIssueToLabourThunk,
	updateIssueToLabourThunk,
	revertIssueToLabourThunk,
	completeIssueToLabourThunk,
} from "./thunks";

type IssueToLabourState = {
	issueToLabours: IssueToLabour[];
	pendingIssueToLabours: IssueToLabour[];
	selected: IssueToLabour | null;
	loadingList: boolean;
	loadingPending: boolean;
	loadingOne: boolean;
	saving: boolean;
	error: string | null;
};

const initialState: IssueToLabourState = {
	issueToLabours: [],
	pendingIssueToLabours: [],
	selected: null,
	loadingList: false,
	loadingPending: false,
	loadingOne: false,
	saving: false,
	error: null,
};

const extractIssue = (payload: any): IssueToLabour | null =>
	payload?.data?.data ?? payload?.data ?? payload ?? null;

const slice = createSlice({
	name: "issueToLabour",
	initialState,
	reducers: {
		clearSelectedIssueToLabour(s) {
			s.selected = null;
		},
		clearIssueToLabourError(s) {
			s.error = null;
		},
	},
	extraReducers: (b) => {
		b.addCase(fetchIssueToLaboursThunk.pending, (s) => {
			s.loadingList = true;
			s.error = null;
		});
		b.addCase(
			fetchIssueToLaboursThunk.fulfilled,
			(s, a: PayloadAction<IssueToLabour[]>) => {
				s.loadingList = false;
				s.issueToLabours = Array.isArray(a.payload) ? a.payload : [];
			},
		);
		b.addCase(fetchIssueToLaboursThunk.rejected, (s, a) => {
			s.loadingList = false;
			s.error = (a.payload as string) || "Failed to load issue to labour list";
		});

		b.addCase(fetchPendingIssueToLaboursThunk.pending, (s) => {
			s.loadingPending = true;
			s.error = null;
		});
		b.addCase(
			fetchPendingIssueToLaboursThunk.fulfilled,
			(s, a: PayloadAction<IssueToLabour[]>) => {
				s.loadingPending = false;
				s.pendingIssueToLabours = Array.isArray(a.payload) ? a.payload : [];
			},
		);
		b.addCase(fetchPendingIssueToLaboursThunk.rejected, (s, a) => {
			s.loadingPending = false;
			s.error =
				(a.payload as string) || "Failed to load pending issue to labour list";
		});

		b.addCase(getIssueToLabourThunk.pending, (s) => {
			s.loadingOne = true;
			s.error = null;
		});
		b.addCase(
			getIssueToLabourThunk.fulfilled,
			(s, a: PayloadAction<IssueToLabour>) => {
				s.loadingOne = false;
				s.selected = a.payload;
			},
		);
		b.addCase(getIssueToLabourThunk.rejected, (s, a) => {
			s.loadingOne = false;
			s.error = (a.payload as string) || "Failed to load issue to labour";
		});

		b.addCase(createIssueToLabourThunk.pending, (s) => {
			s.saving = true;
			s.error = null;
		});
		b.addCase(createIssueToLabourThunk.fulfilled, (s, a: any) => {
			s.saving = false;
			const created = extractIssue(a.payload);
			if (created) s.issueToLabours = [created, ...s.issueToLabours];
		});
		b.addCase(createIssueToLabourThunk.rejected, (s, a) => {
			s.saving = false;
			s.error = (a.payload as string) || "Failed to create issue to labour";
		});

		b.addCase(updateIssueToLabourThunk.pending, (s) => {
			s.saving = true;
			s.error = null;
		});
		b.addCase(updateIssueToLabourThunk.fulfilled, (s, a: any) => {
			s.saving = false;
			const updated = extractIssue(a.payload);
			if (!updated) return;
			const uid = (updated as any)?.id || (updated as any)?._id;
			s.issueToLabours = s.issueToLabours.map((row: any) => {
				const rid = row?.id || row?._id;
				return String(rid) === String(uid) ? updated : row;
			});
			s.pendingIssueToLabours = s.pendingIssueToLabours.map((row: any) => {
				const rid = row?.id || row?._id;
				return String(rid) === String(uid) ? updated : row;
			});
			if (s.selected) {
				const sid = (s.selected as any)?.id || (s.selected as any)?._id;
				if (String(sid) === String(uid)) s.selected = updated;
			}
		});
		b.addCase(updateIssueToLabourThunk.rejected, (s, a) => {
			s.saving = false;
			s.error = (a.payload as string) || "Failed to update issue to labour";
		});

		b.addCase(revertIssueToLabourThunk.pending, (s) => {
			s.saving = true;
			s.error = null;
		});
		b.addCase(revertIssueToLabourThunk.fulfilled, (s, a: any) => {
			s.saving = false;
			const updated = extractIssue(a.payload);
			if (!updated) return;
			const uid = (updated as any)?.id || (updated as any)?._id;
			s.issueToLabours = s.issueToLabours.map((row: any) => {
				const rid = row?.id || row?._id;
				return String(rid) === String(uid) ? updated : row;
			});
			s.pendingIssueToLabours = s.pendingIssueToLabours.filter((row: any) => {
				const rid = row?.id || row?._id;
				return String(rid) !== String(uid);
			});
		});
		b.addCase(revertIssueToLabourThunk.rejected, (s, a) => {
			s.saving = false;
			s.error = (a.payload as string) || "Failed to revert issue to labour";
		});

		b.addCase(completeIssueToLabourThunk.pending, (s) => {
			s.saving = true;
			s.error = null;
		});
		b.addCase(completeIssueToLabourThunk.fulfilled, (s, a: any) => {
			s.saving = false;
			const updated = extractIssue(a.payload);
			if (!updated) return;
			const uid = (updated as any)?.id || (updated as any)?._id;
			s.issueToLabours = s.issueToLabours.map((row: any) => {
				const rid = row?.id || row?._id;
				return String(rid) === String(uid) ? updated : row;
			});
			s.pendingIssueToLabours = s.pendingIssueToLabours.filter((row: any) => {
				const rid = row?.id || row?._id;
				return String(rid) !== String(uid);
			});
		});
		b.addCase(completeIssueToLabourThunk.rejected, (s, a) => {
			s.saving = false;
			s.error = (a.payload as string) || "Failed to complete issue to labour";
		});
	},
});

export const { clearSelectedIssueToLabour, clearIssueToLabourError } =
	slice.actions;

export default slice.reducer;