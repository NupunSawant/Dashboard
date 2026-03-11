// slices/orders/Order/thunks.ts

import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";
import { API } from "../../helpers/api_url";
import { getErrorMessage } from "../../helpers/error_helper";
import type { Order, OrderStatus } from "../../types/Orders/order";

const pickData = (data: any) => data?.data ?? data;

//  List orders (optional status filter)
export const fetchOrdersThunk = createAsyncThunk(
	"orders/list",
	async (args: { status?: OrderStatus } | undefined, thunkAPI) => {
		try {
			const params: any = {};
			if (args?.status) params.status = args.status;

			//  backend: GET /api/orders/order-list?status=...
			const { data } = await api.get(API.ORDERS.LIST, { params });

			const payload = pickData(data);
			const orders = payload?.data ?? payload;

			return Array.isArray(orders) ? (orders as Order[]) : [];
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to load orders"),
			);
		}
	},
);

//  Create manual order
export const createOrderThunk = createAsyncThunk(
	"orders/create",
	async (payload: any, thunkAPI) => {
		try {
			//  backend: POST /api/orders/order-list
			const { data } = await api.post(API.ORDERS.CREATE, payload);

			const payloadData = pickData(data);
			const order = payloadData?.data ?? payloadData;

			return order as Order;
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to create order"),
			);
		}
	},
);

//  Create order from WON quotation
export const createOrderFromQuotationThunk = createAsyncThunk(
	"orders/createFromQuotation",
	async (quotationId: string, thunkAPI) => {
		try {
			//  backend: POST /api/orders/order-list/from-quotation/:quotationId
			const { data } = await api.post(
				API.ORDERS.CREATE_FROM_QUOTATION(quotationId),
			);

			const payloadData = pickData(data);
			const order = payloadData?.data ?? payloadData;

			return order as Order;
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to create order from quotation"),
			);
		}
	},
);

//  Get single order
export const getOrderThunk = createAsyncThunk(
	"orders/getOne",
	async (id: string, thunkAPI) => {
		try {
			//  backend: GET /api/orders/order-list/:id
			const { data } = await api.get(API.ORDERS.GET_ONE(id));

			const payloadData = pickData(data);
			const order = payloadData?.data ?? payloadData;

			return order as Order;
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to load order"),
			);
		}
	},
);

//  Update order (details/items)
export const updateOrderThunk = createAsyncThunk(
	"orders/update",
	async ({ id, payload }: { id: string; payload: any }, thunkAPI) => {
		try {
			//  backend: PUT /api/orders/order-list/:id
			const { data } = await api.put(API.ORDERS.UPDATE(id), payload);

			const payloadData = pickData(data);
			const order = payloadData?.data ?? payloadData;

			return order as Order;
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to update order"),
			);
		}
	},
);

//  Change order status
export const changeOrderStatusThunk = createAsyncThunk(
	"orders/changeStatus",
	async ({ id, status }: { id: string; status: OrderStatus }, thunkAPI) => {
		try {
			//  backend: PATCH /api/orders/order-list/:id/status
			const { data } = await api.patch(API.ORDERS.UPDATE_STATUS(id), { status });

			const payloadData = pickData(data);
			const order = payloadData?.data ?? payloadData;

			return order as Order;
		} catch (err: any) {
			return thunkAPI.rejectWithValue(
				getErrorMessage(err, "Failed to update order status"),
			);
		}
	},
);