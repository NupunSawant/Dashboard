import { useEffect, useMemo } from "react";
import {
	Card,
	Spinner,
	Alert,
	Row,
	Col,
	Button,
	Badge,
	Table,
} from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import type { AppDispatch, RootState } from "../../../slices/store";

import { fetchDispatchByIdThunk } from "../../../slices/Warehouse/Dispatch/thunks";

const theme = "#1a8376";

const Field = ({ label, value }: { label: string; value: any }) => (
	<div
		style={{
			border: "1px solid #eef2f6",
			borderRadius: 12,
			padding: "12px 14px",
			background: "#ffffff",
			boxShadow: "0 1px 0 rgba(0,0,0,0.02)",
			height: "100%",
		}}
	>
		<div style={{ fontSize: 12, color: "#6c757d", marginBottom: 6 }}>
			{label}
		</div>
		<div style={{ fontWeight: 700, color: "#212529" }}>{value ?? "-"}</div>
	</div>
);

const Metric = ({
	label,
	value,
	sub,
	icon,
	accentBg = "rgba(26,131,118,0.12)",
}: {
	label: string;
	value: any;
	sub?: string;
	icon: string;
	accentBg?: string;
}) => (
	<div
		style={{
			background: "#fff",
			border: "1px solid #eef2f6",
			borderRadius: 14,
			padding: 14,
			display: "flex",
			alignItems: "center",
			gap: 12,
			minHeight: 78,
		}}
	>
		<div
			style={{
				width: 44,
				height: 44,
				borderRadius: 12,
				background: accentBg,
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				color: theme,
				fontSize: 20,
				flex: "0 0 auto",
			}}
		>
			<i className={icon} />
		</div>
		<div style={{ minWidth: 0 }}>
			<div style={{ fontSize: 12, color: "#6c757d" }}>{label}</div>
			<div style={{ fontWeight: 900, fontSize: 16, lineHeight: 1.15 }}>
				{value ?? "-"}{" "}
				{sub ? (
					<span style={{ fontWeight: 600, color: "#6c757d", fontSize: 12 }}>
						{sub}
					</span>
				) : null}
			</div>
		</div>
	</div>
);

function fmtDate(d: any) {
	if (!d) return "-";
	try {
		return new Date(d).toISOString().slice(0, 10);
	} catch {
		return String(d);
	}
}

const round2 = (n: any) => {
	const x = Number(n || 0);
	return Math.round(x * 100) / 100;
};

function dispatchTypeBadge(t?: string) {
	const s = String(t || "ORDER").toUpperCase();

	if (s === "ORDER") {
		return (
			<Badge
				bg='info'
				style={{ borderRadius: 999, padding: "6px 10px" }}
			>
				ORDER
			</Badge>
		);
	}

	return (
		<Badge bg='secondary' style={{ borderRadius: 999, padding: "6px 10px" }}>
			{s}
		</Badge>
	);
}

export default function DispatchViewPage() {
	const { id } = useParams();
	const dispatch = useDispatch<AppDispatch>();
	const nav = useNavigate();

	const dispatchState = useSelector(
		(s: RootState) => (s as any).warehouseDispatch || {},
	);

	const selected = dispatchState.selected;
	const loadingOne = !!dispatchState.loadingOne;
	const error = dispatchState.error;

	useEffect(() => {
		if (id) dispatch(fetchDispatchByIdThunk(id));
	}, [dispatch, id]);

	const items = Array.isArray(selected?.items) ? selected.items : [];

	const metrics = useMemo(() => {
		const totals = selected?.totals || {};
		return {
			itemsCount: items.length,
			dispatchDate: fmtDate(selected?.dispatchDate),
			dispatchType: selected?.dispatchType || "ORDER",
			grandTotal:
				totals?.grandTotal !== undefined ? round2(totals.grandTotal) : null,
		};
	}, [items.length, selected?.dispatchDate, selected?.dispatchType, selected?.totals]);

	if (loadingOne) {
		return (
			<div
				className='d-flex justify-content-center align-items-center'
				style={{ minHeight: 240 }}
			>
				<Spinner animation='border' style={{ color: theme }} />
			</div>
		);
	}

	if (error) return <Alert variant='danger'>{String(error)}</Alert>;
	if (!selected) return null;

	const viewTitle =
		selected.dispatchNo ||
		selected.dispatchNumber ||
		selected.dispatchId ||
		selected._id ||
		selected.id ||
		"Dispatch";

	const editId = selected.id || selected._id || id;

	const totals = selected?.totals || {};

	return (
		<div style={{ maxWidth: 1100, margin: "0 auto" }}>
			<Card
				style={{
					borderRadius: 14,
					border: "1px solid #e9ebec",
					overflow: "hidden",
					boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
				}}
			>
				{/* Header (Dispatch-themed) */}
				<div
					style={{
						background: `linear-gradient(90deg, ${theme} 0%, #20a694 100%)`,
						color: "white",
						padding: "18px 20px",
					}}
				>
					<div className='d-flex justify-content-between align-items-center flex-wrap gap-2'>
						<div>
							<div style={{ fontSize: 12, opacity: 0.9, marginBottom: 4 }}>
								Warehouses / Dispatch / Details
							</div>
							<div style={{ fontSize: 20, fontWeight: 800, letterSpacing: 0.2 }}>
								Dispatch: {viewTitle}
							</div>
						</div>

						<div className='d-flex align-items-center gap-2'>
							{dispatchTypeBadge(selected.dispatchType)}

							<Button
								size='sm'
								onClick={() => nav(-1)}
								style={{
									background: "rgba(255,255,255,0.16)",
									border: "1px solid rgba(255,255,255,0.28)",
									borderRadius: 10,
									fontWeight: 700,
									color: "white",
									display: "inline-flex",
									alignItems: "center",
									gap: 8,
								}}
							>
								<i className='ri-arrow-left-line' /> Back
							</Button>

							{/* Edit route is optional (you can enable when you add route) */}
							<Button
								size='sm'
								onClick={() => nav(`/warehouses/dispatch/${editId}/edit`)}
								style={{
									background: "rgba(255,255,255,0.16)",
									border: "1px solid rgba(255,255,255,0.28)",
									borderRadius: 10,
									fontWeight: 700,
									color: "white",
									display: "inline-flex",
									alignItems: "center",
									gap: 8,
								}}
							>
								<i className='ri-edit-line' /> Edit
							</Button>
						</div>
					</div>
				</div>

				<Card.Body style={{ background: "#f7fbfa", padding: 18 }}>
					{/* Top Summary Metrics */}
					<Row className='g-3 mb-3'>
						<Col md={6} lg={3}>
							<Metric label='Items' value={metrics.itemsCount} icon='ri-list-check-2' />
						</Col>

						<Col md={6} lg={3}>
							<Metric
								label='Dispatch Type'
								value={metrics.dispatchType}
								sub={selected.dispatchType || "ORDER"}
								icon='ri-truck-line'
								accentBg='rgba(13,202,240,0.18)'
							/>
						</Col>

						<Col md={6} lg={3}>
							<Metric
								label='Dispatch Date'
								value={metrics.dispatchDate}
								icon='ri-calendar-check-line'
							/>
						</Col>

						<Col md={6} lg={3}>
							<Metric
								label='Grand Total'
								value={metrics.grandTotal !== null ? metrics.grandTotal : "-"}
								sub={metrics.grandTotal !== null ? "₹" : undefined}
								icon='ri-money-rupee-circle-line'
								accentBg='rgba(40,167,69,0.16)'
							/>
						</Col>
					</Row>

					{/* Dispatch Snapshot */}
					<div
						style={{
							background: "#ffffff",
							border: "1px solid #eef2f6",
							borderRadius: 14,
							padding: 12,
							marginBottom: 14,
							display: "flex",
							alignItems: "center",
							justifyContent: "space-between",
							gap: 12,
							flexWrap: "wrap",
						}}
					>
						<div className='d-flex align-items-center gap-2'>
							<div
								style={{
									width: 36,
									height: 36,
									borderRadius: 10,
									background: "rgba(26,131,118,0.12)",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									color: theme,
									fontSize: 18,
								}}
							>
								<i className='ri-file-list-3-line' />
							</div>
							<div style={{ fontSize: 13, color: "#6c757d" }}>
								<b style={{ color: "#212529" }}>Dispatch Snapshot:</b> order + customer + items + totals
							</div>
						</div>

						{dispatchTypeBadge(selected.dispatchType)}
					</div>

					{/* Dispatch / Customer Grid */}
					<Row className='g-3 mb-3'>
						<Col md={6} lg={4}>
							<Field label='Order No' value={selected.orderNo || "-"} />
						</Col>

						<Col md={6} lg={4}>
							<Field label='Dispatch Date' value={fmtDate(selected.dispatchDate)} />
						</Col>

						<Col md={6} lg={4}>
							<Field label='Dispatch Type' value={dispatchTypeBadge(selected.dispatchType)} />
						</Col>

						<Col md={6} lg={4}>
							<Field
								label='Issued From Warehouse'
								value={selected.issuedFromWarehouseName || "-"}
							/>
						</Col>

						<Col md={6} lg={4}>
							<Field label='Dispatched By' value={selected.dispatchedBy || "-"} />
						</Col>

						<Col md={6} lg={4}>
							<Field label='Invoice No' value={selected.invoiceNo || "-"} />
						</Col>

						<Col md={12}>
							<Field label='Remark' value={selected.remark || "-"} />
						</Col>

						{/* Customer */}
						<Col md={6} lg={4}>
							<Field label='Customer Name' value={selected.customerName || "-"} />
						</Col>

						<Col md={6} lg={4}>
							<Field
								label='Customer Name for Transport'
								value={selected.customerNameForTransport || "-"}
							/>
						</Col>

						<Col md={6} lg={4}>
							<Field label='Transporter Name' value={selected.transporterName || "-"} />
						</Col>

						<Col md={6} lg={4}>
							<Field label='Contact Person' value={selected.contactPerson || "-"} />
						</Col>

						<Col md={6} lg={4}>
							<Field
								label='Contact Number'
								value={
									selected.contactNumber !== null && selected.contactNumber !== undefined
										? String(selected.contactNumber)
										: "-"
								}
							/>
						</Col>

						<Col md={12}>
							<Field label='Address' value={selected.address || "-"} />
						</Col>

						<Col md={4}>
							<Field label='City' value={selected.city || "-"} />
						</Col>

						<Col md={4}>
							<Field label='State' value={selected.state || "-"} />
						</Col>

						<Col md={4}>
							<Field label='Pincode' value={selected.pincode || "-"} />
						</Col>

						{/* Totals */}
						<Col md={6} lg={3}>
							<Field
								label='Subtotal'
								value={
									totals?.subtotal !== null && totals?.subtotal !== undefined
										? round2(totals.subtotal)
										: "-"
								}
							/>
						</Col>

						<Col md={6} lg={3}>
							<Field
								label='Total Discount'
								value={
									totals?.totalDiscount !== null && totals?.totalDiscount !== undefined
										? round2(totals.totalDiscount)
										: "-"
								}
							/>
						</Col>

						<Col md={6} lg={3}>
							<Field
								label='Total GST'
								value={
									totals?.totalGst !== null && totals?.totalGst !== undefined
										? round2(totals.totalGst)
										: "-"
								}
							/>
						</Col>

						<Col md={6} lg={3}>
							<Field
								label='Grand Total'
								value={
									totals?.grandTotal !== null && totals?.grandTotal !== undefined
										? round2(totals.grandTotal)
										: "-"
								}
							/>
						</Col>
					</Row>

					{/* Items Table */}
					<div
						style={{
							background: "#ffffff",
							border: "1px solid #eef2f6",
							borderRadius: 14,
							padding: 12,
						}}
					>
						<div className='d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2'>
							<div className='d-flex align-items-center gap-2'>
								<div
									style={{
										width: 36,
										height: 36,
										borderRadius: 10,
										background: "rgba(26,131,118,0.12)",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										color: theme,
										fontSize: 18,
									}}
								>
									<i className='ri-shopping-bag-3-line' />
								</div>
								<div style={{ fontWeight: 800 }}>Dispatch Items</div>
							</div>

							<Badge bg='secondary' style={{ borderRadius: 999, padding: "6px 10px" }}>
								{items.length} item(s)
							</Badge>
						</div>

						<div style={{ overflowX: "auto" }}>
							<Table hover responsive className='align-middle mb-0'>
								<thead style={{ background: "#f8fbfa" }}>
									<tr>
										<th>#</th>
										<th>Category</th>
										<th>Sub Category</th>
										<th>Item Name</th>
										<th>Item Code</th>
										<th>Unit</th>
										<th>Order Qty</th>
										<th>Dispatch Qty</th>
										<th>Rate</th>
										<th>Disc %</th>
										<th>GST %</th>
										<th>Total</th>
										<th>Remark</th>
									</tr>
								</thead>

								<tbody>
									{items.length === 0 ? (
										<tr>
											<td
												colSpan={13}
												className='text-center py-4'
												style={{ color: "#6c757d" }}
											>
												No items found.
											</td>
										</tr>
									) : (
										items.map((it: any, idx: number) => (
											<tr key={idx}>
												<td>{idx + 1}</td>
												<td>{it?.itemsCategory || "-"}</td>
												<td>{it?.itemsSubCategory || "-"}</td>
												<td>{it?.itemsName || "-"}</td>
												<td>{it?.itemsCode || "-"}</td>
												<td>{it?.itemsUnit || "-"}</td>
												<td>{it?.orderQuantity ?? "-"}</td>
												<td>{it?.dispatchQuantity ?? "-"}</td>
												<td>{it?.rate ?? "-"}</td>
												<td>{it?.discountPercent ?? "-"}</td>
												<td>{it?.gstRate ?? "-"}</td>
												<td>{it?.totalAmount ?? "-"}</td>
												<td style={{ minWidth: 220 }}>{it?.remark || "-"}</td>
											</tr>
										))
									)}
								</tbody>
							</Table>
						</div>
					</div>

					{/* Footer Actions */}
					<div
						className='d-flex justify-content-end gap-2 mt-4'
						style={{ paddingTop: 14, borderTop: "1px solid #e9ebec" }}
					>
						<Button
							variant='light'
							onClick={() => nav(-1)}
							style={{
								border: "1px solid #e9ebec",
								borderRadius: 10,
								fontWeight: 700,
							}}
						>
							<i className='ri-arrow-left-line' /> Back
						</Button>
					</div>
				</Card.Body>
			</Card>
		</div>
	);
}