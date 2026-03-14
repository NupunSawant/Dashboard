import { useEffect, useMemo, useState } from "react";
import { Alert, Spinner, Button, Dropdown } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../slices/store";
import {
	fetchQuotationsThunk,
	setQuotationStatusThunk,
	requestQuotationToDispatchThunk,
	fetchQuotationRequestsThunk,
	revertQuotationRequestThunk,
} from "../../../slices/orders/Quotation/thunks";
import type {
	Quotation,
	QuotationStatus,
} from "../../../types/Orders/quotation";
import type { Enquiry } from "../../../types/Orders/Enquiry";
import BasicTable from "../../../components/Table/BasicTable";
import { createColumnHelper } from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { canCreate, canUpdate } from "../../../utils/permission";

const theme = "#1a8376";

const statusLabel: Record<QuotationStatus, string> = {
	PENDING: "Pending",
	SEND: "Send",
	WON: "Won",
	LOST: "Lost",
};

const statusBadge: Record<QuotationStatus, { bg: string; text: string }> = {
	PENDING: { bg: "#f5f5f5", text: "#595959" },
	SEND: { bg: "#e6f7ff", text: "#096dd9" },
	WON: { bg: "#f1ffed", text: "#2e8f05" },
	LOST: { bg: "#fff1f0", text: "#cf1322" },
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

const pickQuotationState = (s: any) =>
	s?.orders?.quotation ||
	s?.quotation ||
	s?.Quotation ||
	s?.quotations ||
	s?.quotationSlice ||
	null;

type TabKey = "REQUESTS" | "QUOTATIONS";

export default function QuotationList() {
	const dispatch = useDispatch<AppDispatch>();
	const nav = useNavigate();

	const [activeTab, setActiveTab] = useState<TabKey>("REQUESTS");
	const [updatingId, setUpdatingId] = useState<string>("");
	const [requestingId, setRequestingId] = useState<string>("");
	const [busyId, setBusyId] = useState<string | null>(null);

	const authUser = useSelector((s: RootState) => s.auth.user);
	const allowCreate = canCreate(authUser, "orders", "quotation");
	const allowUpdate = canUpdate(authUser, "orders", "quotation");

	const quotationState = useSelector((s: RootState) => {
		const st = pickQuotationState(s as any);

		return {
			quotations: (st?.quotations ?? []) as Quotation[],
			quotationRequests: (st?.quotationRequests ?? []) as Enquiry[],
			loadingList: !!st?.loadingList,
			saving: !!st?.saving,
			error: (st?.error ?? null) as string | null,
		};
	});

	const { quotations, quotationRequests, loadingList, saving, error } =
		quotationState;

	useEffect(() => {
		dispatch(fetchQuotationsThunk());
		dispatch(fetchQuotationRequestsThunk());
	}, [dispatch]);

	const changeStatus = async (row: any, next: QuotationStatus) => {
		const id = String(row?.id || row?._id || "");
		if (!id) return;

		const current: QuotationStatus = (row?.status as any) || "PENDING";

		if (current === "WON") return;
		if (current === next) return;

		try {
			setUpdatingId(id);

			const res = await dispatch(setQuotationStatusThunk({ id, status: next }));

			if (setQuotationStatusThunk.fulfilled.match(res)) {
				toast.success(`Status updated: ${statusLabel[next] || next}`);
				dispatch(fetchQuotationsThunk());
			} else {
				const msg = String((res as any).payload || "Status update failed");
				toast.error(msg);
			}
		} catch (e: any) {
			toast.error(e?.message || "Status update failed");
		} finally {
			setUpdatingId("");
		}
	};

	const requestToDispatch = async (row: any) => {
		const id = String(row?.id || row?._id || "");
		if (!id) return;

		try {
			setRequestingId(id);

			const res = await dispatch(requestQuotationToDispatchThunk({ id }));

			if (requestQuotationToDispatchThunk.fulfilled.match(res)) {
				toast.success("Sent to Request-to-Dispatch.");
				dispatch(fetchQuotationsThunk());
				dispatch(fetchQuotationRequestsThunk());
			} else {
				const msg = String(
					(res as any).payload || "Request-to-Dispatch failed",
				);
				toast.error(msg);
			}
		} catch (e: any) {
			toast.error(e?.message || "Request-to-Dispatch failed");
		} finally {
			setRequestingId("");
		}
	};

	const revertQuotationRequest = async (row: any) => {
		const enquiryId = String(row?.id || row?._id || "");
		if (!enquiryId) return;

		try {
			setBusyId(enquiryId);
			await dispatch(revertQuotationRequestThunk(enquiryId)).unwrap();
			toast.success("Quotation request reverted to enquiry successfully");
			dispatch(fetchQuotationRequestsThunk());
			dispatch(fetchQuotationsThunk());
		} catch (e: any) {
			toast.error(String(e || "Failed to revert quotation request"));
		} finally {
			setBusyId(null);
		}
	};

	const quotationCol = createColumnHelper<Quotation>();
	const requestCol = createColumnHelper<Enquiry>();

	const quotationColumns = useMemo(
		() => [
			quotationCol.accessor("srNo" as any, {
				header: "Sr. No",
				cell: (i) => i.getValue() ?? "-",
			}),
			quotationCol.accessor("quotationNo" as any, {
				header: "Quotation No",
				cell: (i) => i.getValue() || "-",
			}),
			quotationCol.accessor("enquiryNo" as any, {
				header: "Enquiry No",
				cell: (i) => i.getValue() || "-",
			}),
			quotationCol.accessor("warehouseName" as any, {
				header: "Warehouse",
				cell: (i) => i.getValue() || "-",
			}),
			quotationCol.accessor("customerName" as any, {
				header: "Customer Name",
				cell: (i) => i.getValue() || "-",
			}),
			quotationCol.accessor("status" as any, {
				header: "Status",
				cell: (i) => {
					const row = i.row.original as any;
					const id = String(row?.id || row?._id || "");
					const s: QuotationStatus = ((i.getValue() as any) ||
						"PENDING") as QuotationStatus;

					const locked = s === "WON";
					const busy = !!updatingId && updatingId === id;
					const cfg = statusBadge[s] || statusBadge.PENDING;

					return (
						<div className='d-flex align-items-center gap-2'>
							<>
								<style>{`
									.status-toggle-no-arrow::after {
										display: none !important;
									}
								`}</style>

								<Dropdown
									drop='down'
									style={{ alignItems: "center", justifyContent: "center" }}
								>
									<Dropdown.Toggle
										className='status-toggle-no-arrow'
										size='sm'
										disabled={locked || busy}
										style={{
											width: 90,
											height: 28,
											padding: "2px 8px",
											borderRadius: 8,
											border: "1px solid #e9ebec",
											background: cfg.bg,
											color: cfg.text,
											fontWeight: 700,
											display: "inline-flex",
											alignItems: "center",
											justifyContent: "center",
											gap: 6,
										}}
									>
										<span style={{ whiteSpace: "nowrap" }}>
											{statusLabel[s] || s}
										</span>
									</Dropdown.Toggle>

									<Dropdown.Menu
										align='start'
										style={{
											minWidth: 110,
											padding: 4,
											borderRadius: 10,
											border: "1px solid #e9ebec",
											marginTop: 2,
										}}
									>
										{(
											["PENDING", "SEND", "WON", "LOST"] as QuotationStatus[]
										).map((st) => {
											const c = statusBadge[st] || statusBadge.PENDING;

											return (
												<Dropdown.Item
													key={st}
													active={st === s}
													onClick={() => changeStatus(row, st)}
													style={{
														borderRadius: 6,
														marginBottom: 2,
														padding: "2px 4px",
														background: st === s ? "#f5f7f9" : "transparent",
													}}
												>
													<span
														className='badge'
														style={{
															background: c.bg,
															color: c.text,
															borderRadius: 999,
															padding: "4px 8px",
															fontWeight: 700,
															border: "1px solid #f0f0f0",
															fontSize: 12,
														}}
													>
														{statusLabel[st] || st}
													</span>
												</Dropdown.Item>
											);
										})}
									</Dropdown.Menu>
								</Dropdown>
							</>

							{busy && (
								<Spinner
									size='sm'
									animation='border'
									style={{ color: theme }}
								/>
							)}
						</div>
					);
				},
			}),
			quotationCol.accessor("id" as any, {
				header: "Action",
				enableSorting: false,
				cell: (i) => {
					const row = i.row.original as any;
					const id = String((i.getValue() as any) || row?._id || "");
					const status: QuotationStatus = (row?.status as any) || "PENDING";

					const lockEdit = status === "WON";

					const isDispatchRequested = Boolean(row?.dispatchRequested);
					const isReadyToDispatch = Boolean(row?.readyToDispatch);

					const canShowRequestDispatch =
						status === "WON" &&
						isDispatchRequested === false &&
						isReadyToDispatch === false;

					const busyReq = !!requestingId && requestingId === id;

					return (
						<div className='d-flex gap-2 align-items-center flex-wrap'>
							<Button
								size='sm'
								disabled={!id}
								onClick={() => nav(`/orders/quotations/view/${id}`)}
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

							{allowUpdate && !lockEdit && (
								<Button
									size='sm'
									disabled={!id}
									onClick={() => nav(`/orders/quotations/edit/${id}`)}
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

							{allowUpdate && canShowRequestDispatch && (
								<Button
									size='sm'
									disabled={!id || busyReq}
									onClick={() => requestToDispatch(row)}
									style={{
										background: "#1a8376",
										border: "1px solid #1a8376",
										color: "white",
										borderRadius: "6px",
										padding: "4px 10px",
										display: "inline-flex",
										alignItems: "center",
										gap: 6,
										fontWeight: 600,
										opacity: busyReq ? 0.85 : 1,
										boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
										transition: "background-color 0.2s, color 0.2s",
										whiteSpace: "nowrap",
									}}
									title='Request to Dispatch'
								>
									{busyReq ? (
										<>
											<Spinner size='sm' animation='border' /> Sending...
										</>
									) : (
										<>
											<i className='ri-send-plane-2-line' />
											Request to Dispatch
										</>
									)}
								</Button>
							)}

							{isDispatchRequested && !isReadyToDispatch && (
								<span
									className='badge'
									style={{
										background: "#eaf4f2",
										color: "#1a8376",
										border: "1px solid #b7e0da",
										borderRadius: 999,
										padding: "6px 12px",
										fontWeight: 700,
										display: "inline-flex",
										alignItems: "center",
										gap: 6,
									}}
								>
									<i className='ri-time-line' />
									DISPATCH REQUESTED
								</span>
							)}

							{isReadyToDispatch && (
								<span
									className='badge'
									style={{
										background: "#f6ffed",
										color: "#389e0d",
										border: "1px solid #b7eb8f",
										borderRadius: 999,
										padding: "6px 10px",
										fontWeight: 700,
									}}
								>
									READY TO DISPATCH
								</span>
							)}
						</div>
					);
				},
			}),
		],
		[quotationCol, nav, updatingId, requestingId],
	);

	const requestColumns = useMemo(
		() => [
			requestCol.accessor("srNo" as any, {
				header: "Sr. No",
				cell: (i) => i.getValue() ?? "-",
			}),
			requestCol.accessor("enquiryNo" as any, {
				header: "Enquiry No",
				cell: (i) => i.getValue() || "-",
			}),
			requestCol.accessor("enquiryDate" as any, {
				header: "Enquiry Date",
				cell: (i) => fmtDate(i.getValue()),
			}),
			requestCol.accessor("customerName" as any, {
				header: "Customer Name",
				cell: (i) => i.getValue() || "-",
			}),
			requestCol.accessor("contactPersonPhone" as any, {
				header: "Phone",
				cell: (i) => i.getValue() ?? "-",
			}),
			requestCol.accessor("staffName" as any, {
				header: "Staff",
				cell: (i) => i.getValue() || "-",
			}),
			requestCol.accessor("stage" as any, {
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
			requestCol.accessor("id" as any, {
				header: "Action",
				enableSorting: false,
				cell: (i) => {
					const row = i.row.original as any;
					const enquiryId = String(row?.id || row?._id || "");

					const isBusy = enquiryId && busyId === enquiryId;
					const disabled = !enquiryId || isBusy || saving;

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
							{allowUpdate && (
								<Button
									variant='light'
									size='sm'
									disabled={disabled}
									onClick={() => revertQuotationRequest(row)}
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
							)}

							{allowCreate && (
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
							)}
						</div>
					);
				},
			}),
		],
		[requestCol, nav, busyId, saving],
	);

	return (
		<>
			{error && <Alert variant='danger'>{error}</Alert>}

			<div className='d-flex gap-2 mb-3'>
				<Button
					onClick={() => setActiveTab("REQUESTS")}
					style={{
						background: activeTab === "REQUESTS" ? theme : "#fff",
						color: activeTab === "REQUESTS" ? "#fff" : theme,
						border: `1px solid ${theme}`,
						fontWeight: 600,
					}}
				>
					Quotation Request List
				</Button>

				<Button
					onClick={() => setActiveTab("QUOTATIONS")}
					style={{
						background: activeTab === "QUOTATIONS" ? theme : "#fff",
						color: activeTab === "QUOTATIONS" ? "#fff" : theme,
						border: `1px solid ${theme}`,
						fontWeight: 600,
					}}
				>
					Quotation List
				</Button>
			</div>

			{loadingList ? (
				<div className='d-flex justify-content-center py-5'>
					<Spinner animation='border' style={{ color: theme }} />
				</div>
			) : activeTab === "REQUESTS" ? (
				<>

					<BasicTable
						columns={requestColumns}
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
				</>
			) : (
				<BasicTable
					columns={quotationColumns}
					data={Array.isArray(quotations) ? quotations : []}
					title='Quotations'
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
								onClick={() => dispatch(fetchQuotationsThunk())}
							>
								<i className='ri-refresh-line' /> Refresh
							</Button>
							{allowCreate && (
								<Button
									onClick={() => nav("/orders/quotations/new")}
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
									<i className='ri-add-circle-line' /> Create Quotation
								</Button>
							)}
						</div>
					}
				/>
			)}
		</>
	);
}
