import { useEffect, useMemo, useState } from "react";
import { Alert, Col, Row, Spinner } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../slices/store";
import { fetchDashboardThunk } from "../../slices/Dashboard/thunks";

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

const theme = "#1a8376";

export default function DashboardPage() {
	const dispatch = useDispatch<AppDispatch>();

	const { data, loading, error } = useSelector((s: RootState) => s.dashboard);

	const [filters, setFilters] = useState<DashboardFilterValues>({
		from: "",
		to: "",
		warehouseName: "",
	});

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
			},
			{
				label: "Dispatch",
				value: data?.kpis?.totalDispatches || 0,
				color: "#fd7e14",
				icon: "ri-truck-line",
			},
			{
				label: "Inward",
				value: data?.kpis?.totalInwards || 0,
				color: "#20c997",
				icon: "ri-inbox-line",
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
			},
			{
				label: "Dispatch Qty",
				value: data?.inventorySummary?.totalDispatchQuantity || 0,
				color: "#0d6efd",
			},
			{
				label: "Transfer Qty",
				value: data?.inventorySummary?.totalTransferQuantity || 0,
				color: "#fd7e14",
			},
			{
				label: "Labour Qty",
				value: data?.inventorySummary?.totalLabourIssueQuantity || 0,
				color: "#6f42c1",
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
			},
			{
				label: "Net Movement Qty",
				value: data?.inventorySummary?.netMovementQuantity || 0,
				status: ((data?.inventorySummary?.netMovementQuantity || 0) < 0
					? "warning"
					: "good") as "danger" | "warning" | "good",
				note: "Overall movement derived from dashboard summary",
			},
		],
		[data],
	);

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

			<DashboardFilters
				values={filters}
				warehouseOptions={warehouseOptions}
				onChange={handleFilterChange}
				onApply={handleApply}
				onReset={handleReset}
				loading={loading}
			/>

			<Row className='g-3 mb-4'>
				<Col md={6} xl={3}>
					<SummaryCard
						title='Orders'
						value={data?.kpis?.totalOrders || 0}
						icon='ri-file-list-3-line'
						color='#1a8376'
						subtitle='Sales order count'
					/>
				</Col>
				<Col md={6} xl={3}>
					<SummaryCard
						title='Dispatches'
						value={data?.kpis?.totalDispatches || 0}
						icon='ri-truck-line'
						color='#0d6efd'
						subtitle='Dispatch records'
					/>
				</Col>
				<Col md={6} xl={3}>
					<SummaryCard
						title='Inwards'
						value={data?.kpis?.totalInwards || 0}
						icon='ri-inbox-line'
						color='#20c997'
						subtitle='Warehouse inward records'
					/>
				</Col>
				<Col md={6} xl={3}>
					<SummaryCard
						title='Pending Actions'
						value={data?.kpis?.pendingActionsCount || 0}
						icon='ri-alert-line'
						color='#dc3545'
						subtitle='Need attention'
					/>
				</Col>
			</Row>

			<Row className='g-3 mb-4'>
				<Col xl={8}>
					<PipelineBoard title='Order Pipeline Overview' stages={salesStages} />
				</Col>
				<Col xl={4}>
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
					/>
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
					<PendingActionsPanel items={data?.pendingActions || []} />
				</Col>
			</Row>

			<Row className='g-3 mb-4'>
				<Col xl={4}>
					<VisualBarPanel
						title='Inventory Movement Analytics'
						items={inventoryBars}
					/>
				</Col>
				<Col xl={4}>
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
					/>
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
					/>
				</Col>
			</Row>

			<Row className='g-3'>
				<Col>
					<RecentActivityTable data={data?.recentActivity || []} />
				</Col>
			</Row>

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
