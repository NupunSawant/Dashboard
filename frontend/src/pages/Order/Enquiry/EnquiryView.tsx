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

import { getEnquiryThunk } from "../../../slices/orders/Enquiry/thunks";

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

function stageBadge(stage?: string) {
	const s = String(stage || "PENDING");

	if (s === "REQUEST_FOR_QUOTATION") {
		return (
			<Badge
				bg='warning'
				text='dark'
				style={{ borderRadius: 999, padding: "6px 10px" }}
			>
				Request For Quotation
			</Badge>
		);
	}
	if (s === "QUOTATION_CREATED") {
		return (
			<Badge bg='info' style={{ borderRadius: 999, padding: "6px 10px" }}>
				Quotation Created
			</Badge>
		);
	}
	if (s === "CLOSED") {
		return (
			<Badge bg='secondary' style={{ borderRadius: 999, padding: "6px 10px" }}>
				Closed
			</Badge>
		);
	}
	return (
		<Badge bg='success' style={{ borderRadius: 999, padding: "6px 10px" }}>
			Pending
		</Badge>
	);
}

export default function EnquiryView() {
	const { id } = useParams();
	const dispatch = useDispatch<AppDispatch>();
	const nav = useNavigate();

	//   Your slice is (s as any).enquiries. We'll read common keys safely.
	const enquiriesState = useSelector(
		(s: RootState) => (s as any).enquiries || {},
	);
	const selected = enquiriesState.selected;
	const loadingOne =
		enquiriesState.loadingOne ||
		enquiriesState.loading ||
		enquiriesState.fetchingOne;
	const error = enquiriesState.error;

	useEffect(() => {
		if (id) dispatch(getEnquiryThunk(id));
	}, [dispatch, id]);

	const items = Array.isArray(selected?.items) ? selected.items : [];

	const metrics = useMemo(() => {
		return {
			itemsCount: items.length,
			enquiryDate: fmtDate(selected?.enquiryDate),
			source: selected?.sourceOfEnquiry || "-",
			stage: selected?.stage || "PENDING",
		};
	}, [
		items.length,
		selected?.enquiryDate,
		selected?.sourceOfEnquiry,
		selected?.stage,
	]);

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
		selected.enquiryNo ||
		selected.enquiryNumber ||
		selected.enquiryId ||
		selected._id ||
		"Enquiry";

	const editId = selected.id || selected._id || id;

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
				{/* Header (Enquiry-themed) */}
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
								Orders / Enquiry / Details
							</div>
							<div
								style={{ fontSize: 20, fontWeight: 800, letterSpacing: 0.2 }}
							>
								Enquiry: {viewTitle}
							</div>
						</div>

						<div className='d-flex align-items-center gap-2'>
							{stageBadge(selected.stage)}

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

							<Button
								size='sm'
								onClick={() => nav(`/orders/enquiries/${editId}/edit`)}
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
							<Metric
								label='Items'
								value={metrics.itemsCount}
								icon='ri-list-check-2'
							/>
						</Col>

						<Col md={6} lg={3}>
							<Metric
								label='Stage'
								value={
									selected.stage === "REQUEST_FOR_QUOTATION"
										? "RFQ"
										: selected.stage === "QUOTATION_CREATED"
											? "Quotation"
											: selected.stage === "CLOSED"
												? "Closed"
												: "Pending"
								}
								sub={selected.stage || "PENDING"}
								icon='ri-flag-2-line'
								accentBg='rgba(255,193,7,0.18)'
							/>
						</Col>

						<Col md={6} lg={3}>
							<Metric
								label='Enquiry Date'
								value={metrics.enquiryDate}
								icon='ri-calendar-check-line'
							/>
						</Col>

						<Col md={6} lg={3}>
							<Metric
								label='Source'
								value={metrics.source}
								icon='ri-radar-line'
								accentBg='rgba(40,167,69,0.16)'
							/>
						</Col>
					</Row>

					{/* Enquiry Details */}
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
								<i className='ri-clipboard-line' />
							</div>
							<div style={{ fontSize: 13, color: "#6c757d" }}>
								<b style={{ color: "#212529" }}>Enquiry Snapshot:</b> customer +
								items requirement + stage tracking
							</div>
						</div>

						{stageBadge(selected.stage)}
					</div>

					{/* Customer / Staff Grid */}
					<Row className='g-3 mb-3'>
						<Col md={6} lg={4}>
							<Field
								label='Customer Name'
								value={selected.customerName || "-"}
							/>
						</Col>

						<Col md={6} lg={4}>
							<Field
								label='Contact Person'
								value={selected.contactPersonName || "-"}
							/>
						</Col>

						<Col md={6} lg={4}>
							<Field
								label='Contact Phone'
								value={
									selected.contactPersonPhone !== null &&
									selected.contactPersonPhone !== undefined
										? String(selected.contactPersonPhone)
										: "-"
								}
							/>
						</Col>

						<Col md={6} lg={4}>
							<Field label='Staff Name' value={selected.staffName || "-"} />
						</Col>

						<Col md={6} lg={4}>
							<Field label='Stage' value={stageBadge(selected.stage)} />
						</Col>

						<Col md={6} lg={4}>
							<Field
								label='Source Of Enquiry'
								value={selected.sourceOfEnquiry || "-"}
							/>
						</Col>

						<Col md={12}>
							<Field label='Remarks' value={selected.remarks || "-"} />
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
								<div style={{ fontWeight: 800 }}>Requested Items</div>
							</div>

							<Badge
								bg='secondary'
								style={{ borderRadius: 999, padding: "6px 10px" }}
							>
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
										<th>Remark</th>
									</tr>
								</thead>

								<tbody>
									{items.length === 0 ? (
										<tr>
											<td
												colSpan={7}
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
												<td style={{ minWidth: 220 }}>
													{it?.itemsRemark || "-"}
												</td>
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
