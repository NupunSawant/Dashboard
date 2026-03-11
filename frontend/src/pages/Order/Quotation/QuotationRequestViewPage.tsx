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
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../../slices/store";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

//   enquiry fetch (RFQ row is basically enquiry)
import { getEnquiryThunk } from "../../../slices/orders/Enquiry/thunks";

//   revert thunk is in quotation slice in your code
import {
	revertQuotationRequestThunk,
	fetchQuotationRequestsThunk,
} from "../../../slices/orders/Quotation/thunks";

const theme = "#1a8376";

const fmtDate = (v: any) => {
	if (!v) return "-";
	try {
		const d = new Date(v);
		return isNaN(d.getTime()) ? String(v) : d.toISOString().slice(0, 10);
	} catch {
		return String(v);
	}
};

export default function QuotationRequestViewPage() {
	const dispatch = useDispatch<AppDispatch>();
	const nav = useNavigate();
	const { id } = useParams(); // this is enquiryId

	const [loading, setLoading] = useState(true);
	const [apiError, setApiError] = useState<string | null>(null);
	const [busy, setBusy] = useState(false);

	const [enquiry, setEnquiry] = useState<any>(null);

	useEffect(() => {
		if (!id) {
			setApiError("Invalid enquiry id");
			setLoading(false);
			return;
		}

		(async () => {
			setLoading(true);
			setApiError(null);

			const res = await dispatch(getEnquiryThunk(id));
			if (getEnquiryThunk.fulfilled.match(res)) {
				setEnquiry(res.payload as any);
			} else {
				setApiError(String(res.payload || "Failed to load quotation request"));
			}

			setLoading(false);
		})();
	}, [dispatch, id]);

	const items = useMemo(() => {
		const arr = enquiry?.items;
		return Array.isArray(arr) ? arr : [];
	}, [enquiry]);

	return (
		<Card
			className='p-3'
			style={{ border: "1px solid #e9ebec", borderRadius: "10px" }}
		>
			{/* Header */}
			<div className='d-flex justify-content-between align-items-center mb-3'>
				<div>
					<h5 className='m-0'>Quotation Request (RFQ) View</h5>
					<div style={{ fontSize: 13, color: "#6c757d", marginTop: 2 }}>
						Enquiry moved to RFQ stage (Quotation Request)
					</div>
				</div>

				<div className='d-flex gap-2'>
					<Button
						variant='light'
						size='sm'
						onClick={() => nav("/orders/quotations")}
						style={{
							border: "1px solid #e9ebec",
							fontSize: "13px",
							borderRadius: "6px",
							display: "inline-flex",
							alignItems: "center",
							gap: "6px",
						}}
					>
						<i className='ri-arrow-left-line' /> Back
					</Button>

					<Button
						size='sm'
						disabled={!id || busy}
						onClick={() => {
							if (!id) return;
							nav(`/orders/quotations/new?enquiryId=${id}`);
						}}
						style={{
							background: theme,
							border: "none",
							borderRadius: "6px",
							fontSize: "13px",
							display: "inline-flex",
							alignItems: "center",
							gap: "6px",
						}}
						title='Create Quotation'
					>
						<i className='ri-add-circle-line' /> Create Quotation
					</Button>

					<Button
						variant='light'
						size='sm'
						disabled={!id || busy}
						onClick={async () => {
							if (!id) return;

							try {
								setBusy(true);
								await dispatch(revertQuotationRequestThunk(id)).unwrap();
								toast.success(
									"Quotation request reverted to enquiry successfully",
								);
								dispatch(fetchQuotationRequestsThunk());
								nav("/orders/quotations", { replace: true });
							} catch (e: any) {
								toast.error(String(e || "Failed to revert quotation request"));
							} finally {
								setBusy(false);
							}
						}}
						style={{
							border: "1px solid #e9ebec",
							fontSize: "13px",
							borderRadius: "6px",
							display: "inline-flex",
							alignItems: "center",
							gap: "6px",
						}}
						title='Revert RFQ'
					>
						{busy ? (
							<Spinner size='sm' animation='border' />
						) : (
							<i className='ri-arrow-go-back-line' />
						)}
						<span style={{ marginLeft: 6 }}>Revert</span>
					</Button>
				</div>
			</div>

			{apiError && <Alert variant='danger'>{apiError}</Alert>}

			{loading ? (
				<div className='d-flex justify-content-center py-5'>
					<Spinner animation='border' style={{ color: theme }} />
				</div>
			) : !enquiry ? (
				<Alert variant='warning'>No data found.</Alert>
			) : (
				<Row className='g-3'>
					{/* LEFT */}
					<Col lg={8}>
						{/* ===== Enquiry Details (RFQ) ===== */}
						<div
							className='p-3 mb-3'
							style={{
								background: "#f8fbfa",
								border: "1px solid #eef2f1",
								borderRadius: 10,
							}}
						>
							<div className='d-flex align-items-center justify-content-between mb-2'>
								<div className='d-flex align-items-center gap-2'>
									<i className='ri-file-list-3-line' style={{ color: theme }} />
									<div style={{ fontWeight: 700 }}>Request Details</div>
								</div>

								<span
									className='badge'
									style={{
										background: "#f9f0ff",
										color: "#531dab",
										borderRadius: "999px",
										padding: "6px 10px",
										fontWeight: 700,
										border: "1px solid #f0f0f0",
									}}
								>
									RFQ
								</span>
							</div>

							<Row className='g-3'>
								<Col md={4}>
									<div style={{ fontSize: 12, color: "#6c757d" }}>
										Enquiry No
									</div>
									<div style={{ fontWeight: 700 }}>
										{enquiry.enquiryNo || "-"}
									</div>
								</Col>

								<Col md={4}>
									<div style={{ fontSize: 12, color: "#6c757d" }}>
										Enquiry Date
									</div>
									<div style={{ fontWeight: 700 }}>
										{fmtDate(enquiry.enquiryDate || enquiry.enquireDate)}
									</div>
								</Col>

								<Col md={4}>
									<div style={{ fontSize: 12, color: "#6c757d" }}>Staff</div>
									<div style={{ fontWeight: 700 }}>
										{enquiry.staffName || "-"}
									</div>
								</Col>

								<Col md={6}>
									<div style={{ fontSize: 12, color: "#6c757d" }}>
										Customer Name
									</div>
									<div style={{ fontWeight: 700 }}>
										{enquiry.customerName || "-"}
									</div>
								</Col>

								<Col md={3}>
									<div style={{ fontSize: 12, color: "#6c757d" }}>
										Contact Person
									</div>
									<div style={{ fontWeight: 700 }}>
										{enquiry.contactPersonName || "-"}
									</div>
								</Col>

								<Col md={3}>
									<div style={{ fontSize: 12, color: "#6c757d" }}>Phone</div>
									<div style={{ fontWeight: 700 }}>
										{enquiry.contactPersonPhone ?? enquiry.phoneNumber ?? "-"}
									</div>
								</Col>

								<Col md={6}>
									<div style={{ fontSize: 12, color: "#6c757d" }}>Source</div>
									<div style={{ fontWeight: 700 }}>
										{enquiry.sourceOfEnquiry || enquiry.source || "-"}
									</div>
								</Col>

								<Col md={6}>
									<div style={{ fontSize: 12, color: "#6c757d" }}>Stage</div>
									<div style={{ fontWeight: 700 }}>
										{String(enquiry.stage || "REQUEST_FOR_QUOTATION")}
									</div>
								</Col>

								<Col md={12}>
									<div style={{ fontSize: 12, color: "#6c757d" }}>Remarks</div>
									<div style={{ fontWeight: 700 }}>
										{enquiry.remarks || enquiry.remark || "-"}
									</div>
								</Col>
							</Row>
						</div>

						{/* ===== Items (same as enquiry items) ===== */}
						<div
							className='p-3'
							style={{
								background: "#ffffff",
								border: "1px solid #eef2f1",
								borderRadius: 10,
							}}
						>
							<div className='d-flex align-items-center gap-2 mb-3'>
								<i className='ri-box-3-line' style={{ color: theme }} />
								<div style={{ fontWeight: 700 }}>Requested Items</div>
								<Badge
									bg='light'
									text='dark'
									style={{ border: "1px solid #e9ebec" }}
								>
									{items.length}
								</Badge>
							</div>

							<div className='table-responsive'>
								<Table bordered hover size='sm' className='align-middle'>
									<thead style={{ background: "#f8fbfa" }}>
										<tr>
											<th style={{ minWidth: 160 }}>Category</th>
											<th style={{ minWidth: 180 }}>Sub Category</th>
											<th style={{ minWidth: 220 }}>Item</th>
											<th style={{ minWidth: 110 }}>Code</th>
											<th style={{ minWidth: 90 }}>Unit</th>
											<th style={{ minWidth: 240 }}>Remark</th>
										</tr>
									</thead>

									<tbody>
										{items.length === 0 ? (
											<tr>
												<td colSpan={6} className='text-center py-4 text-muted'>
													No items found.
												</td>
											</tr>
										) : (
											items.map((r: any, idx: number) => (
												<tr key={idx}>
													<td>{r.itemsCategory || "-"}</td>
													<td>{r.itemsSubCategory || "-"}</td>
													<td>{r.itemsName || "-"}</td>
													<td>{r.itemsCode || "-"}</td>
													<td>{r.itemsUnit || "-"}</td>
													<td>{r.itemsRemark || "-"}</td>
												</tr>
											))
										)}
									</tbody>
								</Table>
							</div>

							<div style={{ fontSize: 12, color: "#6c757d" }}>
								This is a read-only RFQ view. Click <b>Create Quotation</b> to
								open the Quotation Upsert page with enquiry prefilled.
							</div>
						</div>
					</Col>

					{/* RIGHT */}
					<Col lg={4}>
						<div
							className='p-3'
							style={{
								background: "#ffffff",
								border: "1px solid #eef2f1",
								borderRadius: 10,
								position: "sticky",
								top: 12,
							}}
						>
							<div className='d-flex align-items-center gap-2 mb-3'>
								<i className='ri-information-line' style={{ color: theme }} />
								<div style={{ fontWeight: 700 }}>Info</div>
							</div>

							<div className='d-flex justify-content-between mb-2'>
								<div style={{ color: "#6c757d" }}>Enquiry ID</div>
								<div style={{ fontWeight: 700 }}>
									{String(enquiry._id || enquiry.id || "-")}
								</div>
							</div>

							<div className='d-flex justify-content-between mb-2'>
								<div style={{ color: "#6c757d" }}>Items Count</div>
								<div style={{ fontWeight: 700 }}>{items.length}</div>
							</div>

							<hr />

							<div style={{ fontSize: 12, color: "#6c757d" }}>
								Actions:
								<div>
									• Create Quotation: opens quotation form with items + customer
									prefilled
								</div>
								<div>
									• Revert: moves enquiry back from RFQ to previous stage
								</div>
							</div>
						</div>
					</Col>
				</Row>
			)}
		</Card>
	);
}
