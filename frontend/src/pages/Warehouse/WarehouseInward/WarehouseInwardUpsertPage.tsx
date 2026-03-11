import { useEffect, useState } from "react";
import { Card, Button, Form, Alert, Row, Col, Spinner } from "react-bootstrap";
import { Formik } from "formik";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../slices/store";
import {
	createWarehouseInwardThunk,
	getWarehouseInwardThunk,
	updateWarehouseInwardThunk,
} from "../../../slices/Warehouse/thunks";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { fetchUsersThunk } from "../../../slices/users/thunks";
import { fetchSuppliersThunk } from "../../../slices/Masters/suppliers/thunks";
import { fetchWarehousesThunk } from "../../../slices/Masters/warehouses/thunks";
import { fetchCategoriesThunk } from "../../../slices/Masters/categories/thunks";
import { fetchSubCategoriesThunk } from "../../../slices/Masters/subCategories/thunks";
import { fetchItemsThunk } from "../../../slices/Masters/items/thunks";
import { fetchInventoriesThunk } from "../../../slices/Inventory/thunks";

const theme = "#1a8376";

const INWARD_TYPE_OPTIONS = [
	"GRN",
	"STOCK_TRANSFER",
	"LABOUR_RETURN",
	"SALES_RETURN",
] as const;

const CreateSchema = Yup.object({
	inwardType: Yup.string()
		.oneOf([...INWARD_TYPE_OPTIONS], "Invalid inward type")
		.required("Inward type required"),
	inwardDate: Yup.string().required("Inward date required"),
	receivedBy: Yup.string().required("Received by required"),
	remarks: Yup.string().optional(),
	invoiceNo: Yup.string().required("Invoice No required"),
	supplierName: Yup.string().required("Supplier required"),
	warehouseName: Yup.string().required("Warehouse required"),
	items: Yup.array().of(
		Yup.object({
			itemsCategory: Yup.string().required("Category required"),
			itemsSubCategory: Yup.string().required("Sub-category required"),
			itemsName: Yup.string().required("Item name required"),
			itemsCode: Yup.string().required("Item code required"),
			itemsQuantity: Yup.number()
				.typeError("Qty must be number")
				.min(1, "Min 1")
				.required("Qty required"),
			itemsUnit: Yup.string().required("Unit required"),
			itemsRate: Yup.number()
				.typeError("Rate must be number")
				.min(0, "Min 0")
				.required("Rate required"),
			itemsAmount: Yup.number()
				.typeError("Amount must be number")
				.min(0, "Min 0")
				.required("Amount required"),
			itemsRemark: Yup.string().optional(),
		}),
	),
});

const UpdateSchema = Yup.object({
	grnNo: Yup.string().required("GRN No required"),
	inwardType: Yup.string()
		.oneOf([...INWARD_TYPE_OPTIONS], "Invalid inward type")
		.required("Inward type required"),
	inwardDate: Yup.string().required("Inward date required"),
	receivedBy: Yup.string().required("Received by required"),
	remarks: Yup.string().optional(),
	invoiceNo: Yup.string().required("Invoice No required"),
	supplierName: Yup.string().required("Supplier required"),
	warehouseName: Yup.string().required("Warehouse required"),
	items: Yup.array().of(
		Yup.object({
			itemsCategory: Yup.string().required("Category required"),
			itemsSubCategory: Yup.string().required("Sub-category required"),
			itemsName: Yup.string().required("Item name required"),
			itemsCode: Yup.string().required("Item code required"),
			itemsQuantity: Yup.number()
				.typeError("Qty must be number")
				.min(1, "Min 1")
				.required("Qty required"),
			itemsUnit: Yup.string().required("Unit required"),
			itemsRate: Yup.number()
				.typeError("Rate must be number")
				.min(0, "Min 0")
				.required("Rate required"),
			itemsAmount: Yup.number()
				.typeError("Amount must be number")
				.min(0, "Min 0")
				.required("Amount required"),
			itemsRemark: Yup.string().optional(),
		}),
	),
});

export default function WarehouseInwardUpsertPage() {
	const dispatch = useDispatch<AppDispatch>();
	const nav = useNavigate();
	const { id } = useParams();
	const isEdit = !!id;

	const { saving, error } = useSelector((s: RootState) => s.warehouseInward);

	const [loading, setLoading] = useState(false);
	const [apiError, setApiError] = useState<string | null>(null);

	const { users, loadingList: usersLoading } = useSelector(
		(s: RootState) => s.users,
	);
	const { suppliers, loadingList: suppliersLoading } = useSelector(
		(s: RootState) => s.suppliers,
	);
	const { warehouses, loadingList: warehousesLoading } = useSelector(
		(s: RootState) => s.warehouses,
	);
	const { categories, loadingList: categoriesLoading } = useSelector(
		(s: RootState) => s.categories,
	);
	const { subCategories, loadingList: subCategoriesLoading } = useSelector(
		(s: RootState) => s.subCategories,
	);
	const { items, loadingList: itemsLoading } = useSelector(
		(s: RootState) => s.items,
	);

	const [initialValues, setInitialValues] = useState({
		grnNo: "",
		inwardType: "",
		inwardDate: "",
		receivedBy: "",
		remarks: "",
		invoiceNo: "",
		supplierName: "",
		warehouseName: "",
		items: [
			{
				itemsCategory: "",
				itemsSubCategory: "",
				itemsName: "",
				itemsCode: "",
				itemsQuantity: "",
				itemsUnit: "",
				itemsRate: "",
				itemsAmount: "",
				itemsRemark: "",
			},
		],
	});

	useEffect(() => {
		dispatch(fetchUsersThunk());
		dispatch(fetchSuppliersThunk());
		dispatch(fetchWarehousesThunk());
		dispatch(fetchCategoriesThunk());
		dispatch(fetchSubCategoriesThunk());
		dispatch(fetchItemsThunk());

		const onFocus = () => {
			dispatch(fetchUsersThunk());
			dispatch(fetchSuppliersThunk());
			dispatch(fetchWarehousesThunk());
			dispatch(fetchCategoriesThunk());
			dispatch(fetchSubCategoriesThunk());
			dispatch(fetchItemsThunk());
		};

		window.addEventListener("focus", onFocus);
		return () => window.removeEventListener("focus", onFocus);
	}, [dispatch]);

	useEffect(() => {
		if (!isEdit) return;

		(async () => {
			setLoading(true);
			setApiError(null);

			const res = await dispatch(getWarehouseInwardThunk(id!));
			if (getWarehouseInwardThunk.fulfilled.match(res)) {
				const w: any = res.payload;

				setInitialValues({
					grnNo: w.grnNo ?? "",
					inwardType: w.inwardType ?? "",
					inwardDate: w.inwardDate
						? new Date(w.inwardDate).toISOString().slice(0, 10)
						: "",
					receivedBy: w.receivedBy ?? "",
					remarks: w.remarks ?? "",
					invoiceNo: w.invoiceNo ?? "",
					supplierName: w.supplierName ?? "",
					warehouseName: w.warehouseName ?? "",
					items:
						Array.isArray(w.items) && w.items.length > 0
							? w.items.map((item: any) => ({
									itemsCategory: item.itemsCategory ?? "",
									itemsSubCategory: item.itemsSubCategory ?? "",
									itemsName: item.itemsName ?? "",
									itemsCode: item.itemsCode ?? "",
									itemsQuantity:
										item.itemsQuantity === null ||
										item.itemsQuantity === undefined
											? ""
											: item.itemsQuantity,
									itemsUnit: item.itemsUnit ?? "",
									itemsRate:
										item.itemsRate === null || item.itemsRate === undefined
											? ""
											: item.itemsRate,
									itemsAmount:
										item.itemsAmount === null || item.itemsAmount === undefined
											? ""
											: item.itemsAmount,
									itemsRemark: item.itemsRemark ?? "",
								}))
							: [
									{
										itemsCategory: "",
										itemsSubCategory: "",
										itemsName: "",
										itemsCode: "",
										itemsQuantity: "",
										itemsUnit: "",
										itemsRate: "",
										itemsAmount: "",
										itemsRemark: "",
									},
								],
				});
			} else {
				setApiError(String(res.payload || "Failed to load warehouse inward"));
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
							{isEdit ? "Update Warehouse Inward" : "Create Warehouse Inward"}
						</h5>
						<div style={{ fontSize: 13, color: "#6c757d", marginTop: 2 }}>
							{isEdit ? "Update inward details" : "Add a new inward entry"}
						</div>
					</div>

					<Button
						variant='light'
						size='sm'
						onClick={() => nav("/warehouses/inward")}
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
						validationSchema={isEdit ? UpdateSchema : CreateSchema}
						onSubmit={async (values, { setSubmitting }) => {
							setApiError(null);

							if (!values.items || values.items.length === 0) {
								setApiError("At least one item is required");
								setSubmitting(false);
								return;
							}

							const payload = {
								...(isEdit ? { grnNo: values.grnNo } : {}),
								inwardType: values.inwardType,
								inwardDate: values.inwardDate
									? new Date(values.inwardDate as any)
									: undefined,
								receivedBy: values.receivedBy,
								remarks: values.remarks,
								invoiceNo: values.invoiceNo,
								supplierName: values.supplierName,
								warehouseName: values.warehouseName,
								items: values.items.map((item: any) => ({
									itemsCategory: item.itemsCategory,
									itemsSubCategory: item.itemsSubCategory,
									itemsName: item.itemsName,
									itemsCode: item.itemsCode,
									itemsQuantity:
										item.itemsQuantity === ""
											? undefined
											: Number(item.itemsQuantity),
									itemsUnit: item.itemsUnit,
									itemsRate:
										item.itemsRate === "" ? undefined : Number(item.itemsRate),
									itemsAmount:
										item.itemsAmount === ""
											? undefined
											: Number(item.itemsAmount),
									itemsRemark: item.itemsRemark,
								})),
							};

							if (!isEdit) {
								const res = await dispatch(
									createWarehouseInwardThunk(payload as any),
								);
								if (createWarehouseInwardThunk.fulfilled.match(res)) {
									toast.success("Warehouse inward created");
									dispatch(fetchInventoriesThunk());
									nav("/warehouses/inward", { replace: true });
								} else {
									setApiError(String(res.payload || "Create failed"));
									toast.error(String(res.payload || "Create failed"));
								}
							} else {
								const res = await dispatch(
									updateWarehouseInwardThunk({
										id: id!,
										payload: payload as any,
									}),
								);
								if (updateWarehouseInwardThunk.fulfilled.match(res)) {
									toast.success("Warehouse inward updated");
									dispatch(fetchInventoriesThunk());
									nav("/warehouses/inward", { replace: true });
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
							const calcAmount = (qtyVal: any, rateVal: any) => {
								const q = Number(qtyVal);
								const r = Number(rateVal);
								if (Number.isFinite(q) && Number.isFinite(r))
									return String(q * r);
								return "";
							};

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
									{/* ===== Basic Inward Details ===== */}
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
											<div style={{ fontWeight: 700 }}>Inward Details</div>
										</div>

										<Row className='g-3'>
											{isEdit && (
												<Col md={4}>
													<Form.Label style={{ fontWeight: "bold" }}>
														GRN No
													</Form.Label>
													<Form.Control
														name='grnNo'
														value={(values as any).grnNo}
														onChange={handleChange}
														isInvalid={!!touched.grnNo && !!errors.grnNo}
														placeholder='GRN No'
														style={{ borderRadius: 8 }}
													/>
													<Form.Control.Feedback type='invalid'>
														{errors.grnNo as any}
													</Form.Control.Feedback>
												</Col>
											)}

											<Col md={isEdit ? 4 : 4}>
												<Form.Label style={{ fontWeight: "bold" }}>
													Inward Type
												</Form.Label>
												<Form.Select
													name='inwardType'
													value={values.inwardType}
													onChange={handleChange}
													isInvalid={
														!!touched.inwardType && !!errors.inwardType
													}
													style={{ borderRadius: 8 }}
												>
													<option value='' disabled>
														Select inward type
													</option>
													{INWARD_TYPE_OPTIONS.map((type) => (
														<option key={type} value={type}>
															{type}
														</option>
													))}
												</Form.Select>
												<Form.Control.Feedback type='invalid'>
													{errors.inwardType as any}
												</Form.Control.Feedback>
											</Col>

											<Col md={4}>
												<Form.Label style={{ fontWeight: "bold" }}>
													Inward Date
												</Form.Label>
												<Form.Control
													type='date'
													name='inwardDate'
													value={values.inwardDate}
													onChange={handleChange}
													isInvalid={
														!!touched.inwardDate && !!errors.inwardDate
													}
													style={{ borderRadius: 8 }}
												/>
												<Form.Control.Feedback type='invalid'>
													{errors.inwardDate as any}
												</Form.Control.Feedback>
											</Col>

											<Col md={6}>
												<Form.Label style={{ fontWeight: "bold" }}>
													Received By
												</Form.Label>
												<Form.Select
													name='receivedBy'
													value={values.receivedBy}
													onChange={handleChange}
													isInvalid={
														!!touched.receivedBy && !!errors.receivedBy
													}
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
													{errors.receivedBy as any}
												</Form.Control.Feedback>
											</Col>

											<Col md={6}>
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

									{/* ===== Supplier / Warehouse ===== */}
									<div
										className='p-3 mb-3'
										style={{
											background: "#ffffff",
											border: "1px solid #eef2f1",
											borderRadius: 10,
										}}
									>
										<div className='d-flex align-items-center gap-2 mb-2'>
											<i className='ri-truck-line' style={{ color: theme }} />
											<div style={{ fontWeight: 700 }}>
												Supplier & Warehouse
											</div>
										</div>

										<Row className='g-3'>
											<Col md={4}>
												<Form.Label style={{ fontWeight: "bold" }}>
													Invoice No
												</Form.Label>
												<Form.Control
													name='invoiceNo'
													value={values.invoiceNo}
													onChange={handleChange}
													isInvalid={!!touched.invoiceNo && !!errors.invoiceNo}
													placeholder='Enter invoice no'
													style={{ borderRadius: 8 }}
												/>
												<Form.Control.Feedback type='invalid'>
													{errors.invoiceNo as any}
												</Form.Control.Feedback>
											</Col>

											<Col md={6}>
												<Form.Label style={{ fontWeight: "bold" }}>
													Supplier Name
												</Form.Label>
												<Form.Select
													name='supplierName'
													value={values.supplierName}
													onChange={handleChange}
													isInvalid={
														!!touched.supplierName && !!errors.supplierName
													}
													style={{ borderRadius: 8 }}
												>
													<option value='' disabled>
														{suppliersLoading
															? "Loading suppliers..."
															: "Select supplier"}
													</option>
													{(suppliers || []).map((u: any) => {
														const uid = u.id || u._id || u.supplierName;
														const uname = u.supplierName || u.name || u.label;
														return (
															<option key={uid} value={uname}>
																{uname}
															</option>
														);
													})}
												</Form.Select>
												<Form.Control.Feedback type='invalid'>
													{errors.supplierName as any}
												</Form.Control.Feedback>
											</Col>

											<Col md={6}>
												<Form.Label style={{ fontWeight: "bold" }}>
													Warehouse Name
												</Form.Label>
												<Form.Select
													name='warehouseName'
													value={values.warehouseName}
													onChange={handleChange}
													isInvalid={
														!!touched.warehouseName && !!errors.warehouseName
													}
													style={{ borderRadius: 8 }}
												>
													<option value='' disabled>
														{warehousesLoading
															? "Loading warehouses..."
															: "Select warehouse"}
													</option>
													{(warehouses || []).map((u: any) => {
														const uid = u.id || u._id || u.warehouseName;
														const uname = u.warehouseName || u.name || u.label;
														return (
															<option key={uid} value={uname}>
																{uname}
															</option>
														);
													})}
												</Form.Select>
												<Form.Control.Feedback type='invalid'>
													{errors.warehouseName as any}
												</Form.Control.Feedback>
											</Col>
										</Row>
									</div>

									{/* ===== Items List ===== */}
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
																	!!touched.items?.[idx]?.itemsCategory &&
																	!!(errors.items?.[idx] as any)?.itemsCategory
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
																{(errors.items?.[idx] as any)?.itemsCategory
																	? String(
																			(errors.items?.[idx] as any)
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
																	!!touched.items?.[idx]?.itemsSubCategory &&
																	!!(errors.items?.[idx] as any)
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
																{(errors.items?.[idx] as any)?.itemsSubCategory
																	? String(
																			(errors.items?.[idx] as any)
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
																	!!touched.items?.[idx]?.itemsName &&
																	!!(errors.items?.[idx] as any)?.itemsName
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
																{(errors.items?.[idx] as any)?.itemsName
																	? String(
																			(errors.items?.[idx] as any)?.itemsName,
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

														<Col md={2}>
															<Form.Label style={{ fontWeight: "bold" }}>
																Qty <span style={{ color: "red" }}>*</span>
															</Form.Label>
															<Form.Control
																name={`items.${idx}.itemsQuantity`}
																type='text'
																inputMode='decimal'
																value={item.itemsQuantity}
																onChange={(e) => {
																	const newItems = [...values.items];
																	newItems[idx].itemsQuantity = e.target.value;
																	newItems[idx].itemsAmount = calcAmount(
																		e.target.value,
																		item.itemsRate,
																	);
																	setFieldValue("items", newItems);
																}}
																isInvalid={
																	!!touched.items?.[idx]?.itemsQuantity &&
																	!!(errors.items?.[idx] as any)?.itemsQuantity
																}
																placeholder='0'
																style={{ borderRadius: 8 }}
															/>
															<Form.Control.Feedback type='invalid'>
																{(errors.items?.[idx] as any)?.itemsQuantity
																	? String(
																			(errors.items?.[idx] as any)
																				?.itemsQuantity,
																		)
																	: ""}
															</Form.Control.Feedback>
														</Col>

														<Col md={2}>
															<Form.Label style={{ fontWeight: "bold" }}>
																Unit
															</Form.Label>
															<Form.Control
																value={item.itemsUnit}
																readOnly
																style={{ borderRadius: 8 }}
															/>
														</Col>

														<Col md={2}>
															<Form.Label style={{ fontWeight: "bold" }}>
																Rate <span style={{ color: "red" }}>*</span>
															</Form.Label>
															<Form.Control
																name={`items.${idx}.itemsRate`}
																type='text'
																inputMode='decimal'
																value={item.itemsRate}
																onChange={(e) => {
																	const newItems = [...values.items];
																	newItems[idx].itemsRate = e.target.value;
																	newItems[idx].itemsAmount = calcAmount(
																		item.itemsQuantity,
																		e.target.value,
																	);
																	setFieldValue("items", newItems);
																}}
																isInvalid={
																	!!touched.items?.[idx]?.itemsRate &&
																	!!(errors.items?.[idx] as any)?.itemsRate
																}
																placeholder='0'
																style={{ borderRadius: 8 }}
															/>
															<Form.Control.Feedback type='invalid'>
																{(errors.items?.[idx] as any)?.itemsRate
																	? String(
																			(errors.items?.[idx] as any)?.itemsRate,
																		)
																	: ""}
															</Form.Control.Feedback>
														</Col>

														<Col md={2}>
															<Form.Label style={{ fontWeight: "bold" }}>
																Amount <span style={{ color: "red" }}>*</span>
															</Form.Label>
															<Form.Control
																value={item.itemsAmount}
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
														itemsQuantity: "",
														itemsUnit: "",
														itemsRate: "",
														itemsAmount: "",
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
											disabled={isSubmitting || saving || !dirty || !isValid}
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
											{isSubmitting || saving
												? isEdit
													? "Updating..."
													: "Creating..."
												: isEdit
													? "Update Inward"
													: "Create Inward"}
										</Button>

										<Button
											variant='light'
											onClick={() => nav("/warehouses/inward")}
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
