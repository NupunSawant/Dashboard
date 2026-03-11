// pages/Inventory/InventoryOrdersList.tsx

import { useEffect, useMemo, useState } from "react";
import { Alert, Spinner, Form, Card, Row, Col } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../slices/store";
import { fetchOrdersThunk } from "../../../slices/orders/thunks";
import type { Order, OrderStatus } from "../../../types/Orders/order";
import BasicTable from "../../../components/Table/BasicTable";
import { createColumnHelper } from "@tanstack/react-table";

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
				fontWeight: 700,
				padding: "6px 10px",
				borderRadius: "999px",
				fontSize: "12px",
				minWidth: 96,
				display: "inline-flex",
				alignItems: "center",
				justifyContent: "center",
			}}
		>
			{cfg.label}
		</span>
	);
};

const countByStatus = (orders: Order[] = [], status: string) =>
	orders.filter((o: any) => String(o?.orderStatus || "") === status).length;

export default function InventoryOrdersList() {
	const dispatch = useDispatch<AppDispatch>();

	const { orders, loadingList, error } = useSelector(
		(s: RootState) => s.orders,
	);

	const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");

	useEffect(() => {
		dispatch(
			fetchOrdersThunk(
				statusFilter === "ALL" ? undefined : { status: statusFilter },
			),
		);
	}, [dispatch, statusFilter]);

	const safeOrders = orders || [];

	const totalOrders = safeOrders.length;
	const pendingCount = countByStatus(safeOrders, "PENDING");
	const requestedCount = countByStatus(safeOrders, "REQUESTED_FOR_DISPATCH");
	const dispatchedCount = countByStatus(safeOrders, "DISPATCHED");
	const deliveredCount = countByStatus(safeOrders, "DELIVERED");

	const col = createColumnHelper<Order>();

	const columns = useMemo(
		() => [
			col.accessor("orderNo", {
				header: "Order No",
				cell: (i) => (
					<div className='fw-semibold' style={{ color: "#1f2937" }}>
						{i.getValue() || "-"}
					</div>
				),
			}),
			col.accessor("orderDate", {
				header: "Order Date",
				cell: (i) => (
					<span style={{ color: "#495057" }}>{fmtDateTime(i.getValue())}</span>
				),
			}),
			col.accessor("customerName", {
				header: "Customer",
				cell: (i) => (
					<div className='fw-medium' style={{ color: "#212529" }}>
						{i.getValue() || "-"}
					</div>
				),
			}),
			col.accessor("dispatchFromWarehouseName", {
				header: "Dispatch From",
				cell: (i) => (
					<span style={{ color: "#495057" }}>{i.getValue() || "-"}</span>
				),
			}),
			col.accessor((row) => row.items?.length ?? 0, {
				id: "itemsCount",
				header: "Items",
				cell: (i) => (
					<span
						style={{
							background: "#f4f6f8",
							border: "1px solid #e9ecef",
							borderRadius: 999,
							padding: "4px 10px",
							fontWeight: 700,
							fontSize: 12,
							color: "#344054",
							display: "inline-flex",
							minWidth: 40,
							justifyContent: "center",
						}}
					>
						{String(i.getValue() ?? 0)}
					</span>
				),
			}),
			col.accessor("quotationNo", {
				header: "Quotation No",
				cell: (i) => i.getValue() || "-",
			}),
			col.accessor("enquiryNo", {
				header: "Enquiry No",
				cell: (i) => i.getValue() || "-",
			}),
			col.accessor("orderStatus", {
				header: "Status",
				cell: (i) => statusBadge(i.getValue()),
			}),
		],
		[col],
	);

	return (
		<div className='container-fluid px-0'>
			<div
				style={{
					background:
						"linear-gradient(135deg, rgba(26,131,118,0.12) 0%, rgba(26,131,118,0.04) 100%)",
					border: "1px solid rgba(26,131,118,0.14)",
					borderRadius: 18,
					padding: "18px 20px",
					marginBottom: 18,
				}}
			>
				<div className='d-flex flex-wrap justify-content-between align-items-center gap-3'>
					<div>
						<div
							className='d-inline-flex align-items-center gap-2 mb-2'
							style={{
								background: "rgba(26,131,118,0.1)",
								color: theme,
								borderRadius: 999,
								padding: "6px 12px",
								fontSize: 12,
								fontWeight: 700,
							}}
						>
							<i className='ri-box-3-line' />
							Inventory Module
						</div>

						<h4
							className='mb-1'
							style={{
								color: "#163a36",
								fontWeight: 700,
							}}
						>
							Inventory Orders
						</h4>
						<div style={{ color: "#5f6b6d", fontSize: 14 }}>
							Read-only order visibility for stock planning and inventory
							tracking.
						</div>
					</div>

					<div className='d-flex align-items-center gap-2'>
						<Form.Select
							value={statusFilter}
							onChange={(e) => setStatusFilter(e.target.value as any)}
							style={{
								width: 220,
								borderRadius: 10,
								fontSize: "13px",
								border: "1px solid #d7e3e0",
								boxShadow: "none",
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
					</div>
				</div>
			</div>

			<Row className='g-3 mb-3'>
				<Col xl={3} md={6}>
					<Card
						className='border-0 shadow-sm h-100'
						style={{ borderRadius: 16, overflow: "hidden" }}
					>
						<div
							style={{
								height: 4,
								background: theme,
							}}
						/>
						<Card.Body>
							<div
								className='d-flex justify-content-between align-items-start'
							>
								<div>
									<div style={{ color: "#667085", fontSize: 13 }}>
										Total Orders
									</div>
									<div
										style={{
											fontSize: 28,
											fontWeight: 800,
											color: "#101828",
											lineHeight: 1.1,
										}}
									>
										{totalOrders}
									</div>
								</div>
								<div
									style={{
										width: 42,
										height: 42,
										borderRadius: 12,
										background: "rgba(26,131,118,0.1)",
										color: theme,
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										fontSize: 20,
									}}
								>
									<i className='ri-file-list-3-line' />
								</div>
							</div>
						</Card.Body>
					</Card>
				</Col>

				<Col xl={3} md={6}>
					<Card
						className='border-0 shadow-sm h-100'
						style={{ borderRadius: 16, overflow: "hidden" }}
					>
						<div style={{ height: 4, background: "#ad6800" }} />
						<Card.Body>
							<div className='d-flex justify-content-between align-items-start'>
								<div>
									<div style={{ color: "#667085", fontSize: 13 }}>Pending</div>
									<div
										style={{
											fontSize: 28,
											fontWeight: 800,
											color: "#101828",
											lineHeight: 1.1,
										}}
									>
										{pendingCount}
									</div>
								</div>
								<div
									style={{
										width: 42,
										height: 42,
										borderRadius: 12,
										background: "#fff7e6",
										color: "#ad6800",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										fontSize: 20,
									}}
								>
									<i className='ri-time-line' />
								</div>
							</div>
						</Card.Body>
					</Card>
				</Col>

				<Col xl={3} md={6}>
					<Card
						className='border-0 shadow-sm h-100'
						style={{ borderRadius: 16, overflow: "hidden" }}
					>
						<div style={{ height: 4, background: "#096dd9" }} />
						<Card.Body>
							<div className='d-flex justify-content-between align-items-start'>
								<div>
									<div style={{ color: "#667085", fontSize: 13 }}>
										Requested
									</div>
									<div
										style={{
											fontSize: 28,
											fontWeight: 800,
											color: "#101828",
											lineHeight: 1.1,
										}}
									>
										{requestedCount}
									</div>
								</div>
								<div
									style={{
										width: 42,
										height: 42,
										borderRadius: 12,
										background: "#e6f7ff",
										color: "#096dd9",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										fontSize: 20,
									}}
								>
									<i className='ri-send-plane-line' />
								</div>
							</div>
						</Card.Body>
					</Card>
				</Col>

				<Col xl={3} md={6}>
					<Card
						className='border-0 shadow-sm h-100'
						style={{ borderRadius: 16, overflow: "hidden" }}
					>
						<div style={{ height: 4, background: "#389e0d" }} />
						<Card.Body>
							<div className='d-flex justify-content-between align-items-start'>
								<div>
									<div style={{ color: "#667085", fontSize: 13 }}>
										Completed
									</div>
									<div
										style={{
											fontSize: 28,
											fontWeight: 800,
											color: "#101828",
											lineHeight: 1.1,
										}}
									>
										{dispatchedCount + deliveredCount}
									</div>
								</div>
								<div
									style={{
										width: 42,
										height: 42,
										borderRadius: 12,
										background: "#f6ffed",
										color: "#389e0d",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										fontSize: 20,
									}}
								>
									<i className='ri-checkbox-circle-line' />
								</div>
							</div>
						</Card.Body>
					</Card>
				</Col>
			</Row>

			{error && (
				<Alert
					variant='danger'
					style={{
						borderRadius: 12,
						border: "1px solid #ffd6d6",
					}}
				>
					{error}
				</Alert>
			)}

			{loadingList ? (
				<Card
					className='border-0 shadow-sm'
					style={{
						borderRadius: 18,
						minHeight: 260,
					}}
				>
					<Card.Body className='d-flex flex-column justify-content-center align-items-center py-5'>
						<Spinner animation='border' style={{ color: theme }} />
						<div className='mt-3' style={{ color: "#667085", fontWeight: 500 }}>
							Loading inventory orders...
						</div>
					</Card.Body>
				</Card>
			) : (
				<div
					style={{
						background: "#fff",
						borderRadius: 18,
						boxShadow: "0 6px 24px rgba(16, 24, 40, 0.06)",
						border: "1px solid #eef2f6",
						padding: 8,
					}}
				>
					<BasicTable
						data={safeOrders}
						columns={columns}
						title='Order Records'
						rightActions={
							<div
								className='d-flex align-items-center gap-2'
								style={{
									background: "#f8fafc",
									border: "1px solid #e9eef5",
									padding: "8px 12px",
									borderRadius: 12,
									color: "#475467",
									fontSize: 13,
									fontWeight: 600,
								}}
							>
								<i className='ri-eye-line' style={{ color: theme }} />
								Read Only View
							</div>
						}
					/>
				</div>
			)}
		</div>
	);
}