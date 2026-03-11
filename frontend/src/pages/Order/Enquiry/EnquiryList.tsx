// EnquiryListPage.tsx

import { useEffect, useMemo } from "react";
import { Alert, Spinner, Button, Badge } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../slices/store";
import {
	fetchEnquiriesThunk,
	changeEnquiryStageThunk, //   ADD
} from "../../../slices/orders/Enquiry/thunks";
import type { Enquiry } from "../../../types/Orders/Enquiry";
import BasicTable from "../../../components/Table/BasicTable";
import { createColumnHelper } from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify"; //   ADD
import { canCreate, canUpdate } from "../../../utils/permission";

const theme = "#1a8376";

const stageLabel: Record<string, string> = {
	PENDING: "Pending",
	QUOTATION_CREATED: "Quotation",
	REQUEST_FOR_QUOTATION: "RFQ",
	CLOSED: "Closed",
};

const stageBadge: Record<string, { bg: string; text: string }> = {
	PENDING: { bg: "#fff7e6", text: "#ad6800" },
	QUOTATION_CREATED: { bg: "#e6f7ff", text: "#096dd9" },
	REQUEST_FOR_QUOTATION: { bg: "#f9f0ff", text: "#531dab" },
	CLOSED: { bg: "#f6ffed", text: "#389e0d" },
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

export default function EnquiryListPage() {
	const dispatch = useDispatch<AppDispatch>();
	const nav = useNavigate();

	const authUser = useSelector((s: RootState) => s.auth.user);
	const allowCreate = canCreate(authUser, "orders", "enquiry");
	const allowUpdate = canUpdate(authUser, "orders", "enquiry");

	//   safe selector (in case slice key differs)
	const { enquiries, loadingList, error, updating } = useSelector(
		(s: RootState) => {
			const st =
				(s as any).enquiries || (s as any).Enquiries || (s as any).enquiry;
			return {
				enquiries: st?.enquiries ?? [],
				loadingList: !!st?.loadingList,
				error: st?.error ?? null,
				updating: !!st?.updating,
			};
		},
	);

	useEffect(() => {
		dispatch(fetchEnquiriesThunk());
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
			col.accessor("sourceOfEnquiry" as any, {
				header: "Source",
				cell: (i) => i.getValue() || "-",
			}),
			col.accessor("staffName" as any, {
				header: "Staff",
				cell: (i) => i.getValue() || "-",
			}),
			col.accessor("stage" as any, {
				header: "Stage",
				cell: (i) => {
					const s = (i.getValue() as any) || "PENDING";
					const cfg = stageBadge[s] || stageBadge.PENDING;
					return (
						<span
							className='badge'
							style={{
								background: cfg.bg,
								color: cfg.text,
								borderRadius: "999px",
								padding: "6px 10px",
								fontWeight: 600,
								border: "1px solid #f0f0f0",
							}}
						>
							{stageLabel[s] || s}
						</span>
					);
				},
			}),

			//   action column — ALWAYS last
			col.accessor("id" as any, {
				header: "Action",
				enableSorting: false,
				cell: (i) => {
					const row = i.row.original as any;
					const id = (i.getValue() as any) || row?._id;
					const stage = (row?.stage as any) || "PENDING";

					const canSendToRFQ = !!id && stage === "PENDING";

					const onSendToRFQ = async () => {
						if (!id) return;

						try {
							await dispatch(
								changeEnquiryStageThunk({
									id: String(id),
									stage: "REQUEST_FOR_QUOTATION",
								}),
							).unwrap();

							toast.success("Enquiry sent to RFQ");
						} catch (e: any) {
							toast.error(e || "Failed to send to RFQ");
						}
					};

					return (
						<div className='d-flex gap-2'>
							<Button
								size='sm'
								disabled={!id}
								onClick={() => nav(`/orders/enquiries/${id}/view`)}
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
							{allowUpdate && (
								<Button
									size='sm'
									disabled={!id}
									onClick={() => nav(`/orders/enquiries/${id}/edit`)}
									style={{
										background: "#f5f7f9",
										border: "none",
										color: "#4b5563",
										borderRadius: "6px",
										padding: "4px 10px",
									}}
									title='Edit'
								>
									<i className='ri-edit-2-line' />
								</Button>
							)}

							{/*   Send to RFQ */}
							{allowUpdate && (
								<Button
									size='sm'
									disabled={!canSendToRFQ || updating}
									onClick={onSendToRFQ}
									style={{
										background: canSendToRFQ ? theme : "#e9ecef",
										border: "none",
										color: canSendToRFQ ? "#fff" : "#6c757d",
										borderRadius: "6px",
										padding: "4px 10px",
									}}
									title={
										stage === "PENDING"
											? "Send to RFQ"
											: "Only PENDING enquiries can be sent to RFQ"
									}
								>
									<i className='ri-send-plane-2-line' />
								</Button>
							)}
						</div>
					);
				},
			}),
		],
		[col, nav, dispatch, updating],
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
					columns={columns}
					data={Array.isArray(enquiries) ? enquiries : []}
					title='Enquiries'
					rightActions={
						<div className='d-flex gap-2'>
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
									onClick={() => nav("/orders/enquiries/new")}
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
									<i className='ri-add-circle-line' /> Add Enquiry
								</Button>
							)}
						</div>
					}
				/>
			)}
		</>
	);
}
