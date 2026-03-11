import { useEffect, useState } from "react";
import { Card, Button, Form, Alert, Row, Col, Spinner } from "react-bootstrap";
import { Formik } from "formik";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../slices/store";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import { fetchWarehousesThunk } from "../../../slices/Masters/warehouses/thunks";
import { fetchLaboursThunk } from "../../../slices/Masters/labours/thunks";
import { fetchCategoriesThunk } from "../../../slices/Masters/categories/thunks";
import { fetchSubCategoriesThunk } from "../../../slices/Masters/subCategories/thunks";
import { fetchItemsThunk } from "../../../slices/Masters/items/thunks";
import { fetchInventoriesThunk } from "../../../slices/Inventory/thunks";

import {
	createIssueToLabourThunk,
	updateIssueToLabourThunk,
	getIssueToLabourThunk,
} from "../../../slices/Warehouse/IssueToLabour/thunks";

const theme = "#1a8376";

const emptyItem = () => ({
	itemsCategory: "",
	itemsSubCategory: "",
	itemsName: "",
	itemsCode: "",
	itemsUnit: "",
	dispatchQuantity: "",
	remark: "",
});

const IssueSchema = Yup.object({
	issueDate: Yup.string().required("Issue date required"),
	issueFromWarehouse: Yup.string().required("Warehouse required"),
	labourName: Yup.string().required("Labour required"),
	remarks: Yup.string().optional(),
	items: Yup.array()
		.of(
			Yup.object({
				itemsCategory: Yup.string().required("Category required"),
				itemsSubCategory: Yup.string().required("Sub-category required"),
				itemsName: Yup.string().required("Item name required"),
				itemsCode: Yup.string().optional(),
				itemsUnit: Yup.string().optional(),
				dispatchQuantity: Yup.number()
					.typeError("Quantity must be a number")
					.min(1, "Min 1")
					.required("Quantity required"),
				remark: Yup.string().optional(),
			}),
		)
		.min(1, "At least one item is required"),
});

export default function IssueToLabourUpsertPage() {
	const dispatch = useDispatch<AppDispatch>();
	const nav = useNavigate();
	const { id } = useParams();
	const isEdit = !!id;

	const [loading, setLoading] = useState(false);
	const [apiError, setApiError] = useState<string | null>(null);

	const { warehouses, loadingList: warehousesLoading } =
		useSelector((s: RootState) => (s as any).warehouses) || {};
	const { labours, loadingList: laboursLoading } =
		useSelector((s: RootState) => (s as any).labours) || {};
	const { categories, loadingList: categoriesLoading } = useSelector(
		(s: RootState) => s.categories,
	);
	const { subCategories, loadingList: subCategoriesLoading } = useSelector(
		(s: RootState) => s.subCategories,
	);
	const { items: masterItems, loadingList: itemsLoading } = useSelector(
		(s: RootState) => s.items,
	);
	const { inventories } =
		useSelector((s: RootState) => (s as any).inventory) || {};

	const [initialValues, setInitialValues] = useState({
		issueDate: new Date().toISOString().slice(0, 10),
		issueFromWarehouse: "",
		labourName: "",
		remarks: "",
		items: [emptyItem()],
	});

	useEffect(() => {
		dispatch(fetchWarehousesThunk());
		dispatch(fetchLaboursThunk());
		dispatch(fetchCategoriesThunk());
		dispatch(fetchSubCategoriesThunk());
		dispatch(fetchItemsThunk());
		dispatch(fetchInventoriesThunk());

		const onFocus = () => {
			dispatch(fetchWarehousesThunk());
			dispatch(fetchLaboursThunk());
			dispatch(fetchInventoriesThunk());
		};

		window.addEventListener("focus", onFocus);
		return () => window.removeEventListener("focus", onFocus);
	}, [dispatch]);

	useEffect(() => {
		if (!isEdit) return;

		(async () => {
			setLoading(true);
			setApiError(null);

			const res = await dispatch(getIssueToLabourThunk(id!));

			if (getIssueToLabourThunk.fulfilled.match(res)) {
				const t: any = res.payload;

				setInitialValues({
					issueDate: t.issueDate
						? new Date(t.issueDate).toISOString().slice(0, 10)
						: "",
					issueFromWarehouse: t.issueFromWarehouse || "",
					labourName: t.labourName || "",
					remarks: t.remarks || "",
					items:
						Array.isArray(t.items) && t.items.length > 0
							? t.items.map((it: any) => ({
									itemsCategory: it.itemsCategory || "",
									itemsSubCategory: it.itemsSubCategory || "",
									itemsName: it.itemsName || "",
									itemsCode: it.itemsCode || "",
									itemsUnit: it.itemsUnit || "",
									dispatchQuantity:
										it.dispatchQuantity === null ||
										it.dispatchQuantity === undefined
											? ""
											: it.dispatchQuantity,
									remark: it.remark || it.itemsRemark || "",
								}))
							: [emptyItem()],
				});
			} else {
				setApiError(String((res as any).payload || "Failed to load"));
			}

			setLoading(false);
		})();
	}, [dispatch, id, isEdit]);

	const buildWarehouseInventory = (warehouseName: string) => {
		if (!warehouseName || !inventories) return [];

		const key = String(warehouseName).trim().toLowerCase();

		return (inventories as any[]).filter((inv: any) => {
			const invWarehouseKey = String(inv.warehouseKey || "")
				.trim()
				.toLowerCase();
			const invWarehouseName = String(inv.warehouseName || "")
				.trim()
				.toLowerCase();

			return (
				(invWarehouseKey === key || invWarehouseName === key) &&
				Number(inv.availableQuantity || 0) > 0
			);
		});
	};

	const getAvailableQty = (warehouseName: string, itemName: string) => {
		const inv = buildWarehouseInventory(warehouseName);
		return (
			inv.find(
				(i: any) =>
					String(i.itemName || "")
						.trim()
						.toLowerCase() ===
					String(itemName || "")
						.trim()
						.toLowerCase(),
			)?.availableQuantity || 0
		);
	};

	const warehouseOptions = (warehouses || []).map((w: any) => ({
		id: w.id || w._id || w.warehouseName,
		name: w.warehouseName || w.name || w.label || "",
	}));

	const labourOptions = (labours || []).map((l: any) => ({
		id: l.id || l._id || l.labourName,
		name: l.labourName || l.name || l.label || "",
	}));

	return (
		<Card
			className='p-3'
			style={{ border: "1px solid #e9ebec", borderRadius: "10px" }}
		>
			<div className='d-flex justify-content-between align-items-center mb-3'>
				<div>
					<h5 className='m-0'>
						{isEdit ? "Edit Issue To Labour" : "Issue To Labour"}
					</h5>
					<div style={{ fontSize: 13, color: "#6c757d", marginTop: 2 }}>
						{isEdit
							? "Update labour issue details"
							: "Issue raw material from warehouse to labour"}
					</div>
				</div>

				<Button
					variant='light'
					size='sm'
					onClick={() => nav("/warehouses/dispatch")}
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

			{apiError && (
				<Alert variant='danger' className='mb-3'>
					{apiError}
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
					validationSchema={IssueSchema}
					onSubmit={async (values, { setSubmitting }) => {
						setApiError(null);

						if (!values.items || values.items.length === 0) {
							setApiError("At least one item is required");
							setSubmitting(false);
							return;
						}

						for (let i = 0; i < values.items.length; i++) {
							const it = values.items[i];
							const avail = getAvailableQty(
								values.issueFromWarehouse,
								it.itemsName,
							);

							if (!isEdit && Number(it.dispatchQuantity) > avail) {
								const msg = `Item ${i + 1}: Quantity (${it.dispatchQuantity}) exceeds available stock (${avail})`;
								setApiError(msg);
								toast.error(msg);
								setSubmitting(false);
								return;
							}
						}

						const payload = {
							issueDate: new Date(values.issueDate).toISOString(),
							issueFromWarehouse: values.issueFromWarehouse,
							labourName: values.labourName,
							remarks: values.remarks,
							items: values.items.map((it) => ({
								itemsCategory: it.itemsCategory,
								itemsSubCategory: it.itemsSubCategory,
								itemsName: it.itemsName,
								itemsCode: it.itemsCode,
								itemsUnit: it.itemsUnit,
								dispatchQuantity: Number(it.dispatchQuantity),
								itemsRemark: it.remark || "",
							})),
						};

						if (isEdit) {
							const res = await dispatch(
								updateIssueToLabourThunk({ id: id!, payload }),
							);

							if (updateIssueToLabourThunk.fulfilled.match(res)) {
								toast.success("Issue to labour updated");
								nav("/warehouses/dispatch", { replace: true });
							} else {
								const msg = String((res as any).payload || "Update failed");
								setApiError(msg);
								toast.error(msg);
							}
						} else {
							const res = await dispatch(createIssueToLabourThunk(payload));

							if (createIssueToLabourThunk.fulfilled.match(res)) {
								toast.success("Items issued to labour");
								nav("/warehouses/dispatch", { replace: true });
							} else {
								const msg = String((res as any).payload || "Create failed");
								setApiError(msg);
								toast.error(msg);
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
						const getFilteredSubCategories = (categoryName: string) => {
							if (!categoryName) return [];

							return (subCategories || []).filter((sc: any) => {
								const catName =
									sc.categoryName || sc.category?.name || sc.category || "";
								return String(catName).trim() === String(categoryName).trim();
							});
						};

						const getFilteredItems = (
							subCategoryName: string,
							warehouseName: string,
						) => {
							if (!subCategoryName) return [];

							const whInv = buildWarehouseInventory(warehouseName);
							const whItemNames = new Set(
								whInv.map((inv: any) =>
									String(inv.itemName || "")
										.trim()
										.toLowerCase(),
								),
							);

							return (masterItems || []).filter((it: any) => {
								const subName =
									it.subCategoryName ||
									it.subCategory?.name ||
									it.subCategory ||
									"";
								const matchesSub =
									String(subName).trim() === String(subCategoryName).trim();

								const nm = String(it.itemName || it.name || it.label || "")
									.trim()
									.toLowerCase();

								const inWarehouse = !warehouseName || whItemNames.has(nm);

								return matchesSub && inWarehouse;
							});
						};

						return (
							<Form onSubmit={handleSubmit}>
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
											className='ri-user-settings-line'
											style={{ color: theme }}
										/>
										<div style={{ fontWeight: 700 }}>Issue Details</div>
									</div>

									<Row className='g-3'>
										<Col md={4}>
											<Form.Label style={{ fontWeight: "bold" }}>
												Issue Date <span style={{ color: "red" }}>*</span>
											</Form.Label>
											<Form.Control
												type='date'
												name='issueDate'
												value={values.issueDate}
												onChange={handleChange}
												isInvalid={!!touched.issueDate && !!errors.issueDate}
												style={{ borderRadius: 8 }}
											/>
											<Form.Control.Feedback type='invalid'>
												{errors.issueDate as any}
											</Form.Control.Feedback>
										</Col>

										<Col md={4}>
											<Form.Label style={{ fontWeight: "bold" }}>
												Issue From Warehouse{" "}
												<span style={{ color: "red" }}>*</span>
											</Form.Label>
											<Form.Select
												name='issueFromWarehouse'
												value={values.issueFromWarehouse}
												onChange={(e) => {
													setFieldValue("issueFromWarehouse", e.target.value);
													setFieldValue("items", [emptyItem()]);
												}}
												isInvalid={
													!!touched.issueFromWarehouse &&
													!!errors.issueFromWarehouse
												}
												style={{ borderRadius: 8 }}
											>
												<option value='' disabled>
													{warehousesLoading
														? "Loading warehouses..."
														: "Select warehouse"}
												</option>
												{warehouseOptions.map((w: any) => (
													<option key={w.id} value={w.name}>
														{w.name}
													</option>
												))}
											</Form.Select>
											<Form.Control.Feedback type='invalid'>
												{errors.issueFromWarehouse as any}
											</Form.Control.Feedback>
										</Col>

										<Col md={4}>
											<Form.Label style={{ fontWeight: "bold" }}>
												Labour Name <span style={{ color: "red" }}>*</span>
											</Form.Label>
											<Form.Select
												name='labourName'
												value={values.labourName}
												onChange={handleChange}
												isInvalid={!!touched.labourName && !!errors.labourName}
												style={{ borderRadius: 8 }}
											>
												<option value='' disabled>
													{laboursLoading
														? "Loading labours..."
														: "Select labour"}
												</option>
												{labourOptions.map((l: any) => (
													<option key={l.id} value={l.name}>
														{l.name}
													</option>
												))}
											</Form.Select>
											<Form.Control.Feedback type='invalid'>
												{errors.labourName as any}
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
												placeholder='Optional remarks'
												style={{ borderRadius: 8 }}
											/>
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
										<div style={{ fontWeight: 700 }}>Item Details</div>
										{values.issueFromWarehouse && (
											<span
												style={{
													fontSize: 12,
													color: "#6c757d",
													marginLeft: 4,
												}}
											>
												(showing items available in{" "}
												<strong>{values.issueFromWarehouse}</strong>)
											</span>
										)}
									</div>

									{!values.issueFromWarehouse && (
										<Alert variant='info' style={{ fontSize: 13 }}>
											Please select an <strong>Issue From Warehouse</strong>{" "}
											first to see available items.
										</Alert>
									)}

									{values.items.map((item: any, idx: number) => {
										const filteredSubs = getFilteredSubCategories(
											item.itemsCategory,
										);
										const filteredItemsList = getFilteredItems(
											item.itemsSubCategory,
											values.issueFromWarehouse,
										);
										const availQty = item.itemsName
											? getAvailableQty(
													values.issueFromWarehouse,
													item.itemsName,
												)
											: null;

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
															style={{
																padding: "4px 8px",
																fontSize: "12px",
															}}
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
															disabled={!values.issueFromWarehouse}
															isInvalid={
																!!touched.items?.[idx]?.itemsCategory &&
																!!(errors.items?.[idx] as any)?.itemsCategory
															}
															style={{ borderRadius: 8 }}
														>
															<option value=''>
																{!values.issueFromWarehouse
																	? "Select warehouse first"
																	: categoriesLoading
																		? "Loading..."
																		: "Select"}
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
																		(errors.items?.[idx] as any)?.itemsCategory,
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
																!!(errors.items?.[idx] as any)?.itemsSubCategory
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
															Item Name <span style={{ color: "red" }}>*</span>
														</Form.Label>
														<Form.Select
															value={item.itemsName}
															onChange={(e) => {
																const itemName = e.target.value;
																const it = (masterItems || []).find(
																	(x: any) => {
																		const nm =
																			x.itemName || x.name || x.label || "";
																		return (
																			String(nm).trim() ===
																			String(itemName).trim()
																		);
																	},
																);

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
																			? "No items available in this warehouse"
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

														{item.itemsName && availQty !== null && (
															<div
																style={{
																	fontSize: 11,
																	color:
																		(availQty ?? 0) > 0 ? theme : "#cf1322",
																	marginTop: 3,
																}}
															>
																Available: {availQty} {item.itemsUnit}
															</div>
														)}

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
															Unit
														</Form.Label>
														<Form.Control
															value={item.itemsUnit}
															readOnly
															style={{ borderRadius: 8 }}
														/>
													</Col>

													<Col md={3}>
														<Form.Label style={{ fontWeight: "bold" }}>
															Dispatch Quantity{" "}
															<span style={{ color: "red" }}>*</span>
														</Form.Label>
														<Form.Control
															name={`items.${idx}.dispatchQuantity`}
															type='text'
															inputMode='decimal'
															value={item.dispatchQuantity}
															onChange={(e) => {
																const newItems = [...values.items];
																newItems[idx].dispatchQuantity = e.target.value;
																setFieldValue("items", newItems);
															}}
															isInvalid={
																!!touched.items?.[idx]?.dispatchQuantity &&
																!!(errors.items?.[idx] as any)?.dispatchQuantity
															}
															placeholder='0'
															style={{ borderRadius: 8 }}
														/>
														<Form.Control.Feedback type='invalid'>
															{(errors.items?.[idx] as any)?.dispatchQuantity
																? String(
																		(errors.items?.[idx] as any)
																			?.dispatchQuantity,
																	)
																: ""}
														</Form.Control.Feedback>
													</Col>

													<Col md={12}>
														<Form.Label style={{ fontWeight: "bold" }}>
															Item Remark
														</Form.Label>
														<Form.Control
															name={`items.${idx}.remark`}
															value={item.remark}
															onChange={(e) => {
																const newItems = [...values.items];
																newItems[idx].remark = e.target.value;
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

									{values.issueFromWarehouse && (
										<Button
											variant='outline-primary'
											onClick={() => {
												setFieldValue("items", [...values.items, emptyItem()]);
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
									)}
								</div>

								<div className='mt-3 d-flex gap-2'>
									<Button
										type='submit'
										disabled={isSubmitting || !dirty || !isValid}
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
										<i className='ri-send-plane-line' />
										{isSubmitting
											? isEdit
												? "Updating..."
												: "Submitting..."
											: isEdit
												? "Update Issue"
												: "Submit Issue"}
									</Button>

									<Button
										variant='light'
										onClick={() => nav("/warehouses/dispatch")}
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
	);
}
