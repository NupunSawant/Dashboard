import { useEffect, useMemo, useState } from "react";
import {
	Alert,
	Spinner,
	Button,
	Dropdown,
	ButtonGroup,
	Badge,
} from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../slices/store";
import {
	fetchQuotationRequestsThunk,
	revertQuotationRequestThunk,
} from "../../../slices/orders/Quotation/thunks";
import type { Enquiry } from "../../../types/Orders/Enquiry";
import BasicTable from "../../../components/Table/BasicTable";
import { createColumnHelper } from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const theme = "#1a8376";

const fmtDate = (v: any) => {
	if (!v) return "-";
	try {
		const d = new Date(v);
		return isNaN(d.getTime()) ? String(v) : d.toLocaleDateString();
	} catch {
		return String(v);
	}
};

const pickQuotationState = (s: any) =>
	s?.orders?.quotation || s?.quotation || s?.Quotation || s?.quotations || null;

export default function QuotationRequestList() {
	const dispatch = useDispatch<AppDispatch>();
	const nav = useNavigate();

	const [busyId, setBusyId] = useState<string | null>(null);

	//   controls which row dropdown is open
	const [openId, setOpenId] = useState<string | null>(null);

	const quotationRequests = useSelector((s: RootState) => {
		const st = pickQuotationState(s as any);
		return (st?.quotationRequests ?? []) as Enquiry[];
	});
	const loadingList = useSelector((s: RootState) => {
		const st = pickQuotationState(s as any);
		return !!st?.loadingList;
	});
	const saving = useSelector((s: RootState) => {
		const st = pickQuotationState(s as any);
		return !!st?.saving;
	});
	const error = useSelector((s: RootState) => {
		const st = pickQuotationState(s as any);
		return (st?.error ?? null) as string | null;
	});

	useEffect(() => {
		dispatch(fetchQuotationRequestsThunk());
	}, [dispatch]);

	const col = createColumnHelper<Enquiry>();

	const columns = useMemo(
		() => [
			col.accessor("srNo" as any, {
				header: "Sr. No",
				cell: (i) => i.getValue() ?? "-",
			}),
			col.accessor("enquiryNo" as any, {
				header: "Enquiry No",
				cell: (i) => i.getValue() || "-",
			}),
			col.accessor("enquiryDate" as any, {
				header: "Enquiry Date",
				cell: (i) => fmtDate(i.getValue()),
			}),
			col.accessor("customerName" as any, {
				header: "Customer Name",
				cell: (i) => i.getValue() || "-",
			}),
			col.accessor("contactPersonPhone" as any, {
				header: "Phone",
				cell: (i) => i.getValue() ?? "-",
			}),
			col.accessor("staffName" as any, {
				header: "Staff",
				cell: (i) => i.getValue() || "-",
			}),
			col.accessor("stage" as any, {
				header: "Stage",
				cell: () => (
					<span
						className='badge'
						style={{
							background: "#f9f0ff",
							color: "#531dab",
							borderRadius: "999px",
							padding: "6px 10px",
							fontWeight: 600,
							border: "1px solid #f0f0f0",
						}}
					>
						RFQ
					</span>
				),
			}),
			col.accessor("id" as any, {
				header: "Action",
				enableSorting: false,
				cell: (i) => {
					const row = i.row.original as any;
					const enquiryId = String(row?.id || row?._id || "");

					const isBusy = enquiryId && busyId === enquiryId;
					const disabled = !enquiryId || isBusy || saving;

					const show = openId === enquiryId;

					return (
						<div className='d-flex gap-2 justify-content-center'>
							<Button
								size='sm'
								disabled={!enquiryId}
								onClick={() =>
									nav(`/orders/quotation-requests/${enquiryId}/view`)
								}
								style={{
									background: "#eaf4f2",
									border: "none",
									color: theme,
									borderRadius: "6px",
									padding: "4px 10px",
								}}
								title='View'
							>
								<i className='ri-eye-line' />
							</Button>
							<Button
								variant='light'
								size='sm'
								disabled={disabled}
								onClick={async () => {
									if (!enquiryId) return;

									try {
										setBusyId(enquiryId);
										await dispatch(
											revertQuotationRequestThunk(enquiryId),
										).unwrap();
										toast.success(
											"Quotation request reverted to enquiry successfully",
										);
										dispatch(fetchQuotationRequestsThunk());
									} catch (e: any) {
										toast.error(
											String(e || "Failed to revert quotation request"),
										);
									} finally {
										setBusyId(null);
									}
								}}
								style={{
									background: "eaf4f2",
									border: " none",
									color: theme,
									borderRadius: "6px",
									padding: "4px 10px",
								}}
								title='Revert'
							>
								{isBusy ? (
									<Spinner size='sm' animation='border' />
								) : (
									<i className='ri-arrow-go-back-line' />
								)}
							</Button>
							<Button
								variant='light'
								size='sm'
								disabled={disabled}
								onClick={() => {
									if (!enquiryId) return;
									nav(`/orders/quotations/new?enquiryId=${enquiryId}`);
								}}
								style={{
									background: "eaf4f2",
									border: " none",
									color: theme,
									borderRadius: "6px",
									padding: "4px 10px",
								}}
								title='Create Quotation'
							>
								<i className='ri-add-circle-line' />
							</Button>
						</div>
					);
				},
			}),
		],
		[col, nav, busyId, saving, dispatch, openId],
	);

	return (
		<>
			{error && <Alert variant='danger'>{error}</Alert>}

			<div style={{ fontSize: 12, color: "#6c757d", marginBottom: 8 }}>
				RFQ rows in redux: {quotationRequests.length}
			</div>

			{loadingList ? (
				<div className='d-flex justify-content-center py-5'>
					<Spinner animation='border' style={{ color: theme }} />
				</div>
			) : (
				<BasicTable
					columns={columns}
					data={quotationRequests}
					title='Quotation Requests'
					rightActions={
						<div className='d-flex gap-2'>
							<Button
								variant='light'
								onClick={() => dispatch(fetchQuotationRequestsThunk())}
								style={{
									border: "1px solid #e9ebec",
									fontSize: "13px",
									borderRadius: "6px",
									display: "inline-flex",
									alignItems: "center",
									gap: "6px",
								}}
							>
								<i className='ri-refresh-line' /> Refresh
							</Button>

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
								title='Future'
								disabled
							>
								<i className='ri-upload-2-line' /> Export
							</Button>
						</div>
					}
				/>
			)}
		</>
	);
}
