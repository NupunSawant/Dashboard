import { useEffect, useMemo, useState } from "react";
import { Alert, Spinner, Button } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../slices/store";
import BasicTable from "../../../components/Table/BasicTable";
import { createColumnHelper } from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { canCreate, canUpdate } from "../../../utils/permission";
import {
	fetchStockTransfersThunk,
	revertStockTransferThunk,
} from "../../../slices/Warehouse/Stocktransfer/thunks";
import type { StockTransfer } from "../../../types/Warehouses/stocktransfer";

const theme = "#1a8376";

const fmtDate = (val: any) => {
	if (!val) return "-";
	try {
		const d = new Date(val);
		return isNaN(d.getTime()) ? String(val) : d.toLocaleDateString();
	} catch {
		return String(val);
	}
};

const fmtDateTime = (val: any) => {
	if (!val) return "-";
	try {
		const d = new Date(val);
		return isNaN(d.getTime()) ? String(val) : d.toLocaleString();
	} catch {
		return String(val);
	}
};

const statusBadge = (status?: string) => {
	const s = String(status || "DISPATCHED");
	const map: Record<string, { bg: string; text: string; label: string }> = {
		DISPATCHED: { bg: "#e6f7ff", text: "#096dd9", label: "Dispatched" },
		COMPLETED: { bg: "#f6ffed", text: "#389e0d", label: "Completed" },
		REVERTED: { bg: "#fff1f0", text: "#cf1322", label: "Reverted" },
		PENDING: { bg: "#fff7e6", text: "#ad6800", label: "Pending" },
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

const pickId = (x: any) => String(x?.id || x?._id || "").trim();

export default function StockTransferList() {
	const dispatch = useDispatch<AppDispatch>();
	const nav = useNavigate();

	const authUser = useSelector((s: RootState) => s.auth.user);
	const allowCreate = canCreate(authUser, "warehouse", "dispatch");
	const allowUpdate = canUpdate(authUser, "warehouse", "dispatch");

	const { stockTransfers, loadingList, saving, error } = useSelector(
		(s: RootState) => (s as any).stockTransfer,
	) || {};

	const [revertingId, setRevertingId] = useState("");

	useEffect(() => {
		dispatch(fetchStockTransfersThunk());
	}, [dispatch]);

	const col = createColumnHelper<StockTransfer>();

	const columns = useMemo(
		() => [
			col.accessor((row, idx) => idx + 1, {
				id: "srNo",
				header: "Sr No",
				cell: (i) => String(i.getValue() ?? "-"),
			}),
			col.accessor("transferNo", {
				header: "Transfer No",
				cell: (i) => i.getValue() || "-",
			}),
			col.accessor("transferDate", {
				header: "Transfer Date",
				cell: (i) => fmtDate(i.getValue()),
			}),
			col.accessor("transferFromWarehouse", {
				header: "Transfer From",
				cell: (i) => i.getValue() || "-",
			}),
			col.accessor("transferToWarehouse", {
				header: "Transfer To",
				cell: (i) => i.getValue() || "-",
			}),
			col.accessor("status", {
				header: "Dispatch Status",
				cell: (i) => statusBadge(i.getValue()),
			}),
			col.accessor(
				(row) =>
					(row as any)?.createdBy && (row as any)?.createdAt
						? `${(row as any).createdBy} - ${fmtDateTime((row as any).createdAt)}`
						: (row as any)?.createdBy || fmtDateTime((row as any)?.createdAt),
				{
					id: "createdByDate",
					header: "Created By / Date",
					cell: (i) => String(i.getValue() || "-"),
				},
			),
			col.display({
				id: "actions",
				header: "Action",
				cell: ({ row }) => {
					const o: any = row.original;
					const id = pickId(o);
					const status = String(o?.status || "DISPATCHED");
					const canEdit = status === "DISPATCHED";
					const canRevert = status === "DISPATCHED";
					const revertBusy = revertingId === id;

					return (
						<div className="d-flex gap-2 align-items-center">
							{/* View */}
							<Button
								size="sm"
								disabled={!id}
								onClick={() => nav(`/warehouses/stock-transfer/${id}/view`)}
								style={{
									background: "#eaf4f2",
									border: "none",
									color: theme,
									borderRadius: "6px",
									padding: "4px 10px",
								}}
								title="View"
							>
								<i className="ri-eye-line" />
							</Button>

							{/* Edit */}
							{allowUpdate && (
								<Button
									size="sm"
									disabled={!id || !canEdit}
									onClick={() => nav(`/warehouses/stock-transfer/${id}/edit`)}
									style={{
										background: canEdit ? "#eaf4f2" : "#f5f7f9",
										border: "none",
										color: canEdit ? theme : "#6c757d",
										borderRadius: "6px",
										padding: "4px 10px",
									}}
									title="Edit"
								>
									<i className="ri-pencil-line" />
								</Button>
							)}

							{/* Revert */}
							{allowUpdate && (
								<Button
									size="sm"
									disabled={!id || !canRevert || revertBusy || saving}
									onClick={async () => {
										const ok = window.confirm(
											"Revert this stock transfer? Inventory will be restored.",
										);
										if (!ok) return;
										setRevertingId(id);
										try {
											await dispatch(revertStockTransferThunk(id)).unwrap();
											toast.success("Stock transfer reverted");
											dispatch(fetchStockTransfersThunk());
										} catch (e: any) {
											toast.error(e || "Failed to revert");
										} finally {
											setRevertingId("");
										}
									}}
									style={{
										background: canRevert ? "#fff7e6" : "#f5f7f9",
										border: "none",
										color: canRevert ? "#ad6800" : "#6c757d",
										borderRadius: "6px",
										padding: "4px 10px",
										display: "inline-flex",
										alignItems: "center",
										gap: 6,
									}}
									title="Revert"
								>
									<i className="ri-arrow-go-back-line" />
									{revertBusy ? "..." : ""}
								</Button>
							)}
						</div>
					);
				},
			}),
		],
		[col, nav, revertingId, saving, dispatch],
	);

	return (
		<>
			{error && <Alert variant="danger">{error}</Alert>}

			{loadingList ? (
				<div className="d-flex justify-content-center py-5">
					<Spinner animation="border" style={{ color: theme }} />
				</div>
			) : (
				<BasicTable
					data={stockTransfers || []}
					columns={columns}
					title="Stock Transfer"
					rightActions={
						<div className="d-flex gap-2">
							<Button
								variant="light"
								onClick={() => dispatch(fetchStockTransfersThunk())}
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
								onClick={() => toast.info("Export not connected yet")}
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

							{allowCreate && (
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
						</div>
					}
				/>
			)}
		</>
	);
}