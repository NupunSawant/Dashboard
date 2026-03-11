import { useEffect, useState } from "react";
import {
	Card,
	Button,
	Form,
	Alert,
	Row,
	Col,
	Spinner,
	Badge,
} from "react-bootstrap";
import { Formik } from "formik";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../slices/store";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import { fetchUsersThunk } from "../../../slices/users/thunks";
import { fetchCategoriesThunk } from "../../../slices/Masters/categories/thunks";
import { fetchSubCategoriesThunk } from "../../../slices/Masters/subCategories/thunks";
import { fetchItemsThunk } from "../../../slices/Masters/items/thunks";
import { fetchCustomersThunk } from "../../../slices/Masters/customers/thunks";

import {
	createEnquiryThunk,
	getEnquiryThunk,
	updateEnquiryThunk,
} from "../../../slices/orders/Enquiry/thunks";

const theme = "#1a8376";

const SOURCE_OPTIONS = [
	"Website",
	"Walk-in",
	"Phone Call",
	"WhatsApp",
	"Reference",
	"Social Media",
	"Email",
	"Other",
];

const StageOptions = [
	{ value: "PENDING", label: "Pending" },
	{ value: "QUOTATION_CREATED", label: "Quotation Created" },
	{ value: "REQUEST_FOR_QUOTATION", label: "Request For Quotation" },
	{ value: "CLOSED", label: "Closed" },
];

const Schema = Yup.object({
	enquiryDate: Yup.string().required("Enquiry date required"),
	sourceOfEnquiry: Yup.string().required("Source required"),

	customerName: Yup.string().required("Customer name required"),
	contactPersonName: Yup.string().required("Contact person name required"),
	contactPersonPhone: Yup.string()
		.required("Contact person phone required")
		.matches(/^\d{10}$/, "Phone must be 10 digits"),

	staffName: Yup.string().required("Staff name required"),

	stage: Yup.string()
		.oneOf(["PENDING", "QUOTATION_CREATED", "REQUEST_FOR_QUOTATION", "CLOSED"])
		.optional(),

	remarks: Yup.string().optional(),

	items: Yup.array()
		.of(
			Yup.object({
				itemsCategory: Yup.string().required("Category required"),
				itemsSubCategory: Yup.string().required("Sub-category required"),
				itemsName: Yup.string().required("Item name required"),
				itemsCode: Yup.string().required("Item code required"),
				itemsUnit: Yup.string().required("Unit required"),
				itemsRemark: Yup.string().optional(),
			}),
		)
		.min(1, "At least one item is required"),
});

export default function EnquiryUpsertPage() {
	const dispatch = useDispatch<AppDispatch>();
	const nav = useNavigate();
	const { id } = useParams();
	const isEdit = !!id;

	const { creating, updating, error } = useSelector(
		(s: RootState) => (s as any).enquiries,
	);

	const [loading, setLoading] = useState(false);
	const [apiError, setApiError] = useState<string | null>(null);

	const { users, loadingList: usersLoading } = useSelector(
		(s: RootState) => (s as any).users,
	);
	const { categories, loadingList: categoriesLoading } = useSelector(
		(s: RootState) => (s as any).categories,
	);
	const { subCategories, loadingList: subCategoriesLoading } = useSelector(
		(s: RootState) => (s as any).subCategories,
	);
	const { items, loadingList: itemsLoading } = useSelector(
		(s: RootState) => (s as any).items,
	);
	const { customers, loadingList: customersLoading } = useSelector(
		(s: RootState) => (s as any).customers,
	);

	const [initialValues, setInitialValues] = useState<any>({
		enquiryDate: new Date().toISOString().slice(0, 10),
		sourceOfEnquiry: "",
		customerName: "",
		contactPersonName: "",
		contactPersonPhone: "",
		staffName: "",
		stage: "PENDING",
		remarks: "",
		items: [
			{
				itemsCategory: "",
				itemsSubCategory: "",
				itemsName: "",
				itemsCode: "",
				itemsUnit: "",
				itemsRemark: "",
			},
		],
	});

	useEffect(() => {
		dispatch(fetchUsersThunk());
		dispatch(fetchCategoriesThunk());
		dispatch(fetchSubCategoriesThunk());
		dispatch(fetchItemsThunk());
		dispatch(fetchCustomersThunk());

		const onFocus = () => {
			dispatch(fetchUsersThunk());
			dispatch(fetchCategoriesThunk());
			dispatch(fetchSubCategoriesThunk());
			dispatch(fetchItemsThunk());
			dispatch(fetchCustomersThunk());
		};

		window.addEventListener("focus", onFocus);
		return () => window.removeEventListener("focus", onFocus);
	}, [dispatch]);

	useEffect(() => {
		if (!isEdit) return;

		(async () => {
			setLoading(true);
			setApiError(null);

			const res = await dispatch(getEnquiryThunk(id!));
			if (getEnquiryThunk.fulfilled.match(res)) {
				const e: any = res.payload;

				setInitialValues({
					enquiryDate: e.enquiryDate
						? new Date(e.enquiryDate).toISOString().slice(0, 10)
						: new Date().toISOString().slice(0, 10),

					sourceOfEnquiry: e.sourceOfEnquiry ?? "",
					customerName: e.customerName ?? "",
					contactPersonName: e.contactPersonName ?? "",
					contactPersonPhone:
						e.contactPersonPhone === null || e.contactPersonPhone === undefined
							? ""
							: String(e.contactPersonPhone),

					staffName: e.staffName ?? "",
					stage: e.stage ?? "PENDING",
					remarks: e.remarks ?? "",

					items:
						Array.isArray(e.items) && e.items.length > 0
							? e.items.map((item: any) => ({
									itemsCategory: item.itemsCategory ?? "",
									itemsSubCategory: item.itemsSubCategory ?? "",
									itemsName: item.itemsName ?? "",
									itemsCode: item.itemsCode ?? "",
									itemsUnit: item.itemsUnit ?? "",
									itemsRemark: item.itemsRemark ?? "",
								}))
							: [
									{
										itemsCategory: "",
										itemsSubCategory: "",
										itemsName: "",
										itemsCode: "",
										itemsUnit: "",
										itemsRemark: "",
									},
								],
				});
			} else {
				setApiError(String(res.payload || "Failed to load enquiry"));
			}

			setLoading(false);
		})();
	}, [dispatch, id, isEdit]);

	return (
		<>
			<Card
				className='p-3'
				style={{ border: "1px solid #e9ebec", borderRadius: "10px" }}
			>
				{/* Header */}
				<div className='d-flex justify-content-between align-items-center mb-3'>
					<div>
						<h5 className='m-0'>
							{isEdit ? "Update Enquiry" : "Create Enquiry"}
						</h5>
						<div style={{ fontSize: 13, color: "#6c757d", marginTop: 2 }}>
							{isEdit ? "Update enquiry details" : "Add a new enquiry"}
						</div>
					</div>

					<Button
						variant='light'
						size='sm'
						onClick={() => nav("/orders/enquiries")}
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
					<Formik
						enableReinitialize
						initialValues={initialValues}
						validationSchema={Schema}
						onSubmit={async (values, { setSubmitting }) => {
							setApiError(null);

							if (!values.items || values.items.length === 0) {
								setApiError("At least one item is required");
								setSubmitting(false);
								return;
							}

							const payload = {
								enquiryDate: values.enquiryDate
									? new Date(values.enquiryDate as any)
									: undefined,

								sourceOfEnquiry: values.sourceOfEnquiry,

								customerName: values.customerName,
								contactPersonName: values.contactPersonName,
								contactPersonPhone:
									values.contactPersonPhone === ""
										? undefined
										: Number(values.contactPersonPhone),

								staffName: values.staffName,
								stage: values.stage || "PENDING",
								remarks: values.remarks,

								items: values.items.map((item: any) => ({
									itemsCategory: item.itemsCategory,
									itemsSubCategory: item.itemsSubCategory,
									itemsName: item.itemsName,
									itemsCode: item.itemsCode,
									itemsUnit: item.itemsUnit,
									itemsRemark: item.itemsRemark,
								})),
							};

							if (!isEdit) {
								const res = await dispatch(createEnquiryThunk(payload as any));
								if (createEnquiryThunk.fulfilled.match(res)) {
									toast.success("Enquiry created");
									nav("/orders/enquiries", { replace: true });
								} else {
									setApiError(String(res.payload || "Create failed"));
									toast.error(String(res.payload || "Create failed"));
								}
							} else {
								const res = await dispatch(
									updateEnquiryThunk({ id: id!, payload: payload as any }),
								);
								if (updateEnquiryThunk.fulfilled.match(res)) {
									toast.success("Enquiry updated");
									nav("/orders/enquiries", { replace: true });
								} else {
									setApiError(String(res.payload || "Update failed"));
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
							//   FIX: safe typed arrays for touched/errors indexing
							const itemsTouched = (touched as any)?.items as any[] | undefined;
							const itemsErrors = (errors as any)?.items as any[] | undefined;

							//   SAME filter logic (by category name / subCategory name)
							const getFilteredSubCategories = (categoryName: string) => {
								if (!categoryName) return [];
								return (subCategories || []).filter((sc: any) => {
									const catName =
										sc.categoryName || sc.category?.name || sc.category || "";
									return String(catName).trim() === String(categoryName).trim();
								});
							};

							const getFilteredItems = (subCategoryName: string) => {
								if (!subCategoryName) return [];
								return (items || []).filter((it: any) => {
									const subName =
										it.subCategoryName ||
										it.subCategory?.name ||
										it.subCategory ||
										"";
									return (
										String(subName).trim() === String(subCategoryName).trim()
									);
								});
							};

							return (
								<Form onSubmit={handleSubmit}>
									{/* ===== Enquiry Details ===== */}
									<div
										className='p-3 mb-3'
										style={{
											background: "#f8fbfa",
											border: "1px solid #eef2f1",
											borderRadius: 10,
										}}
									>
										<div className='d-flex align-items-center gap-2 mb-2'>
											<i
												className='ri-file-list-3-line'
												style={{ color: theme }}
											/>
											<div style={{ fontWeight: 700 }}>Enquiry Details</div>
										</div>

										<Row className='g-3'>
											<Col md={3}>
												<Form.Label style={{ fontWeight: "bold" }}>
													Enquiry Date <span style={{ color: "red" }}>*</span>
												</Form.Label>
												<Form.Control
													type='date'
													name='enquiryDate'
													value={values.enquiryDate}
													onChange={handleChange}
													isInvalid={
														!!touched.enquiryDate && !!errors.enquiryDate
													}
													style={{ borderRadius: 8 }}
												/>
												<Form.Control.Feedback type='invalid'>
													{errors.enquiryDate as any}
												</Form.Control.Feedback>
											</Col>

											<Col md={3}>
												<Form.Label style={{ fontWeight: "bold" }}>
													Source of Enquiry{" "}
													<span style={{ color: "red" }}>*</span>
												</Form.Label>
												<Form.Select
													name='sourceOfEnquiry'
													value={values.sourceOfEnquiry}
													onChange={handleChange}
													isInvalid={
														!!touched.sourceOfEnquiry &&
														!!errors.sourceOfEnquiry
													}
													style={{ borderRadius: 8 }}
												>
													<option value=''>Select source</option>
													{SOURCE_OPTIONS.map((s) => (
														<option key={s} value={s}>
															{s}
														</option>
													))}
												</Form.Select>
												<Form.Control.Feedback type='invalid'>
													{errors.sourceOfEnquiry as any}
												</Form.Control.Feedback>
											</Col>

											<Col md={3}>
												<Form.Label style={{ fontWeight: "bold" }}>
													Staff Name <span style={{ color: "red" }}>*</span>
												</Form.Label>
												<Form.Select
													name='staffName'
													value={values.staffName}
													onChange={handleChange}
													isInvalid={!!touched.staffName && !!errors.staffName}
													style={{ borderRadius: 8 }}
												>
													<option value='' disabled>
														{usersLoading ? "Loading users..." : "Select user"}
													</option>
													{(users || []).map((u: any) => {
														const uid = u.id || u._id || u.firstName;
														const uname =
															u.name ||
															[u.firstName, u.lastName]
																.filter(Boolean)
																.join(" ") ||
															u.userName ||
															u.label ||
															uid;
														return (
															<option key={uid} value={uname}>
																{uname}
															</option>
														);
													})}
												</Form.Select>
												<Form.Control.Feedback type='invalid'>
													{errors.staffName as any}
												</Form.Control.Feedback>
											</Col>

											<Col md={3}>
												<Form.Label style={{ fontWeight: "bold" }}>
													Stage{" "}
													{isEdit ? (
														<Badge
															style={{
																marginLeft: 8,
																background: "#eaf4f2",
																color: theme,
																border: "1px solid #d8ece8",
															}}
														>
															Editable
														</Badge>
													) : null}
												</Form.Label>
												<Form.Select
													name='stage'
													value={values.stage}
													onChange={handleChange}
													isInvalid={!!touched.stage && !!errors.stage}
													style={{ borderRadius: 8 }}
												>
													{StageOptions.map((s) => (
														<option key={s.value} value={s.value}>
															{s.label}
														</option>
													))}
												</Form.Select>
												<Form.Control.Feedback type='invalid'>
													{errors.stage as any}
												</Form.Control.Feedback>
											</Col>

											<Col md={4}>
												<Form.Label style={{ fontWeight: "bold" }}>
													Customer Name <span style={{ color: "red" }}>*</span>
												</Form.Label>

												<Form.Select
													name='customerName'
													value={values.customerName}
													onChange={(e) => {
														const selectedName = e.target.value;
														const selectedCustomer = (customers || []).find(
															(c: any) => c.customerName === selectedName,
														);

														setFieldValue("customerName", selectedName);

														if (selectedCustomer) {
															setFieldValue(
																"contactPersonName",
																selectedCustomer.customerContactPersonName ||
																	"",
															);
															setFieldValue(
																"contactPersonPhone",
																selectedCustomer.customerContactPersonPhone
																	? String(
																			selectedCustomer.customerContactPersonPhone,
																		)
																	: "",
															);
														}
													}}
													isInvalid={
														!!touched.customerName && !!errors.customerName
													}
													style={{ borderRadius: 8 }}
												>
													<option value=''>
														{customersLoading
															? "Loading customers..."
															: "Select customer"}
													</option>

													{(customers || []).map((c: any) => (
														<option key={c._id || c.id} value={c.customerName}>
															{c.customerName}
														</option>
													))}
												</Form.Select>

												<Form.Control.Feedback type='invalid'>
													{errors.customerName as any}
												</Form.Control.Feedback>
											</Col>

											<Col md={4}>
												<Form.Label style={{ fontWeight: "bold" }}>
													Contact Person Name{" "}
													<span style={{ color: "red" }}>*</span>
												</Form.Label>
												<Form.Control
													name='contactPersonName'
													value={values.contactPersonName}
													onChange={handleChange}
													isInvalid={
														!!touched.contactPersonName &&
														!!errors.contactPersonName
													}
													placeholder='Enter contact person name'
													style={{ borderRadius: 8 }}
												/>
												<Form.Control.Feedback type='invalid'>
													{errors.contactPersonName as any}
												</Form.Control.Feedback>
											</Col>

											<Col md={4}>
												<Form.Label style={{ fontWeight: "bold" }}>
													Contact Person Phone{" "}
													<span style={{ color: "red" }}>*</span>
												</Form.Label>
												<Form.Control
													name='contactPersonPhone'
													value={values.contactPersonPhone}
													onChange={handleChange}
													isInvalid={
														!!touched.contactPersonPhone &&
														!!errors.contactPersonPhone
													}
													placeholder='10-digit phone'
													style={{ borderRadius: 8 }}
												/>
												<Form.Control.Feedback type='invalid'>
													{errors.contactPersonPhone as any}
												</Form.Control.Feedback>
											</Col>

											<Col md={12}>
												<Form.Label style={{ fontWeight: "bold" }}>
													Remarks
												</Form.Label>
												<Form.Control
													name='remarks'
													value={values.remarks}
													onChange={handleChange}
													isInvalid={!!touched.remarks && !!errors.remarks}
													placeholder='Optional remarks'
													style={{ borderRadius: 8 }}
												/>
												<Form.Control.Feedback type='invalid'>
													{errors.remarks as any}
												</Form.Control.Feedback>
											</Col>
										</Row>
									</div>

									<div
										className='p-3 mb-3'
										style={{
											background: "#ffffff",
											border: "1px solid #eef2f1",
											borderRadius: 10,
										}}
									>
										<div className='d-flex align-items-center gap-2 mb-3'>
											<i className='ri-box-3-line' style={{ color: theme }} />
											<div style={{ fontWeight: 700 }}>Items</div>
										</div>

										{values.items.map((item: any, idx: number) => {
											const filteredSubs = getFilteredSubCategories(
												item.itemsCategory,
											);
											const filteredItemsList = getFilteredItems(
												item.itemsSubCategory,
											);

											return (
												<div
													key={idx}
													className='mb-4 p-3'
													style={{
														background: "#f8fbfa",
														borderRadius: 8,
														border: "1px solid #eef2f1",
													}}
												>
													<div className='d-flex justify-content-between align-items-center mb-3'>
														<h6 className='m-0'>Item {idx + 1}</h6>
														{values.items.length > 1 && (
															<Button
																variant='danger'
																size='sm'
																onClick={() => {
																	const newItems = values.items.filter(
																		(_: any, i: number) => i !== idx,
																	);
																	setFieldValue("items", newItems);
																}}
																style={{ padding: "4px 8px", fontSize: "12px" }}
															>
																<i className='ri-delete-bin-line' /> Remove
															</Button>
														)}
													</div>

													<Row className='g-3'>
														<Col md={6}>
															<Form.Label style={{ fontWeight: "bold" }}>
																Category <span style={{ color: "red" }}>*</span>
															</Form.Label>
															<Form.Select
																value={item.itemsCategory}
																onChange={(e) => {
																	const catName = e.target.value;
																	const newItems = [...values.items];
																	newItems[idx].itemsCategory = catName;
																	newItems[idx].itemsSubCategory = "";
																	newItems[idx].itemsName = "";
																	newItems[idx].itemsCode = "";
																	newItems[idx].itemsUnit = "";
																	setFieldValue("items", newItems);
																}}
																isInvalid={
																	!!itemsTouched?.[idx]?.itemsCategory &&
																	!!(itemsErrors?.[idx] as any)?.itemsCategory
																}
																style={{ borderRadius: 8 }}
															>
																<option value=''>
																	{categoriesLoading ? "Loading..." : "Select"}
																</option>
																{(categories || []).map((c: any) => {
																	const cname =
																		c.name || c.categoryName || c.label || "";
																	return (
																		<option key={cname} value={cname}>
																			{cname}
																		</option>
																	);
																})}
															</Form.Select>
															<Form.Control.Feedback type='invalid'>
																{(itemsErrors?.[idx] as any)?.itemsCategory
																	? String(
																			(itemsErrors?.[idx] as any)
																				?.itemsCategory,
																		)
																	: ""}
															</Form.Control.Feedback>
														</Col>

														<Col md={6}>
															<Form.Label style={{ fontWeight: "bold" }}>
																Sub Category{" "}
																<span style={{ color: "red" }}>*</span>
															</Form.Label>
															<Form.Select
																value={item.itemsSubCategory}
																onChange={(e) => {
																	const subName = e.target.value;
																	const newItems = [...values.items];
																	newItems[idx].itemsSubCategory = subName;
																	newItems[idx].itemsName = "";
																	newItems[idx].itemsCode = "";
																	newItems[idx].itemsUnit = "";
																	setFieldValue("items", newItems);
																}}
																disabled={!item.itemsCategory}
																isInvalid={
																	!!itemsTouched?.[idx]?.itemsSubCategory &&
																	!!(itemsErrors?.[idx] as any)
																		?.itemsSubCategory
																}
																style={{ borderRadius: 8 }}
															>
																<option value=''>
																	{!item.itemsCategory
																		? "Select category first"
																		: subCategoriesLoading
																			? "Loading..."
																			: filteredSubs.length === 0
																				? "No sub-categories available"
																				: "Select"}
																</option>
																{filteredSubs.map((sc: any) => {
																	const scname =
																		sc.name ||
																		sc.subCategoryName ||
																		sc.label ||
																		"";
																	return (
																		<option key={scname} value={scname}>
																			{scname}
																		</option>
																	);
																})}
															</Form.Select>
															<Form.Control.Feedback type='invalid'>
																{(itemsErrors?.[idx] as any)?.itemsSubCategory
																	? String(
																			(itemsErrors?.[idx] as any)
																				?.itemsSubCategory,
																		)
																	: ""}
															</Form.Control.Feedback>
														</Col>

														<Col md={6}>
															<Form.Label style={{ fontWeight: "bold" }}>
																Item Name{" "}
																<span style={{ color: "red" }}>*</span>
															</Form.Label>
															<Form.Select
																value={item.itemsName}
																onChange={(e) => {
																	const itemName = e.target.value;

																	const it = (items || []).find((x: any) => {
																		const nm =
																			x.itemName || x.name || x.label || "";
																		return (
																			String(nm).trim() ===
																			String(itemName).trim()
																		);
																	});

																	const newItems = [...values.items];
																	newItems[idx].itemsName = itemName;
																	newItems[idx].itemsCode = it?.itemCode || "";
																	newItems[idx].itemsUnit = it?.unit || "";
																	setFieldValue("items", newItems);
																}}
																disabled={!item.itemsSubCategory}
																isInvalid={
																	!!itemsTouched?.[idx]?.itemsName &&
																	!!(itemsErrors?.[idx] as any)?.itemsName
																}
																style={{ borderRadius: 8 }}
															>
																<option value=''>
																	{!item.itemsSubCategory
																		? "Select sub-category first"
																		: itemsLoading
																			? "Loading..."
																			: filteredItemsList.length === 0
																				? "No items available"
																				: "Select"}
																</option>
																{filteredItemsList.map((it: any) => {
																	const nm =
																		it.itemName || it.name || it.label || "";
																	return (
																		<option key={nm} value={nm}>
																			{nm}
																		</option>
																	);
																})}
															</Form.Select>
															<Form.Control.Feedback type='invalid'>
																{(itemsErrors?.[idx] as any)?.itemsName
																	? String(
																			(itemsErrors?.[idx] as any)?.itemsName,
																		)
																	: ""}
															</Form.Control.Feedback>
														</Col>

														<Col md={3}>
															<Form.Label style={{ fontWeight: "bold" }}>
																Item Code
															</Form.Label>
															<Form.Control
																value={item.itemsCode}
																readOnly
																style={{ borderRadius: 8 }}
															/>
														</Col>

														<Col md={3}>
															<Form.Label style={{ fontWeight: "bold" }}>
																Unit
															</Form.Label>
															<Form.Control
																value={item.itemsUnit}
																readOnly
																style={{ borderRadius: 8 }}
															/>
														</Col>

														<Col md={12}>
															<Form.Label style={{ fontWeight: "bold" }}>
																Item Remark
															</Form.Label>
															<Form.Control
																name={`items.${idx}.itemsRemark`}
																value={item.itemsRemark}
																onChange={(e) => {
																	const newItems = [...values.items];
																	newItems[idx].itemsRemark = e.target.value;
																	setFieldValue("items", newItems);
																}}
																placeholder='Optional item remark'
																style={{ borderRadius: 8 }}
															/>
														</Col>
													</Row>
												</div>
											);
										})}

										<Button
											variant='outline-primary'
											onClick={() => {
												setFieldValue("items", [
													...values.items,
													{
														itemsCategory: "",
														itemsSubCategory: "",
														itemsName: "",
														itemsCode: "",
														itemsUnit: "",
														itemsRemark: "",
													},
												]);
											}}
											style={{
												borderRadius: 6,
												fontSize: "13px",
												display: "inline-flex",
												alignItems: "center",
												gap: "6px",
											}}
										>
											<i className='ri-add-circle-line' /> Add Item
										</Button>
									</div>

									{/* Submit buttons */}
									<div className='mt-3 d-flex gap-2'>
										<Button
											type='submit'
											disabled={
												isSubmitting ||
												creating ||
												updating ||
												!dirty ||
												!isValid
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
													isEdit ? "ri-save-3-line" : "ri-add-circle-line"
												}
											/>
											{isSubmitting || creating || updating
												? isEdit
													? "Updating..."
													: "Creating..."
												: isEdit
													? "Update Enquiry"
													: "Create Enquiry"}
										</Button>

										<Button
											variant='light'
											onClick={() => nav("/orders/enquiries")}
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
									</div>
								</Form>
							);
						}}
					</Formik>
				)}
			</Card>
		</>
	);
}
