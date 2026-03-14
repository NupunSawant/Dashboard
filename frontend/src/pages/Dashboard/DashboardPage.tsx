import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Col, Row, Spinner } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../slices/store";
import { fetchDashboardThunk } from "../../slices/Dashboard/thunks";
import axios from "../../api/axios";
import { API } from "../../helpers/api_url";

import DashboardFilters, {
	type DashboardFilterValues,
} from "../../components/Dashboard/DashboardFilters";
import SummaryCard from "../../components/Dashboard/SummaryCard";
import DashboardStatTable from "../../components/Dashboard/DashboardStatTable";
import PendingActionsPanel from "../../components/Dashboard/PendingActionsPanel";
import RecentActivityTable from "../../components/Dashboard/RecentActivityTable";
import TrendChartCard from "../../components/Dashboard/TrendChartCard";
import PipelineBoard from "../../components/Dashboard/PipelineBoard";
import VisualBarPanel from "../../components/Dashboard/VisualBarPanel";
import MonitoringTable from "../../components/Dashboard/MonitoringTable";
import DashboardSlidePanel, {
	type DashboardPanelColumn,
} from "../../components/Dashboard/DashboardSlidePanel";
import "../../components/Dashboard/DashboardSlidePanel.css";
import InventoryDashboardTable from "../../components/Dashboard/InventoryDashboardTable";

const theme = "#1a8376";

type PanelKey =
	| "orders"
	| "inwards"
	| "pendingActions"
	| "recentActivity"
	| "customers"
	| "items"
	| "users";

type PanelState = {
	open: boolean;
	key: PanelKey | null;
	title: string;
	subtitle?: string;
};

function formatDate(value: any) {
	if (!value) return "-";
	try {
		const d = new Date(value);
		if (Number.isNaN(d.getTime())) return String(value);
		return d.toLocaleDateString("en-GB", {
			day: "2-digit",
			month: "short",
			year: "numeric",
		});
	} catch {
		return String(value);
	}
}

function pick(obj: any, paths: string[]) {
	for (const path of paths) {
		const value = path.split(".").reduce((acc: any, key) => acc?.[key], obj);
		if (value !== undefined && value !== null && value !== "") return value;
	}
	return "-";
}

function normalizeListResponse(response: any) {
	const payload = response?.data;

	const dataRoot = payload?.data ?? payload ?? {};
	const rows =
		dataRoot?.items ||
		dataRoot?.rows ||
		dataRoot?.docs ||
		dataRoot?.data ||
		dataRoot?.records ||
		dataRoot?.results ||
		dataRoot;

	const normalizedRows = Array.isArray(rows)
		? rows
		: Array.isArray(dataRoot)
			? dataRoot
			: [];

	const total =
		dataRoot?.total ||
		dataRoot?.totalRecords ||
		dataRoot?.count ||
		dataRoot?.pagination?.total ||
		normalizedRows.length;

	return {
		rows: normalizedRows,
		total,
	};
}

export default function DashboardPage() {
	const dispatch = useDispatch<AppDispatch>();
	const { data, loading, error } = useSelector((s: RootState) => s.dashboard);

	const [filters, setFilters] = useState<DashboardFilterValues>({
		from: "",
		to: "",
		warehouseName: "",
	});

	const [panel, setPanel] = useState<PanelState>({
		open: false,
		key: null,
		title: "",
		subtitle: "",
	});

	const [panelLoading, setPanelLoading] = useState(false);
	const [panelError, setPanelError] = useState<string | null>(null);
	const [panelRows, setPanelRows] = useState<any[]>([]);
	const [panelTotal, setPanelTotal] = useState(0);
	const [panelPage, setPanelPage] = useState(1);
	const [panelSearch, setPanelSearch] = useState("");
	const [_, setHideFilters] = useState(false);

	const filterTriggerRef = useRef<HTMLDivElement | null>(null);
	const inventorySectionRef = useRef<HTMLDivElement | null>(null);

	const pageSize = 10;

	useEffect(() => {
		dispatch(fetchDashboardThunk());
	}, [dispatch]);

	useEffect(() => {
		if (data?.filtersApplied) {
			setFilters({
				from: data.filtersApplied.from || "",
				to: data.filtersApplied.to || "",
				warehouseName: data.filtersApplied.warehouseName || "",
			});
		}
	}, [data?.filtersApplied]);

	useEffect(() => {
		const handleScroll = () => {
			const inventoryEl = inventorySectionRef.current;
			if (!inventoryEl) return;

			const inventoryRect = inventoryEl.getBoundingClientRect();
			setHideFilters(inventoryRect.top <= 170);
		};

		handleScroll();
		window.addEventListener("scroll", handleScroll, { passive: true });
		window.addEventListener("resize", handleScroll);

		return () => {
			window.removeEventListener("scroll", handleScroll);
			window.removeEventListener("resize", handleScroll);
		};
	}, []);

	const handleFilterChange = (
		name: keyof DashboardFilterValues,
		value: string,
	) => {
		setFilters((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleApply = () => {
		dispatch(
			fetchDashboardThunk({
				from: filters.from || undefined,
				to: filters.to || undefined,
				warehouseName: filters.warehouseName || undefined,
			}),
		);
	};

	const handleReset = () => {
		setFilters({
			from: "",
			to: "",
			warehouseName: "",
		});
		dispatch(fetchDashboardThunk());
	};

	const warehouseOptions = useMemo(() => {
		const arr = (data?.recentActivity || [])
			.map((x) => x.warehouseName)
			.filter(Boolean);
		return Array.from(new Set(arr));
	}, [data]);

	const salesStages = useMemo(() => {
		const sumRows = (rows?: Array<{ count: number }>) =>
			(rows || []).reduce((sum, x) => sum + x.count, 0);

		return [
			{
				label: "Enquiry",
				value: sumRows(data?.salesPipeline?.enquiries),
				color: "#0d6efd",
				icon: "ri-question-answer-line",
			},
			{
				label: "Quotation",
				value: sumRows(data?.salesPipeline?.quotations),
				color: "#6f42c1",
				icon: "ri-file-text-line",
			},
			{
				label: "Order",
				value: sumRows(data?.salesPipeline?.orders),
				color: "#1a8376",
				icon: "ri-file-list-3-line",
				onClick: () => openPanel("orders", "Orders", "Sales order records"),
			},
			{
				label: "Dispatch",
				value: data?.kpis?.totalDispatches || 0,
				color: "#fd7e14",
				icon: "ri-truck-line",
				onClick: () =>
					openPanel(
						"recentActivity",
						"Dispatch Activity",
						"Dispatch-related activity from dashboard summary",
					),
			},
			{
				label: "Inward",
				value: data?.kpis?.totalInwards || 0,
				color: "#20c997",
				icon: "ri-inbox-line",
				onClick: () =>
					openPanel("inwards", "Inwards", "Warehouse inward records"),
			},
		];
	}, [data]);

	const warehouseStages = useMemo(
		() => [
			{
				label: "Ready For Dispatch",
				value: data?.warehousePipeline?.ordersReadyForDispatch || 0,
				color: "#fd7e14",
				icon: "ri-box-3-line",
			},
			{
				label: "Pending Dispatch",
				value: data?.warehousePipeline?.dispatchPending || 0,
				color: "#dc3545",
				icon: "ri-truck-line",
			},
			{
				label: "Delivered",
				value: data?.warehousePipeline?.dispatchDelivered || 0,
				color: "#198754",
				icon: "ri-checkbox-circle-line",
			},
			{
				label: "Transfer Pending",
				value: data?.warehousePipeline?.transferPending || 0,
				color: "#0dcaf0",
				icon: "ri-arrow-left-right-line",
			},
			{
				label: "Labour Issued",
				value: data?.warehousePipeline?.labourIssued || 0,
				color: "#6f42c1",
				icon: "ri-group-line",
			},
			{
				label: "Sales Return Pending",
				value: data?.warehousePipeline?.salesReturnPending || 0,
				color: "#d63384",
				icon: "ri-arrow-go-back-line",
			},
		],
		[data],
	);

	const inventoryBars = useMemo(
		() => [
			{
				label: "Inward Qty",
				value: data?.inventorySummary?.totalInwardQuantity || 0,
				color: "#20c997",
				onClick: () =>
					openPanel("inwards", "Inwards", "Warehouse inward records"),
			},
			{
				label: "Dispatch Qty",
				value: data?.inventorySummary?.totalDispatchQuantity || 0,
				color: "#0d6efd",
				onClick: () =>
					openPanel(
						"recentActivity",
						"Dispatch Activity",
						"Dispatch-related activity from dashboard summary",
					),
			},
			{
				label: "Transfer Qty",
				value: data?.inventorySummary?.totalTransferQuantity || 0,
				color: "#fd7e14",
				onClick: () =>
					openPanel(
						"pendingActions",
						"Pending Actions",
						"Transfer-related pending actions",
					),
			},
			{
				label: "Labour Qty",
				value: data?.inventorySummary?.totalLabourIssueQuantity || 0,
				color: "#6f42c1",
				onClick: () =>
					openPanel(
						"pendingActions",
						"Pending Actions",
						"Labour-related pending actions",
					),
			},
		],
		[data],
	);

	const monitoringRows = useMemo(
		() => [
			{
				label: "Pending Dispatch",
				value: data?.warehousePipeline?.dispatchPending || 0,
				status: ((data?.warehousePipeline?.dispatchPending || 0) > 10
					? "danger"
					: (data?.warehousePipeline?.dispatchPending || 0) > 0
						? "warning"
						: "good") as "danger" | "warning" | "good",
				note: "Open dispatches waiting for completion",
				onClick: () =>
					openPanel(
						"pendingActions",
						"Pending Actions",
						"Pending dispatch-related actions",
					),
			},
			{
				label: "Pending Transfers",
				value: data?.warehousePipeline?.transferPending || 0,
				status: ((data?.warehousePipeline?.transferPending || 0) > 10
					? "danger"
					: (data?.warehousePipeline?.transferPending || 0) > 0
						? "warning"
						: "good") as "danger" | "warning" | "good",
				note: "Inter-warehouse movements still open",
				onClick: () =>
					openPanel(
						"pendingActions",
						"Pending Actions",
						"Pending transfer-related actions",
					),
			},
			{
				label: "Sales Return Pending",
				value: data?.warehousePipeline?.salesReturnPending || 0,
				status: ((data?.warehousePipeline?.salesReturnPending || 0) > 5
					? "danger"
					: (data?.warehousePipeline?.salesReturnPending || 0) > 0
						? "warning"
						: "good") as "danger" | "warning" | "good",
				note: "Pending sales return inward entries",
				onClick: () =>
					openPanel(
						"pendingActions",
						"Pending Actions",
						"Sales return pending actions",
					),
			},
			{
				label: "Net Movement Qty",
				value: data?.inventorySummary?.netMovementQuantity || 0,
				status: ((data?.inventorySummary?.netMovementQuantity || 0) < 0
					? "warning"
					: "good") as "danger" | "warning" | "good",
				note: "Overall movement derived from dashboard summary",
				onClick: () =>
					openPanel("inwards", "Inwards", "Warehouse inward records"),
			},
		],
		[data],
	);

	const panelColumns = useMemo((): DashboardPanelColumn[] => {
		switch (panel.key) {
			case "orders":
				return [
					{
						key: "orderNo",
						label: "Order No",
						render: (row) =>
							pick(row, ["orderNo", "order_no", "orderNumber", "order_number"]),
					},
					{
						key: "date",
						label: "Order Date",
						render: (row) => formatDate(pick(row, ["orderDate", "order_date"])),
					},
					{
						key: "customer",
						label: "Customer",
						render: (row) =>
							pick(row, [
								"customerName",
								"customer_name",
								"customer.customerName",
								"customer.customer_name",
							]),
					},
					{
						key: "status",
						label: "Status",
						render: (row) =>
							pick(row, ["orderStatus", "order_status", "status"]),
					},
					{
						key: "amount",
						label: "Amount",
						render: (row) =>
							pick(row, [
								"grandTotal",
								"grand_total",
								"totalAmount",
								"total_amount",
							]),
					},
				];

			case "inwards":
				return [
					{
						key: "inwardNo",
						label: "Inward No",
						render: (row) =>
							pick(row, ["inwardNo", "inward_no", "grnNo", "grn_no"]),
					},
					{
						key: "date",
						label: "Date",
						render: (row) =>
							formatDate(pick(row, ["inwardDate", "inward_date", "date"])),
					},
					{
						key: "warehouse",
						label: "Warehouse",
						render: (row) =>
							pick(row, [
								"warehouseName",
								"warehouse_name",
								"warehouse.warehouseName",
							]),
					},
					{
						key: "type",
						label: "Type",
						render: (row) =>
							pick(row, ["inwardType", "inward_type", "sourceType"]),
					},
					{
						key: "status",
						label: "Status",
						render: (row) => pick(row, ["status"]),
					},
				];

			case "pendingActions":
				return [
					{ key: "label", label: "Action", render: (row) => row.label || "-" },
					{ key: "count", label: "Count", render: (row) => row.count ?? 0 },
					{ key: "key", label: "Key", render: (row) => row.key || "-" },
				];

			case "recentActivity":
				return [
					{
						key: "module",
						label: "Module",
						render: (row) => row.module || "-",
					},
					{ key: "refNo", label: "Ref No", render: (row) => row.refNo || "-" },
					{
						key: "partyName",
						label: "Party",
						render: (row) => row.partyName || "-",
					},
					{
						key: "warehouseName",
						label: "Warehouse",
						render: (row) => row.warehouseName || "-",
					},
					{
						key: "status",
						label: "Status",
						render: (row) => row.status || "-",
					},
					{
						key: "createdAt",
						label: "Created",
						render: (row) => formatDate(row.createdAt),
					},
				];

			case "customers":
				return [
					{
						key: "customerName",
						label: "Customer",
						render: (row) =>
							pick(row, ["customerName", "customer_name", "name"]),
					},
					{
						key: "phone",
						label: "Phone",
						render: (row) =>
							pick(row, ["contactNumber", "contact_number", "phone"]),
					},
					{
						key: "city",
						label: "City",
						render: (row) => pick(row, ["city"]),
					},
					{
						key: "state",
						label: "State",
						render: (row) => pick(row, ["state"]),
					},
				];

			case "items":
				return [
					{
						key: "itemName",
						label: "Item",
						render: (row) => pick(row, ["itemName", "item_name", "name"]),
					},
					{
						key: "itemCode",
						label: "Code",
						render: (row) => pick(row, ["itemCode", "item_code", "code"]),
					},
					{
						key: "category",
						label: "Category",
						render: (row) =>
							pick(row, ["categoryName", "category_name", "category"]),
					},
					{
						key: "unit",
						label: "Unit",
						render: (row) => pick(row, ["unitName", "unit_name", "unit"]),
					},
				];

			case "users":
				return [
					{
						key: "name",
						label: "Name",
						render: (row) => pick(row, ["name", "fullName", "full_name"]),
					},
					{
						key: "email",
						label: "Email",
						render: (row) => pick(row, ["email"]),
					},
					{
						key: "userType",
						label: "User Type",
						render: (row) => pick(row, ["userType", "user_type", "role"]),
					},
					{
						key: "phone",
						label: "Phone",
						render: (row) => pick(row, ["phone", "mobile"]),
					},
				];

			default:
				return [{ key: "value", label: "Value" }];
		}
	}, [panel.key]);

	const openPanel = (key: PanelKey, title: string, subtitle?: string) => {
		setPanel({
			open: true,
			key,
			title,
			subtitle,
		});
		setPanelPage(1);
		setPanelSearch("");
		setPanelRows([]);
		setPanelTotal(0);
		setPanelError(null);
	};

	const closePanel = () => {
		setPanel({
			open: false,
			key: null,
			title: "",
			subtitle: "",
		});
		setPanelRows([]);
		setPanelTotal(0);
		setPanelSearch("");
		setPanelPage(1);
		setPanelError(null);
	};

	useEffect(() => {
		if (!panel.open || !panel.key) return;

		const fetchPanelData = async () => {
			setPanelLoading(true);
			setPanelError(null);

			try {
				if (panel.key === "pendingActions") {
					const rows = data?.pendingActions || [];
					const filtered = rows.filter((x) =>
						JSON.stringify(x).toLowerCase().includes(panelSearch.toLowerCase()),
					);
					setPanelRows(filtered);
					setPanelTotal(filtered.length);
					return;
				}

				if (panel.key === "recentActivity") {
					const rows = data?.recentActivity || [];
					const filtered = rows.filter((x) =>
						JSON.stringify(x).toLowerCase().includes(panelSearch.toLowerCase()),
					);
					setPanelRows(filtered);
					setPanelTotal(filtered.length);
					return;
				}

				const params: Record<string, any> = {
					page: panelPage,
					pageSize,
				};

				if (panelSearch.trim()) params.search = panelSearch.trim();
				if (filters.from) params.from = filters.from;
				if (filters.to) params.to = filters.to;
				if (filters.warehouseName) params.warehouseName = filters.warehouseName;

				let response: any;

				switch (panel.key) {
					case "orders":
						response = await axios.get(API.ORDERS.LIST, { params });
						break;
					case "inwards":
						response = await axios.get(API.WAREHOUSE_INWARD.LIST, { params });
						break;
					case "customers":
						response = await axios.get(API.CUSTOMERS.LIST, { params });
						break;
					case "items":
						response = await axios.get(API.ITEMS.LIST, { params });
						break;
					case "users":
						response = await axios.get(API.USERS.LIST, { params });
						break;
					default:
						response = null;
				}

				const normalized = normalizeListResponse(response);
				setPanelRows(normalized.rows);
				setPanelTotal(normalized.total);
			} catch (err: any) {
				setPanelError(
					err?.response?.data?.message ||
						err?.message ||
						"Failed to load panel data",
				);
			} finally {
				setPanelLoading(false);
			}
		};

		fetchPanelData();
	}, [
		panel.open,
		panel.key,
		panelPage,
		panelSearch,
		filters.from,
		filters.to,
		filters.warehouseName,
		data?.pendingActions,
		data?.recentActivity,
	]);

	if (loading && !data) {
		return (
			<div className='d-flex align-items-center justify-content-center py-5'>
				<Spinner animation='border' style={{ color: theme }} />
			</div>
		);
	}

	if (error && !data) {
		return <Alert variant='danger'>{error}</Alert>;
	}

	return (
		<div>
			<div className='d-flex align-items-center justify-content-between mb-4'>
				<div>
					<h3 className='mb-1' style={{ fontWeight: 800, color: "#0f172a" }}>
						Dashboard
					</h3>
					<div style={{ color: "#6c757d", fontSize: 14 }}>
						Sales, warehouse, monitoring and trend overview
					</div>
				</div>
			</div>

			<div ref={filterTriggerRef}>
				<DashboardFilters
					values={filters}
					warehouseOptions={warehouseOptions}
					onChange={handleFilterChange}
					onApply={handleApply}
					onReset={handleReset}
					loading={loading}
				/>
			</div>

			<Row className='g-3 mb-4'>
				<Col md={6} xl={3}>
					<div
						style={{ cursor: "pointer" }}
						onClick={() => openPanel("orders", "Orders", "Sales order records")}
					>
						<SummaryCard
							title='Orders'
							value={data?.kpis?.totalOrders || 0}
							icon='ri-file-list-3-line'
							color='#1a8376'
							subtitle='Sales order count'
							onClick={() =>
								openPanel("orders", "Orders", "Sales order records")
							}
						/>
					</div>
				</Col>
				<Col md={6} xl={3}>
					<div
						style={{ cursor: "pointer" }}
						onClick={() =>
							openPanel(
								"recentActivity",
								"Dispatches Overview",
								"Dispatch-related activity from dashboard summary",
							)
						}
					>
						<SummaryCard
							title='Dispatches'
							value={data?.kpis?.totalDispatches || 0}
							icon='ri-truck-line'
							color='#0d6efd'
							subtitle='Dispatch records'
						/>
					</div>
				</Col>
				<Col md={6} xl={3}>
					<div
						style={{ cursor: "pointer" }}
						onClick={() =>
							openPanel("inwards", "Inwards", "Warehouse inward records")
						}
					>
						<SummaryCard
							title='Inwards'
							value={data?.kpis?.totalInwards || 0}
							icon='ri-inbox-line'
							color='#20c997'
							subtitle='Warehouse inward records'
						/>
					</div>
				</Col>
				<Col md={6} xl={3}>
					<div
						style={{ cursor: "pointer" }}
						onClick={() =>
							openPanel(
								"pendingActions",
								"Pending Actions",
								"Actions derived from dashboard summary",
							)
						}
					>
						<SummaryCard
							title='Pending Actions'
							value={data?.kpis?.pendingActionsCount || 0}
							icon='ri-alert-line'
							color='#dc3545'
							subtitle='Need attention'
						/>
					</div>
				</Col>
			</Row>

			<Row className='g-3 mb-4'>
				<Col xl={8}>
					<PipelineBoard title='Order Pipeline Overview' stages={salesStages} />
				</Col>
				<Col xl={4}>
					<div
						style={{ cursor: "pointer" }}
						onClick={() =>
							openPanel(
								"customers",
								"Customers",
								"Customer records from master module",
							)
						}
					>
						<DashboardStatTable
							title='Quick Performance'
							icon='ri-pie-chart-2-line'
							rows={[
								{
									label: "Customers",
									value: data?.kpis?.totalCustomers || 0,
									trend: "Registered customers",
								},
								{
									label: "Items",
									value: data?.kpis?.totalItems || 0,
									trend: "Master item count",
								},
								{
									label: "Warehouses",
									value: data?.kpis?.totalWarehouses || 0,
									trend: "Warehouse locations",
								},
								{
									label: "Users",
									value: data?.kpis?.totalUsers || 0,
									trend: "Application users",
								},
							]}
							onRowClick={(row) => {
								if (row.label === "Customers") {
									openPanel(
										"customers",
										"Customers",
										"Customer records from master module",
									);
								} else if (row.label === "Items") {
									openPanel("items", "Items", "Items from master module");
								} else if (row.label === "Users") {
									openPanel("users", "Users", "Application users");
								}
							}}
						/>
					</div>
				</Col>
			</Row>

			<Row className='g-3 mb-4'>
				<Col xl={8}>
					<PipelineBoard
						title='Warehouse Operations Overview'
						stages={warehouseStages}
					/>
				</Col>
				<Col xl={4}>
					<div
						style={{ cursor: "pointer" }}
						onClick={() =>
							openPanel(
								"pendingActions",
								"Pending Actions",
								"Actions derived from dashboard summary",
							)
						}
					>
						<PendingActionsPanel
							items={data?.pendingActions || []}
							onItemClick={(item) =>
								openPanel(
									"pendingActions",
									"Pending Actions",
									`Action: ${item.label}`,
								)
							}
						/>
					</div>
				</Col>
			</Row>

			<Row className='g-3 mb-4'>
				<Col xl={4}>
					<div
						style={{ cursor: "pointer" }}
						onClick={() =>
							openPanel("items", "Items", "Items from master module")
						}
					>
						<VisualBarPanel
							title='Inventory Movement Analytics'
							items={inventoryBars}
						/>
					</div>
				</Col>
				<Col xl={4}>
					<div
						style={{ cursor: "pointer" }}
						onClick={() =>
							openPanel("items", "Items", "Items from master module")
						}
					>
						<DashboardStatTable
							title='Masters Analytics'
							icon='ri-layout-grid-line'
							rows={[
								{
									label: "Categories",
									value: data?.mastersSummary?.categories || 0,
								},
								{
									label: "Sub Categories",
									value: data?.mastersSummary?.subCategories || 0,
								},
								{ label: "Items", value: data?.mastersSummary?.items || 0 },
								{
									label: "Customers",
									value: data?.mastersSummary?.customers || 0,
								},
								{
									label: "Suppliers",
									value: data?.mastersSummary?.suppliers || 0,
								},
								{ label: "Labours", value: data?.mastersSummary?.labours || 0 },
							]}
							onRowClick={(row) => {
								if (row.label === "Items") {
									openPanel("items", "Items", "Items from master module");
								} else if (row.label === "Customers") {
									openPanel(
										"customers",
										"Customers",
										"Customer records from master module",
									);
								}
							}}
						/>
					</div>
				</Col>
				<Col xl={4}>
					<DashboardStatTable
						title='Warehouse Summary'
						icon='ri-building-line'
						rows={[
							{
								label: "Ready For Dispatch",
								value: data?.warehousePipeline?.ordersReadyForDispatch || 0,
							},
							{
								label: "Transfer Completed",
								value: data?.warehousePipeline?.transferCompleted || 0,
							},
							{
								label: "Labour Completed",
								value: data?.warehousePipeline?.labourCompleted || 0,
							},
							{
								label: "Stock Transfer Inwards",
								value: data?.warehousePipeline?.stockTransferInwards || 0,
							},
							{
								label: "Labour Return Inwards",
								value: data?.warehousePipeline?.labourReturnInwards || 0,
							},
						]}
					/>
				</Col>
			</Row>

			<Row className='g-3 mb-4'>
				<Col xl={4}>
					<TrendChartCard
						title='Orders Trend'
						data={data?.trends?.ordersTrend || []}
						color='#1a8376'
					/>
				</Col>
				<Col xl={4}>
					<TrendChartCard
						title='Dispatch Trend'
						data={data?.trends?.dispatchTrend || []}
						color='#0d6efd'
					/>
				</Col>
				<Col xl={4}>
					<TrendChartCard
						title='Inward Trend'
						data={data?.trends?.inwardTrend || []}
						color='#20c997'
					/>
				</Col>
			</Row>

			<Row className='g-3 mb-4'>
				<Col xl={6}>
					<MonitoringTable title='Monitoring Overview' rows={monitoringRows} />
				</Col>
				<Col xl={6}>
					<div
						style={{ cursor: "pointer" }}
						onClick={() => openPanel("users", "Users", "Application users")}
					>
						<DashboardStatTable
							title='Users Summary'
							icon='ri-team-line'
							rows={[
								{
									label: "Total Users",
									value: data?.usersSummary?.totalUsers || 0,
								},
								...((data?.usersSummary?.byUserType || []).map((u: any) => ({
									label: String(u.userType),
									value: u.count,
								})) as Array<{ label: string; value: number }>),
							]}
							onRowClick={() =>
								openPanel("users", "Users", "Application users")
							}
						/>
					</div>
				</Col>
			</Row>

			<Row className='g-3 mb-4'>
				<Col>
					<div ref={inventorySectionRef}>
						<InventoryDashboardTable />
					</div>
				</Col>
			</Row>

			<Row className='g-3'>
				<Col>
					<div
						style={{ cursor: "pointer" }}
						onClick={() =>
							openPanel(
								"recentActivity",
								"Recent Activity",
								"Latest activity from dashboard summary",
							)
						}
					>
						<RecentActivityTable
							data={data?.recentActivity || []}
							onRowClick={() =>
								openPanel(
									"recentActivity",
									"Recent Activity",
									"Latest activity from dashboard summary",
								)
							}
						/>
					</div>
				</Col>
			</Row>

			<DashboardSlidePanel
				isOpen={panel.open}
				title={panel.title}
				subtitle={panel.subtitle}
				loading={panelLoading}
				error={panelError}
				columns={panelColumns}
				rows={panelRows}
				total={panelTotal}
				page={panelPage}
				pageSize={pageSize}
				search={panelSearch}
				onSearchChange={(value) => {
					setPanelSearch(value);
					setPanelPage(1);
				}}
				onPageChange={setPanelPage}
				onClose={closePanel}
			/>

			{loading ? (
				<div
					style={{
						position: "fixed",
						right: 20,
						bottom: 20,
						background: "#fff",
						border: "1px solid #eef0f2",
						borderRadius: 12,
						padding: "10px 14px",
						boxShadow: "0 2px 10px rgba(15,23,42,0.08)",
						display: "flex",
						alignItems: "center",
						gap: 10,
						zIndex: 1050,
					}}
				>
					<Spinner animation='border' size='sm' />
					<span style={{ fontWeight: 600 }}>Refreshing dashboard...</span>
				</div>
			) : null}

			{error ? (
				<Alert variant='danger' className='mt-4'>
					{error}
				</Alert>
			) : null}
		</div>
	);
}
