export interface DashboardKpis {
	totalOrders: number;
	totalDispatches: number;
	totalInwards: number;
	totalTransfers: number;
	totalLabourIssues: number;
	totalItems: number;
	totalCustomers: number;
	totalWarehouses: number;
	totalUsers: number;
	pendingActionsCount: number;
}

export interface StatusCount {
	key: string;
	label: string;
	count: number;
}

export interface PendingAction {
	key: string;
	label: string;
	count: number;
}

export interface RecentActivity {
	id: string;
	module: string;
	refNo: string;
	date: string | null;
	status: string;
	partyName: string;
	warehouseName: string;
	createdAt: string | null;
}

export interface DashboardResponse {
	filtersApplied: {
		from: string;
		to: string;
		warehouseName: string;
	};
	kpis: DashboardKpis;
	salesPipeline: {
		enquiries: StatusCount[];
		quotations: StatusCount[];
		orders: StatusCount[];
	};
	warehousePipeline: {
		ordersReadyForDispatch: number;
		dispatchPending: number;
		dispatchDelivered: number;
		transferPending: number;
		transferCompleted: number;
		labourIssued: number;
		labourCompleted: number;
		stockTransferInwards: number;
		labourReturnInwards: number;
		salesReturnPending: number;
	};
	inventorySummary: {
		totalItems: number;
		totalInwardEntries: number;
		totalDispatchEntries: number;
		totalTransferEntries: number;
		totalLabourIssueEntries: number;
		totalInwardQuantity: number;
		totalDispatchQuantity: number;
		totalTransferQuantity: number;
		totalLabourIssueQuantity: number;
		netMovementQuantity: number;
		note?: string;
	};
	mastersSummary: {
		categories: number;
		subCategories: number;
		items: number;
		customers: number;
		suppliers: number;
		warehouses: number;
		labours: number;
		units: number;
		gst: number;
		hsnCodes: number;
	};
	usersSummary: {
		totalUsers: number;
		byUserType: Array<{
			userType: string;
			count: number;
		}>;
	};
	pendingActions: PendingAction[];
	recentActivity: RecentActivity[];
	trends: {
		ordersTrend: Array<{ _id: string; count: number }>;
		dispatchTrend: Array<{ _id: string; count: number }>;
		inwardTrend: Array<{ _id: string; count: number }>;
		enquiryTrend: Array<{ _id: string; count: number }>;
		quotationTrend: Array<{ _id: string; count: number }>;
	};
}
