import { useEffect, useMemo, useState } from "react";
import {
	Alert,
	Badge,
	Button,
	Card,
	Col,
	Row,
	Spinner,
	Table,
} from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../slices/store";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import {
	getQuotationThunk,
	setQuotationStatusThunk,
} from "../../../slices/orders/Quotation/thunks";
import { fetchOrdersThunk } from "../../../slices/orders/thunks";

import type {
	Quotation,
	QuotationStatus,
} from "../../../types/Orders/quotation";

const theme = "#1a8376";

const statusLabel: Record<QuotationStatus, string> = {
	PENDING: "Pending",
	SEND: "Send",
	WON: "Won",
	LOST: "Lost",
};

const statusBadge: Record<
	QuotationStatus,
	{ bg: string; text: string; border: string }
> = {
	PENDING: { bg: "#f5f5f5", text: "#595959", border: "#e9ecef" },
	SEND: { bg: "#e6f7ff", text: "#096dd9", border: "#b6e3ff" },
	WON: { bg: "#f6ffed", text: "#389e0d", border: "#c6f6b8" },
	LOST: { bg: "#fff1f0", text: "#cf1322", border: "#ffc1bd" },
};

const fmtDate = (v: any) => {
	if (!v) return "-";
	try {
		const d = new Date(v);
		return isNaN(d.getTime()) ? String(v) : d.toLocaleDateString();
	} catch {
		return String(v);
	}
};

const round2 = (n: any) => {
	const x = Number(n || 0);
	return Math.round(x * 100) / 100;
};

const infoLabelStyle: React.CSSProperties = {
	fontSize: 12,
	color: "#6c757d",
	marginBottom: 4,
	fontWeight: 600,
};

const infoValueStyle: React.CSSProperties = {
	fontSize: 14,
	fontWeight: 700,
	color: "#1f2937",
	wordBreak: "break-word",
};

const sectionCardStyle: React.CSSProperties = {
	background: "#ffffff",
	border: "1px solid #e9ebec",
	borderRadius: 14,
	boxShadow: "0 1px 2px rgba(16,24,40,0.04)",
};

export default function QuotationView() {
	const dispatch = useDispatch<AppDispatch>();
	const nav = useNavigate();
	const { id } = useParams();

	const [apiError, setApiError] = useState<string | null>(null);

	const { selectedQuotation, loadingOne, saving, error } = useSelector(
		(s: RootState) => {
			const st =
				(s as any).quotation ||
				(s as any).Quotation ||
				(s as any).quotations ||
				(s as any).quotationSlice;

			return {
				selectedQuotation: (st?.selectedQuotation ?? null) as Quotation | null,
				loadingOne: !!st?.loadingOne,
				saving: !!st?.saving,
				error: st?.error ?? null,
			};
		},
	);

	useEffect(() => {
		if (!id) return;
		setApiError(null);
		dispatch(getQuotationThunk(id));
	}, [dispatch, id]);

	const q = selectedQuotation as any;
	const status: QuotationStatus = (q?.status as any) || "PENDING";
	const locked = status === "WON" || status === "LOST";

	const totals = useMemo(() => {
		if (q?.totals) {
			return {
				subtotal: round2(q.totals.subtotal),
				totalDiscount: round2(q.totals.totalDiscount),
				totalGst: round2(q.totals.totalGst),
				grandTotal: round2(q.totals.grandTotal),
			};
		}

		const items = Array.isArray(q?.items) ? q.items : [];
		const t = items.reduce(
			(acc: any, r: any) => {
				acc.subtotal += Number(r.amount || 0);
				acc.totalDiscount += Number(r.discountPrice || 0);
				acc.totalGst += Number(r.gstAmount || 0);
				acc.grandTotal += Number(r.totalAmount || 0);
				return acc;
			},
			{ subtotal: 0, totalDiscount: 0, totalGst: 0, grandTotal: 0 },
		);

		return {
			subtotal: round2(t.subtotal),
			totalDiscount: round2(t.totalDiscount),
			totalGst: round2(t.totalGst),
			grandTotal: round2(t.grandTotal),
		};
	}, [q]);

	const doStatus = async (next: QuotationStatus) => {
		if (!id || locked) return;

		try {
			setApiError(null);
			const res = await dispatch(setQuotationStatusThunk({ id, status: next }));

			if (setQuotationStatusThunk.fulfilled.match(res)) {
				toast.success(`Status updated: ${next}`);
				if (next === "WON") {
					dispatch(fetchOrdersThunk(undefined));
				}
				dispatch(getQuotationThunk(id));
			} else {
				const msg = String(res.payload || "Status update failed");
				setApiError(msg);
				toast.error(msg);
			}
		} catch (e: any) {
			const msg = e?.message || "Status update failed";
			setApiError(msg);
			toast.error(msg);
		}
	};

	return (
		<>
			<style>{`
				.qv-page-card {
					border: 1px solid #e9ebec;
					border-radius: 16px;
					box-shadow: 0 2px 10px rgba(16,24,40,0.04);
					background: #fff;
				}

				.qv-hero {
					background: linear-gradient(135deg, #f8fbfa 0%, #f2faf8 100%);
					border: 1px solid #e6f1ef;
					border-radius: 14px;
				}

				.qv-section-title {
					font-size: 15px;
					font-weight: 800;
					color: #111827;
				}

				.qv-table thead th {
					background: #f8fbfa !important;
					color: #495057;
					font-size: 12px;
					font-weight: 800;
					white-space: nowrap;
					vertical-align: middle;
				}

				.qv-table tbody td {
					font-size: 13px;
					vertical-align: middle;
				}

				.qv-table tbody tr:hover {
					background: #fcfdfd;
				}

				.qv-summary-row {
					display: flex;
					justify-content: space-between;
					align-items: center;
					margin-bottom: 12px;
					font-size: 14px;
				}

				.qv-summary-label {
					color: #6c757d;
					font-weight: 600;
				}

				.qv-summary-value {
					font-weight: 800;
					color: #111827;
				}
			`}</style>

			<Card className='p-3 p-md-4 qv-page-card'>
				{/* Header */}
				<div className='d-flex justify-content-between align-items-start flex-wrap gap-3 mb-3'>
					<div>
						<div
							className='d-inline-flex align-items-center gap-2 mb-2'
							style={{
								background: "#eaf4f2",
								color: theme,
								padding: "6px 10px",
								borderRadius: 999,
								fontSize: 12,
								fontWeight: 800,
							}}
						>
							<i className='ri-file-list-3-line' />
							Quotation Management
						</div>

						<h4 className='mb-1 fw-bold' style={{ color: "#111827" }}>
							Quotation View
						</h4>
						<div style={{ fontSize: 13, color: "#6c757d" }}>
							View complete quotation details, item pricing, and status actions.
						</div>
					</div>

					<div className='d-flex gap-2 flex-wrap'>
						<Button
							variant='light'
							size='sm'
							onClick={() => nav("/orders/quotations")}
							style={{
								border: "1px solid #e9ebec",
								fontSize: "13px",
								borderRadius: "10px",
								display: "inline-flex",
								alignItems: "center",
								gap: "6px",
								padding: "8px 12px",
								background: "white",
								fontWeight: 600,
							}}
						>
							<i className='ri-arrow-left-line' /> Back
						</Button>

						{!locked && q?._id && (
							<Button
								size='sm'
								onClick={() => nav(`/orders/quotations/edit/${q._id}`)}
								style={{
									background: theme,
									border: `1px solid ${theme}`,
									borderRadius: "10px",
									fontSize: "13px",
									display: "inline-flex",
									alignItems: "center",
									gap: "6px",
									padding: "8px 12px",
									fontWeight: 700,
								}}
							>
								<i className='ri-edit-2-line' /> Edit Quotation
							</Button>
						)}
					</div>
				</div>

				{(apiError || error) && (
					<Alert variant='danger' className='mb-3'>
						{apiError || error}
					</Alert>
				)}

				{loadingOne ? (
					<div className='d-flex justify-content-center py-5'>
						<Spinner animation='border' style={{ color: theme }} />
					</div>
				) : !q ? (
					<Alert variant='warning'>Quotation not found.</Alert>
				) : (
					<Row className='g-3 g-lg-4'>
						{/* LEFT */}
						<Col lg={8}>
							{/* Hero card */}
							<div className='qv-hero p-3 p-md-4 mb-3'>
								<div className='d-flex justify-content-between align-items-start flex-wrap gap-3'>
									<div>
										<div
											style={{
												fontSize: 13,
												color: "#6c757d",
												fontWeight: 700,
												marginBottom: 6,
											}}
										>
											Quotation Number
										</div>
										<div
											style={{
												fontWeight: 900,
												fontSize: 24,
												color: theme,
												lineHeight: 1.2,
											}}
										>
											{q.quotationNo || "-"}
										</div>
										<div
											style={{
												fontSize: 13,
												color: "#6c757d",
												marginTop: 8,
											}}
										>
											Created on {fmtDate(q.createdAt)}
										</div>
									</div>

									<div className='d-flex flex-column align-items-lg-end gap-2'>
										<span
											className='badge'
											style={{
												background:
													(statusBadge[status] || statusBadge.PENDING).bg,
												color: (statusBadge[status] || statusBadge.PENDING).text,
												border: `1px solid ${
													(statusBadge[status] || statusBadge.PENDING).border
												}`,
												borderRadius: 999,
												padding: "8px 14px",
												fontWeight: 800,
												fontSize: 12,
												letterSpacing: "0.2px",
											}}
										>
											{statusLabel[status] || status}
										</span>

										{locked ? (
											<Badge
												style={{
													background: "#fff1f0",
													color: "#cf1322",
													border: "1px solid #ffd4d4",
													borderRadius: 999,
													padding: "8px 12px",
													fontWeight: 700,
												}}
											>
												<i className='ri-lock-line me-1' />
												Locked
											</Badge>
										) : null}
									</div>
								</div>
							</div>

							{/* Basic info */}
							<div className='p-3 p-md-4 mb-3' style={sectionCardStyle}>
								<div className='d-flex align-items-center gap-2 mb-3'>
									<div
										style={{
											width: 34,
											height: 34,
											borderRadius: 10,
											background: "#eaf4f2",
											color: theme,
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											fontSize: 18,
										}}
									>
										<i className='ri-information-line' />
									</div>
									<div className='qv-section-title'>Basic Information</div>
								</div>

								<Row className='g-3'>
									<Col md={4}>
										<div style={infoLabelStyle}>Quotation Date</div>
										<div style={infoValueStyle}>{fmtDate(q.quotationDate)}</div>
									</Col>

									<Col md={4}>
										<div style={infoLabelStyle}>Enquiry No</div>
										<div style={infoValueStyle}>{q.enquiryNo || "-"}</div>
									</Col>

									<Col md={4}>
										<div style={infoLabelStyle}>Warehouse</div>
										<div style={infoValueStyle}>{q.warehouseName || "-"}</div>
									</Col>

									<Col md={4}>
										<div style={infoLabelStyle}>Customer</div>
										<div style={infoValueStyle}>{q.customerName || "-"}</div>
									</Col>

									<Col md={4}>
										<div style={infoLabelStyle}>Contact Person</div>
										<div style={infoValueStyle}>
											{q.contactPersonName || "-"}
										</div>
									</Col>

									<Col md={4}>
										<div style={infoLabelStyle}>Phone</div>
										<div style={infoValueStyle}>
											{q.contactPersonPhone ?? "-"}
										</div>
									</Col>

									{q.enquiryStage ? (
										<Col md={6}>
											<div style={infoLabelStyle}>Enquiry Stage</div>
											<div style={infoValueStyle}>{q.enquiryStage}</div>
										</Col>
									) : null}

									<Col md={12}>
										<div style={infoLabelStyle}>Remarks</div>
										<div style={infoValueStyle}>{q.remarks || "-"}</div>
									</Col>
								</Row>
							</div>

							{/* Items */}
							<div className='p-3 p-md-4 mb-3' style={sectionCardStyle}>
								<div className='d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3'>
									<div className='d-flex align-items-center gap-2'>
										<div
											style={{
												width: 34,
												height: 34,
												borderRadius: 10,
												background: "#eaf4f2",
												color: theme,
												display: "flex",
												alignItems: "center",
												justifyContent: "center",
												fontSize: 18,
											}}
										>
											<i className='ri-box-3-line' />
										</div>
										<div className='qv-section-title'>Items</div>
									</div>

									<div
										style={{
											fontSize: 12,
											fontWeight: 700,
											background: "#f8f9fa",
											border: "1px solid #e9ecef",
											color: "#495057",
											borderRadius: 999,
											padding: "6px 10px",
										}}
									>
										{Array.isArray(q.items) ? q.items.length : 0} item(s)
									</div>
								</div>

								<div className='table-responsive'>
									<Table
										bordered
										hover
										size='sm'
										className='align-middle mb-0 qv-table'
									>
										<thead>
											<tr>
												<th>#</th>
												<th>Category</th>
												<th>Sub Category</th>
												<th>Item</th>
												<th>Code</th>
												<th>Unit</th>
												<th className='text-end'>Qty</th>
												<th className='text-end'>Rate</th>
												<th className='text-end'>Amount</th>
												<th className='text-end'>Disc %</th>
												<th className='text-end'>Disc ₹</th>
												<th className='text-end'>After Disc</th>
												<th className='text-end'>GST %</th>
												<th className='text-end'>GST ₹</th>
												<th className='text-end'>Total ₹</th>
												<th>Remark</th>
											</tr>
										</thead>
										<tbody>
											{Array.isArray(q.items) && q.items.length > 0 ? (
												q.items.map((r: any, idx: number) => (
													<tr key={idx}>
														<td style={{ fontWeight: 700 }}>{idx + 1}</td>
														<td>{r.itemsCategory || "-"}</td>
														<td>{r.itemsSubCategory || "-"}</td>
														<td style={{ fontWeight: 700 }}>
															{r.itemsName || "-"}
														</td>
														<td>{r.itemsCode || "-"}</td>
														<td>{r.itemsUnit || "-"}</td>
														<td className='text-end'>{round2(r.quantity)}</td>
														<td className='text-end'>{round2(r.rate)}</td>
														<td className='text-end'>{round2(r.amount)}</td>
														<td className='text-end'>
															{round2(r.discountPercent)}
														</td>
														<td className='text-end'>
															{round2(r.discountPrice)}
														</td>
														<td className='text-end'>
															{round2(r.discountedAmount)}
														</td>
														<td className='text-end'>{round2(r.gstRate)}</td>
														<td className='text-end'>{round2(r.gstAmount)}</td>
														<td
															className='text-end'
															style={{ fontWeight: 900, color: theme }}
														>
															{round2(r.totalAmount)}
														</td>
														<td>{r.itemsRemark || "-"}</td>
													</tr>
												))
											) : (
												<tr>
													<td
														colSpan={16}
														className='text-center text-muted py-4'
													>
														No items available
													</td>
												</tr>
											)}
										</tbody>
									</Table>
								</div>
							</div>

							
							{/* <div className='p-3 p-md-4' style={sectionCardStyle}>
								<div className='d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3'>
									<div className='d-flex align-items-center gap-2'>
										<div
											style={{
												width: 34,
												height: 34,
												borderRadius: 10,
												background: "#eaf4f2",
												color: theme,
												display: "flex",
												alignItems: "center",
												justifyContent: "center",
												fontSize: 18,
											}}
										>
											<i className='ri-settings-3-line' />
										</div>
										<div className='qv-section-title'>Status Actions</div>
									</div>

									{locked ? (
										<Badge
											style={{
												background: "#fff1f0",
												color: "#cf1322",
												border: "1px solid #ffd4d4",
												borderRadius: 999,
												padding: "8px 12px",
												fontWeight: 700,
											}}
										>
											Locked after final status
										</Badge>
									) : null}
								</div>

								<div className='d-flex gap-2 flex-wrap'>
									<Button
										disabled={locked || saving}
										onClick={() => doStatus("SEND")}
										style={{
											background: "#0dcaf0",
											border: "1px solid #0dcaf0",
											borderRadius: "10px",
											fontSize: "13px",
											display: "inline-flex",
											alignItems: "center",
											gap: "6px",
											padding: "9px 14px",
											fontWeight: 700,
										}}
									>
										<i className='ri-send-plane-2-line' />
										{saving ? "Updating..." : "Send"}
									</Button>

									<Button
										disabled={locked || saving}
										onClick={() => doStatus("WON")}
										style={{
											background: "#198754",
											border: "1px solid #198754",
											borderRadius: "10px",
											fontSize: "13px",
											display: "inline-flex",
											alignItems: "center",
											gap: "6px",
											padding: "9px 14px",
											fontWeight: 700,
										}}
									>
										<i className='ri-checkbox-circle-line' />
										Won
									</Button>

									<Button
										disabled={locked || saving}
										onClick={() => doStatus("LOST")}
										style={{
											background: "#dc3545",
											border: "1px solid #dc3545",
											borderRadius: "10px",
											fontSize: "13px",
											display: "inline-flex",
											alignItems: "center",
											gap: "6px",
											padding: "9px 14px",
											fontWeight: 700,
										}}
									>
										<i className='ri-close-circle-line' />
										Lost
									</Button>
								</div> */}
							{/* </div> */}
						</Col>

						{/* RIGHT */}
						<Col lg={4}>
							<div
								className='p-3 p-md-4'
								style={{
									...sectionCardStyle,
									position: "sticky",
									top: 12,
								}}
							>
								<div className='d-flex align-items-center gap-2 mb-3'>
									<div
										style={{
											width: 38,
											height: 38,
											borderRadius: 12,
											background: "#eaf4f2",
											color: theme,
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											fontSize: 18,
										}}
									>
										<i className='ri-calculator-line' />
									</div>
									<div>
										<div className='qv-section-title'>Summary</div>
										<div style={{ fontSize: 12, color: "#6c757d" }}>
											Calculated quotation totals
										</div>
									</div>
								</div>

								<div
									style={{
										background: "#f8fbfa",
										border: "1px solid #edf3f1",
										borderRadius: 12,
										padding: 14,
									}}
								>
									<div className='qv-summary-row'>
										<div className='qv-summary-label'>Subtotal</div>
										<div className='qv-summary-value'>{totals.subtotal}</div>
									</div>

									<div className='qv-summary-row'>
										<div className='qv-summary-label'>Total Discount</div>
										<div className='qv-summary-value'>
											{totals.totalDiscount}
										</div>
									</div>

									<div className='qv-summary-row mb-0'>
										<div className='qv-summary-label'>Total GST</div>
										<div className='qv-summary-value'>{totals.totalGst}</div>
									</div>
								</div>

								<div
									style={{
										marginTop: 14,
										padding: 16,
										borderRadius: 14,
										background: "linear-gradient(135deg, #f2fbf8 0%, #ffffff 100%)",
										border: "1px solid #dcefeb",
									}}
								>
									<div
										style={{
											fontSize: 12,
											fontWeight: 700,
											color: "#6c757d",
											marginBottom: 6,
											textTransform: "uppercase",
											letterSpacing: "0.4px",
										}}
									>
										Grand Total
									</div>
									<div
										style={{
											fontWeight: 900,
											fontSize: 28,
											color: theme,
											lineHeight: 1.1,
										}}
									>
										₹ {totals.grandTotal}
									</div>
								</div>
							</div>
						</Col>
					</Row>
				)}
			</Card>
		</>
	);
}