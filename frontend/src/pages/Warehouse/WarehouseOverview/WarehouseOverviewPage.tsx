import { useEffect, useMemo, useState } from "react";
import { Alert, Button, Form, Spinner } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { createColumnHelper } from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";
import type { AppDispatch, RootState } from "../../../slices/store";
import {
	fetchDailyLogThunk,
	fetchInStockThunk,
} from "../../../slices/Warehouse/WarehouseOverview/thunks";
import {
	setSelectedWarehouse,
	clearWarehouseOverview,
} from "../../../slices/Warehouse/WarehouseOverview/reducer";
import { fetchWarehousesThunk } from "../../../slices/Masters/warehouses/thunks";
import type {
	DailyLogRow,
	InStockRow,
} from "../../../types/Warehouses/warehouseOverview";
import BasicTable from "../../../components/Table/BasicTable";

const theme = "#1a8376";

type TabKey = "DAILY_LOG" | "IN_STOCK";

export default function WarehouseOverviewPage() {
	const dispatch = useDispatch<AppDispatch>();
	const nav = useNavigate();

	const warehouses = useSelector(
		(s: RootState) => (s as any).warehouses?.warehouses ?? [],
	);

	const {
		selectedWarehouse,
		dailyLog,
		inStock,
		loadingDailyLog,
		loadingInStock,
		error,
	} = useSelector((s: RootState) => (s as any).warehouseOverview);

	const [localWarehouse, setLocalWarehouse] = useState<string>(
		selectedWarehouse ?? "",
	);

	const [activeTab, setActiveTab] = useState<TabKey>("DAILY_LOG");

	useEffect(() => {
		dispatch(fetchWarehousesThunk());
		return () => {
			dispatch(clearWarehouseOverview());
		};
	}, [dispatch]);

	useEffect(() => {
		if (warehouses.length > 0 && !localWarehouse) {
			const first = String(warehouses[0]?.warehouseName ?? "");
			if (first) {
				setLocalWarehouse(first);
				dispatch(setSelectedWarehouse(first));
			}
		}
	}, [warehouses]);

	useEffect(() => {
		if (!localWarehouse) return;
		dispatch(fetchDailyLogThunk(localWarehouse));
		dispatch(fetchInStockThunk(localWarehouse));
	}, [localWarehouse, dispatch]);

	const handleWarehouseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const val = e.target.value;
		setLocalWarehouse(val);
		dispatch(setSelectedWarehouse(val));
	};

	/* ───────────── DAILY LOG COLUMNS ───────────── */

	const dailyCol = createColumnHelper<DailyLogRow>();

	const dailyColumns = useMemo(
		() => [
			dailyCol.accessor("srNo", {
				header: "Sr No",
				cell: (i) => i.getValue() ?? "-",
			}),
			dailyCol.accessor("itemName", {
				header: "Item Name",
				cell: (i) => i.getValue() || "-",
			}),
			dailyCol.accessor("itemCode", {
				header: "Item Code",
				cell: (i) => i.getValue() || "-",
			}),
			dailyCol.accessor("category", {
				header: "Category",
				cell: (i) => i.getValue() || "-",
			}),
			dailyCol.accessor("subCategory", {
				header: "Sub Category",
				cell: (i) => i.getValue() || "-",
			}),
			dailyCol.accessor("unit", {
				header: "Unit",
				cell: (i) => i.getValue() || "-",
			}),
			dailyCol.accessor("todayIn", {
				header: "Today In",
				cell: (i) => (
					<span style={{ color: "#1a8376", fontWeight: 600 }}>
						{i.getValue() ?? 0}
					</span>
				),
			}),
			dailyCol.accessor("todayOut", {
				header: "Today Out",
				cell: (i) => (
					<span style={{ color: "#e74c3c", fontWeight: 600 }}>
						{i.getValue() ?? 0}
					</span>
				),
			}),
			dailyCol.accessor("closingStock", {
				header: "Closing Stock",
				cell: (i) => (
					<span style={{ fontWeight: 600 }}>{i.getValue() ?? 0}</span>
				),
			}),
		],
		[dailyCol],
	);

	/* ───────────── IN STOCK COLUMNS ───────────── */

	const stockCol = createColumnHelper<InStockRow>();

	const inStockColumns = useMemo(
		() => [
			stockCol.accessor("srNo", {
				header: "Sr No",
				cell: (i) => i.getValue() ?? "-",
			}),
			stockCol.accessor("itemName", {
				header: "Item Name",
				cell: (i) => i.getValue() || "-",
			}),
			stockCol.accessor("itemCode", {
				header: "Item Code",
				cell: (i) => i.getValue() || "-",
			}),
			stockCol.accessor("category", {
				header: "Category",
				cell: (i) => i.getValue() || "-",
			}),
			stockCol.accessor("subCategory", {
				header: "Sub Category",
				cell: (i) => i.getValue() || "-",
			}),
			stockCol.accessor("unit", {
				header: "Unit",
				cell: (i) => i.getValue() || "-",
			}),
			stockCol.accessor("totalQuantity", {
				header: "Total Quantity",
				cell: (i) => (
					<span style={{ fontWeight: 600, color: theme }}>
						{i.getValue() ?? 0}
					</span>
				),
			}),
			stockCol.accessor("inventoryIds", {
				header: "Action",
				enableSorting: false,
				cell: (i) => {
					const id = i.getValue()?.[0];
					return (
						<Button
							size='sm'
							disabled={!id}
							onClick={() =>
								nav(
									`/warehouses/${id}/view?warehouseName=${encodeURIComponent(
										localWarehouse,
									)}`,
								)
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
		[stockCol, nav],
	);

	const isLoading = loadingDailyLog || loadingInStock;

	return (
		<>
			<style>{`
				.warehouse-tabs {
					display: flex;
					gap: 22px;
					align-items: center;
					border-bottom: 1px solid #e9ebec;
					padding: 6px 2px 0 2px;
					margin-bottom: 14px;
				}

				.warehouse-tab-btn {
					border: none;
					background: transparent;
					padding: 10px 0;
					font-weight: 700;
					font-size: 14px;
					color: #495057;
					position: relative;
				}

				.warehouse-tab-btn.active {
					color: ${theme};
				}

				.warehouse-tab-btn.active::after {
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

			<div
				className='d-flex align-items-center justify-content-between mb-3'
				style={{ flexWrap: "wrap", gap: "12px" }}
			>
				<h5 style={{ margin: 0, fontWeight: 600, color: "#2d3748" }}>
					Warehouse Overview
				</h5>

				<div className='d-flex align-items-center gap-2'>
					<Form.Label className='mb-0 fw-semibold'>Warehouse:</Form.Label>

					<Form.Select
						size='sm'
						value={localWarehouse}
						onChange={handleWarehouseChange}
						style={{
							minWidth: "200px",
							borderRadius: "6px",
							border: "1px solid #e2e8f0",
						}}
					>
						<option value=''>-- Select Warehouse --</option>
						{warehouses.map((w: any) => {
							const name = String(w?.warehouseName ?? "");
							return (
								<option key={name} value={name}>
									{name}
								</option>
							);
						})}
					</Form.Select>
				</div>
			</div>

			<div className='warehouse-tabs'>
				<button
					className={`warehouse-tab-btn ${
						activeTab === "DAILY_LOG" ? "active" : ""
					}`}
					onClick={() => setActiveTab("DAILY_LOG")}
				>
					Daily Log
				</button>

				<button
					className={`warehouse-tab-btn ${
						activeTab === "IN_STOCK" ? "active" : ""
					}`}
					onClick={() => setActiveTab("IN_STOCK")}
				>
					In Stock
				</button>
			</div>

			{error && <Alert variant='danger'>{error}</Alert>}

			{!localWarehouse && (
				<Alert variant='info'>
					Please select a warehouse to view the overview.
				</Alert>
			)}

			{localWarehouse && (
				<>
					{isLoading ? (
						<div className='d-flex justify-content-center py-5'>
							<Spinner animation='border' style={{ color: theme }} />
						</div>
					) : (
						<>
							{activeTab === "DAILY_LOG" ? (
								<BasicTable
									data={dailyLog || []}
									columns={dailyColumns}
									title={`Daily Log — ${localWarehouse}`}
								/>
							) : (
								<BasicTable
									data={inStock || []}
									columns={inStockColumns}
									title={`In Stock — ${localWarehouse}`}
								/>
							)}
						</>
					)}
				</>
			)}
		</>
	);
}
