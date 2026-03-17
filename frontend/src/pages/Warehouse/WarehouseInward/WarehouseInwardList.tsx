// WarehouseInwardList.tsx

import { useEffect, useMemo, useState } from "react";
import { Alert, Spinner, Button } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../slices/store";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import { fetchWarehouseInwardsThunk } from "../../../slices/Warehouse/thunks";
import { fetchPendingStockTransfersThunk } from "../../../slices/Warehouse/Stocktransfer/thunks";
import type { WarehouseInward } from "../../../types/Warehouses/warehouseInward";
import type { StockTransfer } from "../../../types/Warehouses/stocktransfer";
import BasicTable from "../../../components/Table/BasicTable";
import { createColumnHelper } from "@tanstack/react-table";
import { useNavigate, useSearchParams } from "react-router-dom";
import { fetchInventoriesThunk } from "../../../slices/Inventory/thunks";
import { canCreate, canUpdate } from "../../../utils/permission";
import { fetchPendingIssueToLaboursThunk } from "../../../slices/Warehouse/IssueToLabour/thunks";
import type { IssueToLabour } from "../../../types/Warehouses/issueToLabour";
import { fetchPendingSalesReturnDispatchesThunk } from "../../../slices/Warehouse/Dispatch/thunks";
import type { Dispatch as DispatchType } from "../../../types/Warehouses/dispatch";
import IconButton from "@mui/material/IconButton";
import { toast } from "react-toastify";

const theme = "#1a8376";

type TabKey =
	| "GRN"
	| "PENDING_TRANSFER"
	| "PENDING_LABOUR"
	| "PENDING_SALE_RETURN";

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

const statusLabel = (status?: string) => {
	const s = String(status || "DISPATCHED").toUpperCase();
	const map: Record<string, string> = {
		DISPATCHED: "Dispatched",
		COMPLETED: "Completed",
		REVERTED: "Reverted",
	};
	return map[s] || s;
};

const returnedItemStatusLabel = (status?: string) => {
	const s = String(status || "NOT_RETURNED").toUpperCase();
	const map: Record<string, string> = {
		NOT_RETURNED: "Not Returned",
		PARTIALLY_RETURNED: "Partially Returned",
		FULLY_RETURNED: "Fully Returned",
	};
	return map[s] || s;
};

const salesReturnInwardStatusLabel = (status?: string) => {
	const s = String(status || "NONE").toUpperCase();
	const map: Record<string, string> = {
		NONE: "None",
		PENDING: "Pending",
		COMPLETED: "Completed",
	};
	return map[s] || s;
};

const statusBadge = (status?: string) => {
	const s = String(status || "DISPATCHED").toUpperCase();
	const map: Record<string, { bg: string; text: string; label: string }> = {
		DISPATCHED: { bg: "#e6f7ff", text: "#096dd9", label: "Dispatched" },
		COMPLETED: { bg: "#f6ffed", text: "#389e0d", label: "Completed" },
		REVERTED: { bg: "#fff1f0", text: "#cf1322", label: "Reverted" },
	};
	const cfg = map[s] || map.DISPATCHED;
	return (
		<span
			className='badge'
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

const returnedItemStatusBadge = (status?: string) => {
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
			className='badge'
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

const salesReturnInwardStatusBadge = (status?: string) => {
	const s = String(status || "NONE").toUpperCase();
	const map: Record<string, { bg: string; text: string; label: string }> = {
		NONE: { bg: "#f5f5f5", text: "#595959", label: "None" },
		PENDING: { bg: "#fff7e6", text: "#ad6800", label: "Pending" },
		COMPLETED: { bg: "#f6ffed", text: "#389e0d", label: "Completed" },
	};
	const cfg = map[s] || map.NONE;
	return (
		<span
			className='badge'
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

const fmtDate = (val: any) => {
	if (!val) return "-";
	try {
		const d = new Date(val);
		return Number.isNaN(d.getTime()) ? String(val) : d.toLocaleDateString();
	} catch {
		return String(val);
	}
};

function InwardRowActions({
	id,
	allowUpdate,
	nav,
}: {
	id: string;
	allowUpdate: boolean;
	nav: ReturnType<typeof useNavigate>;
}) {
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
				<MenuItem
					sx={{ ...menuItemStyle, color: theme }}
					disabled={!id}
					onClick={() => {
						nav(`/warehouses/inward/${id}/view`);
						setAnchorEl(null);
					}}
					title='View'
				>
					<i className='ri-eye-line' />
					View
				</MenuItem>
				<Divider variant='middle' component='li' flexItem />

				{allowUpdate && (
					<MenuItem
						sx={{ ...menuItemStyle, color: theme }}
						disabled={!id}
						onClick={() => {
							nav(`/warehouses/inward/${id}/edit`);
							setAnchorEl(null);
						}}
						title='Edit'
					>
						<i className='ri-pencil-line' />
						Edit
					</MenuItem>
				)}
			</Menu>
		</>
	);
}

export default function WarehouseInwardList() {
	const dispatch = useDispatch<AppDispatch>();
	const nav = useNavigate();
	const [sp, setSp] = useSearchParams();

	const initialTab = (sp.get("tab") as TabKey) || "GRN";
	const [activeTab, setActiveTab] = useState<TabKey>(
		initialTab === "PENDING_SALE_RETURN" ||
			initialTab === "PENDING_TRANSFER" ||
			initialTab === "PENDING_LABOUR" ||
			initialTab === "GRN"
			? initialTab
			: "GRN",
	);

	const authUser = useSelector((s: RootState) => s.auth.user);
	const allowCreate = canCreate(authUser, "warehouse", "itemInward");
	const allowUpdate = canUpdate(authUser, "warehouse", "itemInward");

	const { warehouseInwards, loadingList, error } = useSelector(
		(s: RootState) => s.warehouseInward,
	);

	const { pendingTransfers = [], loadingPending = false } =
		(useSelector((s: RootState) => (s as any).stockTransfer) as any) || {};

	const {
		pendingIssueToLabours = [],
		loadingPending: loadingPendingLabour = false,
	} = (useSelector((s: RootState) => (s as any).issueToLabour) as any) || {};

	const { pendingSalesReturns = [], loadingPendingSalesReturn = false } =
		(useSelector((s: RootState) => (s as any).warehouseDispatch) as any) || {};

	useEffect(() => {
		dispatch(fetchWarehouseInwardsThunk());
		dispatch(fetchInventoriesThunk());
		dispatch(fetchPendingStockTransfersThunk());
		dispatch(fetchPendingIssueToLaboursThunk());
		dispatch(fetchPendingSalesReturnDispatchesThunk());
	}, [dispatch]);

	useEffect(() => {
		const tab = sp.get("tab");
		if (
			tab === "GRN" ||
			tab === "PENDING_TRANSFER" ||
			tab === "PENDING_LABOUR" ||
			tab === "PENDING_SALE_RETURN"
		) {
			setActiveTab(tab);
		}
	}, [sp]);

	const changeTab = (tab: TabKey) => {
		setActiveTab(tab);
		setSp({ tab });
	};

	const col = createColumnHelper<WarehouseInward>();

	const columns = useMemo(
		() => [
			col.accessor("srNo", {
				header: "Sr No",
				cell: (i) => i.getValue() ?? "-",
			}),
			col.accessor("grnNo", {
				header: "GRN No",
				cell: (i) => i.getValue() || "-",
			}),
			col.accessor("inwardType", {
				header: "Inward Type",
				cell: (i) => i.getValue() || "-",
			}),
			col.accessor("inwardDate", {
				header: "Inward Date",
				cell: (i) => fmtDate(i.getValue()),
			}),
			col.accessor("supplierName", {
				header: "Supplier",
				cell: (i) => i.getValue() || "-",
			}),
			col.accessor("warehouseName", {
				header: "Warehouse",
				cell: (i) => i.getValue() || "-",
			}),
			col.accessor("invoiceNo", {
				header: "Invoice No",
				cell: (i) => i.getValue() || "-",
			}),
			col.accessor("itemsName", {
				header: "Item",
				cell: (i) => i.getValue() || "-",
			}),
			col.accessor("itemsQuantity", {
				header: "Qty",
				cell: (i) => i.getValue() ?? "-",
			}),
			col.accessor("itemsUnit", {
				header: "Unit",
				cell: (i) => i.getValue() || "-",
			}),
			col.accessor("itemsAmount", {
				header: "Amount",
				cell: (i) => {
					const v = i.getValue();
					if (v === null || v === undefined) return "-";
					const n = Number(v);
					if (Number.isNaN(n)) return String(v);
					return n.toLocaleString();
				},
			}),
			col.accessor("remarks", {
				header: "Remarks",
				cell: (i) => i.getValue() || "-",
			}),
			col.accessor("id", {
				header: "Action",
				enableSorting: false,
				cell: (i) => {
					const id = String(
						i.getValue() || (i.row.original as any)._id || "",
					).trim();

					return (
						<InwardRowActions id={id} allowUpdate={allowUpdate} nav={nav} />
					);
				},
			}),
		],
		[col, nav, allowUpdate],
	);

	const stCol = createColumnHelper<StockTransfer>();

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
				cell: (i) => fmtDate(i.getValue()),
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
				header: "Status",
				cell: (i) => statusBadge(i.getValue()),
			}),
			stCol.display({
				id: "actions",
				header: "Action",
				cell: ({ row }) => {
					const o: any = row.original;
					const id = String(o?.id || o?._id || "").trim();
					const toWarehouse = o?.transferToWarehouse || "";

					return (
						<div className='d-flex align-items-center gap-2'>
							{allowUpdate && (
								<Button
									size='sm'
									disabled={!id}
									onClick={() =>
										nav(
											`/warehouses/inward/stock-transfer/${id}/inward?toWarehouse=${encodeURIComponent(
												toWarehouse,
											)}`,
										)
									}
									style={{
										background: theme,
										border: "none",
										color: "white",
										borderRadius: "6px",
										padding: "4px 12px",
										fontSize: "13px",
										display: "inline-flex",
										alignItems: "center",
										gap: 6,
									}}
									title='Inward'
								>
									<i className='ri-download-2-line' /> Inward
								</Button>
							)}
						</div>
					);
				},
			}),
		],
		[stCol, nav, allowUpdate],
	);

	const labourCol = createColumnHelper<IssueToLabour>();

	const labourColumns = useMemo(
		() => [
			labourCol.accessor((_, idx) => idx + 1, {
				id: "srNo",
				header: "Sr No",
				cell: (i) => String(i.getValue() ?? "-"),
			}),
			labourCol.accessor("issueNo", {
				header: "Dispatch No",
				cell: (i) => i.getValue() || "-",
			}),
			labourCol.accessor("issueDate", {
				header: "Dispatch Date",
				cell: (i) => fmtDate(i.getValue()),
			}),
			labourCol.accessor("labourName", {
				header: "Labour Name",
				cell: (i) => i.getValue() || "-",
			}),
			labourCol.accessor("remarks", {
				header: "Remarks",
				cell: (i) => i.getValue() || "-",
			}),
			labourCol.display({
				id: "actions",
				header: "Action",
				cell: ({ row }) => {
					const o: any = row.original;
					const id = String(o?.id || o?._id || "").trim();

					return (
						<Button
							size='sm'
							onClick={() => nav(`/warehouses/inward/labour/${id}`)}
							style={{
								background: theme,
								border: "none",
								color: "white",
								borderRadius: "6px",
								padding: "4px 12px",
								fontSize: "13px",
								display: "inline-flex",
								alignItems: "center",
								gap: 6,
							}}
						>
							<i className='ri-download-2-line' /> Inward
						</Button>
					);
				},
			}),
		],
		[labourCol, nav],
	);

	const returnCol = createColumnHelper<DispatchType>();

	const returnColumns = useMemo(
		() => [
			returnCol.accessor((_, idx) => idx + 1, {
				id: "srNo",
				header: "Sr No",
				cell: (i) => String(i.getValue() ?? "-"),
			}),
			returnCol.accessor("dispatchNo", {
				header: "Dispatch No",
				cell: (i) => i.getValue() || "-",
			}),
			returnCol.accessor("dispatchDate", {
				header: "Dispatch Date",
				cell: (i) => fmtDate(i.getValue()),
			}),
			returnCol.accessor("customerName", {
				header: "Customer Name",
				cell: (i) => i.getValue() || "-",
			}),
			returnCol.accessor("issuedFromWarehouseName", {
				header: "Warehouse",
				cell: (i) => i.getValue() || "-",
			}),
			returnCol.accessor("salesReturnInwardStatus", {
				header: "Sales Return Inward Status",
				cell: (i) => salesReturnInwardStatusBadge(i.getValue()),
			}),
			returnCol.accessor("returnedItemStatus", {
				header: "Returned Item Status",
				cell: (i) => returnedItemStatusBadge(i.getValue()),
			}),
			returnCol.display({
				id: "actions",
				header: "Action",
				cell: ({ row }) => {
					const o: any = row.original;
					const id = String(o?.id || o?._id || "").trim();

					return (
						<Button
							size='sm'
							disabled={!id}
							onClick={() => nav(`/warehouses/inward/sales-return/${id}`)}
							style={{
								background: theme,
								border: "none",
								color: "white",
								borderRadius: "6px",
								padding: "4px 12px",
								fontSize: "13px",
								display: "inline-flex",
								alignItems: "center",
								gap: 6,
							}}
						>
							<i className='ri-download-2-line' /> Inward
						</Button>
					);
				},
			}),
		],
		[returnCol, nav],
	);

	const handleExport = () => {
		const today = new Date();
		const yyyy = today.getFullYear();
		const mm = String(today.getMonth() + 1).padStart(2, "0");
		const dd = String(today.getDate()).padStart(2, "0");

		if (activeTab === "GRN") {
			const headers = [
				"Sr No",
				"GRN No",
				"Inward Type",
				"Inward Date",
				"Supplier",
				"Warehouse",
				"Invoice No",
				"Item",
				"Qty",
				"Unit",
				"Amount",
				"Remarks",
			];

			const rows = (warehouseInwards || []).map((row: any) => [
				row?.srNo ?? "-",
				row?.grnNo || "-",
				row?.inwardType || "-",
				fmtDate(row?.inwardDate),
				row?.supplierName || "-",
				row?.warehouseName || "-",
				row?.invoiceNo || "-",
				row?.itemsName || "-",
				row?.itemsQuantity ?? "-",
				row?.itemsUnit || "-",
				row?.itemsAmount ?? "-",
				row?.remarks || "-",
			]);

			downloadCsv(`warehouse_inward_${yyyy}-${mm}-${dd}.csv`, headers, rows);
			toast.success("Warehouse Inward exported successfully");
			return;
		}

		if (activeTab === "PENDING_TRANSFER") {
			const headers = [
				"Sr No",
				"Transfer No",
				"Transfer Date",
				"Transfer From",
				"Transfer To",
				"Status",
			];

			const rows = (pendingTransfers || []).map((row: any, idx: number) => [
				idx + 1,
				row?.transferNo || "-",
				fmtDate(row?.transferDate),
				row?.transferFromWarehouse || "-",
				row?.transferToWarehouse || "-",
				statusLabel(row?.status),
			]);

			downloadCsv(
				`pending_stock_transfers_${yyyy}-${mm}-${dd}.csv`,
				headers,
				rows,
			);
			toast.success("Pending Stock Transfers exported successfully");
			return;
		}

		if (activeTab === "PENDING_LABOUR") {
			const headers = [
				"Sr No",
				"Dispatch No",
				"Dispatch Date",
				"Labour Name",
				"Remarks",
			];

			const rows = (pendingIssueToLabours || []).map(
				(row: any, idx: number) => [
					idx + 1,
					row?.issueNo || "-",
					fmtDate(row?.issueDate),
					row?.labourName || "-",
					row?.remarks || "-",
				],
			);

			downloadCsv(
				`pending_labour_inward_${yyyy}-${mm}-${dd}.csv`,
				headers,
				rows,
			);
			toast.success("Pending Labour Inward exported successfully");
			return;
		}

		if (activeTab === "PENDING_SALE_RETURN") {
			const headers = [
				"Sr No",
				"Dispatch No",
				"Dispatch Date",
				"Customer Name",
				"Warehouse",
				"Sales Return Inward Status",
				"Returned Item Status",
			];

			const rows = (pendingSalesReturns || []).map((row: any, idx: number) => [
				idx + 1,
				row?.dispatchNo || "-",
				fmtDate(row?.dispatchDate),
				row?.customerName || "-",
				row?.issuedFromWarehouseName || "-",
				salesReturnInwardStatusLabel(row?.salesReturnInwardStatus),
				returnedItemStatusLabel(row?.returnedItemStatus),
			]);

			downloadCsv(
				`pending_sales_return_${yyyy}-${mm}-${dd}.csv`,
				headers,
				rows,
			);
			toast.success("Pending Sales Return exported successfully");
		}
	};

	return (
		<>
			<style>{`
				.inward-tabs {
					display: flex;
					gap: 22px;
					align-items: center;
					border-bottom: 1px solid #e9ebec;
					padding: 6px 2px 0 2px;
					margin-bottom: 14px;
					flex-wrap: wrap;
				}
				.inward-tab-btn {
					border: none;
					background: transparent;
					padding: 10px 0;
					font-weight: 700;
					font-size: 14px;
					color: #495057;
					position: relative;
				}
				.inward-tab-btn.active { color: ${theme}; }
				.inward-tab-btn.active::after {
					content: "";
					position: absolute;
					left: 0; right: 0; bottom: -1px;
					height: 3px;
					background: ${theme};
					border-radius: 6px;
				}
			`}</style>

			<div className='d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2'>
				<h4 className='mb-0 fw-bold' style={{ color: "#111" }}>
					Warehouse Inward
				</h4>

				<div className='d-flex gap-2 align-items-center'>
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

					{allowCreate && activeTab === "GRN" && (
						<Button
							onClick={() => nav("/warehouses/inward/new")}
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
							<i className='ri-add-circle-line' /> Add Inward
						</Button>
					)}
				</div>
			</div>

			<div className='inward-tabs'>
				<button
					className={`inward-tab-btn ${activeTab === "GRN" ? "active" : ""}`}
					onClick={() => changeTab("GRN")}
					type='button'
				>
					GRN List
				</button>

				<button
					className={`inward-tab-btn ${
						activeTab === "PENDING_TRANSFER" ? "active" : ""
					}`}
					onClick={() => changeTab("PENDING_TRANSFER")}
					type='button'
				>
					Pending Stock Transfers
					{(pendingTransfers?.length ?? 0) > 0 && (
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
							{pendingTransfers.length}
						</span>
					)}
				</button>

				<button
					className={`inward-tab-btn ${
						activeTab === "PENDING_LABOUR" ? "active" : ""
					}`}
					onClick={() => changeTab("PENDING_LABOUR")}
					type='button'
				>
					Pending Labour Inward
					{(pendingIssueToLabours?.length ?? 0) > 0 && (
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
							{pendingIssueToLabours.length}
						</span>
					)}
				</button>

				<button
					className={`inward-tab-btn ${
						activeTab === "PENDING_SALE_RETURN" ? "active" : ""
					}`}
					onClick={() => changeTab("PENDING_SALE_RETURN")}
					type='button'
				>
					Pending Sales Return
					{(pendingSalesReturns?.length ?? 0) > 0 && (
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
							{pendingSalesReturns.length}
						</span>
					)}
				</button>
			</div>

			{activeTab === "GRN" && (
				<>
					{error && <Alert variant='danger'>{error}</Alert>}

					{loadingList ? (
						<div className='d-flex justify-content-center py-5'>
							<Spinner animation='border' style={{ color: theme }} />
						</div>
					) : (
						<BasicTable
							data={warehouseInwards || []}
							columns={columns}
							title='Warehouse Inward'
						/>
					)}
				</>
			)}

			{activeTab === "PENDING_TRANSFER" && (
				<>
					{loadingPending ? (
						<div className='d-flex justify-content-center py-5'>
							<Spinner animation='border' style={{ color: theme }} />
						</div>
					) : (
						<BasicTable
							data={pendingTransfers || []}
							columns={stColumns}
							title='Pending Stock Transfers'
						/>
					)}
				</>
			)}

			{activeTab === "PENDING_LABOUR" && (
				<>
					{loadingPendingLabour ? (
						<div className='d-flex justify-content-center py-5'>
							<Spinner animation='border' style={{ color: theme }} />
						</div>
					) : (
						<BasicTable
							data={pendingIssueToLabours || []}
							columns={labourColumns}
							title='Pending Labour Inward'
						/>
					)}
				</>
			)}

			{activeTab === "PENDING_SALE_RETURN" && (
				<>
					{loadingPendingSalesReturn ? (
						<div className='d-flex justify-content-center py-5'>
							<Spinner animation='border' style={{ color: theme }} />
						</div>
					) : (
						<BasicTable
							data={pendingSalesReturns || []}
							columns={returnColumns}
							title='Pending Sales Return'
						/>
					)}
				</>
			)}
		</>
	);
}
