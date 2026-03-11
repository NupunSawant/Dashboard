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
		dispatch: BasicPermission;
		order: BasicPermission;
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

export type User = {
	id?: string;
	_id?: string;

	firstName: string;
	lastName: string;
	userName: string;

	desgination?: string;
	userType: string;

	phone: string;
	email: string;

	address?: string;
	country?: string;
	state?: string;
	city?: string;
	pincode?: string;

	permissions: UserPermissions;

	createdAt?: string;
	updatedAt?: string;
};
