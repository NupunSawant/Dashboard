import mongoose, { Schema, Document } from "mongoose";

type BasicPermission = {
	view: boolean;
	create: boolean;
	update: boolean;
};

type DashboardPermission = {
	view: boolean;
};

export interface IUserPermissions {
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
}

export interface IUser extends Document {
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

	passwordHash: string;
	permissions: IUserPermissions;

	createdAt: Date;
	createdBy?: mongoose.Types.ObjectId;
	updatedAt: Date;
	updatedBy?: mongoose.Types.ObjectId;
}

const basicPermissionSchema = new Schema<BasicPermission>(
	{
		view: { type: Boolean, default: true },
		create: { type: Boolean, default: true },
		update: { type: Boolean, default: true },
	},
	{ _id: false },
);

const dashboardPermissionSchema = new Schema<DashboardPermission>(
	{
		view: { type: Boolean, default: true },
	},
	{ _id: false },
);

const permissionsSchema = new Schema<IUserPermissions>(
	{
		dashboard: {
			type: new Schema(
				{
					dashboard: {
						type: dashboardPermissionSchema,
						default: () => ({ view: true }),
					},
				},
				{ _id: false },
			),
			default: () => ({
				dashboard: { view: true },
			}),
		},

		inventory: {
			type: new Schema(
				{
					inStock: {
						type: basicPermissionSchema,
						default: () => ({ view: true, create: true, update: true }),
					},
					reorderLevel: {
						type: basicPermissionSchema,
						default: () => ({ view: true, create: true, update: true }),
					},
					dispatch: {
						type: basicPermissionSchema,
						default: () => ({ view: true, create: true, update: true }),
					},
					order: {
						type: basicPermissionSchema,
						default: () => ({ view: true, create: true, update: true }),
					},
				},
				{ _id: false },
			),
			default: () => ({
				inStock: { view: true, create: true, update: true },
				reorderLevel: { view: true, create: true, update: true },
				dispatch: { view: true, create: true, update: true },
				order: { view: true, create: true, update: true },
			}),
		},

		masters: {
			type: new Schema(
				{
					gst: {
						type: basicPermissionSchema,
						default: () => ({ view: true, create: true, update: true }),
					},
					item: {
						type: basicPermissionSchema,
						default: () => ({ view: true, create: true, update: true }),
					},
					unit: {
						type: basicPermissionSchema,
						default: () => ({ view: true, create: true, update: true }),
					},
					labour: {
						type: basicPermissionSchema,
						default: () => ({ view: true, create: true, update: true }),
					},
					category: {
						type: basicPermissionSchema,
						default: () => ({ view: true, create: true, update: true }),
					},
					customer: {
						type: basicPermissionSchema,
						default: () => ({ view: true, create: true, update: true }),
					},
					hsnCode: {
						type: basicPermissionSchema,
						default: () => ({ view: true, create: true, update: true }),
					},
					suppliers: {
						type: basicPermissionSchema,
						default: () => ({ view: true, create: true, update: true }),
					},
					warehouse: {
						type: basicPermissionSchema,
						default: () => ({ view: true, create: true, update: true }),
					},
					subCategory: {
						type: basicPermissionSchema,
						default: () => ({ view: true, create: true, update: true }),
					},
				},
				{ _id: false },
			),
			default: () => ({
				gst: { view: true, create: true, update: true },
				item: { view: true, create: true, update: true },
				unit: { view: true, create: true, update: true },
				labour: { view: true, create: true, update: true },
				category: { view: true, create: true, update: true },
				customer: { view: true, create: true, update: true },
				hsnCode: { view: true, create: true, update: true },
				suppliers: { view: true, create: true, update: true },
				warehouse: { view: true, create: true, update: true },
				subCategory: { view: true, create: true, update: true },
			}),
		},

		orders: {
			type: new Schema(
				{
					order: {
						type: basicPermissionSchema,
						default: () => ({ view: true, create: true, update: true }),
					},
					enquiry: {
						type: basicPermissionSchema,
						default: () => ({ view: true, create: true, update: true }),
					},
					quotation: {
						type: basicPermissionSchema,
						default: () => ({ view: true, create: true, update: true }),
					},
					siteVisit: {
						type: basicPermissionSchema,
						default: () => ({ view: true, create: true, update: true }),
					},
				},
				{ _id: false },
			),
			default: () => ({
				order: { view: true, create: true, update: true },
				enquiry: { view: true, create: true, update: true },
				quotation: { view: true, create: true, update: true },
				siteVisit: { view: true, create: true, update: true },
			}),
		},

		userManagement: {
			type: new Schema(
				{
					user: {
						type: basicPermissionSchema,
						default: () => ({ view: true, create: true, update: true }),
					},
				},
				{ _id: false },
			),
			default: () => ({
				user: { view: true, create: true, update: true },
			}),
		},

		warehouse: {
			type: new Schema(
				{
					dispatch: {
						type: basicPermissionSchema,
						default: () => ({ view: true, create: true, update: true }),
					},
					itemInward: {
						type: basicPermissionSchema,
						default: () => ({ view: true, create: true, update: true }),
					},
					warehouseOverview: {
						type: basicPermissionSchema,
						default: () => ({ view: true, create: true, update: true }),
					},
				},
				{ _id: false },
			),
			default: () => ({
				dispatch: { view: true, create: true, update: true },
				itemInward: { view: true, create: true, update: true },
				warehouseOverview: { view: true, create: true, update: true },
			}),
		},
	},
	{ _id: false },
);

const UserSchema = new Schema<IUser>(
	{
		firstName: { type: String, required: true, trim: true },
		lastName: { type: String, required: true, trim: true },
		userName: { type: String, required: true, unique: true, trim: true },

		desgination: { type: String, trim: true },

		userType: { type: String, required: true, trim: true, default: "Staff" },

		phone: { type: String, required: true, unique: true, trim: true },
		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true,
		},

		address: { type: String, trim: true },
		country: { type: String, trim: true },
		state: { type: String, trim: true },
		city: { type: String, trim: true },
		pincode: { type: String, trim: true },

		passwordHash: { type: String, required: true },

		permissions: {
			type: permissionsSchema,
			default: () => ({
				dashboard: {
					dashboard: { view: true },
				},
				inventory: {
					inStock: { view: true, create: true, update: true },
					reorderLevel: { view: true, create: true, update: true },
					dispatch: { view: true, create: true, update: true },
					order: { view: true, create: true, update: true },
				},
				masters: {
					gst: { view: true, create: true, update: true },
					item: { view: true, create: true, update: true },
					unit: { view: true, create: true, update: true },
					labour: { view: true, create: true, update: true },
					category: { view: true, create: true, update: true },
					customer: { view: true, create: true, update: true },
					hsnCode: { view: true, create: true, update: true },
					suppliers: { view: true, create: true, update: true },
					warehouse: { view: true, create: true, update: true },
					subCategory: { view: true, create: true, update: true },
				},
				orders: {
					order: { view: true, create: true, update: true },
					enquiry: { view: true, create: true, update: true },
					quotation: { view: true, create: true, update: true },
					siteVisit: { view: true, create: true, update: true },
				},
				userManagement: {
					user: { view: true, create: true, update: true },
				},
				warehouse: {
					dispatch: { view: true, create: true, update: true },
					itemInward: { view: true, create: true, update: true },
					warehouseOverview: { view: true, create: true, update: true },
				},
			}),
		},
	},
	{ timestamps: true },
);

export const User = mongoose.model<IUser>("User", UserSchema);
