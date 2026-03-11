// pages/Order/OrdersList.tsx

import { useEffect, useMemo, useState } from "react";
import { Alert, Spinner, Button, Form } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../slices/store";
import {
	fetchOrdersThunk,
	changeOrderStatusThunk,
} from "../../slices/orders/thunks";
import type { Order, OrderStatus } from "../../types/Orders/order";
import BasicTable from "../../components/Table/BasicTable";
import { createColumnHelper } from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { canCreate, canUpdate } from "../../utils/permission";

const theme = "#1a8376";

const fmtDateTime = (val: any) => {
	if (!val) return "-";
	try {
		const d = new Date(val);
		return isNaN(d.getTime()) ? String(val) : d.toLocaleString();
	} catch {
		return String(val);
	}
};

const statusBadge = (status?: OrderStatus | string) => {
	const s = String(status || "PENDING");

	const map: Record<string, { bg: string; text: string; label: string }> = {
		PENDING: { bg: "#fff7e6", text: "#ad6800", label: "Pending" },
		REQUESTED_FOR_DISPATCH: {
			bg: "#e6f7ff",
			text: "#096dd9",
			label: "Requested",
		},
		DISPATCHED: { bg: "#f6ffed", text: "#389e0d", label: "Dispatched" },
		DELIVERED: { bg: "#f0f5ff", text: "#2f54eb", label: "Delivered" },
		CANCELLED: { bg: "#fff1f0", text: "#cf1322", label: "Cancelled" },
	};

	const cfg = map[s] || map.PENDING;

	return (
		<span
			className='badge'
			style={{
				background: cfg.bg,
				color: cfg.text,
				border: `1px solid ${cfg.bg}`,
				fontWeight: 600,
			}}
		>
			{cfg.label}
		</span>
	);
};

export default function OrdersList() {
	const dispatch = useDispatch<AppDispatch>();
	const nav = useNavigate();

	const { orders, loadingList, changingStatus, error } = useSelector(
		(s: RootState) => s.orders,
	);
	const authUser = useSelector((s: RootState) => s.auth.user);

	const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");

	const allowCreate = canCreate(authUser, "orders", "order");
	const allowUpdate = canUpdate(authUser, "orders", "order");

	useEffect(() => {
		dispatch(
			fetchOrdersThunk(
				statusFilter === "ALL" ? undefined : { status: statusFilter },
			),
		);
	}, [dispatch, statusFilter]);

	const col = createColumnHelper<Order>();

	const columns = useMemo(
		() => [
			col.accessor("orderNo", {
				header: "Order No",
				cell: (i) => i.getValue() || "-",
			}),
			col.accessor("orderDate", {
				header: "Order Date",
				cell: (i) => fmtDateTime(i.getValue()),
			}),
			col.accessor("customerName", {
				header: "Customer",
				cell: (i) => i.getValue() || "-",
			}),
			col.accessor("dispatchFromWarehouseName", {
				header: "Dispatch From",
				cell: (i) => i.getValue() || "-",
			}),
			col.accessor("orderStatus", {
				header: "Status",
				cell: (i) => statusBadge(i.getValue()),
			}),
			col.accessor((row) => row.items?.length ?? 0, {
				id: "itemsCount",
				header: "Items",
				cell: (i) => String(i.getValue() ?? 0),
			}),
			col.accessor("quotationNo", {
				header: "Quotation No",
				cell: (i) => i.getValue() || "-",
			}),
			col.display({
				id: "actions",
				header: "Action",
				cell: ({ row }) => {
					const o = row.original as any;
					const orderId = o?.id || o?._id;
					const status = String(o?.orderStatus || "PENDING");

					const canRequestDispatch = allowUpdate && status === "PENDING";
					const canEdit = allowUpdate && status === "PENDING";

					return (
						<div className='d-flex gap-2 align-items-center'>
							{allowUpdate && (
								<Button
									size='sm'
									disabled={!orderId || !canRequestDispatch || changingStatus}
									onClick={async () => {
										try {
											await dispatch(
												changeOrderStatusThunk({
													id: orderId,
													status: "REQUESTED_FOR_DISPATCH",
												}),
											).unwrap();

											toast.success("Order sent to Ready To Dispatch");
										} catch (e: any) {
											toast.error(e || "Failed to request dispatch");
										}
									}}
									style={{
										background: canRequestDispatch ? theme : "#e9ebec",
										border: "none",
										color: canRequestDispatch ? "white" : "#6c757d",
										borderRadius: "6px",
										padding: "4px 10px",
										fontSize: "12px",
									}}
								>
									<i className='ri-send-plane-2-line' /> Request Dispatch
								</Button>
							)}

							{allowUpdate && (
								<Button
									size='sm'
									disabled={!orderId || !canEdit}
									onClick={() => nav(`/orders/${orderId}/edit`)}
									style={{
										background: "#eaf4f2",
										border: "none",
										color: theme,
										borderRadius: "6px",
										padding: "4px 10px",
									}}
								>
									<i className='ri-pencil-line' />
								</Button>
							)}

							<Button
								size='sm'
								disabled={!orderId}
								onClick={() => nav(`/orders/${orderId}`)}
								style={{
									background: "white",
									border: "1px solid #e9ebec",
									color: "#495057",
									borderRadius: "6px",
									padding: "4px 10px",
								}}
							>
								<i className='ri-eye-line' />
							</Button>
						</div>
					);
				},
			}),
		],
		[col, nav, dispatch, changingStatus, allowUpdate],
	);

	return (
		<>
			{error && <Alert variant='danger'>{error}</Alert>}

			{loadingList ? (
				<div className='d-flex justify-content-center py-5'>
					<Spinner animation='border' style={{ color: theme }} />
				</div>
			) : (
				<BasicTable
					data={orders || []}
					columns={columns}
					title='Orders'
					rightActions={
						<div className='d-flex gap-2 align-items-center'>
							<Form.Select
								value={statusFilter}
								onChange={(e) => setStatusFilter(e.target.value as any)}
								style={{
									width: 220,
									borderRadius: "6px",
									fontSize: "13px",
								}}
							>
								<option value='ALL'>All Status</option>
								<option value='PENDING'>Pending</option>
								<option value='REQUESTED_FOR_DISPATCH'>
									Requested for Dispatch
								</option>
								<option value='DISPATCHED'>Dispatched</option>
								<option value='DELIVERED'>Delivered</option>
								<option value='CANCELLED'>Cancelled</option>
							</Form.Select>

							<Button
								variant='light'
								style={{
									border: "1px solid #e9ebec",
									fontSize: "13px",
									borderRadius: "6px",
									display: "inline-flex",
									alignItems: "center",
									gap: "6px",
								}}
							>
								<i className='ri-upload-2-line' /> Export
							</Button>

							{allowCreate && (
								<Button
									onClick={() => nav("/orders/new")}
									style={{
										background: theme,
										border: "none",
										borderRadius: "6px",
										fontSize: "13px",
										display: "inline-flex",
										alignItems: "center",
										gap: "6px",
									}}
								>
									<i className='ri-add-circle-line' /> Create Order
								</Button>
							)}
						</div>
					}
				/>
			)}
		</>
	);
}
