import { useEffect, useMemo } from "react";
import { Alert, Spinner, Button, Card } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../slices/store";
import BasicTable from "../../../components/Table/BasicTable";
import { createColumnHelper } from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";

import { fetchDispatchesThunk } from "../../../slices/Warehouse/Dispatch/thunks";
import type { Dispatch as DispatchType } from "../../../types/Warehouses/dispatch";

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

const dispatchStatusBadge = (status?: string) => {
	const s = String(status || "PENDING").toUpperCase();

	const map: Record<
		string,
		{ bg: string; text: string; border: string; label: string }
	> = {
		PENDING: {
			bg: "#fff7e6",
			text: "#ad6800",
			border: "#ffe7ba",
			label: "Pending",
		},
		DELIVERED: {
			bg: "#f0f5ff",
			text: "#2f54eb",
			border: "#d6e4ff",
			label: "Delivered",
		},
	};

	const cfg = map[s] || map.PENDING;

	return (
		<span
			style={{
				display: "inline-flex",
				alignItems: "center",
				gap: 6,
				background: cfg.bg,
				color: cfg.text,
				border: `1px solid ${cfg.border}`,
				fontWeight: 700,
				padding: "5px 10px",
				borderRadius: 999,
				fontSize: 12,
				lineHeight: 1,
				whiteSpace: "nowrap",
			}}
		>
			<span
				style={{
					width: 6,
					height: 6,
					borderRadius: "50%",
					background: cfg.text,
					display: "inline-block",
				}}
			/>
			{cfg.label}
		</span>
	);
};

const typeBadge = (type?: string) => {
	const t = String(type || "").toUpperCase();
	if (!t) return "-";

	const map: Record<
		string,
		{ bg: string; text: string; border: string; label: string }
	> = {
		ORDER: {
			bg: "#ecfdf3",
			text: "#027a48",
			border: "#d1fadf",
			label: "Order",
		},
		QUOTATION: {
			bg: "#fff7ed",
			text: "#c2410c",
			border: "#fed7aa",
			label: "Quotation",
		},
	};

	const cfg = map[t] || {
		bg: "#f8fafc",
		text: "#475467",
		border: "#eaecf0",
		label: t,
	};

	return (
		<span
			style={{
				display: "inline-flex",
				alignItems: "center",
				background: cfg.bg,
				color: cfg.text,
				border: `1px solid ${cfg.border}`,
				fontWeight: 700,
				padding: "5px 10px",
				borderRadius: 999,
				fontSize: 12,
				lineHeight: 1,
				whiteSpace: "nowrap",
			}}
		>
			{cfg.label}
		</span>
	);
};

const pickId = (x: any) =>
	String(x?.id || x?._id || x?.dispatchId || x?.dispatchNo || "").trim();

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

export default function InventoryDispatchList() {
	const dispatch = useDispatch<AppDispatch>();
	const nav = useNavigate();

	const dispatchState = useSelector(
		(s: RootState) => (s as any).warehouseDispatch || {},
	);

	const {
		dispatches = [],
		loadingList = false,
		error = null,
	} = dispatchState || {};

	useEffect(() => {
		dispatch(fetchDispatchesThunk());
	}, [dispatch]);

	const stats = useMemo(() => {
		const rows = Array.isArray(dispatches) ? dispatches : [];
		return {
			total: rows.length,
			pending: rows.filter(
				(x: any) =>
					String(x?.dispatchStatus || "PENDING").toUpperCase() === "PENDING",
			).length,
			delivered: rows.filter(
				(x: any) =>
					String(x?.dispatchStatus || "").toUpperCase() === "DELIVERED",
			).length,
		};
	}, [dispatches]);

	const col = createColumnHelper<DispatchType>();

	const columns = useMemo(
		() => [
			col.accessor((_, idx) => idx + 1, {
				id: "srNo",
				header: "Sr No",
				cell: (i) => <span style={{ fontWeight: 600 }}>{i.getValue()}</span>,
			}),
			col.accessor(
				(row) =>
					(row as any).dispatchNo ||
					(row as any).dispatchId ||
					(row as any).id ||
					(row as any)._id,
				{
					id: "dispatchKey",
					header: "Dispatch No",
					cell: (i) => (
						<span style={{ fontWeight: 700, color: "#1f2937" }}>
							{String(i.getValue() ?? "-")}
						</span>
					),
				},
			),
			col.accessor("dispatchDate", {
				header: "Dispatch Date",
				cell: (i) => fmtDateTime(i.getValue()),
			}),
			col.accessor("orderNo", {
				header: "Order No",
				cell: (i) => i.getValue() || "-",
			}),
			col.accessor("quotationNo", {
				header: "Quotation No",
				cell: (i) => i.getValue() || "-",
			}),
			col.accessor("dispatchType", {
				header: "Dispatch Type",
				cell: (i) => typeBadge(i.getValue()),
			}),
			col.accessor("issuedFromWarehouseName", {
				header: "Warehouse",
				cell: (i) => i.getValue() || "-",
			}),
			col.accessor("customerName", {
				header: "Customer Name",
				cell: (i) => i.getValue() || "-",
			}),
			col.accessor("dispatchStatus", {
				header: "Dispatch Status",
				cell: (i) => dispatchStatusBadge(i.getValue()),
			}),
			col.accessor(
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
			col.accessor(
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
			col.display({
				id: "actions",
				header: "Action",
				cell: ({ row }) => {
					const d: any = row.original;
					const dispatchId = pickId(d);

					return (
						<Button
							size='sm'
							disabled={!dispatchId}
							onClick={() => nav(`/inventory/dispatch/${dispatchId}/view`)}
							style={{
								background: "#f8fbfa",
								border: "1px solid #dbe9e6",
								color: theme,
								borderRadius: 8,
								padding: "5px 12px",
								fontWeight: 600,
								display: "inline-flex",
								alignItems: "center",
								gap: 6,
							}}
							title='View'
						>
							<i className='ri-eye-line' />
							View
						</Button>
					);
				},
			}),
		],
		[col, nav],
	);

	return (
		<div>
			<div className='d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3'>
				<div>
					<h4 className='mb-1 fw-bold' style={{ color: "#111827" }}>
						Inventory Dispatch
					</h4>
					<div style={{ fontSize: 13, color: "#667085" }}>
						Read-only dispatch data mirrored from Warehouse Dispatch
					</div>
				</div>

				<Button
					variant='light'
					onClick={() => dispatch(fetchDispatchesThunk())}
					style={{
						border: "1px solid #e9ebec",
						fontSize: "13px",
						borderRadius: "8px",
						display: "inline-flex",
						alignItems: "center",
						gap: "6px",
						padding: "8px 14px",
						fontWeight: 600,
						background: "#fff",
					}}
				>
					<i className='ri-refresh-line' /> Refresh
				</Button>
			</div>

			<div className='d-flex gap-3 flex-wrap mb-3'>
				<Card
					style={{
						border: "1px solid #e9ebec",
						borderRadius: 12,
						minWidth: 160,
						boxShadow: "0 1px 2px rgba(16,24,40,0.04)",
					}}
				>
					<Card.Body style={{ padding: "14px 16px" }}>
						<div style={{ fontSize: 12, color: "#667085", marginBottom: 4 }}>
							Total
						</div>
						<div style={{ fontSize: 22, fontWeight: 700, color: "#111827" }}>
							{stats.total}
						</div>
					</Card.Body>
				</Card>

				<Card
					style={{
						border: "1px solid #e9ebec",
						borderRadius: 12,
						minWidth: 160,
						boxShadow: "0 1px 2px rgba(16,24,40,0.04)",
					}}
				>
					<Card.Body style={{ padding: "14px 16px" }}>
						<div style={{ fontSize: 12, color: "#667085", marginBottom: 4 }}>
							Pending
						</div>
						<div style={{ fontSize: 22, fontWeight: 700, color: "#111827" }}>
							{stats.pending}
						</div>
					</Card.Body>
				</Card>

				<Card
					style={{
						border: "1px solid #e9ebec",
						borderRadius: 12,
						minWidth: 160,
						boxShadow: "0 1px 2px rgba(16,24,40,0.04)",
					}}
				>
					<Card.Body style={{ padding: "14px 16px" }}>
						<div style={{ fontSize: 12, color: "#667085", marginBottom: 4 }}>
							Delivered
						</div>
						<div style={{ fontSize: 22, fontWeight: 700, color: "#111827" }}>
							{stats.delivered}
						</div>
					</Card.Body>
				</Card>
			</div>

			{error && (
				<Alert
					variant='danger'
					style={{
						borderRadius: 12,
						border: "1px solid #f1c0c7",
					}}
				>
					{String(error)}
				</Alert>
			)}

			<Card
				style={{
					border: "1px solid #e9ebec",
					borderRadius: 14,
					overflow: "hidden",
					boxShadow: "0 2px 8px rgba(16,24,40,0.04)",
				}}
			>
				<div
					className='d-flex align-items-center justify-content-between flex-wrap gap-2'
					style={{
						padding: "14px 16px",
						borderBottom: "1px solid #eef2f1",
						background: "#fcfcfd",
					}}
				>
					<div style={{ fontWeight: 700, color: "#111827" }}>
						Dispatch Records
					</div>

					<span
						style={{
							fontSize: 12,
							fontWeight: 700,
							color: theme,
							background: "#eef8f6",
							border: "1px solid #d9efea",
							padding: "5px 10px",
							borderRadius: 999,
						}}
					>
						Read Only
					</span>
				</div>

				<Card.Body style={{ padding: 14 }}>
					{loadingList ? (
						<div className='d-flex justify-content-center py-5'>
							<Spinner animation='border' style={{ color: theme }} />
						</div>
					) : (
						<BasicTable
							data={dispatches || []}
							columns={columns}
							title='Inventory Dispatch List'
						/>
					)}
				</Card.Body>
			</Card>
		</div>
	);
}