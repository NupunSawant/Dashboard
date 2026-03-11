// pages/Order/ViewOrderPage.tsx
//   Polished UI (theme matched) + nicer title header
//   Same routes: /orders/:id (view) and /orders/:id/edit (edit)
//   Read-only + Summary + Action buttons styled like your OrdersList/Upsert

import { useEffect, useMemo, useState } from "react";
import {
	Card,
	Button,
	Alert,
	Row,
	Col,
	Spinner,
	Table,
	Form,
	Badge,
} from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../slices/store";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import {
	getOrderThunk,
	changeOrderStatusThunk,
} from "../../slices/orders/thunks";
import { clearSelectedOrder } from "../../slices/orders/reducer";
import type { OrderStatus } from "../../types/Orders/order";

const theme = "#1a8376";

// ---------------- helpers ----------------
const round2 = (n: any) => {
	const x = Number(n || 0);
	return Math.round(x * 100) / 100;
};

const fmtDateTime = (val: any) => {
	if (!val) return "-";
	try {
		const d = new Date(val);
		return isNaN(d.getTime()) ? String(val) : d.toLocaleString();
	} catch {
		return String(val);
	}
};

const statusBadge = (status?: OrderStatus | string | null) => {
	const s = String(status || "PENDING");
	const map: Record<
		string,
		{ bg: string; text: string; label: string; dot: string }
	> = {
		PENDING: {
			bg: "#fff7e6",
			text: "#ad6800",
			label: "Pending",
			dot: "#fa8c16",
		},
		REQUESTED_FOR_DISPATCH: {
			bg: "#e6f7ff",
			text: "#096dd9",
			label: "Requested",
			dot: "#1890ff",
		},
		DISPATCHED: {
			bg: "#f6ffed",
			text: "#389e0d",
			label: "Dispatched",
			dot: "#52c41a",
		},
		DELIVERED: {
			bg: "#f0f5ff",
			text: "#2f54eb",
			label: "Delivered",
			dot: "#2f54eb",
		},
		CANCELLED: {
			bg: "#fff1f0",
			text: "#cf1322",
			label: "Cancelled",
			dot: "#ff4d4f",
		},
	};
	const cfg = map[s] || map.PENDING;

	return (
		<span
			className='badge'
			style={{
				background: cfg.bg,
				color: cfg.text,
				border: `1px solid ${cfg.bg}`,
				fontWeight: 800,
				padding: "6px 10px",
				borderRadius: 999,
				display: "inline-flex",
				alignItems: "center",
				gap: 8,
			}}
		>
			<span
				style={{
					width: 8,
					height: 8,
					borderRadius: 999,
					background: cfg.dot,
					display: "inline-block",
				}}
			/>
			{cfg.label}
		</span>
	);
};

const calcTotals = (items: any[]) => {
	return (items || []).reduce(
		(acc, r) => {
			const qty = Number(r?.quantity || 0);
			const rate = Number(r?.rate || 0);
			const discP = Number(r?.discountPercent || 0);
			const gstR = Number(r?.gstRate || 0);

			const amount = qty * rate;
			const discountPrice = (discP / 100) * amount;
			const discountedAmount = amount - discountPrice;
			const gstAmount = (gstR / 100) * discountedAmount;
			const totalAmount = discountedAmount + gstAmount;

			acc.subtotal += amount || 0;
			acc.totalDiscount += discountPrice || 0;
			acc.totalGst += gstAmount || 0;
			acc.grandTotal += totalAmount || 0;
			return acc;
		},
		{ subtotal: 0, totalDiscount: 0, totalGst: 0, grandTotal: 0 },
	);
};

const StatPill = ({
	label,
	value,
	icon,
}: {
	label: string;
	value: any;
	icon: string;
}) => (
	<div
		className='d-flex align-items-center gap-2'
		style={{
			padding: "10px 12px",
			borderRadius: 12,
			border: "1px solid #eef2f1",
			background: "white",
			minHeight: 44,
		}}
	>
		<div
			style={{
				width: 34,
				height: 34,
				borderRadius: 10,
				display: "grid",
				placeItems: "center",
				background: "#eaf4f2",
				color: theme,
				flex: "0 0 auto",
			}}
		>
			<i className={icon} />
		</div>

		<div style={{ lineHeight: 1.15 }}>
			<div style={{ fontSize: 12, color: "#6c757d", fontWeight: 700 }}>
				{label}
			</div>
			<div style={{ fontSize: 13, fontWeight: 900, color: "#212529" }}>
				{value}
			</div>
		</div>
	</div>
);

const SectionTitle = ({
	icon,
	title,
	right,
}: {
	icon: string;
	title: string;
	right?: React.ReactNode;
}) => (
	<div className='d-flex align-items-center gap-2 mb-3'>
		<div
			style={{
				width: 36,
				height: 36,
				borderRadius: 12,
				display: "grid",
				placeItems: "center",
				background: "#eaf4f2",
				color: theme,
				border: "1px solid #d7ece8",
			}}
		>
			<i className={icon} />
		</div>
		<div style={{ fontWeight: 900, fontSize: 14 }}>{title}</div>
		{right ? <div style={{ marginLeft: "auto" }}>{right}</div> : null}
	</div>
);

// ---------------- page ----------------
export default function ViewOrderPage() {
	const dispatch = useDispatch<AppDispatch>();
	const nav = useNavigate();
	const { id } = useParams();

	const [loading, setLoading] = useState(false);
	const [apiError, setApiError] = useState<string | null>(null);
	const [order, setOrder] = useState<any>(null);

	const { error, loadingOne, changingStatus } = useSelector((s: RootState) => {
		const st =
			(s as any).orders ||
			(s as any).order ||
			(s as any).orderSlice ||
			(s as any).Order;

		return {
			error: st?.error ?? null,
			loadingOne: !!st?.loadingOne,
			changingStatus: !!st?.changingStatus,
		};
	});

	useEffect(() => {
		if (!id) return;

		(async () => {
			setLoading(true);
			setApiError(null);

			const res = await dispatch(getOrderThunk(id));
			if (getOrderThunk.fulfilled.match(res)) {
				setOrder(res.payload as any);
			} else {
				setApiError(String(res.payload || "Failed to load order"));
			}
			setLoading(false);
		})();

		return () => {
			dispatch(clearSelectedOrder());
		};
	}, [dispatch, id]);

	const orderId = order?.id || order?._id || id;
	const status: OrderStatus = (order?.orderStatus as any) || "PENDING";
	const canRequestDispatch = String(status) === "PENDING";

	const totals = useMemo(() => calcTotals(order?.items || []), [order?.items]);

	const title = useMemo(() => {
		const no = order?.orderNo ? `#${order.orderNo}` : "";
		return no ? `Order ${no}` : "Order Details";
	}, [order?.orderNo]);

	return (
		<div>
			{/* TOP TITLE BAR */}
			<div
				className='mb-3'
				style={{
					borderRadius: 14,
					padding: "14px 14px",
					border: "1px solid #e9ebec",
					background: "linear-gradient(180deg, #ffffff 0%, #f8fbfa 100%)",
					boxShadow: "0 6px 18px rgba(16, 24, 40, 0.06)",
				}}
			>
				<div className='d-flex justify-content-between align-items-start flex-wrap gap-2'>
					<div>
						<div className='d-flex align-items-center gap-2'>
							<div
								style={{
									width: 42,
									height: 42,
									borderRadius: 14,
									display: "grid",
									placeItems: "center",
									background: "#eaf4f2",
									border: "1px solid #d7ece8",
									color: theme,
								}}
							>
								<i
									className='ri-shopping-bag-3-line'
									style={{ fontSize: 18 }}
								/>
							</div>

							<div>
								<div
									style={{
										display: "flex",
										alignItems: "center",
										gap: 10,
										flexWrap: "wrap",
									}}
								>
									<h5 className='m-0' style={{ fontWeight: 900 }}>
										{title}
									</h5>
									{statusBadge(status)}
								</div>

								<div style={{ fontSize: 12.5, color: "#6c757d", marginTop: 2 }}>
									View full order summary, line items and totals.
								</div>
							</div>
						</div>
					</div>

					<div className='d-flex gap-2 align-items-center flex-wrap'>
						<Button
							variant='light'
							size='sm'
							onClick={() => nav("/orders-list")}
							style={{
								border: "1px solid #e9ebec",
								fontSize: "13px",
								borderRadius: "10px",
								display: "inline-flex",
								alignItems: "center",
								gap: "6px",
								padding: "8px 10px",
								background: "white",
							}}
						>
							<i className='ri-arrow-left-line' /> Back
						</Button>

						<Button
							size='sm'
							disabled={!orderId || status !== "PENDING"}
							onClick={() => nav(`/orders/${orderId}/edit`)}
							style={{
								background: "#eaf4f2",
								border: "1px solid #d7ece8",
								color: theme,
								borderRadius: "10px",
								display: "inline-flex",
								alignItems: "center",
								gap: "6px",
								fontSize: "13px",
								padding: "8px 10px",
								fontWeight: 700,
							}}
						>
							<i className='ri-pencil-line' /> Edit
						</Button>

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
									const res = await dispatch(getOrderThunk(orderId));
									if (getOrderThunk.fulfilled.match(res))
										setOrder(res.payload as any);
								} catch (e: any) {
									toast.error(e || "Failed to request dispatch");
								}
							}}
							style={{
								background: canRequestDispatch ? theme : "#e9ebec",
								border: "none",
								color: canRequestDispatch ? "white" : "#6c757d",
								borderRadius: "10px",
								display: "inline-flex",
								alignItems: "center",
								gap: "6px",
								fontSize: "13px",
								padding: "8px 12px",
								fontWeight: 700,
								boxShadow: canRequestDispatch
									? "0 6px 14px rgba(26, 131, 118, 0.22)"
									: "none",
							}}
							title={
								canRequestDispatch
									? "Send to Ready To Dispatch"
									: "Only allowed when Pending"
							}
						>
							<i className='ri-send-plane-2-line' /> Request Dispatch
						</Button>
					</div>
				</div>

				{/* quick stats row */}
				<div
					className='mt-3'
					style={{
						display: "grid",
						gap: 10,
						gridTemplateColumns: "repeat(4, minmax(180px, 1fr))" as any,
					}}
				>
					<StatPill
						label='Customer'
						value={order?.customerName || "-"}
						icon='ri-user-3-line'
					/>
					<StatPill
						label='Dispatch From'
						value={order?.dispatchFromWarehouseName || "-"}
						icon='ri-home-4-line'
					/>
					<StatPill
						label='Order Date'
						value={order?.orderDate ? fmtDateTime(order.orderDate) : "-"}
						icon='ri-calendar-2-line'
					/>
					<StatPill
						label='Items'
						value={String(order?.items?.length || 0)}
						icon='ri-box-3-line'
					/>
				</div>
			</div>

			<Card
				className='p-3'
				style={{ border: "1px solid #e9ebec", borderRadius: 14 }}
			>
				{(apiError || error) && (
					<Alert variant='danger' className='mb-3'>
						{apiError || error}
					</Alert>
				)}

				{loading || loadingOne ? (
					<div className='d-flex justify-content-center py-5'>
						<Spinner animation='border' style={{ color: theme }} />
					</div>
				) : !order ? (
					<Alert variant='warning'>Order not found.</Alert>
				) : (
					<Row className='g-3'>
						{/* LEFT */}
						<Col lg={8}>
							{/* ===== Meta / Notes ===== */}
							<div
								className='p-3 mb-3'
								style={{
									background: "#f8fbfa",
									border: "1px solid #eef2f1",
									borderRadius: 14,
								}}
							>
								<SectionTitle
									icon='ri-file-list-3-line'
									title='Order Information'
								/>

								<Row className='g-3'>
									<Col md={4}>
										<Form.Label style={{ fontWeight: 800, fontSize: 13 }}>
											Order No
										</Form.Label>
										<Form.Control
											value={order?.orderNo || "-"}
											readOnly
											style={{ borderRadius: 10 }}
										/>
									</Col>

									<Col md={4}>
										<Form.Label style={{ fontWeight: 800, fontSize: 13 }}>
											Status
										</Form.Label>
										<Form.Control
											value={order?.orderStatus || "PENDING"}
											readOnly
											style={{ borderRadius: 10 }}
										/>
									</Col>

									<Col md={4}>
										<Form.Label style={{ fontWeight: 800, fontSize: 13 }}>
											Quotation / Enquiry
										</Form.Label>
										<Form.Control
											value={`${order?.quotationNo || "-"} / ${order?.enquiryNo || "-"}`}
											readOnly
											style={{ borderRadius: 10 }}
										/>
									</Col>

									<Col md={6}>
										<Form.Label style={{ fontWeight: 800, fontSize: 13 }}>
											Created
										</Form.Label>
										<Form.Control
											value={fmtDateTime(order?.createdAt)}
											readOnly
											style={{ borderRadius: 10 }}
										/>
									</Col>

									<Col md={6}>
										<Form.Label style={{ fontWeight: 800, fontSize: 13 }}>
											Last Updated
										</Form.Label>
										<Form.Control
											value={fmtDateTime(order?.updatedAt)}
											readOnly
											style={{ borderRadius: 10 }}
										/>
									</Col>

									<Col md={12}>
										<Form.Label style={{ fontWeight: 800, fontSize: 13 }}>
											Remarks
										</Form.Label>
										<Form.Control
											value={order?.remarks || "-"}
											readOnly
											style={{ borderRadius: 10 }}
										/>
									</Col>
								</Row>
							</div>

							{/* ===== Items ===== */}
							<div
								className='p-3'
								style={{
									background: "white",
									border: "1px solid #eef2f1",
									borderRadius: 14,
								}}
							>
								<SectionTitle
									icon='ri-box-3-line'
									title='Items'
									right={
										<Badge
											bg='light'
											text='dark'
											style={{
												border: "1px solid #e9ebec",
												borderRadius: 999,
												padding: "8px 10px",
												fontWeight: 800,
											}}
										>
											Rows: {order?.items?.length || 0}
										</Badge>
									}
								/>

								<div className='table-responsive'>
									<Table
										bordered
										hover
										size='sm'
										className='align-middle'
										style={{ borderRadius: 12, overflow: "hidden" }}
									>
										<thead style={{ background: "#f8fbfa" }}>
											<tr>
												<th style={{ minWidth: 180 }}>Item</th>
												<th style={{ minWidth: 140 }}>Category</th>
												<th style={{ minWidth: 160 }}>Sub Category</th>
												<th style={{ minWidth: 90 }}>Code</th>
												<th style={{ minWidth: 80 }}>Unit</th>
												<th style={{ minWidth: 70 }}>Qty</th>
												<th style={{ minWidth: 90 }}>Rate</th>
												<th style={{ minWidth: 110 }}>Amount</th>
												<th style={{ minWidth: 70 }}>Disc%</th>
												<th style={{ minWidth: 110 }}>Disc₹</th>
												<th style={{ minWidth: 120 }}>After</th>
												<th style={{ minWidth: 70 }}>GST%</th>
												<th style={{ minWidth: 110 }}>GST₹</th>
												<th style={{ minWidth: 120 }}>Total₹</th>
												<th style={{ minWidth: 220 }}>Remark</th>
											</tr>
										</thead>

										<tbody>
											{(order?.items || []).map((r: any, idx: number) => {
												const qty = Number(r?.quantity || 0);
												const rate = Number(r?.rate || 0);
												const discP = Number(r?.discountPercent || 0);
												const gstR = Number(r?.gstRate || 0);

												const amount = qty * rate;
												const discountPrice = (discP / 100) * amount;
												const discountedAmount = amount - discountPrice;
												const gstAmount = (gstR / 100) * discountedAmount;
												const totalAmount = discountedAmount + gstAmount;

												return (
													<tr key={idx}>
														<td style={{ fontWeight: 800 }}>
															{r?.itemsName || "-"}
														</td>
														<td>{r?.itemsCategory || "-"}</td>
														<td>{r?.itemsSubCategory || "-"}</td>
														<td>{r?.itemsCode || "-"}</td>
														<td>{r?.itemsUnit || "-"}</td>
														<td>{qty}</td>
														<td>{round2(rate)}</td>
														<td>{round2(amount)}</td>
														<td>{round2(discP)}</td>
														<td>{round2(discountPrice)}</td>
														<td>{round2(discountedAmount)}</td>
														<td>{round2(gstR)}</td>
														<td>{round2(gstAmount)}</td>
														<td style={{ fontWeight: 900, color: theme }}>
															{round2(totalAmount)}
														</td>
														<td>{r?.remark || "-"}</td>
													</tr>
												);
											})}

											{(!order?.items || order.items.length === 0) && (
												<tr>
													<td
														colSpan={15}
														className='text-center'
														style={{ color: "#6c757d" }}
													>
														No items found.
													</td>
												</tr>
											)}
										</tbody>
									</Table>
								</div>
							</div>
						</Col>

						{/* RIGHT: Summary */}
						<Col lg={4}>
							<div
								className='p-3'
								style={{
									background: "white",
									border: "1px solid #eef2f1",
									borderRadius: 14,
									position: "sticky",
									top: 12,
								}}
							>
								<SectionTitle icon='ri-calculator-line' title='Summary' />

								<div
									style={{
										padding: 12,
										borderRadius: 14,
										border: "1px solid #eef2f1",
										background:
											"linear-gradient(180deg, #ffffff 0%, #f8fbfa 100%)",
									}}
								>
									<div className='d-flex justify-content-between mb-2'>
										<div style={{ color: "#6c757d", fontWeight: 700 }}>
											Subtotal
										</div>
										<div style={{ fontWeight: 900 }}>
											{round2(totals.subtotal)}
										</div>
									</div>

									<div className='d-flex justify-content-between mb-2'>
										<div style={{ color: "#6c757d", fontWeight: 700 }}>
											Total Discount
										</div>
										<div style={{ fontWeight: 900 }}>
											{round2(totals.totalDiscount)}
										</div>
									</div>

									<div className='d-flex justify-content-between mb-2'>
										<div style={{ color: "#6c757d", fontWeight: 700 }}>
											Total GST
										</div>
										<div style={{ fontWeight: 900 }}>
											{round2(totals.totalGst)}
										</div>
									</div>

									<hr />

									<div className='d-flex justify-content-between align-items-center'>
										<div style={{ fontWeight: 900, fontSize: 16 }}>
											Grand Total
										</div>
										<div
											style={{
												fontWeight: 900,
												fontSize: 20,
												color: theme,
											}}
										>
											₹ {round2(totals.grandTotal)}
										</div>
									</div>
								</div>

								<div
									style={{
										marginTop: 12,
										fontSize: 12,
										color: "#6c757d",
										padding: "10px 12px",
										borderRadius: 12,
										border: "1px dashed #d7ece8",
										background: "#f8fbfa",
									}}
								>
									<div
										style={{ fontWeight: 800, color: theme, marginBottom: 6 }}
									>
										How totals are calculated
									</div>
									<div>Amount = Qty × Rate</div>
									<div>Discount = (Disc%) of Amount</div>
									<div>GST = (GST%) of After Discount</div>
								</div>

								<div className='mt-3 d-flex gap-2'>
									<Button
										variant='light'
										onClick={() => nav("/orders-list")}
										style={{
											flex: 1,
											border: "1px solid #e9ebec",
											fontSize: "13px",
											borderRadius: "10px",
											display: "inline-flex",
											alignItems: "center",
											justifyContent: "center",
											gap: "6px",
											padding: "9px 10px",
											background: "white",
										}}
									>
										<i className='ri-arrow-left-line' /> Back
									</Button>

									<Button
										disabled={!orderId || status !== "PENDING"}
										onClick={() => nav(`/orders/${orderId}/edit`)}
										style={{
											flex: 1,
											background: theme,
											border: "none",
											borderRadius: "10px",
											fontSize: "13px",
											display: "inline-flex",
											alignItems: "center",
											justifyContent: "center",
											gap: "6px",
											padding: "9px 10px",
											fontWeight: 800,
											boxShadow: "0 6px 14px rgba(26, 131, 118, 0.22)",
										}}
									>
										<i className='ri-pencil-line' /> Edit
									</Button>
								</div>
							</div>
						</Col>
					</Row>
				)}
			</Card>
		</div>
	);
}
