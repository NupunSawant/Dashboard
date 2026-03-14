import { useEffect, useMemo, useState } from "react";
import { Alert, Button, Card, Col, Form, Row, Spinner } from "react-bootstrap";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import WarehouseOutlinedIcon from "@mui/icons-material/WarehouseOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import { createColumnHelper, type SortingState } from "@tanstack/react-table";

import DashboardInventorySummaryTable from "./DashboardInventorySummaryTable";
import { useInventoryDashboard } from "../../hooks/useInventoryDashboard";
import { useWarehouseMasterOptions } from "../../hooks/useWarehouseMasterOptions";
import type { DashboardInventoryTableRow } from "../../types/Dashboard/dashboard";

const theme = "#1a8376";

const ALL_WAREHOUSES = "ALL_WAREHOUSES";
const ALL_CATEGORIES = "ALL_CATEGORIES";

const columnHelper = createColumnHelper<DashboardInventoryTableRow>();

export default function InventoryDashboardTable() {
	const {
		data: warehouseOptions = [],
		isLoading: loadingWarehouses,
		error: warehousesError,
	} = useWarehouseMasterOptions();

	const [selectedWarehouse, setSelectedWarehouse] =
		useState<string>(ALL_WAREHOUSES);
	const [selectedCategory, setSelectedCategory] =
		useState<string>(ALL_CATEGORIES);

	const [searchInput, setSearchInput] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");

	const [warehouseChanging, setWarehouseChanging] = useState(false);

	const [pageIndex, setPageIndex] = useState(0);
	const [pageSize, setPageSize] = useState(10);
	const [sorting, setSorting] = useState<SortingState>([
		{ id: "srNo", desc: false },
	]);

	useEffect(() => {
		const timer = window.setTimeout(() => {
			setDebouncedSearch(searchInput.trim());
			setPageIndex(0);
		}, 350);

		return () => window.clearTimeout(timer);
	}, [searchInput]);

	const sortBy = sorting[0]?.id || "srNo";
	const sortOrder = sorting[0]?.desc ? "desc" : "asc";

	const effectiveWarehouseName =
		selectedWarehouse === ALL_WAREHOUSES ? "" : selectedWarehouse;
	const effectiveCategory =
		selectedCategory === ALL_CATEGORIES ? "" : selectedCategory;

	const {
		data,
		isLoading: loadingInventory,
		isFetching,
		error: inventoryError,
		refetch,
	} = useInventoryDashboard({
		warehouseName: effectiveWarehouseName,
		category: effectiveCategory,
		search: debouncedSearch,
		page: pageIndex + 1,
		limit: pageSize,
		sortBy,
		sortOrder,
	});

	const rows = data?.rows || [];
	const totalRecords = Number(data?.pagination?.total ?? 0);
	const categoriesForSelectedWarehouse = data?.meta?.categories || [];
	const appliedWarehouseName = String(
		data?.meta?.appliedFilters?.warehouseName ?? "",
	);

	useEffect(() => {
		if (warehouseChanging && appliedWarehouseName === effectiveWarehouseName) {
			setWarehouseChanging(false);
		}
	}, [warehouseChanging, appliedWarehouseName, effectiveWarehouseName]);

	useEffect(() => {
		if (!warehouseChanging) return;

		if (
			selectedCategory !== ALL_CATEGORIES &&
			!categoriesForSelectedWarehouse.includes(selectedCategory)
		) {
			setSelectedCategory(ALL_CATEGORIES);
			setPageIndex(0);
		}
	}, [warehouseChanging, categoriesForSelectedWarehouse, selectedCategory]);

	useEffect(() => {
		if (warehouseChanging) return;

		if (
			selectedCategory !== ALL_CATEGORIES &&
			!categoriesForSelectedWarehouse.includes(selectedCategory)
		) {
			setSelectedCategory(ALL_CATEGORIES);
			setPageIndex(0);
		}
	}, [warehouseChanging, categoriesForSelectedWarehouse, selectedCategory]);

	const columns = useMemo(
		() => [
			columnHelper.accessor("srNo", {
				header: "SR No",
				cell: (info) => (
					<span className='fw-semibold text-muted'>{info.getValue()}</span>
				),
			}),
			columnHelper.accessor("itemName", {
				header: "Item Name",
				cell: (info) => (
					<span className='fw-semibold text-dark'>{info.getValue()}</span>
				),
			}),
			columnHelper.accessor("warehouseName", { header: "Warehouse" }),
			columnHelper.accessor("category", { header: "Category" }),
			columnHelper.accessor("subCategory", { header: "Sub Category" }),
			columnHelper.accessor("unit", { header: "Unit" }),
			columnHelper.accessor("receivedQuantity", {
				header: "Received Qty",
				cell: (info) => Number(info.getValue() ?? 0).toLocaleString(),
			}),
			columnHelper.accessor("reservedQuantity", {
				header: "Reserved Qty",
				cell: (info) => (
					<span
						className='fw-semibold px-2 py-1 rounded-pill'
						style={{
							background: "rgba(255, 193, 7, 0.14)",
							color: "#9a6700",
							fontSize: "0.82rem",
						}}
					>
						{Number(info.getValue() ?? 0).toLocaleString()}
					</span>
				),
			}),
			columnHelper.accessor("availableQuantity", {
				header: "Available Qty",
				cell: (info) => (
					<span
						className='fw-bold px-2 py-1 rounded-pill'
						style={{
							background: "rgba(26, 131, 118, 0.12)",
							color: theme,
							fontSize: "0.84rem",
						}}
					>
						{Number(info.getValue() ?? 0).toLocaleString()}
					</span>
				),
			}),
		],
		[],
	);

	const loading = loadingWarehouses || (loadingInventory && !data);

	const error =
		(inventoryError as any)?.message ||
		(warehousesError as any)?.message ||
		null;

	return (
		<Card
			className='border-0 shadow-sm overflow-hidden'
			style={{
				borderRadius: "22px",
				background:
					"linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(250,252,255,0.98) 100%)",
				boxShadow: "0 14px 38px rgba(15, 23, 42, 0.08)",
			}}
		>
			<div
				style={{
					height: 5,
					background:
						"linear-gradient(90deg, #1a8376 0%, #0d6efd 50%, #6f42c1 100%)",
				}}
			/>

			<Card.Header
				className='border-0'
				style={{
					padding: "1rem 1rem 0.95rem",
					background:
						"linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(248,252,253,1) 100%)",
				}}
			>
				<div className='d-flex flex-wrap align-items-center justify-content-between gap-3'>
					<div className='d-flex align-items-center gap-3'>
						<div
							style={{
								width: 52,
								height: 52,
								borderRadius: "16px",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								background:
									"linear-gradient(135deg, rgba(26,131,118,0.12) 0%, rgba(13,110,253,0.12) 100%)",
								boxShadow: "0 10px 24px rgba(15, 23, 42, 0.08)",
							}}
						>
							<Inventory2OutlinedIcon style={{ color: theme, fontSize: 26 }} />
						</div>

						<div>
							<div
								className='fw-bold'
								style={{
									fontSize: "1.08rem",
									color: "#0f172a",
									lineHeight: 1.15,
								}}
							>
								Inventory Details
							</div>
							<div className='text-muted' style={{ fontSize: "0.9rem" }}>
								Server-side filtered inventory for fast dashboard loading
							</div>
						</div>
					</div>

					<div className='d-flex align-items-center gap-2 flex-wrap'>
						<span
							className='px-3 py-2 rounded-pill fw-semibold'
							style={{
								background: "rgba(26,131,118,0.10)",
								color: theme,
								fontSize: "0.84rem",
							}}
						>
							Total Rows: {totalRecords.toLocaleString()}
						</span>

						{isFetching ? (
							<span
								className='px-3 py-2 rounded-pill fw-semibold d-inline-flex align-items-center gap-2'
								style={{
									background: "rgba(13,110,253,0.08)",
									color: "#0d6efd",
									fontSize: "0.84rem",
								}}
							>
								<Spinner animation='border' size='sm' />
								Refreshing
							</span>
						) : null}
					</div>
				</div>
			</Card.Header>

			<Card.Body style={{ padding: "1rem" }}>
				{loading ? (
					<div
						className='d-flex flex-column align-items-center justify-content-center'
						style={{
							minHeight: "240px",
							borderRadius: "18px",
							background:
								"linear-gradient(135deg, rgba(26,131,118,0.05) 0%, rgba(13,110,253,0.04) 100%)",
							border: "1px solid rgba(26,131,118,0.10)",
						}}
					>
						<Spinner animation='border' style={{ color: theme }} />
						<div className='mt-3 fw-semibold' style={{ color: "#495057" }}>
							Loading inventory...
						</div>
						<div className='text-muted small mt-1'>
							Please wait while dashboard data is being prepared
						</div>
					</div>
				) : error ? (
					<Alert
						variant='danger'
						className='mb-0 border-0'
						style={{
							borderRadius: "16px",
							background: "linear-gradient(135deg, #fff5f5 0%, #fff 100%)",
							boxShadow: "0 8px 22px rgba(220, 53, 69, 0.08)",
						}}
					>
						<div className='fw-semibold mb-1'>Unable to load inventory</div>
						<div>{error}</div>
					</Alert>
				) : (
					<>
						<Card
							className='border-0 mb-3'
							style={{
								borderRadius: "18px",
								background:
									"linear-gradient(135deg, rgba(26,131,118,0.05) 0%, rgba(255,255,255,0.95) 100%)",
								boxShadow: "0 10px 25px rgba(15, 23, 42, 0.05)",
								border: "1px solid rgba(26,131,118,0.10)",
							}}
						>
							<Card.Body style={{ padding: "1rem 1rem 0.9rem" }}>
								<Row className='g-3 align-items-end'>
									<Col xl={4} md={6}>
										<Form.Group>
											<Form.Label
												className='fw-semibold d-flex align-items-center gap-2 mb-2'
												style={{ color: "#334155", fontSize: "0.92rem" }}
											>
												<WarehouseOutlinedIcon
													style={{ fontSize: 18, color: theme }}
												/>
												Warehouse
											</Form.Label>
											<Form.Select
												value={selectedWarehouse}
												onChange={(e) => {
													const nextWarehouse = e.target.value;
													setSelectedWarehouse(nextWarehouse);
													setSelectedCategory(ALL_CATEGORIES);
													setPageIndex(0);
													setWarehouseChanging(true);
												}}
												style={{
													borderRadius: "12px",
													minHeight: "44px",
													border: "1px solid rgba(26,131,118,0.18)",
													boxShadow: "none",
												}}
											>
												<option value={ALL_WAREHOUSES}>All Warehouses</option>
												{warehouseOptions.map((w) => (
													<option key={w} value={w}>
														{w}
													</option>
												))}
											</Form.Select>
										</Form.Group>
									</Col>

									<Col xl={4} md={6}>
										<Form.Group>
											<Form.Label
												className='fw-semibold d-flex align-items-center gap-2 mb-2'
												style={{ color: "#334155", fontSize: "0.92rem" }}
											>
												<CategoryOutlinedIcon
													style={{ fontSize: 18, color: theme }}
												/>
												Category
											</Form.Label>
											<Form.Select
												value={selectedCategory}
												disabled={warehouseChanging}
												onChange={(e) => {
													setSelectedCategory(e.target.value);
													setPageIndex(0);
												}}
												style={{
													borderRadius: "12px",
													minHeight: "44px",
													border: "1px solid rgba(26,131,118,0.18)",
													boxShadow: "none",
													backgroundColor: warehouseChanging
														? "rgba(248, 249, 250, 0.95)"
														: undefined,
													cursor: warehouseChanging ? "not-allowed" : "pointer",
												}}
											>
												<option value={ALL_CATEGORIES}>All Categories</option>
												{categoriesForSelectedWarehouse.map((c) => (
													<option key={c} value={c}>
														{c}
													</option>
												))}
											</Form.Select>
										</Form.Group>
									</Col>

									<Col xl={4} md={12}>
										<div className='d-flex gap-2 flex-wrap justify-content-md-start justify-content-xl-end'>
											<Button
												variant='light'
												onClick={() => {
													setSelectedWarehouse(ALL_WAREHOUSES);
													setSelectedCategory(ALL_CATEGORIES);
													setSearchInput("");
													setDebouncedSearch("");
													setWarehouseChanging(false);
													setPageIndex(0);
													setPageSize(10);
													setSorting([{ id: "srNo", desc: false }]);
												}}
												className='fw-semibold d-flex align-items-center gap-2 px-3'
												style={{
													minHeight: "44px",
													borderRadius: "12px",
													border: "1px solid rgba(26,131,118,0.18)",
													color: theme,
												}}
											>
												<RestartAltRoundedIcon style={{ fontSize: 18 }} />
												Reset Filters
											</Button>
										</div>
									</Col>
								</Row>

								<div
									className='d-flex flex-wrap gap-2 mt-3'
									style={{ paddingBottom: "0.2rem" }}
								>
									<span
										className='px-3 py-2 rounded-pill fw-semibold'
										style={{
											background: "rgba(26,131,118,0.10)",
											color: theme,
											fontSize: "0.84rem",
										}}
									>
										Visible Page Rows: {rows.length}
									</span>

									{selectedWarehouse !== ALL_WAREHOUSES && (
										<span
											className='px-3 py-2 rounded-pill fw-semibold'
											style={{
												background: "rgba(13,110,253,0.08)",
												color: "#0d6efd",
												fontSize: "0.84rem",
											}}
										>
											Warehouse: {selectedWarehouse}
										</span>
									)}

									{selectedCategory !== ALL_CATEGORIES && (
										<span
											className='px-3 py-2 rounded-pill fw-semibold'
											style={{
												background: "rgba(111,66,193,0.08)",
												color: "#6f42c1",
												fontSize: "0.84rem",
											}}
										>
											Category: {selectedCategory}
										</span>
									)}

									{debouncedSearch && (
										<span
											className='px-3 py-2 rounded-pill fw-semibold'
											style={{
												background: "rgba(15,23,42,0.06)",
												color: "#334155",
												fontSize: "0.84rem",
											}}
										>
											Search: {debouncedSearch}
										</span>
									)}

									{warehouseChanging && (
										<span
											className='px-3 py-2 rounded-pill fw-semibold d-inline-flex align-items-center gap-2'
											style={{
												background: "rgba(255, 193, 7, 0.12)",
												color: "#9a6700",
												fontSize: "0.84rem",
											}}
										>
											<Spinner animation='border' size='sm' />
											Updating category options...
										</span>
									)}
								</div>
							</Card.Body>
						</Card>

						<DashboardInventorySummaryTable
							title='Inventory Details'
							subtitle='Backend-filtered inventory table with TanStack Query'
							iconClassName='ri-database-2-line'
							data={rows}
							columns={columns}
							loading={loadingInventory}
							error={error}
							totalRecords={totalRecords}
							pageIndex={pageIndex}
							pageSize={pageSize}
							onPageChange={(nextPage) => setPageIndex(nextPage)}
							onPageSizeChange={(size) => {
								setPageSize(size);
								setPageIndex(0);
							}}
							sorting={sorting}
							onSortingChange={(nextSorting) => {
								setSorting(nextSorting);
								setPageIndex(0);
							}}
							search={searchInput}
							onSearchChange={(value) => setSearchInput(value)}
							onRefresh={() => refetch()}
							emptyTitle='No inventory records found'
							emptySubtitle='Try changing warehouse, category, or search filters'
							maxBodyHeight={480}
						/>
					</>
				)}
			</Card.Body>
		</Card>
	);
}
