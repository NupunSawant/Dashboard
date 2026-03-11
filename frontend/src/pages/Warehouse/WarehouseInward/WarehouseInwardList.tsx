// WarehouseInwardList.tsx

import { useEffect, useMemo, useState } from "react";
import { Alert, Spinner, Button } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../slices/store";
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

const theme = "#1a8376";

type TabKey =
	| "GRN"
	| "PENDING_TRANSFER"
	| "PENDING_LABOUR"
	| "PENDING_SALE_RETURN";

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
					const id = i.getValue() || (i.row.original as any)._id;

					return (
						<div className='d-flex align-items-center gap-2'>
							<Button
								size='sm'
								disabled={!id}
								onClick={() => nav(`/warehouses/inward/${id}/view`)}
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
									onClick={() => nav(`/warehouses/inward/${id}/edit`)}
									style={{
										background: "#eaf4f2",
										border: "none",
										color: theme,
										borderRadius: "6px",
										padding: "4px 10px",
									}}
									title='Edit'
								>
									<i className='ri-pencil-line' />
								</Button>
							)}
						</div>
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
							}
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
