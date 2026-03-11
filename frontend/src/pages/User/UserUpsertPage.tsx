import { useEffect, useMemo, useState } from "react";
import { Card, Button, Form, Alert, Row, Col, Spinner } from "react-bootstrap";
import { Formik } from "formik";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../slices/store";
import {
	createUserThunk,
	getUserThunk,
	updateUserThunk,
	updatePasswordThunk,
} from "../../slices/users/thunks";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Country, State, City } from "country-state-city";
import type { UserPermissions } from "../../types/user";
import { meThunk } from "../../slices/auth/thunks";

const theme = "#1a8376";

const CreateSchema = Yup.object({
	firstName: Yup.string().required("First name required"),
	lastName: Yup.string().required("Last name required"),
	userName: Yup.string().required("Username required"),
	desgination: Yup.string().required("Desgination required"),
	userType: Yup.string().required("User type required"),
	phone: Yup.string()
		.matches(/^\d{10}$/, "Phone must be 10 digits")
		.required("Phone required"),
	email: Yup.string().email("Invalid email").required("Email required"),
	address: Yup.string().required("Address required"),
	country: Yup.string().required("Country required"),
	state: Yup.string().required("State required"),
	city: Yup.string().required("City required"),
	pincode: Yup.string().required("Pincode required"),
	password: Yup.string().min(6, "Min 6 chars").required("Password required"),
	confirmPassword: Yup.string()
		.oneOf([Yup.ref("password")], "Passwords must match")
		.required("Confirm password required"),
});

const UpdateSchema = Yup.object({
	firstName: Yup.string().required("First name required"),
	lastName: Yup.string().required("Last name required"),
	userName: Yup.string().required("Username required"),
	desgination: Yup.string().required("Desgination required"),
	userType: Yup.string().required("User type required"),
	phone: Yup.string()
		.matches(/^\d{10}$/, "Phone must be 10 digits")
		.required("Phone required"),
	email: Yup.string().email("Invalid email").required("Email required"),
	address: Yup.string().required("Address required"),
	country: Yup.string().required("Country required"),
	state: Yup.string().required("State required"),
	city: Yup.string().required("City required"),
	pincode: Yup.string().required("Pincode required"),
});

const PasswordSchema = Yup.object({
	oldPassword: Yup.string().required("Old password required"),
	newPassword: Yup.string()
		.min(6, "Min 6 chars")
		.required("New password required"),
	confirmPassword: Yup.string()
		.oneOf([Yup.ref("newPassword")], "Passwords must match")
		.required("Confirm password required"),
});

const makeBasic = (value = true) => ({
	view: value,
	create: value,
	update: value,
});

const makeDefaultPermissions = (value = true): UserPermissions => ({
	dashboard: {
		dashboard: { view: value },
	},
	inventory: {
		inStock: makeBasic(value),
		reorderLevel: makeBasic(value),
		order: makeBasic(value),
		dispatch: makeBasic(value),
	},
	masters: {
		gst: makeBasic(value),
		item: makeBasic(value),
		unit: makeBasic(value),
		labour: makeBasic(value),
		category: makeBasic(value),
		customer: makeBasic(value),
		hsnCode: makeBasic(value),
		suppliers: makeBasic(value),
		warehouse: makeBasic(value),
		subCategory: makeBasic(value),
	},
	orders: {
		order: makeBasic(value),
		enquiry: makeBasic(value),
		quotation: makeBasic(value),
		siteVisit: makeBasic(value),
	},
	userManagement: {
		user: makeBasic(value),
	},
	warehouse: {
		dispatch: makeBasic(value),
		itemInward: makeBasic(value),
		warehouseOverview: makeBasic(value),
	},
});

type PermissionItem = {
	key: string;
	label: string;
	onlyView?: boolean;
};

type PermissionSection = {
	key: keyof UserPermissions;
	label: string;
	items: PermissionItem[];
};

const permissionSections: PermissionSection[] = [
	{
		key: "dashboard",
		label: "Dashboard",
		items: [{ key: "dashboard", label: "Dashboard", onlyView: true }],
	},
	{
		key: "inventory",
		label: "Inventory",
		items: [
			{ key: "inStock", label: "In Stock" },
			{ key: "reorderLevel", label: "Reorder Level" },
			{ key: "order", label: "Order" },
			{ key: "dispatch", label: "Dispatch" },
		],
	},
	{
		key: "masters",
		label: "Masters",
		items: [
			{ key: "gst", label: "GST" },
			{ key: "item", label: "Item" },
			{ key: "unit", label: "Unit" },
			{ key: "labour", label: "Labour" },
			{ key: "category", label: "Category" },
			{ key: "customer", label: "Customer" },
			{ key: "hsnCode", label: "HSN Code" },
			{ key: "suppliers", label: "Suppliers" },
			{ key: "warehouse", label: "Warehouse" },
			{ key: "subCategory", label: "Sub Category" },
		],
	},
	{
		key: "orders",
		label: "Orders",
		items: [
			{ key: "order", label: "Order" },
			{ key: "enquiry", label: "Enquiry" },
			{ key: "quotation", label: "Quotation" },
			{ key: "siteVisit", label: "Site Visit" },
		],
	},
	{
		key: "userManagement",
		label: "User Management",
		items: [{ key: "user", label: "User" }],
	},
	{
		key: "warehouse",
		label: "Warehouse",
		items: [
			{ key: "dispatch", label: "Dispatch" },
			{ key: "itemInward", label: "Item Inward" },
			{ key: "warehouseOverview", label: "Warehouse Overview" },
		],
	},
];

type FormValues = {
	firstName: string;
	lastName: string;
	userName: string;
	desgination: string;
	userType: string;
	phone: string;
	email: string;
	address: string;
	country: string;
	state: string;
	city: string;
	pincode: string;
	password: string;
	confirmPassword: string;
	permissions: UserPermissions;
};

type MainTab = "DETAILS" | "PERMISSIONS" | "PASSWORD";

function clonePermissions(p: UserPermissions): UserPermissions {
	return JSON.parse(JSON.stringify(p));
}

function setAllPermissions(value: boolean): UserPermissions {
	return makeDefaultPermissions(value);
}

function isAllPermissionsChecked(p: UserPermissions) {
	return permissionSections.every((section) =>
		section.items.every((item) => {
			const node = (p as any)?.[section.key]?.[item.key];
			if (!node) return false;
			if (item.onlyView) return !!node.view;
			return !!node.view && !!node.create && !!node.update;
		}),
	);
}

function isSectionAllChecked(
	p: UserPermissions,
	sectionKey: keyof UserPermissions,
	items: PermissionItem[],
) {
	return items.every((item) => {
		const node = (p as any)?.[sectionKey]?.[item.key];
		if (!node) return false;
		if (item.onlyView) return !!node.view;
		return !!node.view && !!node.create && !!node.update;
	});
}

function toggleSectionAll(
	p: UserPermissions,
	sectionKey: keyof UserPermissions,
	items: PermissionItem[],
	value: boolean,
): UserPermissions {
	const next = clonePermissions(p);

	items.forEach((item) => {
		if (item.onlyView) {
			(next as any)[sectionKey][item.key].view = value;
		} else {
			(next as any)[sectionKey][item.key].view = value;
			(next as any)[sectionKey][item.key].create = value;
			(next as any)[sectionKey][item.key].update = value;
		}
	});

	return next;
}

function isModuleAllActionsChecked(
	p: UserPermissions,
	sectionKey: keyof UserPermissions,
	moduleKey: string,
) {
	const node = (p as any)?.[sectionKey]?.[moduleKey];
	if (!node) return false;
	return !!node.view && !!node.create && !!node.update;
}

function toggleModuleAllActions(
	p: UserPermissions,
	sectionKey: keyof UserPermissions,
	moduleKey: string,
	value: boolean,
): UserPermissions {
	const next = clonePermissions(p);
	(next as any)[sectionKey][moduleKey].view = value;
	(next as any)[sectionKey][moduleKey].create = value;
	(next as any)[sectionKey][moduleKey].update = value;
	return next;
}

function toggleSinglePermission(
	p: UserPermissions,
	sectionKey: keyof UserPermissions,
	moduleKey: string,
	action: "view" | "create" | "update",
	value: boolean,
): UserPermissions {
	const next = clonePermissions(p);
	(next as any)[sectionKey][moduleKey][action] = value;
	return next;
}

export default function UserUpsertPage() {
	const dispatch = useDispatch<AppDispatch>();
	const nav = useNavigate();
	const { id } = useParams();
	const isEdit = !!id;

	const { saving, error } = useSelector((s: RootState) => s.users);

	const [loading, setLoading] = useState(false);
	const [apiError, setApiError] = useState<string | null>(null);
	const [openSection, setOpenSection] = useState<keyof UserPermissions | null>(
		"dashboard",
	);
	const [activeTab, setActiveTab] = useState<MainTab>("DETAILS");

	const initialDefaultValues = useMemo<FormValues>(
		() => ({
			firstName: "",
			lastName: "",
			userName: "",
			desgination: "",
			userType: "",
			phone: "",
			email: "",
			address: "",
			country: "",
			state: "",
			city: "",
			pincode: "",
			password: "",
			confirmPassword: "",
			permissions: makeDefaultPermissions(true),
		}),
		[],
	);

	const [initialValues, setInitialValues] =
		useState<FormValues>(initialDefaultValues);

	useEffect(() => {
		if (!isEdit) return;

		(async () => {
			setLoading(true);
			setApiError(null);

			const res = await dispatch(getUserThunk(id!));
			if (getUserThunk.fulfilled.match(res)) {
				const u: any = res.payload;
				setInitialValues({
					firstName: u.firstName ?? "",
					lastName: u.lastName ?? "",
					userName: u.userName ?? "",
					desgination: u.desgination ?? "",
					userType: u.userType ?? "",
					phone: u.phone ?? "",
					email: u.email ?? "",
					address: u.address ?? "",
					country: u.country ?? "",
					state: u.state ?? "",
					city: u.city ?? "",
					pincode: u.pincode ?? "",
					password: "",
					confirmPassword: "",
					permissions: u.permissions ?? makeDefaultPermissions(true),
				});
			} else {
				setApiError(String(res.payload || "Failed to load user"));
			}

			setLoading(false);
		})();
	}, [dispatch, id, isEdit]);

	return (
		<>
			<style>{`
				.user-upsert-shell {
					background: #f8fafb;
					border: 1px solid #e9ebec;
					border-radius: 14px;
					overflow: hidden;
					box-shadow: 0 2px 10px rgba(15, 23, 42, 0.04);
				}

				.user-upsert-topbar {
					height: 5px;
					background: ${theme};
				}

				.user-upsert-header {
					padding: 18px 20px 14px 20px;
					background: #fff;
					border-bottom: 1px solid #eef1f4;
				}

				.user-upsert-tabs {
					display: flex;
					gap: 22px;
					align-items: center;
					border-bottom: 1px solid #e9ebec;
					padding: 6px 20px 0 20px;
					background: #fff;
				}

				.user-upsert-tab-btn {
					border: none;
					background: transparent;
					padding: 12px 0;
					font-weight: 700;
					font-size: 14px;
					color: #495057;
					position: relative;
					transition: all 0.2s ease;
				}

				.user-upsert-tab-btn.active {
					color: ${theme};
				}

				.user-upsert-tab-btn.active::after {
					content: "";
					position: absolute;
					left: 0;
					right: 0;
					bottom: -1px;
					height: 3px;
					background: ${theme};
					border-radius: 6px;
				}

				.user-upsert-content {
					padding: 20px;
				}

				.section-card {
					border: 1px solid #e9ebec;
					border-radius: 12px;
					background: #fff;
					overflow: hidden;
				}

				.section-card-header {
					padding: 14px 16px;
					border-bottom: 1px solid #eef1f4;
					background: #f8fbfa;
				}

				.section-card-body {
					padding: 16px;
				}

				.input-label {
					font-weight: 700;
					font-size: 13px;
					color: #212529;
					margin-bottom: 8px;
				}

				.permissions-wrap .table > :not(caption) > * > * {
					padding-top: 12px;
					padding-bottom: 12px;
					vertical-align: middle;
				}

				.permissions-wrap .table thead th {
					background: #fbfcfd;
					border-bottom: 1px solid #edf1f0;
				}
			`}</style>

			<Card className='border-0 bg-transparent shadow-none'>
				<div className='user-upsert-shell'>
					<div className='user-upsert-topbar' />

					<div className='user-upsert-header'>
						<div className='d-flex justify-content-between align-items-center flex-wrap gap-2'>
							<div>
								<h5 className='m-0 fw-bold' style={{ color: "#111" }}>
									{isEdit ? "Update User" : "Create User"}
								</h5>
								<div style={{ fontSize: 13, color: "#6c757d", marginTop: 4 }}>
									{isEdit ? "Update user details" : "Add a new user"}
								</div>
							</div>

							<Button
								variant='light'
								size='sm'
								onClick={() => nav("/users")}
								style={{
									border: "1px solid #e9ebec",
									fontSize: "13px",
									borderRadius: "6px",
									display: "inline-flex",
									alignItems: "center",
									gap: "6px",
								}}
							>
								<i className='ri-arrow-left-line' /> Back
							</Button>
						</div>
					</div>

					<div className='user-upsert-tabs'>
						<button
							type='button'
							className={`user-upsert-tab-btn ${
								activeTab === "DETAILS" ? "active" : ""
							}`}
							onClick={() => setActiveTab("DETAILS")}
						>
							Basic Details
						</button>

						<button
							type='button'
							className={`user-upsert-tab-btn ${
								activeTab === "PERMISSIONS" ? "active" : ""
							}`}
							onClick={() => setActiveTab("PERMISSIONS")}
						>
							Permissions
						</button>

						{isEdit && (
							<button
								type='button'
								className={`user-upsert-tab-btn ${
									activeTab === "PASSWORD" ? "active" : ""
								}`}
								onClick={() => setActiveTab("PASSWORD")}
							>
								Change Password
							</button>
						)}
					</div>

					<div className='user-upsert-content'>
						{(apiError || error) && (
							<Alert variant='danger' className='mb-3'>
								{apiError || error}
							</Alert>
						)}

						{loading ? (
							<div className='d-flex justify-content-center py-5'>
								<Spinner animation='border' style={{ color: theme }} />
							</div>
						) : (
							<>
								<Formik
									enableReinitialize
									initialValues={initialValues}
									validationSchema={isEdit ? UpdateSchema : CreateSchema}
									onSubmit={async (values, { setSubmitting }) => {
										setApiError(null);

										if (!isEdit) {
											const res = await dispatch(
												createUserThunk({
													firstName: values.firstName,
													lastName: values.lastName,
													userName: values.userName,
													desgination: values.desgination,
													userType: values.userType,
													phone: values.phone,
													email: values.email,
													address: values.address,
													country: values.country,
													state: values.state,
													city: values.city,
													pincode: values.pincode,
													password: values.password,
													permissions: values.permissions,
												} as any),
											);

											if (createUserThunk.fulfilled.match(res)) {
												toast.success("User created");
												nav("/users", { replace: true });
											} else {
												toast.error(String(res.payload || "Create failed"));
											}
										} else {
											const res = await dispatch(
												updateUserThunk({
													id: id!,
													payload: {
														firstName: values.firstName,
														lastName: values.lastName,
														userName: values.userName,
														desgination: values.desgination,
														userType: values.userType,
														phone: values.phone,
														email: values.email,
														address: values.address,
														country: values.country,
														state: values.state,
														city: values.city,
														pincode: values.pincode,
														permissions: values.permissions,
													},
												} as any),
											);

											if (updateUserThunk.fulfilled.match(res)) {
												await dispatch(meThunk());
												toast.success("User updated");
												nav("/users", { replace: true });
											} else {
												toast.error(String(res.payload || "Update failed"));
											}
										}

										setSubmitting(false);
									}}
								>
									{({
										handleSubmit,
										handleChange,
										setFieldValue,
										values,
										touched,
										errors,
										isSubmitting,
										isValid,
										dirty,
									}) => {
										const countries = Country.getAllCountries();

										const countryObj = countries.find(
											(c) => c.name === values.country,
										);

										const states = countryObj
											? State.getStatesOfCountry(countryObj.isoCode)
											: [];
										const stateObj = states.find(
											(s) => s.name === values.state,
										);
										const cities = stateObj
											? City.getCitiesOfState(
													countryObj!.isoCode,
													stateObj.isoCode,
												)
											: [];

										const allPermissionsChecked = isAllPermissionsChecked(
											values.permissions,
										);

										return (
											<Form onSubmit={handleSubmit}>
												{activeTab === "DETAILS" && (
													<div className='section-card'>
														<div className='section-card-header'>
															<div className='d-flex align-items-center justify-content-between flex-wrap gap-2'>
																<div>
																	<h6 className='m-0 fw-bold'>User Details</h6>
																	<div
																		style={{
																			fontSize: 12,
																			color: "#6c757d",
																			marginTop: 4,
																		}}
																	>
																		Enter basic information and address details
																	</div>
																</div>

																<div
																	style={{
																		background: `${theme}12`,
																		color: theme,
																		borderRadius: 999,
																		padding: "6px 12px",
																		fontSize: 12,
																		fontWeight: 700,
																	}}
																>
																	{isEdit ? "Edit Mode" : "Create Mode"}
																</div>
															</div>
														</div>

														<div className='section-card-body'>
															<Row className='g-3'>
																<Col md={4}>
																	<Form.Label className='input-label'>
																		First Name
																	</Form.Label>
																	<Form.Control
																		name='firstName'
																		value={values.firstName}
																		onChange={handleChange}
																		isInvalid={
																			!!touched.firstName && !!errors.firstName
																		}
																		placeholder='Enter first name'
																		style={{ borderRadius: 8 }}
																	/>
																	<Form.Control.Feedback type='invalid'>
																		{errors.firstName as any}
																	</Form.Control.Feedback>
																</Col>

																<Col md={4}>
																	<Form.Label className='input-label'>
																		Last Name
																	</Form.Label>
																	<Form.Control
																		name='lastName'
																		value={values.lastName}
																		onChange={handleChange}
																		isInvalid={
																			!!touched.lastName && !!errors.lastName
																		}
																		placeholder='Enter last name'
																		style={{ borderRadius: 8 }}
																	/>
																	<Form.Control.Feedback type='invalid'>
																		{errors.lastName as any}
																	</Form.Control.Feedback>
																</Col>

																<Col md={4}>
																	<Form.Label className='input-label'>
																		Username
																	</Form.Label>
																	<Form.Control
																		name='userName'
																		value={values.userName}
																		onChange={handleChange}
																		isInvalid={
																			!!touched.userName && !!errors.userName
																		}
																		placeholder='Enter username'
																		style={{ borderRadius: 8 }}
																	/>
																	<Form.Control.Feedback type='invalid'>
																		{errors.userName as any}
																	</Form.Control.Feedback>
																</Col>

																<Col md={4}>
																	<Form.Label className='input-label'>
																		Desgination
																	</Form.Label>
																	<Form.Control
																		name='desgination'
																		value={values.desgination}
																		onChange={handleChange}
																		isInvalid={
																			!!touched.desgination &&
																			!!errors.desgination
																		}
																		placeholder='Enter desgination'
																		style={{ borderRadius: 8 }}
																	/>
																	<Form.Control.Feedback type='invalid'>
																		{errors.desgination as any}
																	</Form.Control.Feedback>
																</Col>

																<Col md={4}>
																	<Form.Label className='input-label'>
																		User Type
																	</Form.Label>
																	<Form.Control
																		name='userType'
																		value={values.userType}
																		onChange={handleChange}
																		isInvalid={
																			!!touched.userType && !!errors.userType
																		}
																		placeholder='Enter user type'
																		style={{ borderRadius: 8 }}
																	/>
																	<Form.Control.Feedback type='invalid'>
																		{errors.userType as any}
																	</Form.Control.Feedback>
																</Col>

																<Col md={4}>
																	<Form.Label className='input-label'>
																		Phone
																	</Form.Label>
																	<Form.Control
																		name='phone'
																		type='text'
																		inputMode='numeric'
																		maxLength={10}
																		value={values.phone}
																		onChange={(e) => {
																			const onlyDigits = e.target.value.replace(
																				/\D/g,
																				"",
																			);
																			setFieldValue("phone", onlyDigits);
																		}}
																		isInvalid={
																			!!touched.phone && !!errors.phone
																		}
																		placeholder='10 digit phone'
																		style={{ borderRadius: 8 }}
																	/>
																	<Form.Control.Feedback type='invalid'>
																		{errors.phone as any}
																	</Form.Control.Feedback>
																</Col>

																<Col md={4}>
																	<Form.Label className='input-label'>
																		Email
																	</Form.Label>
																	<Form.Control
																		name='email'
																		value={values.email}
																		onChange={handleChange}
																		isInvalid={
																			!!touched.email && !!errors.email
																		}
																		placeholder='Enter email'
																		style={{ borderRadius: 8 }}
																	/>
																	<Form.Control.Feedback type='invalid'>
																		{errors.email as any}
																	</Form.Control.Feedback>
																</Col>

																<Col md={4}>
																	<Form.Label className='input-label'>
																		Pincode
																	</Form.Label>
																	<Form.Control
																		name='pincode'
																		value={values.pincode}
																		onChange={handleChange}
																		isInvalid={
																			!!touched.pincode && !!errors.pincode
																		}
																		placeholder='Enter pincode'
																		style={{ borderRadius: 8 }}
																	/>
																	<Form.Control.Feedback type='invalid'>
																		{errors.pincode as any}
																	</Form.Control.Feedback>
																</Col>

																<Col md={12}>
																	<Form.Label className='input-label'>
																		Address
																	</Form.Label>
																	<Form.Control
																		name='address'
																		value={values.address}
																		onChange={handleChange}
																		isInvalid={
																			!!touched.address && !!errors.address
																		}
																		placeholder='Enter address'
																		style={{ borderRadius: 8 }}
																	/>
																	<Form.Control.Feedback type='invalid'>
																		{errors.address as any}
																	</Form.Control.Feedback>
																</Col>

																<Col md={6}>
																	<Form.Label className='input-label'>
																		Country
																	</Form.Label>
																	<Form.Select
																		name='country'
																		value={values.country}
																		onChange={(e) => {
																			const val = e.target.value;
																			setFieldValue("country", val);
																			setFieldValue("state", "");
																			setFieldValue("city", "");
																		}}
																		isInvalid={
																			!!touched.country && !!errors.country
																		}
																		style={{ borderRadius: 8 }}
																	>
																		<option value=''>Select Country</option>
																		{countries.map((c) => (
																			<option key={c.isoCode} value={c.name}>
																				{c.name}
																			</option>
																		))}
																	</Form.Select>
																	<Form.Control.Feedback type='invalid'>
																		{errors.country as any}
																	</Form.Control.Feedback>
																</Col>

																<Col md={6}>
																	<Form.Label className='input-label'>
																		State
																	</Form.Label>
																	<Form.Select
																		name='state'
																		value={values.state}
																		onChange={(e) => {
																			const val = e.target.value;
																			setFieldValue("state", val);
																			setFieldValue("city", "");
																		}}
																		disabled={!values.country}
																		isInvalid={
																			!!touched.state && !!errors.state
																		}
																		style={{ borderRadius: 8 }}
																	>
																		<option value=''>
																			{values.country
																				? "Select State"
																				: "Select Country first"}
																		</option>
																		{states.map((s) => (
																			<option key={s.isoCode} value={s.name}>
																				{s.name}
																			</option>
																		))}
																	</Form.Select>
																	<Form.Control.Feedback type='invalid'>
																		{errors.state as any}
																	</Form.Control.Feedback>
																</Col>

																<Col md={6}>
																	<Form.Label className='input-label'>
																		City
																	</Form.Label>
																	<Form.Select
																		name='city'
																		value={values.city}
																		onChange={(e) =>
																			setFieldValue("city", e.target.value)
																		}
																		disabled={!values.country || !values.state}
																		isInvalid={!!touched.city && !!errors.city}
																		style={{ borderRadius: 8 }}
																	>
																		<option value=''>
																			{values.state
																				? "Select City"
																				: "Select State first"}
																		</option>
																		{cities.map((c) => (
																			<option
																				key={`${c.name}-${c.latitude}-${c.longitude}`}
																				value={c.name}
																			>
																				{c.name}
																			</option>
																		))}
																	</Form.Select>
																	<Form.Control.Feedback type='invalid'>
																		{errors.city as any}
																	</Form.Control.Feedback>
																</Col>

																{!isEdit && (
																	<>
																		<Col md={3}>
																			<Form.Label className='input-label'>
																				Password
																			</Form.Label>
																			<Form.Control
																				name='password'
																				type='password'
																				value={values.password}
																				onChange={handleChange}
																				isInvalid={
																					!!touched.password &&
																					!!errors.password
																				}
																				placeholder='Enter password'
																				style={{ borderRadius: 8 }}
																			/>
																			<Form.Control.Feedback type='invalid'>
																				{errors.password as any}
																			</Form.Control.Feedback>
																		</Col>

																		<Col md={3}>
																			<Form.Label className='input-label'>
																				Confirm Password
																			</Form.Label>
																			<Form.Control
																				name='confirmPassword'
																				type='password'
																				value={values.confirmPassword}
																				onChange={handleChange}
																				isInvalid={
																					!!touched.confirmPassword &&
																					!!errors.confirmPassword
																				}
																				placeholder='Confirm password'
																				style={{ borderRadius: 8 }}
																			/>
																			<Form.Control.Feedback type='invalid'>
																				{errors.confirmPassword as any}
																			</Form.Control.Feedback>
																		</Col>
																	</>
																)}
															</Row>
														</div>
													</div>
												)}

												{activeTab === "PERMISSIONS" && (
													<Card
														className='permissions-wrap'
														style={{
															border: "1px solid #e9ebec",
															borderRadius: 12,
															overflow: "hidden",
														}}
													>
														<div
															className='d-flex flex-wrap justify-content-between align-items-center gap-2 px-3 py-3'
															style={{
																background: "#f8fbfa",
																borderBottom: "1px solid #edf1f0",
															}}
														>
															<div>
																<h6 className='m-0 fw-bold'>Permissions</h6>
																<div
																	style={{
																		fontSize: 12,
																		color: "#6c757d",
																		marginTop: 4,
																	}}
																>
																	Control module-wise access for this user
																</div>
															</div>

															<Form.Check
																type='checkbox'
																id='allPermissions'
																label='All Permissions'
																checked={allPermissionsChecked}
																onChange={(e) =>
																	setFieldValue(
																		"permissions",
																		setAllPermissions(e.target.checked),
																	)
																}
																style={{ fontWeight: 600 }}
															/>
														</div>

														<div className='p-3'>
															{permissionSections.map((section) => {
																const sectionChecked = isSectionAllChecked(
																	values.permissions,
																	section.key,
																	section.items,
																);

																const isOpen = openSection === section.key;

																return (
																	<div
																		key={section.key}
																		style={{
																			border: "1px solid #e9ebec",
																			borderRadius: 10,
																			marginBottom: 14,
																			overflow: "hidden",
																		}}
																	>
																		<div
																			className='d-flex justify-content-between align-items-center px-3 py-3'
																			style={{
																				cursor: "pointer",
																				background: isOpen ? "#f8fbfa" : "#fff",
																				transition: "all 0.2s ease",
																			}}
																			onClick={() =>
																				setOpenSection((prev) =>
																					prev === section.key
																						? null
																						: section.key,
																				)
																			}
																		>
																			<div className='d-flex align-items-center gap-3'>
																				<div
																					style={{
																						width: 30,
																						height: 30,
																						borderRadius: 8,
																						background: `${theme}12`,
																						color: theme,
																						display: "flex",
																						alignItems: "center",
																						justifyContent: "center",
																						fontWeight: 700,
																						fontSize: 13,
																					}}
																				>
																					{section.label.charAt(0)}
																				</div>

																				<div>
																					<div
																						style={{
																							fontWeight: 700,
																							color: "#212529",
																						}}
																					>
																						{section.label}
																					</div>
																					<div
																						style={{
																							fontSize: 12,
																							color: "#6c757d",
																							marginTop: 2,
																						}}
																					>
																						{section.items.length} permission
																						{section.items.length > 1
																							? "s"
																							: ""}
																					</div>
																				</div>
																			</div>

																			<div
																				className='d-flex align-items-center gap-3'
																				onClick={(e) => e.stopPropagation()}
																			>
																				<Form.Check
																					type='checkbox'
																					id={`section-${section.key}`}
																					label='All Permission'
																					checked={sectionChecked}
																					onChange={(e) =>
																						setFieldValue(
																							"permissions",
																							toggleSectionAll(
																								values.permissions,
																								section.key,
																								section.items,
																								e.target.checked,
																							),
																						)
																					}
																					style={{ fontWeight: 600 }}
																				/>
																				<i
																					className='ri-arrow-down-s-line'
																					style={{
																						fontSize: 20,
																						color: "#6c757d",
																						transition: "transform 0.25s ease",
																						transform: isOpen
																							? "rotate(180deg)"
																							: "rotate(0deg)",
																					}}
																				/>
																			</div>
																		</div>

																		<div
																			style={{
																				maxHeight: isOpen ? "1200px" : "0px",
																				opacity: isOpen ? 1 : 0,
																				overflow: "hidden",
																				transition:
																					"max-height 0.3s ease, opacity 0.22s ease",
																				borderTop: isOpen
																					? "1px solid #edf1f0"
																					: "1px solid transparent",
																			}}
																		>
																			<div className='table-responsive px-3 py-3'>
																				<table className='table align-middle mb-0'>
																					<thead>
																						<tr style={{ fontSize: 13 }}>
																							<th
																								style={{
																									minWidth: 220,
																									color: "#5c6670",
																									fontWeight: 700,
																								}}
																							>
																								Module
																							</th>
																							<th
																								style={{
																									minWidth: 100,
																									color: "#5c6670",
																									fontWeight: 700,
																								}}
																							>
																								View
																							</th>
																							<th
																								style={{
																									minWidth: 100,
																									color: "#5c6670",
																									fontWeight: 700,
																								}}
																							>
																								Create
																							</th>
																							<th
																								style={{
																									minWidth: 100,
																									color: "#5c6670",
																									fontWeight: 700,
																								}}
																							>
																								Update
																							</th>
																							<th
																								style={{
																									minWidth: 130,
																									color: "#5c6670",
																									fontWeight: 700,
																								}}
																							>
																								All Actions
																							</th>
																						</tr>
																					</thead>

																					<tbody>
																						{section.items.map((item) => {
																							const node = (
																								values.permissions as any
																							)?.[section.key]?.[item.key];

																							const allActionsChecked =
																								item.onlyView
																									? !!node?.view
																									: isModuleAllActionsChecked(
																											values.permissions,
																											section.key,
																											item.key,
																										);

																							return (
																								<tr key={item.key}>
																									<td>
																										<div
																											style={{
																												fontWeight: 600,
																											}}
																										>
																											{item.label}
																										</div>
																									</td>

																									<td>
																										<Form.Check
																											type='checkbox'
																											checked={!!node?.view}
																											onChange={(e) =>
																												setFieldValue(
																													"permissions",
																													toggleSinglePermission(
																														values.permissions,
																														section.key,
																														item.key,
																														"view",
																														e.target.checked,
																													),
																												)
																											}
																										/>
																									</td>

																									<td>
																										{item.onlyView ? (
																											<span
																												style={{
																													color: "#adb5bd",
																												}}
																											>
																												—
																											</span>
																										) : (
																											<Form.Check
																												type='checkbox'
																												checked={!!node?.create}
																												onChange={(e) =>
																													setFieldValue(
																														"permissions",
																														toggleSinglePermission(
																															values.permissions,
																															section.key,
																															item.key,
																															"create",
																															e.target.checked,
																														),
																													)
																												}
																											/>
																										)}
																									</td>

																									<td>
																										{item.onlyView ? (
																											<span
																												style={{
																													color: "#adb5bd",
																												}}
																											>
																												—
																											</span>
																										) : (
																											<Form.Check
																												type='checkbox'
																												checked={!!node?.update}
																												onChange={(e) =>
																													setFieldValue(
																														"permissions",
																														toggleSinglePermission(
																															values.permissions,
																															section.key,
																															item.key,
																															"update",
																															e.target.checked,
																														),
																													)
																												}
																											/>
																										)}
																									</td>

																									<td>
																										{item.onlyView ? (
																											<span
																												style={{
																													color: "#adb5bd",
																												}}
																											>
																												—
																											</span>
																										) : (
																											<Form.Check
																												type='checkbox'
																												label='All'
																												checked={
																													allActionsChecked
																												}
																												onChange={(e) =>
																													setFieldValue(
																														"permissions",
																														toggleModuleAllActions(
																															values.permissions,
																															section.key,
																															item.key,
																															e.target.checked,
																														),
																													)
																												}
																											/>
																										)}
																									</td>
																								</tr>
																							);
																						})}
																					</tbody>
																				</table>
																			</div>
																		</div>
																	</div>
																);
															})}
														</div>
													</Card>
												)}

												{activeTab !== "PASSWORD" && (
													<div className='mt-4 d-flex gap-2'>
														<Button
															type='submit'
															disabled={
																isSubmitting || saving || !dirty || !isValid
															}
															style={{
																background: theme,
																border: "none",
																borderRadius: "6px",
																fontSize: "13px",
																display: "inline-flex",
																alignItems: "center",
																gap: "6px",
																padding: "8px 14px",
															}}
														>
															<i
																className={
																	isEdit
																		? "ri-save-3-line"
																		: "ri-add-circle-line"
																}
															/>
															{isSubmitting || saving
																? isEdit
																	? "Updating..."
																	: "Creating..."
																: isEdit
																	? "Update User"
																	: "Create User"}
														</Button>

														<Button
															variant='light'
															onClick={() => nav("/users")}
															style={{
																border: "1px solid #e9ebec",
																fontSize: "13px",
																borderRadius: "6px",
																display: "inline-flex",
																alignItems: "center",
																gap: "6px",
																padding: "8px 14px",
															}}
														>
															<i className='ri-close-line' /> Cancel
														</Button>

														{activeTab === "DETAILS" && (
															<Button
																type='button'
																variant='light'
																onClick={() => setActiveTab("PERMISSIONS")}
																style={{
																	border: "1px solid #d7ebe7",
																	background: "#eaf4f2",
																	color: theme,
																	fontSize: "13px",
																	borderRadius: "6px",
																	display: "inline-flex",
																	alignItems: "center",
																	gap: "6px",
																	padding: "8px 14px",
																}}
															>
																Next <i className='ri-arrow-right-line' />
															</Button>
														)}
													</div>
												)}
											</Form>
										);
									}}
								</Formik>

								{isEdit && activeTab === "PASSWORD" && (
									<Card
										className='mt-4'
										style={{
											border: "1px solid #e9ebec",
											borderRadius: "12px",
											overflow: "hidden",
										}}
									>
										<div className='section-card-header'>
											<div>
												<h6 className='m-0 fw-bold'>Change Password</h6>
												<div
													style={{
														fontSize: 12,
														color: "#6c757d",
														marginTop: 4,
													}}
												>
													Update the user password securely
												</div>
											</div>
										</div>

										<div className='section-card-body'>
											<Formik
												initialValues={{
													oldPassword: "",
													newPassword: "",
													confirmPassword: "",
												}}
												validationSchema={PasswordSchema}
												onSubmit={async (
													values,
													{ setSubmitting, resetForm },
												) => {
													const res = await dispatch(
														updatePasswordThunk({
															id: id!,
															payload: {
																password: values.newPassword,
															},
														}),
													);

													if (updatePasswordThunk.fulfilled.match(res)) {
														toast.success("Password updated");
														resetForm();
													} else {
														toast.error(
															String(res.payload || "Password update failed"),
														);
													}

													setSubmitting(false);
												}}
											>
												{({
													handleSubmit,
													handleChange,
													values,
													touched,
													errors,
													isSubmitting,
												}) => (
													<Form onSubmit={handleSubmit}>
														<Row className='g-3'>
															<Col md={4}>
																<Form.Label className='input-label'>
																	Old Password
																</Form.Label>
																<Form.Control
																	type='password'
																	name='oldPassword'
																	value={values.oldPassword}
																	onChange={handleChange}
																	isInvalid={
																		!!touched.oldPassword &&
																		!!errors.oldPassword
																	}
																	placeholder='Enter old password'
																	style={{ borderRadius: 8 }}
																/>
																<Form.Control.Feedback type='invalid'>
																	{errors.oldPassword as any}
																</Form.Control.Feedback>
															</Col>

															<Col md={4}>
																<Form.Label className='input-label'>
																	New Password
																</Form.Label>
																<Form.Control
																	type='password'
																	name='newPassword'
																	value={values.newPassword}
																	onChange={handleChange}
																	isInvalid={
																		!!touched.newPassword &&
																		!!errors.newPassword
																	}
																	placeholder='Enter new password'
																	style={{ borderRadius: 8 }}
																/>
																<Form.Control.Feedback type='invalid'>
																	{errors.newPassword as any}
																</Form.Control.Feedback>
															</Col>

															<Col md={4}>
																<Form.Label className='input-label'>
																	Confirm Password
																</Form.Label>
																<Form.Control
																	type='password'
																	name='confirmPassword'
																	value={values.confirmPassword}
																	onChange={handleChange}
																	isInvalid={
																		!!touched.confirmPassword &&
																		!!errors.confirmPassword
																	}
																	placeholder='Confirm new password'
																	style={{ borderRadius: 8 }}
																/>
																<Form.Control.Feedback type='invalid'>
																	{errors.confirmPassword as any}
																</Form.Control.Feedback>
															</Col>
														</Row>

														<div className='mt-3 d-flex gap-2'>
															<Button
																type='submit'
																disabled={isSubmitting}
																style={{
																	background: theme,
																	border: "none",
																	borderRadius: "6px",
																	fontSize: "13px",
																	display: "inline-flex",
																	alignItems: "center",
																	gap: "6px",
																	padding: "8px 14px",
																}}
															>
																<i className='ri-key-2-line' />
																{isSubmitting
																	? "Updating..."
																	: "Update Password"}
															</Button>
														</div>
													</Form>
												)}
											</Formik>
										</div>
									</Card>
								)}
							</>
						)}
					</div>
				</div>
			</Card>
		</>
	);
}
