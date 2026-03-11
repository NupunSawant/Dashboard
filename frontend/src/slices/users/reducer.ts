import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { User } from "../../types/user";
import {
	fetchUsersThunk,
	createUserThunk,
	getUserThunk,
	updateUserThunk,
	updatePasswordThunk,
} from "./thunks";

type UsersState = {
	users: User[];
	loadingList: boolean;
	saving: boolean;
	passwordSaving: boolean; //
	error: string | null;
};

const initialState: UsersState = {
	users: [],
	loadingList: false,
	saving: false,
	passwordSaving: false, //
	error: null,
};

const usersSlice = createSlice({
	name: "users",
	initialState,
	reducers: {},
	extraReducers: (b) => {
		b.addCase(fetchUsersThunk.pending, (s) => {
			s.loadingList = true;
			s.error = null;
		});
		b.addCase(fetchUsersThunk.fulfilled, (s, a: PayloadAction<User[]>) => {
			s.loadingList = false;
			s.users = Array.isArray(a.payload) ? a.payload : [];
		});
		b.addCase(fetchUsersThunk.rejected, (s, a) => {
			s.loadingList = false;
			s.error = (a.payload as string) || "Failed to load users";
		});

		b.addCase(createUserThunk.pending, (s) => {
			s.saving = true;
			s.error = null;
		});
		b.addCase(createUserThunk.fulfilled, (s, a: PayloadAction<User>) => {
			s.saving = false;
			if (!Array.isArray(s.users)) s.users = [];
			s.users = [a.payload, ...s.users];
		});
		b.addCase(createUserThunk.rejected, (s, a) => {
			s.saving = false;
			s.error = (a.payload as string) || "Failed to create user";
		});

		b.addCase(updateUserThunk.pending, (s) => {
			s.saving = true;
			s.error = null;
		});
		b.addCase(updateUserThunk.fulfilled, (s, a: PayloadAction<User>) => {
			s.saving = false;
			const updated = a.payload;
			const uid = updated.id || updated._id;

			s.users = s.users.map((u) => {
				const id = u.id || u._id;
				return id === uid ? updated : u;
			});
		});
		b.addCase(updateUserThunk.rejected, (s, a) => {
			s.saving = false;
			s.error = (a.payload as string) || "Failed to update user";
		});

		// optional: if you want to store current user fetched by getUserThunk, add a field.
		b.addCase(getUserThunk.rejected, (s, a) => {
			s.error = (a.payload as string) || "Failed to load user";
		});

		b.addCase(updatePasswordThunk.pending, (s) => {
			s.passwordSaving = true;
			s.error = null;
		});
		b.addCase(updatePasswordThunk.fulfilled, (s) => {
			s.passwordSaving = false;
		});
		b.addCase(updatePasswordThunk.rejected, (s, a) => {
			s.passwordSaving = false;
			s.error = (a.payload as string) || "Failed to update password";
		});
	},
});

export default usersSlice.reducer;
