import { useEffect, useMemo, useState } from "react";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import { Alert, Spinner, Button } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../slices/store";
import BasicTable from "../../../components/Table/BasicTable";
import { createColumnHelper } from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { canCreate, canUpdate } from "../../../utils/permission";

import {
	fetchReadyToDispatchThunk,
	fetchDispatchesThunk,
	deliverDispatchThunk,
	revertReadyDispatchThunk,
} from "../../../slices/Warehouse/Dispatch/thunks";
import { changeOrderStatusThunk } from "../../../slices/orders/thunks";

import type {
	ReadyToDispatchOrder,
	Dispatch as DispatchType,
} from "../../../types/Warehouses/dispatch";

import {
	fetchStockTransfersThunk,
	revertStockTransferThunk,
} from "../../../slices/Warehouse/Stocktransfer/thunks";
import type { StockTransfer } from "../../../types/Warehouses/stocktransfer";

import {
	fetchIssueToLaboursThunk,
	revertIssueToLabourThunk,
} from "../../../slices/Warehouse/IssueToLabour/thunks";
import type { IssueToLabour } from "../../../types/Warehouses/issueToLabour";

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

const pickId = (x: any) => String(x?.id || x?._id || "").trim();

const pickName = (val: any): string => {
	if (!val) return "";
	if (typeof val === "object") {
		return (
			`${val.firstName || ""} ${val.lastName || ""}`.trim() ||
			String(val._id || val)
		);
	}
	return String(val);
};

const escapeCsvValue = (value: any) => {
	if (value === null || value === undefined) return "";
	const str = String(value).replace(/"/g, '""');
	return `"${str}"`;
};

const downloadCsv = (fileName: string, headers: string[], rows: any[][]) => {
	if (!rows.length) {
		toast.info("No data available to export");
		return;
	}

	const csvContent = [
		headers.map(escapeCsvValue).join(","),
		...rows.map((row) => row.map(escapeCsvValue).join(",")),
	].join("\n");

	const blob = new Blob([csvContent], {
		type: "text/csv;charset=utf-8;",
	});

	const url = window.URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.setAttribute("download", fileName);
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	window.URL.revokeObjectURL(url);
};

const orderStatusLabel = (status?: string) => {
	const s = String(status || "PENDING");
	const map: Record<string, string> = {
		PENDING: "Pending",
		REQUESTED_FOR_DISPATCH: "Requested For Dispatch",
		DISPATCHED: "Dispatched",
		DELIVERED: "Delivered",
		CANCELLED: "Cancelled",
		WON: "Won",
	};
	return map[s] || s;
};

const dispatchStatusLabel = (status?: string) => {
	const s = String(status || "PENDING");
	const map: Record<string, string> = {
		PENDING: "Pending",
		DELIVERED: "Delivered",
		CREATED: "Created",
		DISPATCHED: "Dispatched",
		CANCELLED: "Cancelled",
	};
	return map[s] || s;
};

const returnStatusLabel = (status?: string) => {
	const s = String(status || "NOT_RETURNED").toUpperCase();
	const map: Record<string, string> = {
		NOT_RETURNED: "Not Returned",
		PARTIALLY_RETURNED: "Partially Returned",
		FULLY_RETURNED: "Fully Returned",
	};
	return map[s] || s;
};

const labourStatusLabel = (status?: string) => {
	const s = String(status || "ISSUED").toUpperCase();
	const map: Record<string, string> = {
		ISSUED: "Issued",
		COMPLETED: "Completed",
		REVERTED: "Reverted",
	};
	return map[s] || s;
};

const stockTransferStatusLabel = (status?: string) => {
	const s = String(status || "DISPATCHED").toUpperCase();
	const map: Record<string, string> = {
		DISPATCHED: "Dispatched",
		COMPLETED: "Completed",
		REVERTED: "Reverted",
	};
	return map[s] || s;
};

const orderStatusBadge = (status?: string) => {
	const s = String(status || "PENDING");

	const map: Record<string, { bg: string; text: string; label: string }> = {
		PENDING: { bg: "#fff7e6", text: "#ad6800", label: "Pending" },
		REQUESTED_FOR_DISPATCH: {
			bg: "#e6f7ff",
			text: "#096dd9",
			label: "Requested For Dispatch",
		},
		DISPATCHED: { bg: "#f6ffed", text: "#389e0d", label: "Dispatched" },
		DELIVERED: { bg: "#f0f5ff", text: "#2f54eb", label: "Delivered" },
		CANCELLED: { bg: "#fff1f0", text: "#cf1322", label: "Cancelled" },
	};

	const cfg = map[s] || map.PENDING;

	return (
		<span
			className="badge"
			style={{
				background: cfg.bg,
				color: cfg.text,
				border: `1px solid ${cfg.bg}`,
				fontWeight: 600,
				padding: "6px 10px",
				borderRadius: 999,
			}}
		>
			{cfg.label}
		</span>
	);
};

const dispatchStatusBadge = (status?: string) => {
	const s = String(status || "PENDING");

	const map: Record<string, { bg: string; text: string; label: string }> = {
		PENDING: { bg: "#fff7e6", text: "#ad6800", label: "Pending" },
		DELIVERED: { bg: "#f0f5ff", text: "#2f54eb", label: "Delivered" },
		CREATED: { bg: "#e6f7ff", text: "#096dd9", label: "Created" },
		DISPATCHED: { bg: "#e6f7ff", text: "#096dd9", label: "Dispatched" },
		CANCELLED: { bg: "#fff1f0", text: "#cf1322", label: "Cancelled" },
	};

	const cfg = map[s] || map.PENDING;

	return (
		<span
			className="badge"
			style={{
				background: cfg.bg,
				color: cfg.text,
				border: `1px solid ${cfg.bg}`,
				fontWeight: 600,
				padding: "6px 10px",
				borderRadius: 999,
			}}
		>
			{cfg.label}
		</span>
	);
};

const returnStatusBadge = (status?: string) => {
	const s = String(status || "NOT_RETURNED").toUpperCase();

	const map: Record<string, { bg: string; text: string; label: string }> = {
		NOT_RETURNED: {
			bg: "#f5f5f5",
			text: "#595959",
			label: "Not Returned",
		},
		PARTIALLY_RETURNED: {
			bg: "#fff7e6",
			text: "#ad6800",
			label: "Partially Returned",
		},
		FULLY_RETURNED: {
			bg: "#f6ffed",
			text: "#389e0d",
			label: "Fully Returned",
		},
	};

	const cfg = map[s] || map.NOT_RETURNED;

	return (
		<span
			className="badge"
			style={{
				background: cfg.bg,
				color: cfg.text,
				border: `1px solid ${cfg.bg}`,
				fontWeight: 600,
				padding: "6px 10px",
				borderRadius: 999,
			}}
		>
			{cfg.label}
		</span>
	);
};

const labourStatusBadge = (status?: string) => {
	const s = String(status || "ISSUED").toUpperCase();

	const map: Record<string, { bg: string; text: string; label: string }> = {
		ISSUED: { bg: "#e6f7ff", text: "#096dd9", label: "Issued" },
		COMPLETED: { bg: "#f6ffed", text: "#389e0d", label: "Completed" },
		REVERTED: { bg: "#fff1f0", text: "#cf1322", label: "Reverted" },
	};

	const cfg = map[s] || map.ISSUED;

	return (
		<span
			className="badge"
			style={{
				background: cfg.bg,
				color: cfg.text,
				border: `1px solid ${cfg.bg}`,
				fontWeight: 600,
				padding: "6px 10px",
				borderRadius: 999,
			}}
		>
			{cfg.label}
		</span>
	);
};

const stockTransferStatusBadge = (status?: string) => {
	const s = String(status || "DISPATCHED");
	const map: Record<string, { bg: string; text: string; label: string }> = {
		DISPATCHED: { bg: "#e6f7ff", text: "#096dd9", label: "Dispatched" },
		COMPLETED: { bg: "#f6ffed", text: "#389e0d", label: "Completed" },
		REVERTED: { bg: "#fff1f0", text: "#cf1322", label: "Reverted" },
	};
	const cfg = map[s] || map.DISPATCHED;

	return (
		<span
			className="badge"
			style={{
				background: cfg.bg,
				color: cfg.text,
				border: `1px solid ${cfg.bg}`,
				fontWeight: 600,
				padding: "6px 10px",
				borderRadius: 999,
			}}
		>
			{cfg.label}
		</span>
	);
};

type TabKey = "READY" | "DISPATCH" | "STOCK_TRANSFER" | "ISSUE_TO_LABOUR";

type MenuItemStyle = {
	fontSize: string;
	borderRadius: string;
	display: string;
	alignItems: string;
	gap: string;
	padding: string;
	minHeight: string;
	fontWeight: number;
	"& i": {
		fontSize: string;
		width: string;
		textAlign: "center";
	};
	"&:hover": {
		background: string;
	};
	"&.Mui-disabled": {
		opacity: number;
	};
};

const menuItemStyle: MenuItemStyle = {
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

function ReadyRowActions({
	row,
	allowCreate,
	allowUpdate,
	revertingReady,
	revertingId,
	setRevertingId,
	dispatch,
	nav,
}: {
	row: ReadyToDispatchOrder;
	allowCreate: boolean;
	allowUpdate: boolean;
	revertingReady: boolean;
	revertingId: string;
	setRevertingId: (v: string) => void;
	dispatch: AppDispatch;
	nav: ReturnType<typeof useNavigate>;
}) {
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

	const o: any = row;
	const rowId = String(pickId(o) || "").trim();
	const orderId = String(o?.orderId || pickId(o) || "").trim();
	const quotationId = String(o?.quotationId || "").trim();
	const status = String(o?.orderStatus || o?.status || "");
	const isOrderRow = !!orderId;
	const isQuotationRow = !!quotationId;
	const canCreateDispatch =
		status === "REQUESTED_FOR_DISPATCH" || status === "WON";
	const revertBusy = revertingId === rowId;
	const open = Boolean(anchorEl);

	return (
		<>
			<IconButton
				size="small"
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
				<i className="ri-more-2-fill" />
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
				<MenuItem
					sx={{ ...menuItemStyle, color: theme }}
					disabled={!isOrderRow}
					onClick={() => {
						nav(`/orders/${orderId}`);
						setAnchorEl(null);
					}}
				>
					<i className="ri-eye-line" />
					View Order
				</MenuItem>
				<Divider variant="middle" component="li" flexItem />

				{allowUpdate && (
					<MenuItem
						sx={{ ...menuItemStyle, color: "#cf1322" }}
						disabled={!rowId || revertBusy || revertingReady}
						onClick={async () => {
							try {
								const ok = window.confirm(
									"Revert this ready-to-dispatch entry?",
								);
								if (!ok) return;

								setRevertingId(rowId);

								if (isQuotationRow) {
									await dispatch(revertReadyDispatchThunk(rowId)).unwrap();
									toast.success("Quotation dispatch request reverted");
								} else {
									await dispatch(
										changeOrderStatusThunk({
											id: orderId,
											status: "PENDING",
										}),
									).unwrap();
									toast.success("Order reverted to Pending");
								}

								dispatch(fetchReadyToDispatchThunk());
								dispatch(fetchDispatchesThunk());
							} catch (e: any) {
								toast.error(e || "Failed to revert");
							} finally {
								setRevertingId("");
								setAnchorEl(null);
							}
						}}
					>
						<i className="ri-arrow-go-back-line" />
						Revert
					</MenuItem>
				)}
				<Divider variant="middle" component="li" flexItem />

				{allowCreate && (
					<MenuItem
						sx={{ ...menuItemStyle, color: "#096dd9" }}
						disabled={!canCreateDispatch || (!isOrderRow && !isQuotationRow)}
						onClick={() => {
							if (isOrderRow) {
								nav(`/warehouses/dispatch/${orderId}/create`);
							} else {
								nav(
									`/warehouses/dispatch/new?sourceType=QUOTATION&sourceId=${quotationId}`,
								);
							}
							setAnchorEl(null);
						}}
					>
						<i className="ri-truck-line" />
						Create Dispatch
					</MenuItem>
				)}
			</Menu>
		</>
	);
}

function DispatchRowActions({
	row,
	allowUpdate,
	deliveringId,
	setDeliveringId,
	dispatch,
	nav,
}: {
	row: DispatchType;
	allowUpdate: boolean;
	deliveringId: string;
	setDeliveringId: (v: string) => void;
	dispatch: AppDispatch;
	nav: ReturnType<typeof useNavigate>;
}) {
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

	const d: any = row;
	const currentDispatchId =
		pickId(d) || String(d?.dispatchId || d?.dispatchNo || "").trim();
	const status = String(d?.dispatchStatus || "PENDING");
	const returnStatus = String(
		d?.returnedItemStatus || "NOT_RETURNED",
	).toUpperCase();
	const canDeliver = status === "PENDING";
	const canReturn =
		status === "DELIVERED" && returnStatus === "NOT_RETURNED";
	const busy = deliveringId === currentDispatchId;
	const open = Boolean(anchorEl);

	return (
		<>
			<IconButton
				size="small"
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
				<i className="ri-more-2-fill" />
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
				<MenuItem
					sx={{ ...menuItemStyle, color: theme }}
					disabled={!currentDispatchId}
					onClick={() => {
						nav(`/warehouses/dispatch/${currentDispatchId}/view`);
						setAnchorEl(null);
					}}
				>
					<i className="ri-eye-line" />
					View Dispatch
				</MenuItem>

				<Divider variant="middle" component="li" flexItem />

				{allowUpdate && (
					<MenuItem
						sx={{ ...menuItemStyle, color: "#389e0d" }}
						disabled={!currentDispatchId || !canDeliver || busy}
						onClick={async () => {
							try {
								const ok = window.confirm(
									"Mark this dispatch as Delivered?",
								);
								if (!ok) return;

								setDeliveringId(currentDispatchId);
								await dispatch(deliverDispatchThunk(currentDispatchId)).unwrap();
								toast.success("Dispatch marked Delivered");

								dispatch(fetchDispatchesThunk());
								dispatch(fetchReadyToDispatchThunk());
							} catch (e: any) {
								toast.error(e || "Failed to deliver dispatch");
							} finally {
								setDeliveringId("");
								setAnchorEl(null);
							}
						}}
						title="Deliver"
					>
						<i className="ri-check-double-line" />
						Deliver
						{busy ? "..." : ""}
					</MenuItem>
				)}

				<Divider variant="middle" component="li" flexItem />

				{allowUpdate && canReturn && (
					<MenuItem
						sx={{ ...menuItemStyle, color: "#096dd9" }}
						disabled={!currentDispatchId}
						onClick={() => {
							nav(`/warehouses/dispatch/${currentDispatchId}/sales-return`);
							setAnchorEl(null);
						}}
						title="Sales Return"
					>
						<i className="ri-arrow-go-back-line" />
						Return
					</MenuItem>
				)}
			</Menu>
		</>
	);
}

function StockTransferRowActions({
	row,
	allowUpdate,
	revertingStId,
	setRevertingStId,
	dispatch,
	nav,
}: {
	row: StockTransfer;
	allowUpdate: boolean;
	revertingStId: string;
	setRevertingStId: (v: string) => void;
	dispatch: AppDispatch;
	nav: ReturnType<typeof useNavigate>;
}) {
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

	const o: any = row;
	const id = String(o?.id || o?._id || "").trim();
	const status = String(o?.status || "DISPATCHED");
	const canEdit = status === "DISPATCHED";
	const canRevert = status === "DISPATCHED";
	const busy = revertingStId === id;
	const open = Boolean(anchorEl);

	return (
		<>
			<IconButton
				size="small"
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
				<i className="ri-more-2-fill" />
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
				<MenuItem
					sx={{ ...menuItemStyle, color: theme }}
					disabled={!id}
					onClick={() => {
						nav(`/warehouses/stock-transfer/${id}/view`);
						setAnchorEl(null);
					}}
					title="View"
				>
					<i className="ri-eye-line" />
					View
				</MenuItem>

				<Divider variant="middle" component="li" flexItem />

				{allowUpdate && (
					<MenuItem
						sx={{
							...menuItemStyle,
							color: canEdit ? theme : "#6c757d",
						}}
						disabled={!id || !canEdit}
						onClick={() => {
							nav(`/warehouses/stock-transfer/${id}/edit`);
							setAnchorEl(null);
						}}
						title="Edit"
					>
						<i className="ri-pencil-line" />
						Edit
					</MenuItem>
				)}
				<Divider variant="middle" component="li" flexItem />

				{allowUpdate && (
					<MenuItem
						sx={{
							...menuItemStyle,
							color: canRevert ? theme : "#6c757d",
						}}
						disabled={!id || !canRevert || busy}
						onClick={async () => {
							const ok = window.confirm(
								"Revert this stock transfer? Inventory will be restored.",
							);
							if (!ok) return;
							setRevertingStId(id);
							try {
								await dispatch(revertStockTransferThunk(id)).unwrap();
								toast.success("Stock transfer reverted");
								dispatch(fetchStockTransfersThunk());
							} catch (e: any) {
								toast.error(e || "Failed to revert");
							} finally {
								setRevertingStId("");
								setAnchorEl(null);
							}
						}}
						title="Revert"
					>
						<i className="ri-arrow-go-back-line" />
						{busy ? "..." : "Revert"}
					</MenuItem>
				)}
			</Menu>
		</>
	);
}

function IssueToLabourRowActions({
	row,
	allowUpdate,
	revertingLabourId,
	setRevertingLabourId,
	dispatch,
	nav,
}: {
	row: IssueToLabour;
	allowUpdate: boolean;
	revertingLabourId: string;
	setRevertingLabourId: (v: string) => void;
	dispatch: AppDispatch;
	nav: ReturnType<typeof useNavigate>;
}) {
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

	const d: any = row;
	const id = String(d?.id || d?._id || "").trim();
	const status = String(d?.status || "ISSUED").toUpperCase();
	const canEdit = status === "ISSUED";
	const canRevert = status === "ISSUED";
	const busy = revertingLabourId === id;
	const open = Boolean(anchorEl);

	return (
		<>
			<IconButton
				size="small"
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
				<i className="ri-more-2-fill" />
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
				<MenuItem
					sx={{ ...menuItemStyle, color: theme }}
					disabled={!id}
					onClick={() => {
						nav(`/warehouses/issue-to-labour/${id}/view`);
						setAnchorEl(null);
					}}
					title="View"
				>
					<i className="ri-eye-line" />
					View
				</MenuItem>
				<Divider variant="middle" component="li" flexItem />

				{allowUpdate && (
					<MenuItem
						sx={{ ...menuItemStyle, color: theme }}
						disabled={!id || !canEdit}
						onClick={() => {
							nav(`/warehouses/issue-to-labour/${id}/edit`);
							setAnchorEl(null);
						}}
						title="Edit"
					>
						<i className="ri-pencil-line" />
						Edit
					</MenuItem>
				)}
				<Divider variant="middle" component="li" flexItem />
				{allowUpdate && (
					<MenuItem
						sx={{ ...menuItemStyle, color: theme }}
						disabled={!id || !canRevert || busy}
						onClick={async () => {
							const ok = window.confirm(
								"Revert this issue to labour? Inventory will be restored.",
							);
							if (!ok) return;

							setRevertingLabourId(id);

							try {
								await dispatch(revertIssueToLabourThunk(id)).unwrap();
								toast.success("Issue to labour reverted");
								dispatch(fetchIssueToLaboursThunk());
							} catch (e: any) {
								toast.error(e || "Failed to revert");
							} finally {
								setRevertingLabourId("");
								setAnchorEl(null);
							}
						}}
						title="Revert"
					>
						<i className="ri-arrow-go-back-line" />
						{busy ? "..." : "Revert"}
					</MenuItem>
				)}
			</Menu>
		</>
	);
}

export default function DispatchList() {
	const dispatch = useDispatch<AppDispatch>();
	const nav = useNavigate();

	const authUser = useSelector((s: RootState) => s.auth.user);
	const allowCreate = canCreate(authUser, "warehouse", "dispatch");
	const allowUpdate = canUpdate(authUser, "warehouse", "dispatch");

	const dispatchState =
		(useSelector((s: RootState) => (s as any).dispatch) as any) ||
		(useSelector((s: RootState) => (s as any).warehouseDispatch) as any) ||
		{};

	const {
		ready = [],
		dispatches = [],
		loadingReady = false,
		loadingList = false,
		revertingReady = false,
		error = null,
	} = dispatchState || {};

	const [activeTab, setActiveTab] = useState<TabKey>("READY");
	const [deliveringId, setDeliveringId] = useState<string>("");
	const [revertingId, setRevertingId] = useState<string>("");
	const [revertingStId, setRevertingStId] = useState<string>("");
	const [revertingLabourId, setRevertingLabourId] = useState<string>("");

	const { stockTransfers = [], loadingList: stLoading = false } =
		(useSelector((s: RootState) => (s as any).stockTransfer) as any) || {};

	const { issueToLabours = [], loadingList: labourLoading = false } =
		(useSelector((s: RootState) => (s as any).issueToLabour) as any) || {};

	useEffect(() => {
		dispatch(fetchReadyToDispatchThunk());
		dispatch(fetchDispatchesThunk());
		dispatch(fetchStockTransfersThunk());
		dispatch(fetchIssueToLaboursThunk());
	}, [dispatch]);

	const readyCol = createColumnHelper<ReadyToDispatchOrder>();
	const listCol = createColumnHelper<DispatchType>();
	const stCol = createColumnHelper<StockTransfer>();
	const labourCol = createColumnHelper<IssueToLabour>();

	const readyColumns = useMemo(
		() => [
			readyCol.accessor((_, idx) => idx + 1, {
				id: "srNo",
				header: "Sr No",
				cell: (i) => String(i.getValue() ?? "-"),
			}),
			readyCol.accessor("orderNo" as any, {
				header: "Order No",
				cell: (i) => i.getValue() || "-",
			}),
			readyCol.accessor("quotationNo" as any, {
				header: "Quotation No",
				cell: (i) => i.getValue() || "-",
			}),
			readyCol.accessor("orderDate" as any, {
				header: "Date",
				cell: (i) => fmtDateTime(i.getValue()),
			}),
			readyCol.accessor("orderStatus" as any, {
				header: "Status",
				cell: (i) => orderStatusBadge(i.getValue()),
			}),
			readyCol.accessor("customerName" as any, {
				header: "Customer Name",
				cell: (i) => i.getValue() || "-",
			}),
			readyCol.accessor("dispatchFromWarehouseName" as any, {
				header: "Dispatch From Warehouse",
				cell: (i) => i.getValue() || "-",
			}),
			readyCol.accessor(
				(row) => {
					const name = pickName((row as any)?.createdBy);
					const date = fmtDateTime((row as any)?.createdAt);
					if (name && (row as any)?.createdAt) return `${name} - ${date}`;
					return name || date;
				},
				{
					id: "createdByDate",
					header: "Created By / Date",
					cell: (i) => String(i.getValue() || "-"),
				},
			),
			readyCol.accessor(
				(row) => {
					const name = pickName((row as any)?.updatedBy);
					const date = fmtDateTime((row as any)?.updatedAt);
					if (name && (row as any)?.updatedAt) return `${name} - ${date}`;
					return name || date;
				},
				{
					id: "updatedByDate",
					header: "Updated By / Date",
					cell: (i) => String(i.getValue() || "-"),
				},
			),
			readyCol.display({
				id: "actions",
				header: "Action",
				cell: ({ row }) => (
					<ReadyRowActions
						row={row.original}
						allowCreate={allowCreate}
						allowUpdate={allowUpdate}
						revertingReady={revertingReady}
						revertingId={revertingId}
						setRevertingId={setRevertingId}
						dispatch={dispatch}
						nav={nav}
					/>
				),
			}),
		],
		[
			readyCol,
			allowCreate,
			allowUpdate,
			revertingReady,
			revertingId,
			dispatch,
			nav,
		],
	);

	const dispatchColumns = useMemo(
		() => [
			listCol.accessor((_, idx) => idx + 1, {
				id: "srNo",
				header: "Sr No",
				cell: (i) => String(i.getValue() ?? "-"),
			}),
			listCol.accessor(
				(row) =>
					(row as any).dispatchNo ||
					(row as any).dispatchId ||
					(row as any).id ||
					(row as any)._id,
				{
					id: "dispatchKey",
					header: "Dispatch No",
					cell: (i) => String(i.getValue() ?? "-"),
				},
			),
			listCol.accessor("dispatchDate", {
				header: "Dispatch Date",
				cell: (i) => fmtDateTime(i.getValue()),
			}),
			listCol.accessor("orderNo", {
				header: "Order No",
				cell: (i) => i.getValue() || "-",
			}),
			listCol.accessor("quotationNo", {
				header: "Quotation No",
				cell: (i) => i.getValue() || "-",
			}),
			listCol.accessor("dispatchType", {
				header: "Dispatch Type",
				cell: (i) => i.getValue() || "-",
			}),
			listCol.accessor("issuedFromWarehouseName", {
				header: "Issued From Warehouse",
				cell: (i) => i.getValue() || "-",
			}),
			listCol.accessor("customerName", {
				header: "Customer Name",
				cell: (i) => i.getValue() || "-",
			}),
			listCol.accessor("dispatchStatus", {
				header: "Dispatch Status",
				cell: (i) => dispatchStatusBadge(i.getValue()),
			}),
			listCol.accessor("returnedItemStatus", {
				header: "Return Status",
				cell: (i) => returnStatusBadge(i.getValue()),
			}),
			listCol.accessor(
				(row) => {
					const name = pickName((row as any)?.createdBy);
					const date = fmtDateTime((row as any)?.createdAt);
					if (name && (row as any)?.createdAt) return `${name} - ${date}`;
					return name || date;
				},
				{
					id: "createdByDate",
					header: "Created By / Date",
					cell: (i) => String(i.getValue() || "-"),
				},
			),
			listCol.accessor(
				(row) => {
					const name = pickName((row as any)?.updatedBy);
					const date = fmtDateTime((row as any)?.updatedAt);
					if (name && (row as any)?.updatedAt) return `${name} - ${date}`;
					return name || date;
				},
				{
					id: "updatedByDate",
					header: "Updated By / Date",
					cell: (i) => String(i.getValue() || "-"),
				},
			),
			listCol.display({
				id: "actions",
				header: "Action",
				cell: ({ row }) => (
					<DispatchRowActions
						row={row.original}
						allowUpdate={allowUpdate}
						deliveringId={deliveringId}
						setDeliveringId={setDeliveringId}
						dispatch={dispatch}
						nav={nav}
					/>
				),
			}),
		],
		[listCol, allowUpdate, deliveringId, dispatch, nav],
	);

	const stColumns = useMemo(
		() => [
			stCol.accessor((_, idx) => idx + 1, {
				id: "srNo",
				header: "Sr No",
				cell: (i) => String(i.getValue() ?? "-"),
			}),
			stCol.accessor("transferNo", {
				header: "Transfer No",
				cell: (i) => i.getValue() || "-",
			}),
			stCol.accessor("transferDate", {
				header: "Transfer Date",
				cell: (i) => fmtDateTime(i.getValue()),
			}),
			stCol.accessor("transferFromWarehouse", {
				header: "Transfer From",
				cell: (i) => i.getValue() || "-",
			}),
			stCol.accessor("transferToWarehouse", {
				header: "Transfer To",
				cell: (i) => i.getValue() || "-",
			}),
			stCol.accessor("status", {
				header: "Dispatch Status",
				cell: (i) => stockTransferStatusBadge(i.getValue()),
			}),
			stCol.accessor(
				(row) => {
					const name = pickName((row as any)?.createdBy);
					const date = fmtDateTime((row as any)?.createdAt);
					if (name && (row as any)?.createdAt) return `${name} - ${date}`;
					return name || date;
				},
				{
					id: "createdByDate",
					header: "Created By / Date",
					cell: (i) => String(i.getValue() || "-"),
				},
			),
			stCol.display({
				id: "actions",
				header: "Action",
				cell: ({ row }) => (
					<StockTransferRowActions
						row={row.original}
						allowUpdate={allowUpdate}
						revertingStId={revertingStId}
						setRevertingStId={setRevertingStId}
						dispatch={dispatch}
						nav={nav}
					/>
				),
			}),
		],
		[stCol, allowUpdate, revertingStId, dispatch, nav],
	);

	const labourColumns = useMemo(
		() => [
			labourCol.accessor((_, idx) => idx + 1, {
				id: "srNo",
				header: "Sr. No.",
				cell: (i) => String(i.getValue() ?? "-"),
			}),
			labourCol.accessor("issueNo", {
				header: "Dispatch ID",
				cell: (i) => i.getValue() || "-",
			}),
			labourCol.accessor("issueDate", {
				header: "Issued Date",
				cell: (i) => fmtDateTime(i.getValue()),
			}),
			labourCol.accessor("issueFromWarehouse", {
				header: "Issued From",
				cell: (i) => i.getValue() || "-",
			}),
			labourCol.accessor("labourName", {
				header: "Labour Name",
				cell: (i) => i.getValue() || "-",
			}),
			labourCol.accessor("status", {
				header: "Dispatch Status",
				cell: (i) => labourStatusBadge(i.getValue()),
			}),
			labourCol.accessor("remarks", {
				header: "Remarks",
				cell: (i) => i.getValue() || "-",
			}),
			labourCol.accessor(
				(row) => {
					const name = pickName((row as any)?.createdBy);
					const date = fmtDateTime((row as any)?.createdAt);
					if (name && (row as any)?.createdAt) return `${name} - ${date}`;
					return name || date;
				},
				{
					id: "createdByDate",
					header: "Created By / Date",
					cell: (i) => String(i.getValue() || "-"),
				},
			),
			labourCol.accessor(
				(row) => {
					const name = pickName((row as any)?.updatedBy);
					const date = fmtDateTime((row as any)?.updatedAt);
					if (name && (row as any)?.updatedAt) return `${name} - ${date}`;
					return name || date;
				},
				{
					id: "updatedByDate",
					header: "Updated By / Date",
					cell: (i) => String(i.getValue() || "-"),
				},
			),
			labourCol.display({
				id: "actions",
				header: "Actions",
				cell: ({ row }) => (
					<IssueToLabourRowActions
						row={row.original}
						allowUpdate={allowUpdate}
						revertingLabourId={revertingLabourId}
						setRevertingLabourId={setRevertingLabourId}
						dispatch={dispatch}
						nav={nav}
					/>
				),
			}),
		],
		[labourCol, allowUpdate, revertingLabourId, dispatch, nav],
	);

	const handleExport = () => {
		const today = new Date();
		const yyyy = today.getFullYear();
		const mm = String(today.getMonth() + 1).padStart(2, "0");
		const dd = String(today.getDate()).padStart(2, "0");

		if (activeTab === "READY") {
			const headers = [
				"Sr No",
				"Order No",
				"Quotation No",
				"Date",
				"Status",
				"Customer Name",
				"Dispatch From Warehouse",
				"Created By / Date",
				"Updated By / Date",
			];

			const rows = (ready || []).map((row: any, idx: number) => [
				idx + 1,
				row?.orderNo || "-",
				row?.quotationNo || "-",
				fmtDateTime(row?.orderDate),
				orderStatusLabel(row?.orderStatus),
				row?.customerName || "-",
				row?.dispatchFromWarehouseName || "-",
				(() => {
					const name = pickName(row?.createdBy);
					const date = fmtDateTime(row?.createdAt);
					if (name && row?.createdAt) return `${name} - ${date}`;
					return name || date || "-";
				})(),
				(() => {
					const name = pickName(row?.updatedBy);
					const date = fmtDateTime(row?.updatedAt);
					if (name && row?.updatedAt) return `${name} - ${date}`;
					return name || date || "-";
				})(),
			]);

			downloadCsv(`ready_for_dispatch_${yyyy}-${mm}-${dd}.csv`, headers, rows);
			toast.success("Ready For Dispatch exported successfully");
			return;
		}

		if (activeTab === "DISPATCH") {
			const headers = [
				"Sr No",
				"Dispatch No",
				"Dispatch Date",
				"Order No",
				"Quotation No",
				"Dispatch Type",
				"Issued From Warehouse",
				"Customer Name",
				"Dispatch Status",
				"Return Status",
				"Created By / Date",
				"Updated By / Date",
			];

			const rows = (dispatches || []).map((row: any, idx: number) => [
				idx + 1,
				row?.dispatchNo || row?.dispatchId || row?.id || row?._id || "-",
				fmtDateTime(row?.dispatchDate),
				row?.orderNo || "-",
				row?.quotationNo || "-",
				row?.dispatchType || "-",
				row?.issuedFromWarehouseName || "-",
				row?.customerName || "-",
				dispatchStatusLabel(row?.dispatchStatus),
				returnStatusLabel(row?.returnedItemStatus),
				(() => {
					const name = pickName(row?.createdBy);
					const date = fmtDateTime(row?.createdAt);
					if (name && row?.createdAt) return `${name} - ${date}`;
					return name || date || "-";
				})(),
				(() => {
					const name = pickName(row?.updatedBy);
					const date = fmtDateTime(row?.updatedAt);
					if (name && row?.updatedAt) return `${name} - ${date}`;
					return name || date || "-";
				})(),
			]);

			downloadCsv(`dispatch_list_${yyyy}-${mm}-${dd}.csv`, headers, rows);
			toast.success("Dispatch List exported successfully");
			return;
		}

		if (activeTab === "STOCK_TRANSFER") {
			const headers = [
				"Sr No",
				"Transfer No",
				"Transfer Date",
				"Transfer From",
				"Transfer To",
				"Dispatch Status",
				"Created By / Date",
			];

			const rows = (stockTransfers || []).map((row: any, idx: number) => [
				idx + 1,
				row?.transferNo || "-",
				fmtDateTime(row?.transferDate),
				row?.transferFromWarehouse || "-",
				row?.transferToWarehouse || "-",
				stockTransferStatusLabel(row?.status),
				(() => {
					const name = pickName(row?.createdBy);
					const date = fmtDateTime(row?.createdAt);
					if (name && row?.createdAt) return `${name} - ${date}`;
					return name || date || "-";
				})(),
			]);

			downloadCsv(`stock_transfer_list_${yyyy}-${mm}-${dd}.csv`, headers, rows);
			toast.success("Stock Transfer List exported successfully");
			return;
		}

		if (activeTab === "ISSUE_TO_LABOUR") {
			const headers = [
				"Sr No",
				"Dispatch ID",
				"Issued Date",
				"Issued From",
				"Labour Name",
				"Dispatch Status",
				"Remarks",
				"Created By / Date",
				"Updated By / Date",
			];

			const rows = (issueToLabours || []).map((row: any, idx: number) => [
				idx + 1,
				row?.issueNo || "-",
				fmtDateTime(row?.issueDate),
				row?.issueFromWarehouse || "-",
				row?.labourName || "-",
				labourStatusLabel(row?.status),
				row?.remarks || "-",
				(() => {
					const name = pickName(row?.createdBy);
					const date = fmtDateTime(row?.createdAt);
					if (name && row?.createdAt) return `${name} - ${date}`;
					return name || date || "-";
				})(),
				(() => {
					const name = pickName(row?.updatedBy);
					const date = fmtDateTime(row?.updatedAt);
					if (name && row?.updatedAt) return `${name} - ${date}`;
					return name || date || "-";
				})(),
			]);

			downloadCsv(
				`issue_to_labour_list_${yyyy}-${mm}-${dd}.csv`,
				headers,
				rows,
			);
			toast.success("Issue To Labour List exported successfully");
		}
	};

	return (
		<>
			<style>{`
				.dispatch-tabs {
					display: flex;
					gap: 22px;
					align-items: center;
					border-bottom: 1px solid #e9ebec;
					padding: 6px 2px 0 2px;
					margin-bottom: 14px;
					flex-wrap: wrap;
				}

				.dispatch-tab-btn {
					border: none;
					background: transparent;
					padding: 10px 0;
					font-weight: 700;
					font-size: 14px;
					color: #495057;
					position: relative;
				}

				.dispatch-tab-btn.active {
					color: ${theme};
				}

				.dispatch-tab-btn.active::after {
					content: "";
					position: absolute;
					left: 0;
					right: 0;
					bottom: -1px;
					height: 3px;
					background: ${theme};
					border-radius: 6px;
				}
			`}</style>

			<div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
				<h4 className="mb-0 fw-bold" style={{ color: "#111" }}>
					Dispatch
				</h4>

				<div className="d-flex gap-2 align-items-center">
					<Button
						variant="light"
						onClick={() => {
							if (activeTab === "READY") dispatch(fetchReadyToDispatchThunk());
							else if (activeTab === "DISPATCH")
								dispatch(fetchDispatchesThunk());
							else if (activeTab === "STOCK_TRANSFER")
								dispatch(fetchStockTransfersThunk());
							else if (activeTab === "ISSUE_TO_LABOUR")
								dispatch(fetchIssueToLaboursThunk());
						}}
						style={{
							border: "1px solid #e9ebec",
							fontSize: "13px",
							borderRadius: "6px",
							display: "inline-flex",
							alignItems: "center",
							gap: "6px",
						}}
					>
						<i className="ri-refresh-line" /> Refresh
					</Button>

					<Button
						variant="light"
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
						<i className="ri-upload-2-line" /> Export
					</Button>

					{allowCreate && activeTab === "STOCK_TRANSFER" && (
						<Button
							onClick={() => nav("/warehouses/stock-transfer/new")}
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
							<i className="ri-add-circle-line" /> Create Transfer
						</Button>
					)}

					{allowCreate && activeTab === "ISSUE_TO_LABOUR" && (
						<Button
							onClick={() => nav("/warehouses/issue-to-labour/new")}
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
							<i className="ri-add-circle-line" /> Issue To Labour
						</Button>
					)}
				</div>
			</div>

			<div className="dispatch-tabs">
				<button
					className={`dispatch-tab-btn ${activeTab === "READY" ? "active" : ""}`}
					onClick={() => setActiveTab("READY")}
					type="button"
				>
					Ready for Dispatch
				</button>

				<button
					className={`dispatch-tab-btn ${activeTab === "DISPATCH" ? "active" : ""}`}
					onClick={() => setActiveTab("DISPATCH")}
					type="button"
				>
					Dispatch
				</button>

				<button
					className={`dispatch-tab-btn ${activeTab === "STOCK_TRANSFER" ? "active" : ""}`}
					onClick={() => setActiveTab("STOCK_TRANSFER")}
					type="button"
				>
					Stock Transfer
					{stockTransfers.filter((t: any) => t?.status === "DISPATCHED")
						.length > 0 && (
						<span
							style={{
								marginLeft: 6,
								background: theme,
								color: "white",
								borderRadius: 99,
								fontSize: 11,
								padding: "1px 7px",
								fontWeight: 700,
							}}
						>
							{
								stockTransfers.filter((t: any) => t?.status === "DISPATCHED")
									.length
							}
						</span>
					)}
				</button>

				<button
					className={`dispatch-tab-btn ${activeTab === "ISSUE_TO_LABOUR" ? "active" : ""}`}
					onClick={() => setActiveTab("ISSUE_TO_LABOUR")}
					type="button"
				>
					Issue To Labour
					{issueToLabours.filter((t: any) => t?.status === "ISSUED").length >
						0 && (
						<span
							style={{
								marginLeft: 6,
								background: theme,
								color: "white",
								borderRadius: 99,
								fontSize: 11,
								padding: "1px 7px",
								fontWeight: 700,
							}}
						>
							{issueToLabours.filter((t: any) => t?.status === "ISSUED").length}
						</span>
					)}
				</button>
			</div>

			{error && <Alert variant="danger">{error}</Alert>}

			{activeTab === "READY" ? (
				loadingReady ? (
					<div className="d-flex justify-content-center py-5">
						<Spinner animation="border" style={{ color: theme }} />
					</div>
				) : (
					<BasicTable
						data={ready || []}
						columns={readyColumns}
						title="Ready For Dispatch"
					/>
				)
			) : activeTab === "DISPATCH" ? (
				loadingList ? (
					<div className="d-flex justify-content-center py-5">
						<Spinner animation="border" style={{ color: theme }} />
					</div>
				) : (
					<BasicTable
						data={dispatches || []}
						columns={dispatchColumns}
						title="Dispatch List"
					/>
				)
			) : activeTab === "STOCK_TRANSFER" ? (
				stLoading ? (
					<div className="d-flex justify-content-center py-5">
						<Spinner animation="border" style={{ color: theme }} />
					</div>
				) : (
					<BasicTable
						data={stockTransfers || []}
						columns={stColumns}
						title="Stock Transfer List"
					/>
				)
			) : activeTab === "ISSUE_TO_LABOUR" ? (
				labourLoading ? (
					<div className="d-flex justify-content-center py-5">
						<Spinner animation="border" style={{ color: theme }} />
					</div>
				) : (
					<BasicTable
						data={issueToLabours || []}
						columns={labourColumns}
						title="Issue To Labour List"
					/>
				)
			) : null}
		</>
	);
}