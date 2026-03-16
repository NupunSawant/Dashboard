import { useEffect, useMemo, useState } from "react";
import { Alert, Spinner, Button } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../slices/store";
import BasicTable from "../../../components/Table/BasicTable";
import { createColumnHelper } from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";
import {
	fetchStockOverviewThunk,
	fetchWarehouseStockThunk,
} from "../../../slices/Inventory/thunks";
import type {
	StockOverviewRow,
	WarehouseStockRow,
} from "../../../types/Inventory/inventory";

const theme = "#1a8376";

type TabKey = "OVERVIEW" | "WAREHOUSE";

export default function InventoryList() {
	const dispatch = useDispatch<AppDispatch>();
	const nav = useNavigate();
	const [tab, setTab] = useState<TabKey>("OVERVIEW");

	const {
		stockOverview,
		warehouseStock,
		loadingOverview,
		loadingWarehouseStock,
		error,
	} = useSelector((s: RootState) => s.inventory);

	useEffect(() => {
		dispatch(fetchStockOverviewThunk());
		dispatch(fetchWarehouseStockThunk());
	}, [dispatch]);

	const overviewCol = createColumnHelper<StockOverviewRow>();
	const warehouseCol = createColumnHelper<WarehouseStockRow>();

	const overviewColumns = useMemo(
		() => [
			overviewCol.accessor("srNo", {
				header: "Sr. No",
				cell: (i) => i.getValue() ?? "-",
			}),
			overviewCol.accessor("itemName", {
				header: "Item Name",
				cell: (i) => i.getValue() || "-",
			}),
			overviewCol.accessor("category", {
				header: "Category",
				cell: (i) => i.getValue() || "-",
			}),
			overviewCol.accessor("subCategory", {
				header: "Sub Category",
				cell: (i) => i.getValue() || "-",
			}),
			overviewCol.accessor("unit", {
				header: "Unit",
				cell: (i) => i.getValue() || "-",
			}),
			overviewCol.accessor("receivedQuantity", {
				header: "Received",
				cell: (i) => i.getValue() ?? 0,
			}),
			overviewCol.accessor("availableQuantity", {
				header: "Available",
				cell: (i) => i.getValue() ?? 0,
			}),
			overviewCol.accessor("reservedQuantity", {
				header: "Reserved",
				cell: (i) => i.getValue() ?? 0,
			}),
		],
		[overviewCol],
	);

	const warehouseColumns = useMemo(
		() => [
			warehouseCol.accessor("srNo", {
				header: "Sr. No",
				cell: (i) => i.getValue() ?? "-",
			}),
			warehouseCol.accessor("itemName", {
				header: "Item Name",
				cell: (i) => i.getValue() || "-",
			}),
			warehouseCol.accessor("category", {
				header: "Category",
				cell: (i) => i.getValue() || "-",
			}),
			warehouseCol.accessor("subCategory", {
				header: "Sub Category",
				cell: (i) => i.getValue() || "-",
			}),
			warehouseCol.accessor("unit", {
				header: "Unit",
				cell: (i) => i.getValue() || "-",
			}),
			warehouseCol.accessor("availableQuantity", {
				header: "Available",
				cell: (i) => i.getValue() ?? 0,
			}),
			warehouseCol.accessor("id", {
				header: "Action",
				enableSorting: false,
				cell: (i) => {
					const row = i.row.original;
					return (
						<Button
							size='sm'
							disabled={!row?.itemId}
							onClick={() =>
								nav(`/inventory/warehouse-stock/${row.itemId || ""}`)
							}
							style={{
								background: "#eaf4f2",
								border: "none",
								color: theme,
								borderRadius: "6px",
								padding: "4px 10px",
							}}
						>
							<i className='ri-eye-line' />
						</Button>
					);
				},
			}),
		],
		[warehouseCol, nav],
	);

	const loading = tab === "OVERVIEW" ? loadingOverview : loadingWarehouseStock;
	const tableTitle =
		tab === "OVERVIEW"
			? "Inventory - Stock Overview"
			: "Inventory - Warehouse-wise Stock";

	const handleExport = () => {
		const data = tab === "OVERVIEW" ? stockOverview : warehouseStock;
		if (!data || data.length === 0) return;

		let rows: any[] = [];

		if (tab === "OVERVIEW") {
			rows = data.map((row: any) => ({
				"Item Name": row.itemName,
				Category: row.category,
				"Sub Category": row.subCategory,
				Unit: row.unit,
				Received: row.receivedQuantity ?? 0,
				Available: row.availableQuantity ?? 0,
				Reserved: row.reservedQuantity ?? 0,
			}));
		} else {
			rows = data.map((row: any) => ({
				"Item Name": row.itemName,
				Category: row.category,
				"Sub Category": row.subCategory,
				Unit: row.unit,
				Available: row.availableQuantity ?? 0,
			}));
		}

		const headers = Object.keys(rows[0]);
		const csv =
			headers.join(",") +
			"\n" +
			rows.map((r) => headers.map((h) => r[h]).join(",")).join("\n");

		const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
		const url = URL.createObjectURL(blob);

		const link = document.createElement("a");
		link.href = url;
		link.download =
			tab === "OVERVIEW"
				? "inventory-stock-overview.csv"
				: "inventory-warehouse-stock.csv";

		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	return (
		<>
			{error && <Alert variant='danger'>{error}</Alert>}

			<div className='d-flex flex-wrap gap-2 mb-3'>
				<Button
					onClick={() => setTab("OVERVIEW")}
					style={{
						background: tab === "OVERVIEW" ? theme : "#fff",
						color: tab === "OVERVIEW" ? "#fff" : theme,
						border: `1px solid ${theme}`,
						borderRadius: "8px",
						fontSize: "13px",
						padding: "7px 14px",
					}}
				>
					<i className='ri-bar-chart-box-line me-1' />
					Stock Overview
				</Button>

				<Button
					onClick={() => setTab("WAREHOUSE")}
					style={{
						background: tab === "WAREHOUSE" ? theme : "#fff",
						color: tab === "WAREHOUSE" ? "#fff" : theme,
						border: `1px solid ${theme}`,
						borderRadius: "8px",
						fontSize: "13px",
						padding: "7px 14px",
					}}
				>
					<i className='ri-building-line me-1' />
					Warehouse-wise Stock
				</Button>
			</div>

			{loading ? (
				<div className='d-flex justify-content-center py-5'>
					<Spinner animation='border' style={{ color: theme }} />
				</div>
			) : tab === "OVERVIEW" ? (
				<BasicTable
					columns={overviewColumns}
					data={stockOverview || []}
					title={tableTitle}
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
						</div>
					}
				/>
			) : (
				<BasicTable
					columns={warehouseColumns}
					data={warehouseStock || []}
					title={tableTitle}
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
						</div>
					}
				/>
			)}
		</>
	);
}
