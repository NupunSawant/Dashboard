// EnquiryListPage.tsx

import { useEffect, useMemo, useState } from "react";
import { Alert, Spinner, Button } from "react-bootstrap";
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
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";

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
	const enquiryState = useSelector(
		(s: RootState) =>
			(s as any).enquiries || (s as any).Enquiries || (s as any).enquiry,
	);

	const enquiries = enquiryState?.enquiries ?? [];
	const loadingList = enquiryState?.loadingList ?? false;
	const error = enquiryState?.error ?? null;
	const updating = enquiryState?.updating ?? false;

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
					const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

					const open = Boolean(anchorEl);
					const menuItemStyle = {
						fontSize: "14px",
						borderRadius: "6px",
						display: "flex",
						alignItems: "center",
						gap: "10px",
						padding: "8px 12px",
						minHeight: "36px",
						fontWeight: 500,

						"& i": {
							fontSize: "18px",
							width: "18px",
							textAlign: "center",
						},

						"&:hover": {
							background: "#f5f7f9",
						},

						"&.Mui-disabled": {
							opacity: 0.5,
						},
					};

					return (
						<>
							<IconButton
								size='small'
								onClick={(e) => setAnchorEl(e.currentTarget)}
								sx={{
									color: theme,
									background: "#edf6f5",
									borderRadius: "8px",
									width: 32,
									height: 32,
									transition: "all .15s ease",
									"&:hover": {
										background: "#dff1ef",
									},
								}}
							>
								<i className='ri-more-2-fill' style={{ fontSize: 18 }} />
							</IconButton>

							<Menu
								anchorEl={anchorEl}
								open={open}
								disableScrollLock
								onClose={() => setAnchorEl(null)}
								anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
								transformOrigin={{ vertical: "top", horizontal: "right" }}
								PaperProps={{
									sx: {
										borderRadius: "10px",
										boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
										minWidth: 200,
										padding: "4px",
										border: "1px solid #f1f1f1",
									},
								}}
							>
								{" "}
								<MenuItem
									sx={{ ...menuItemStyle, color: theme }}
									disabled={!id}
									onClick={() => nav(`/orders/enquiries/${id}/view`)}
									title='View'
								>
									<i className='ri-eye-line' />
									View
								</MenuItem>
								<Divider variant='middle' component='li' flexItem={true} />
								{allowUpdate && (
									<MenuItem
										sx={{ ...menuItemStyle, color: "#4b5563" }}
										disabled={!id}
										onClick={() => nav(`/orders/enquiries/${id}/edit`)}
										title='Edit'
									>
										<i className='ri-edit-2-line' />
										Edit
									</MenuItem>
								)}
								<Divider variant='middle' component='li' flexItem={true} />
								{/*   Send to RFQ */}
								{allowUpdate && (
									<MenuItem
										sx={{
											...menuItemStyle,
											color: canSendToRFQ ? "#fff" : "#6c757d",
										}}
										disabled={!canSendToRFQ || updating}
										onClick={onSendToRFQ}
										title={
											stage === "PENDING"
												? "Send to RFQ"
												: "Only PENDING enquiries can be sent to RFQ"
										}
									>
										<i className='ri-send-plane-2-line' />
										Send to RFQ
									</MenuItem>
								)}
							</Menu>
						</>
					);
				},
			}),
		],
		[col, nav, dispatch, updating],
	);

	const handleExport = () => {
		if (!enquiries || enquiries.length === 0) return;

		const rows = enquiries.map((row: any) => ({
			"Enquiry No": row.enquiryNo,
			"Enquiry Date": fmtDate(row.enquiryDate),
			"Customer Name": row.customerName,
			Phone: row.contactPersonPhone ?? "",
			Source: row.sourceOfEnquiry ?? "",
			Staff: row.staffName ?? "",
			Stage: stageLabel[row.stage] || row.stage,
		}));

		const headers = Object.keys(rows[0]);

		const csv =
			headers.join(",") +
			"\n" +
			rows
				.map((r: { [x: string]: any }) => headers.map((h) => r[h]).join(","))
				.join("\n");

		const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
		const url = URL.createObjectURL(blob);

		const link = document.createElement("a");
		link.href = url;
		link.download = "enquiries.csv";

		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

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
								onClick={handleExport}
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
