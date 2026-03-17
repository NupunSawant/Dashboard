import { useEffect, useMemo, useState } from "react";
import { Card, Button, Form, Alert, Row, Col, Spinner, Table } from "react-bootstrap";
import { Formik } from "formik";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../slices/store";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import { fetchWarehousesThunk } from "../../../slices/Masters/warehouses/thunks";
import { fetchCategoriesThunk } from "../../../slices/Masters/categories/thunks";
import { fetchSubCategoriesThunk } from "../../../slices/Masters/subCategories/thunks";
import { fetchItemsThunk } from "../../../slices/Masters/items/thunks";
import {
	getIssueToLabourThunk,
	completeIssueToLabourThunk,
} from "../../../slices/Warehouse/IssueToLabour/thunks";

const theme = "#1a8376";

const emptyProducedItem = () => ({
	itemsCategory: "",
	itemsSubCategory: "",
	itemsName: "",
	itemsCode: "",
	itemsUnit: "",
	itemsQuantity: "",
	itemsRate: 0,
	itemsAmount: 0,
	itemsRemark: "",
});

const Schema = Yup.object({
	inwardDate: Yup.string().required("Inward date required"),
	receivedByWarehouseName: Yup.string().required("Warehouse required"),
	receivedBy: Yup.string().required("Received by required"),
	remarks: Yup.string().optional(),
	itemsDetails: Yup.array().of(
		Yup.object({
			itemsCategory: Yup.string().required("Category required"),
			itemsSubCategory: Yup.string().required("Sub-category required"),
			itemsName: Yup.string().required("Item name required"),
			itemsQuantity: Yup.number()
				.typeError("Quantity must be a number")
				.min(1, "Min 1")
				.required("Quantity required"),
		}),
	),
	labourReturnedItems: Yup.array().of(
		Yup.object({
			returnQuantity: Yup.number()
				.typeError("Return qty must be a number")
				.min(0, "Min 0"),
		}),
	),
});

export default function LabourInwardPage() {
	const dispatch = useDispatch<AppDispatch>();
	const nav = useNavigate();
	const { id } = useParams();

	const [loading, setLoading] = useState(true);
	const [apiError, setApiError] = useState<string | null>(null);
	const [editableReturnRows, setEditableReturnRows] = useState<Record<number, boolean>>({});

	const { warehouses = [] } =
		(useSelector((s: RootState) => (s as any).warehouses) as any) || {};
	const { categories = [] } = useSelector((s: RootState) => s.categories);
	const { subCategories = [] } = useSelector((s: RootState) => s.subCategories);
	const { items: masterItems = [] } = useSelector((s: RootState) => s.items);
	const issueState =
		(useSelector((s: RootState) => (s as any).issueToLabour) as any) || {};
	const selectedIssue = issueState.selected || null;
	selectedIssue;	

	const [initialValues, setInitialValues] = useState({
		dispatchNo: "",
		labourName: "",
		inwardDate: new Date().toISOString().slice(0, 10),
		receivedByWarehouseName: "",
		receivedBy: "",
		remarks: "",
		itemsDetails: [emptyProducedItem()],
		labourReturnedItems: [] as Array<{
			itemsCategory: string;
			itemsSubCategory: string;
			itemsName: string;
			itemsCode: string;
			itemsUnit: string;
			dispatchQuantity: number | string;
			returnQuantity: number | string;
			itemsRemark?: string;
		}>,
	});

	useEffect(() => {
		dispatch(fetchWarehousesThunk());
		dispatch(fetchCategoriesThunk());
		dispatch(fetchSubCategoriesThunk());
		dispatch(fetchItemsThunk());
	}, [dispatch]);

	useEffect(() => {
		if (!id) return;

		(async () => {
			setLoading(true);
			setApiError(null);

			const res = await dispatch(getIssueToLabourThunk(id));

			if (getIssueToLabourThunk.fulfilled.match(res)) {
				const t: any = res.payload;

				setInitialValues({
					dispatchNo: t.issueNo || "",
					labourName: t.labourName || "",
					inwardDate: new Date().toISOString().slice(0, 10),
					receivedByWarehouseName: t.issueFromWarehouse || "",
					receivedBy: "",
					remarks: t.remarks || "",
					itemsDetails: [emptyProducedItem()],
					labourReturnedItems: Array.isArray(t.items)
						? t.items.map((it: any) => ({
								itemsCategory: it.itemsCategory || "",
								itemsSubCategory: it.itemsSubCategory || "",
								itemsName: it.itemsName || "",
								itemsCode: it.itemsCode || "",
								itemsUnit: it.itemsUnit || "",
								dispatchQuantity:
									it.dispatchQuantity === null ||
									it.dispatchQuantity === undefined
										? 0
										: Number(it.dispatchQuantity),
								returnQuantity: 0,
								itemsRemark: it.itemsRemark || it.remark || "",
							}))
						: [],
				});
			} else {
				setApiError(String((res as any).payload || "Failed to load issue"));
			}

			setLoading(false);
		})();
	}, [dispatch, id]);

	const warehouseOptions = useMemo(
		() =>
			(warehouses || []).map((w: any) => ({
				id: w.id || w._id || w.warehouseName,
				name: w.warehouseName || w.name || w.label || "",
			})),
		[warehouses],
	);

	const getFilteredSubCategories = (categoryName: string) => {
		if (!categoryName) return [];
		return (subCategories || []).filter((sc: any) => {
			const catName = sc.categoryName || sc.category?.name || sc.category || "";
			return String(catName).trim() === String(categoryName).trim();
		});
	};

	const getFilteredItems = (subCategoryName: string) => {
		if (!subCategoryName) return [];
		return (masterItems || []).filter((it: any) => {
			const subName =
				it.subCategoryName || it.subCategory?.name || it.subCategory || "";
			return String(subName).trim() === String(subCategoryName).trim();
		});
	};

	return (
		<Card
			className='p-3'
			style={{ border: "1px solid #e9ebec", borderRadius: "10px" }}
		>
			<div className='d-flex justify-content-between align-items-center mb-3'>
				<div>
					<h5 className='m-0'>Labour Inward / Create GRN</h5>
					<div style={{ fontSize: 13, color: "#6c757d", marginTop: 2 }}>
						Receive finished goods and returned raw material from labour
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
					validationSchema={Schema}
					onSubmit={async (values, { setSubmitting }) => {
						setApiError(null);

						const hasProduced = (values.itemsDetails || []).some(
							(x: any) => Number(x.itemsQuantity || 0) > 0,
						);
						const hasReturned = (values.labourReturnedItems || []).some(
							(x: any) => Number(x.returnQuantity || 0) > 0,
						);

						if (!hasProduced && !hasReturned) {
							const msg =
								"At least one produced item or one returned raw item is required";
							setApiError(msg);
							toast.error(msg);
							setSubmitting(false);
							return;
						}

						for (let i = 0; i < (values.labourReturnedItems || []).length; i++) {
							const row: any = values.labourReturnedItems[i];
							const issued = Number(row.dispatchQuantity || 0);
							const returned = Number(row.returnQuantity || 0);

							if (returned > issued) {
								const msg = `Returned quantity cannot exceed issued quantity for row ${i + 1}`;
								setApiError(msg);
								toast.error(msg);
								setSubmitting(false);
								return;
							}
						}

						const payload = {
							inwardDate: new Date(values.inwardDate).toISOString(),
							receivedByWarehouseName: values.receivedByWarehouseName,
							receivedBy: values.receivedBy,
							remarks: values.remarks,
							itemsDetails: (values.itemsDetails || [])
								.filter((it: any) => Number(it.itemsQuantity || 0) > 0)
								.map((it: any) => ({
									itemsCategory: it.itemsCategory,
									itemsSubCategory: it.itemsSubCategory,
									itemsName: it.itemsName,
									itemsCode: it.itemsCode,
									itemsUnit: it.itemsUnit,
									itemsQuantity: Number(it.itemsQuantity),
									itemsRate: Number(it.itemsRate || 0),
									itemsAmount: Number(it.itemsAmount || 0),
									itemsRemark: it.itemsRemark || "",
								})),
							labourReturnedItems: (values.labourReturnedItems || []).map(
								(it: any) => ({
									itemsCategory: it.itemsCategory,
									itemsSubCategory: it.itemsSubCategory,
									itemsName: it.itemsName,
									itemsCode: it.itemsCode,
									itemsUnit: it.itemsUnit,
									dispatchQuantity: Number(it.dispatchQuantity || 0),
									returnQuantity: Number(it.returnQuantity || 0),
									itemsRemark: it.itemsRemark || "",
								}),
							),
						};

						const res = await dispatch(
							completeIssueToLabourThunk({ id: id!, payload }),
						);

						if (completeIssueToLabourThunk.fulfilled.match(res)) {
							toast.success("Labour inward completed successfully");
							nav("/warehouses/inward", { replace: true });
						} else {
							const msg = String((res as any).payload || "Failed to create GRN");
							setApiError(msg);
							toast.error(msg);
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
					}) => (
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
									<i className='ri-file-list-3-line' style={{ color: theme }} />
									<div style={{ fontWeight: 700 }}>Issue Details</div>
								</div>

								<Row className='g-3'>
									<Col md={3}>
										<Form.Label style={{ fontWeight: "bold" }}>
											Dispatch No
										</Form.Label>
										<Form.Control
											value={values.dispatchNo}
											readOnly
											style={{ borderRadius: 8 }}
										/>
									</Col>

									<Col md={3}>
										<Form.Label style={{ fontWeight: "bold" }}>
											Labour Name
										</Form.Label>
										<Form.Control
											value={values.labourName}
											readOnly
											style={{ borderRadius: 8 }}
										/>
									</Col>

									<Col md={3}>
										<Form.Label style={{ fontWeight: "bold" }}>
											Received By Warehouse{" "}
											<span style={{ color: "red" }}>*</span>
										</Form.Label>
										<Form.Select
											name='receivedByWarehouseName'
											value={values.receivedByWarehouseName}
											onChange={handleChange}
											isInvalid={
												!!touched.receivedByWarehouseName &&
												!!errors.receivedByWarehouseName
											}
											style={{ borderRadius: 8 }}
										>
											<option value='' disabled>
												Select warehouse
											</option>
											{warehouseOptions.map((w: any) => (
												<option key={w.id} value={w.name}>
													{w.name}
												</option>
											))}
										</Form.Select>
										<Form.Control.Feedback type='invalid'>
											{errors.receivedByWarehouseName as any}
										</Form.Control.Feedback>
									</Col>

									<Col md={3}>
										<Form.Label style={{ fontWeight: "bold" }}>
											Inward Date <span style={{ color: "red" }}>*</span>
										</Form.Label>
										<Form.Control
											type='date'
											name='inwardDate'
											value={values.inwardDate}
											onChange={handleChange}
											isInvalid={!!touched.inwardDate && !!errors.inwardDate}
											style={{ borderRadius: 8 }}
										/>
										<Form.Control.Feedback type='invalid'>
											{errors.inwardDate as any}
										</Form.Control.Feedback>
									</Col>

									<Col md={6}>
										<Form.Label style={{ fontWeight: "bold" }}>
											Received By <span style={{ color: "red" }}>*</span>
										</Form.Label>
										<Form.Control
											name='receivedBy'
											value={values.receivedBy}
											onChange={handleChange}
											placeholder='Enter received by'
											isInvalid={!!touched.receivedBy && !!errors.receivedBy}
											style={{ borderRadius: 8 }}
										/>
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
									<div style={{ fontWeight: 700 }}>Produced Item Details</div>
								</div>

								{values.itemsDetails.map((item: any, idx: number) => {
									const filteredSubs = getFilteredSubCategories(item.itemsCategory);
									const filteredItemsList = getFilteredItems(item.itemsSubCategory);

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
												<h6 className='m-0'>Produced Item {idx + 1}</h6>
												{values.itemsDetails.length > 1 && (
													<Button
														variant='danger'
														size='sm'
														onClick={() => {
															const next = values.itemsDetails.filter(
																(_: any, i: number) => i !== idx,
															);
															setFieldValue("itemsDetails", next);
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
															const next = [...values.itemsDetails];
															next[idx].itemsCategory = catName;
															next[idx].itemsSubCategory = "";
															next[idx].itemsName = "";
															next[idx].itemsCode = "";
															next[idx].itemsUnit = "";
															setFieldValue("itemsDetails", next);
														}}
														isInvalid={
															!!touched.itemsDetails?.[idx]?.itemsCategory &&
															!!(errors.itemsDetails?.[idx] as any)?.itemsCategory
														}
														style={{ borderRadius: 8 }}
													>
														<option value=''>Select</option>
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
												</Col>

												<Col md={6}>
													<Form.Label style={{ fontWeight: "bold" }}>
														Sub Category <span style={{ color: "red" }}>*</span>
													</Form.Label>
													<Form.Select
														value={item.itemsSubCategory}
														onChange={(e) => {
															const subName = e.target.value;
															const next = [...values.itemsDetails];
															next[idx].itemsSubCategory = subName;
															next[idx].itemsName = "";
															next[idx].itemsCode = "";
															next[idx].itemsUnit = "";
															setFieldValue("itemsDetails", next);
														}}
														disabled={!item.itemsCategory}
														style={{ borderRadius: 8 }}
													>
														<option value=''>
															{!item.itemsCategory
																? "Select category first"
																: "Select"}
														</option>
														{filteredSubs.map((sc: any) => {
															const scname =
																sc.name || sc.subCategoryName || sc.label || "";
															return (
																<option key={scname} value={scname}>
																	{scname}
																</option>
															);
														})}
													</Form.Select>
												</Col>

												<Col md={6}>
													<Form.Label style={{ fontWeight: "bold" }}>
														Item Name <span style={{ color: "red" }}>*</span>
													</Form.Label>
													<Form.Select
														value={item.itemsName}
														onChange={(e) => {
															const itemName = e.target.value;
															const it = (masterItems || []).find((x: any) => {
																const nm =
																	x.itemName || x.name || x.label || "";
																return (
																	String(nm).trim() ===
																	String(itemName).trim()
																);
															});
															const next = [...values.itemsDetails];
															next[idx].itemsName = itemName;
															next[idx].itemsCode = it?.itemCode || "";
															next[idx].itemsUnit = it?.unit || "";
															setFieldValue("itemsDetails", next);
														}}
														disabled={!item.itemsSubCategory}
														style={{ borderRadius: 8 }}
													>
														<option value=''>
															{!item.itemsSubCategory
																? "Select sub-category first"
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

												<Col md={4}>
													<Form.Label style={{ fontWeight: "bold" }}>
														Received Quantity{" "}
														<span style={{ color: "red" }}>*</span>
													</Form.Label>
													<Form.Control
														type='text'
														inputMode='decimal'
														value={item.itemsQuantity}
														onChange={(e) => {
															const next = [...values.itemsDetails];
															next[idx].itemsQuantity = e.target.value;
															setFieldValue("itemsDetails", next);
														}}
														placeholder='0'
														style={{ borderRadius: 8 }}
													/>
												</Col>

												<Col md={8}>
													<Form.Label style={{ fontWeight: "bold" }}>
														Item Remark
													</Form.Label>
													<Form.Control
														value={item.itemsRemark}
														onChange={(e) => {
															const next = [...values.itemsDetails];
															next[idx].itemsRemark = e.target.value;
															setFieldValue("itemsDetails", next);
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
									onClick={() =>
										setFieldValue("itemsDetails", [
											...values.itemsDetails,
											emptyProducedItem(),
										])
									}
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

							<div
								className='p-3 mb-3'
								style={{
									background: "#ffffff",
									border: "1px solid #eef2f1",
									borderRadius: 10,
								}}
							>
								<div className='d-flex align-items-center gap-2 mb-3'>
									<i className='ri-arrow-go-back-line' style={{ color: theme }} />
									<div style={{ fontWeight: 700 }}>Labour Returned Items</div>
								</div>

								<Table responsive bordered hover className='align-middle mb-0'>
									<thead style={{ background: "#f8fbfa" }}>
										<tr>
											<th>Category</th>
											<th>Sub Category</th>
											<th>Item Name</th>
											<th>Item Code</th>
											<th>Unit</th>
											<th>Dispatch Quantity</th>
											<th>Return Quantity</th>
											<th>Action</th>
										</tr>
									</thead>
									<tbody>
										{(values.labourReturnedItems || []).length === 0 ? (
											<tr>
												<td colSpan={8} className='text-center text-muted py-3'>
													No dispatched raw items found
												</td>
											</tr>
										) : (
											values.labourReturnedItems.map((row: any, idx: number) => {
												const editable = !!editableReturnRows[idx];
												return (
													<tr key={idx}>
														<td>{row.itemsCategory || "-"}</td>
														<td>{row.itemsSubCategory || "-"}</td>
														<td>{row.itemsName || "-"}</td>
														<td>{row.itemsCode || "-"}</td>
														<td>{row.itemsUnit || "-"}</td>
														<td>{row.dispatchQuantity || 0}</td>
														<td style={{ minWidth: 140 }}>
															<Form.Control
																type='text'
																inputMode='decimal'
																value={row.returnQuantity}
																readOnly={!editable}
																onChange={(e) => {
																	const next = [...values.labourReturnedItems];
																	next[idx].returnQuantity = e.target.value;
																	setFieldValue("labourReturnedItems", next);
																}}
																placeholder='0'
																style={{ borderRadius: 8 }}
															/>
														</td>
														<td style={{ minWidth: 100 }}>
															<Button
																size='sm'
																variant={editable ? "secondary" : "light"}
																onClick={() =>
																	setEditableReturnRows((prev) => ({
																		...prev,
																		[idx]: !prev[idx],
																	}))
																}
																style={{
																	borderRadius: "6px",
																	display: "inline-flex",
																	alignItems: "center",
																	gap: 6,
																}}
															>
																<i className='ri-pencil-line' />
																{editable ? "Lock" : "Edit"}
															</Button>
														</td>
													</tr>
												);
											})
										)}
									</tbody>
								</Table>
							</div>

							<div className='mt-3 d-flex gap-2'>
								<Button
									type='submit'
									disabled={isSubmitting || !isValid}
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
									<i className='ri-check-double-line' />
									{isSubmitting ? "Creating GRN..." : "Create GRN"}
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
					)}
				</Formik>
			)}
		</Card>
	);
}