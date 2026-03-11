export type BasicPermission = {
	view: boolean;
	create: boolean;
	update: boolean;
};

export type DashboardPermission = {
	view: boolean;
};

export type UserPermissions = {
	dashboard: {
		dashboard: DashboardPermission;
	};
	inventory: {
		inStock: BasicPermission;
		reorderLevel: BasicPermission;
		order: BasicPermission;
		dispatch: BasicPermission;
	};
	masters: {
		gst: BasicPermission;
		item: BasicPermission;
		unit: BasicPermission;
		labour: BasicPermission;
		category: BasicPermission;
		customer: BasicPermission;
		hsnCode: BasicPermission;
		suppliers: BasicPermission;
		warehouse: BasicPermission;
		subCategory: BasicPermission;
	};
	orders: {
		order: BasicPermission;
		enquiry: BasicPermission;
		quotation: BasicPermission;
		siteVisit: BasicPermission;
	};
	userManagement: {
		user: BasicPermission;
	};
	warehouse: {
		dispatch: BasicPermission;
		itemInward: BasicPermission;
		warehouseOverview: BasicPermission;
	};
};

export type AuthUser = {
	id: string;
	name: string;
	email: string;
	phone: string;
	permissions: UserPermissions;
};
