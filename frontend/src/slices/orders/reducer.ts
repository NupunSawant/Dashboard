// slices/orders/Order/slice.ts

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Order } from "../../types/Orders/order";
import {
	fetchOrdersThunk,
	createOrderThunk,
	createOrderFromQuotationThunk,
	getOrderThunk,
	updateOrderThunk,
	changeOrderStatusThunk,
} from "./thunks";

type OrdersState = {
	orders: Order[];
	selected: Order | null;

	loadingList: boolean;
	loadingOne: boolean;

	creating: boolean; // create manual or create-from-quotation
	saving: boolean; // update order
	changingStatus: boolean;

	error: string | null;
};

const initialState: OrdersState = {
	orders: [],
	selected: null,

	loadingList: false,
	loadingOne: false,

	creating: false,
	saving: false,
	changingStatus: false,

	error: null,
};

const upsertInList = (list: Order[], item: Order) => {
	const id = item.id || item._id;
	if (!id) return [item, ...list];

	const idx = list.findIndex((x) => (x.id || x._id) === id);
	if (idx === -1) return [item, ...list];

	const copy = [...list];
	copy[idx] = item;
	return copy;
};

const ordersSlice = createSlice({
	name: "orders",
	initialState,
	reducers: {
		//   requested: clearSelected (keep alias for convenience)
		clearSelected: (s) => {
			s.selected = null;
		},
		//   optional alias (if some files already import this name)
		clearSelectedOrder: (s) => {
			s.selected = null;
		},
		clearOrdersError: (s) => {
			s.error = null;
		},
	},
	extraReducers: (b) => {
		// ======================
		// LIST
		// ======================
		b.addCase(fetchOrdersThunk.pending, (s) => {
			s.loadingList = true;
			s.error = null;
		});
		b.addCase(fetchOrdersThunk.fulfilled, (s, a: PayloadAction<Order[]>) => {
			s.loadingList = false;
			s.orders = Array.isArray(a.payload) ? a.payload : [];
		});
		b.addCase(fetchOrdersThunk.rejected, (s, a) => {
			s.loadingList = false;
			s.error = (a.payload as string) || "Failed to load orders";
		});

		// ======================
		// GET ONE
		// ======================
		b.addCase(getOrderThunk.pending, (s) => {
			s.loadingOne = true;
			s.error = null;
		});
		b.addCase(getOrderThunk.fulfilled, (s, a: PayloadAction<Order>) => {
			s.loadingOne = false;
			s.selected = a.payload || null;

			if (a.payload) s.orders = upsertInList(s.orders, a.payload);
		});
		b.addCase(getOrderThunk.rejected, (s, a) => {
			s.loadingOne = false;
			s.error = (a.payload as string) || "Failed to load order";
		});

		// ======================
		// CREATE (manual)
		// ======================
		b.addCase(createOrderThunk.pending, (s) => {
			s.creating = true;
			s.error = null;
		});
		b.addCase(createOrderThunk.fulfilled, (s, a: PayloadAction<Order>) => {
			s.creating = false;

			if (a.payload) {
				s.orders = upsertInList(s.orders, a.payload);
				s.selected = a.payload;
			}
		});
		b.addCase(createOrderThunk.rejected, (s, a) => {
			s.creating = false;
			s.error = (a.payload as string) || "Failed to create order";
		});

		// ======================
		// CREATE FROM QUOTATION
		// ======================
		b.addCase(createOrderFromQuotationThunk.pending, (s) => {
			s.creating = true;
			s.error = null;
		});
		b.addCase(
			createOrderFromQuotationThunk.fulfilled,
			(s, a: PayloadAction<Order>) => {
				s.creating = false;

				if (a.payload) {
					s.orders = upsertInList(s.orders, a.payload);
					s.selected = a.payload;
				}
			},
		);
		b.addCase(createOrderFromQuotationThunk.rejected, (s, a) => {
			s.creating = false;
			s.error =
				(a.payload as string) || "Failed to create order from quotation";
		});

		// ======================
		// UPDATE ORDER
		// ======================
		b.addCase(updateOrderThunk.pending, (s) => {
			s.saving = true;
			s.error = null;
		});
		b.addCase(updateOrderThunk.fulfilled, (s, a: PayloadAction<Order>) => {
			s.saving = false;

			if (a.payload) {
				s.orders = upsertInList(s.orders, a.payload);

				const id = a.payload.id || a.payload._id;
				const selId = s.selected?.id || s.selected?._id;

				if (s.selected && id && selId === id) {
					s.selected = a.payload;
				}
			}
		});
		b.addCase(updateOrderThunk.rejected, (s, a) => {
			s.saving = false;
			s.error = (a.payload as string) || "Failed to update order";
		});

		// ======================
		// CHANGE STATUS
		// ======================
		b.addCase(changeOrderStatusThunk.pending, (s) => {
			s.changingStatus = true;
			s.error = null;
		});
		b.addCase(
			changeOrderStatusThunk.fulfilled,
			(s, a: PayloadAction<Order>) => {
				s.changingStatus = false;

				if (a.payload) {
					s.orders = upsertInList(s.orders, a.payload);

					const id = a.payload.id || a.payload._id;
					const selId = s.selected?.id || s.selected?._id;

					if (s.selected && id && selId === id) {
						s.selected = a.payload;
					}
				}
			},
		);
		b.addCase(changeOrderStatusThunk.rejected, (s, a) => {
			s.changingStatus = false;
			s.error = (a.payload as string) || "Failed to update order status";
		});
	},
});

export const { clearSelected, clearSelectedOrder, clearOrdersError } =
	ordersSlice.actions;

export default ordersSlice.reducer;
