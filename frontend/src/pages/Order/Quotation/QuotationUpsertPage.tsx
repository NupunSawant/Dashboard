// QuotationUpsertPage.tsx

import { useEffect, useMemo, useState } from "react";
import {
	Card,
	Button,
	Form,
	Alert,
	Row,
	Col,
	Spinner,
	Table,
} from "react-bootstrap";
import { Formik } from "formik";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../slices/store";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

import { fetchCategoriesThunk } from "../../../slices/Masters/categories/thunks";
import { fetchSubCategoriesThunk } from "../../../slices/Masters/subCategories/thunks";
import { fetchItemsThunk } from "../../../slices/Masters/items/thunks";
import { fetchWarehousesThunk } from "../../../slices/Masters/warehouses/thunks";
import { fetchCustomersThunk } from "../../../slices/Masters/customers/thunks";

import {
	createQuotationThunk,
	getQuotationThunk,
	updateQuotationThunk,
} from "../../../slices/orders/Quotation/thunks";

//   reuse enquiry thunk to prefill when enquiryId is provided
import { getEnquiryThunk } from "../../../slices/orders/Enquiry/thunks";

import type { QuotationStatus } from "../../../types/Orders/quotation";

const theme = "#1a8376";

const parseGstRate = (v: any) => {
	if (v === null || v === undefined) return 0;
	if (typeof v === "number") return Number.isFinite(v) ? v : 0;

	const s = String(v).trim(); // "18%" / "18"
	const n = parseFloat(s.replace("%", "").trim());
	return Number.isFinite(n) ? n : 0;
};

const calcRow = (r: any) => {
	const qty = Number(r.quantity || 0);
	const rate = Number(r.rate || 0);
	const discP = Number(r.discountPercent || 0);
	const gstR = Number(r.gstRate || 0);

	const amount = qty * rate;
	const discountPrice = (discP / 100) * amount;
	const discountedAmount = amount - discountPrice;
	const gstAmount = (gstR / 100) * discountedAmount;
	const totalAmount = discountedAmount + gstAmount;

	return {
		...r,
		quantity: qty,
		rate: rate,
		discountPercent: discP,
		gstRate: gstR,

		amount: Number.isFinite(amount) ? amount : 0,
		discountPrice: Number.isFinite(discountPrice) ? discountPrice : 0,
		discountedAmount: Number.isFinite(discountedAmount) ? discountedAmount : 0,
		gstAmount: Number.isFinite(gstAmount) ? gstAmount : 0,
		totalAmount: Number.isFinite(totalAmount) ? totalAmount : 0,
	};
};

const round2 = (n: any) => {
	const x = Number(n || 0);
	return Math.round(x * 100) / 100;
};

const Schema = Yup.object({
	quotationDate: Yup.string().required("Quotation date required"),
	warehouseName: Yup.string().required("Warehouse required"),

	customerName: Yup.string().required("Customer name required"),
	contactPersonName: Yup.string().required("Contact person name required"),
	contactPersonPhone: Yup.string()
		.required("Contact person phone required")
		.matches(/^\d{10}$/, "Phone must be 10 digits"),

	remarks: Yup.string().optional(),

	items: Yup.array()
		.of(
			Yup.object({
				itemsCategory: Yup.string().required("Category required"),
				itemsSubCategory: Yup.string().required("Sub-category required"),
				itemsName: Yup.string().required("Item name required"),

				itemsCode: Yup.string().required("Item code required"),
				itemsUnit: Yup.string().required("Unit required"),

				quantity: Yup.number()
					.typeError("Qty must be number")
					.min(0.01, "Qty required"),
				rate: Yup.number()
					.typeError("Rate must be number")
					.min(0, "Rate required"),
				discountPercent: Yup.number()
					.typeError("Discount must be number")
					.min(0, "Min 0")
					.max(100, "Max 100"),

				gstRate: Yup.number().typeError("GST must be number").min(0).max(100),

				itemsRemark: Yup.string().optional(),
			}),
		)
		.min(1, "At least one item is required"),
});

export default function QuotationUpsertPage() {
	const dispatch = useDispatch<AppDispatch>();
	const nav = useNavigate();
	const { id } = useParams();
	const isEdit = !!id;

	const [searchParams] = useSearchParams();
	const enquiryId = searchParams.get("enquiryId") || undefined;

	const [loading, setLoading] = useState(false);
	const [apiError, setApiError] = useState<string | null>(null);

	//   quotation slice flags
	const { saving, error } = useSelector((s: RootState) => {
		const st =
			(s as any).quotation ||
			(s as any).Quotation ||
			(s as any).quotations ||
			(s as any).quotationSlice;

		return {
			saving: !!st?.saving,
			error: st?.error ?? null,
		};
	});

	//   masters
	const { categories, loadingList: categoriesLoading } = useSelector(
		(s: RootState) => (s as any).categories,
	);
	const { subCategories, loadingList: subCategoriesLoading } = useSelector(
		(s: RootState) => (s as any).subCategories,
	);
	const { items, loadingList: itemsLoading } = useSelector(
		(s: RootState) => (s as any).items,
	);
	const { warehouses, loadingList: warehousesLoading } = useSelector(
		(s: RootState) => (s as any).warehouses,
	);
	const { customers, loadingList: customersLoading } = useSelector(
		(s: RootState) => (s as any).customers,
	);

	const [lockStatus, setLockStatus] = useState<QuotationStatus | null>(null);
	const locked = lockStatus === "WON" || lockStatus === "LOST";

	const [initialValues, setInitialValues] = useState<any>({
		enquiryId: enquiryId || "",
		enquiryNo: "",

		quotationDate: new Date().toISOString().slice(0, 10),
		warehouseName: "",

		customerName: "",
		contactPersonName: "",
		contactPersonPhone: "",
		remarks: "",

		items: [
			calcRow({
				itemsCategory: "",
				itemsSubCategory: "",
				itemsName: "",
				itemsCode: "",
				itemsUnit: "",
				gstRate: 0,

				quantity: 1,
				rate: 0,
				discountPercent: 0,

				amount: 0,
				discountPrice: 0,
				discountedAmount: 0,
				gstAmount: 0,
				totalAmount: 0,

				itemsRemark: "",
			}),
		],
	});

	useEffect(() => {
		dispatch(fetchWarehousesThunk());
		dispatch(fetchCategoriesThunk());
		dispatch(fetchSubCategoriesThunk());
		dispatch(fetchItemsThunk());
		dispatch(fetchCustomersThunk());

		const onFocus = () => {
			dispatch(fetchWarehousesThunk());
			dispatch(fetchCategoriesThunk());
			dispatch(fetchSubCategoriesThunk());
			dispatch(fetchItemsThunk());
			dispatch(fetchCustomersThunk());
		};

		window.addEventListener("focus", onFocus);
		return () => window.removeEventListener("focus", onFocus);
	}, [dispatch]);

	//   Prefill from Enquiry (create mode only)
	useEffect(() => {
		if (!enquiryId || isEdit) return;

		(async () => {
			setLoading(true);
			setApiError(null);

			const res = await dispatch(getEnquiryThunk(enquiryId));
			if (getEnquiryThunk.fulfilled.match(res)) {
				const e: any = res.payload;

				setInitialValues((prev: any) => ({
					...prev,
					enquiryId,
					enquiryNo: e.enquiryNo ?? "",

					customerName: e.customerName ?? "",
					contactPersonName: e.contactPersonName ?? "",
					contactPersonPhone:
						e.contactPersonPhone === null || e.contactPersonPhone === undefined
							? ""
							: String(e.contactPersonPhone),

					// map items from enquiry into quotation items (qty/rate editable)
					items:
						Array.isArray(e.items) && e.items.length > 0
							? e.items.map((it: any) =>
									calcRow({
										itemsCategory: it.itemsCategory ?? "",
										itemsSubCategory: it.itemsSubCategory ?? "",
										itemsName: it.itemsName ?? "",

										itemsCode: it.itemsCode ?? "",
										itemsUnit: it.itemsUnit ?? "",

										//   will be auto-filled when user selects item (from Items master)
										gstRate: it.gstRate ?? 0,

										quantity: 1,
										rate: 0,
										discountPercent: 0,
										itemsRemark: it.itemsRemark ?? "",
									}),
								)
							: prev.items,
				}));
			} else {
				setApiError(String(res.payload || "Failed to load enquiry"));
			}

			setLoading(false);
		})();
	}, [dispatch, enquiryId, isEdit]);

	//   Load quotation for edit
	useEffect(() => {
		if (!isEdit) return;

		(async () => {
			setLoading(true);
			setApiError(null);

			const res = await dispatch(getQuotationThunk(id!));
			if (getQuotationThunk.fulfilled.match(res)) {
				const q: any = res.payload;
				const status: QuotationStatus = (q.status as any) || "PENDING";
				setLockStatus(status);

				setInitialValues({
					enquiryId: q.enquiryId ?? "",
					enquiryNo: q.enquiryNo ?? "",

					quotationDate: q.quotationDate
						? new Date(q.quotationDate).toISOString().slice(0, 10)
						: new Date().toISOString().slice(0, 10),

					warehouseName: q.warehouseName ?? "",

					customerName: q.customerName ?? "",
					contactPersonName: q.contactPersonName ?? "",
					contactPersonPhone:
						q.contactPersonPhone === null || q.contactPersonPhone === undefined
							? ""
							: String(q.contactPersonPhone),

					remarks: q.remarks ?? "",

					items:
						Array.isArray(q.items) && q.items.length > 0
							? q.items.map((r: any) => calcRow(r))
							: initialValues.items,
				});
			} else {
				setApiError(String(res.payload || "Failed to load quotation"));
			}

			setLoading(false);
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [dispatch, id, isEdit]);

	const getFilteredSubCategories = useMemo(() => {
		return (categoryName: string) => {
			if (!categoryName) return [];
			return (subCategories || []).filter((sc: any) => {
				const catName =
					sc.categoryName || sc.category?.name || sc.category || "";
				return String(catName).trim() === String(categoryName).trim();
			});
		};
	}, [subCategories]);

	const getFilteredItems = useMemo(() => {
		return (subCategoryName: string) => {
			if (!subCategoryName) return [];
			return (items || []).filter((it: any) => {
				const subName =
					it.subCategoryName || it.subCategory?.name || it.subCategory || "";
				return String(subName).trim() === String(subCategoryName).trim();
			});
		};
	}, [items]);

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
							{isEdit
								? "Update Quotation"
								: enquiryId
									? "Create Quotation (From Enquiry)"
									: "Create Quotation"}
						</h5>
						<div style={{ fontSize: 13, color: "#6c757d", marginTop: 2 }}>
							{isEdit ? "Update quotation details" : "Add a new quotation"}
							{locked ? (
								<span
									style={{ marginLeft: 10, color: "#cf1322", fontWeight: 600 }}
								>
									(LOCKED: {lockStatus})
								</span>
							) : null}
						</div>
					</div>

					<Button
						variant='light'
						size='sm'
						onClick={() => nav("/orders/quotations")}
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

							const payload: any = {
								enquiryId: values.enquiryId || undefined,

								quotationDate: values.quotationDate
									? new Date(values.quotationDate as any)
									: undefined,
								warehouseName: values.warehouseName,

								customerName: values.customerName,
								contactPersonName: values.contactPersonName,
								contactPersonPhone:
									values.contactPersonPhone === ""
										? undefined
										: Number(values.contactPersonPhone),

								remarks: values.remarks,

								items: values.items.map((r: any) => {
									const rr = calcRow(r);
									return {
										itemsCategory: rr.itemsCategory,
										itemsSubCategory: rr.itemsSubCategory,
										itemsName: rr.itemsName,

										itemsCode: rr.itemsCode,
										itemsUnit: rr.itemsUnit,

										quantity: Number(rr.quantity || 0),
										rate: Number(rr.rate || 0),

										discountPercent: Number(rr.discountPercent || 0),

										//   GST comes from item selection (Item master)
										gstRate: Number(rr.gstRate || 0),

										itemsRemark: rr.itemsRemark || "",
									};
								}),
							};

							const totals = values.items.reduce(
								(acc: any, r: any) => {
									const rr = calcRow(r);
									acc.subtotal += rr.amount || 0;
									acc.totalDiscount += rr.discountPrice || 0;
									acc.totalGst += rr.gstAmount || 0;
									acc.grandTotal += rr.totalAmount || 0;
									return acc;
								},
								{ subtotal: 0, totalDiscount: 0, totalGst: 0, grandTotal: 0 },
							);

							payload.totals = {
								subtotal: round2(totals.subtotal),
								totalDiscount: round2(totals.totalDiscount),
								totalGst: round2(totals.totalGst),
								grandTotal: round2(totals.grandTotal),
							};

							if (locked) {
								toast.error("This quotation is locked (WON/LOST).");
								setSubmitting(false);
								return;
							}

							if (!isEdit) {
								const res = await dispatch(createQuotationThunk(payload));
								if (createQuotationThunk.fulfilled.match(res)) {
									const created: any = res.payload;
									toast.success("Quotation created");
									nav(`/orders/quotations/view/${created._id || created.id}`, {
										replace: true,
									});
								} else {
									setApiError(String(res.payload || "Create failed"));
									toast.error(String(res.payload || "Create failed"));
								}
							} else {
								const res = await dispatch(
									updateQuotationThunk({ id: id!, payload }),
								);
								if (updateQuotationThunk.fulfilled.match(res)) {
									const updated: any = res.payload;
									toast.success("Quotation updated");
									nav(
										`/orders/quotations/view/${updated._id || updated.id || id}`,
										{
											replace: true,
										},
									);
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
							const itemsTouched = (touched as any)?.items as any[] | undefined;
							const itemsErrors = (errors as any)?.items as any[] | undefined;

							const totals = (values.items || []).reduce(
								(acc: any, r: any) => {
									const rr = calcRow(r);
									acc.subtotal += rr.amount || 0;
									acc.totalDiscount += rr.discountPrice || 0;
									acc.totalGst += rr.gstAmount || 0;
									acc.grandTotal += rr.totalAmount || 0;
									return acc;
								},
								{ subtotal: 0, totalDiscount: 0, totalGst: 0, grandTotal: 0 },
							);

							return (
								<Form onSubmit={handleSubmit}>
									<Row className='g-3'>
										{/* LEFT */}
										<Col lg={8}>
											{/* ===== Quotation Details ===== */}
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
													<div style={{ fontWeight: 700 }}>
														Quotation Details
													</div>
												</div>

												<Row className='g-3'>
													{values.enquiryId ? (
														<>
															<Col md={6}>
																<Form.Label style={{ fontWeight: "bold" }}>
																	Enquiry No
																</Form.Label>
																<Form.Control
																	value={values.enquiryNo || "-"}
																	readOnly
																	style={{ borderRadius: 8 }}
																/>
															</Col>
															<Col md={6}>
																<Form.Label style={{ fontWeight: "bold" }}>
																	Enquiry ID
																</Form.Label>
																<Form.Control
																	value={values.enquiryId}
																	readOnly
																	style={{ borderRadius: 8 }}
																/>
															</Col>
														</>
													) : null}

													<Col md={6}>
														<Form.Label style={{ fontWeight: "bold" }}>
															Quotation Date{" "}
															<span style={{ color: "red" }}>*</span>
														</Form.Label>
														<Form.Control
															type='date'
															name='quotationDate'
															value={values.quotationDate}
															onChange={handleChange}
															disabled={locked}
															isInvalid={
																!!(touched as any).quotationDate &&
																!!(errors as any).quotationDate
															}
															style={{ borderRadius: 8 }}
														/>
														<Form.Control.Feedback type='invalid'>
															{(errors as any).quotationDate}
														</Form.Control.Feedback>
													</Col>

													<Col md={6}>
														<Form.Label style={{ fontWeight: "bold" }}>
															Warehouse <span style={{ color: "red" }}>*</span>
														</Form.Label>
														<Form.Select
															name='warehouseName'
															value={values.warehouseName}
															onChange={handleChange}
															disabled={locked}
															isInvalid={
																!!(touched as any).warehouseName &&
																!!(errors as any).warehouseName
															}
															style={{ borderRadius: 8 }}
														>
															<option value='' disabled>
																{warehousesLoading
																	? "Loading warehouses..."
																	: "Select warehouse"}
															</option>
															{(warehouses || []).map((w: any) => {
																const wid = w.id || w._id || w.name;
																const wname =
																	w.name || w.warehouseName || w.label || wid;
																return (
																	<option key={wid} value={wname}>
																		{wname}
																	</option>
																);
															})}
														</Form.Select>
														<Form.Control.Feedback type='invalid'>
															{(errors as any).warehouseName}
														</Form.Control.Feedback>
													</Col>

													<Col md={4}>
														<Form.Label style={{ fontWeight: "bold" }}>
															Customer Name{" "}
															<span style={{ color: "red" }}>*</span>
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
															disabled={locked}
															isInvalid={
																!!(touched as any).customerName &&
																!!(errors as any).customerName
															}
															style={{ borderRadius: 8 }}
														>
															<option value=''>
																{customersLoading
																	? "Loading customers..."
																	: "Select customer"}
															</option>
															{(customers || []).map((c: any) => (
																<option
																	key={c._id || c.id}
																	value={c.customerName}
																>
																	{c.customerName}
																</option>
															))}
														</Form.Select>
														<Form.Control.Feedback type='invalid'>
															{(errors as any).customerName}
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
															disabled={locked}
															isInvalid={
																!!(touched as any).contactPersonName &&
																!!(errors as any).contactPersonName
															}
															placeholder='Enter contact person name'
															style={{ borderRadius: 8 }}
														/>
														<Form.Control.Feedback type='invalid'>
															{(errors as any).contactPersonName}
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
															disabled={locked}
															isInvalid={
																!!(touched as any).contactPersonPhone &&
																!!(errors as any).contactPersonPhone
															}
															placeholder='10-digit phone'
															style={{ borderRadius: 8 }}
														/>
														<Form.Control.Feedback type='invalid'>
															{(errors as any).contactPersonPhone}
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
															disabled={locked}
															isInvalid={
																!!(touched as any).remarks &&
																!!(errors as any).remarks
															}
															placeholder='Optional remarks'
															style={{ borderRadius: 8 }}
														/>
														<Form.Control.Feedback type='invalid'>
															{(errors as any).remarks}
														</Form.Control.Feedback>
													</Col>
												</Row>
											</div>

											{/* ===== Items ===== */}
											<div
												className='p-3 mb-3'
												style={{
													background: "#ffffff",
													border: "1px solid #eef2f1",
													borderRadius: 10,
												}}
											>
												<div className='d-flex align-items-center gap-2 mb-3'>
													<i
														className='ri-box-3-line'
														style={{ color: theme }}
													/>
													<div style={{ fontWeight: 700 }}>Items</div>
												</div>

												<div className='table-responsive'>
													<Table
														bordered
														hover
														size='sm'
														className='align-middle'
													>
														<thead style={{ background: "#f8fbfa" }}>
															<tr>
																<th style={{ minWidth: 160 }}>Category *</th>
																<th style={{ minWidth: 180 }}>
																	Sub Category *
																</th>
																<th style={{ minWidth: 220 }}>Item *</th>
																<th style={{ minWidth: 110 }}>Code</th>
																<th style={{ minWidth: 90 }}>Unit</th>
																<th style={{ minWidth: 90 }}>Qty *</th>
																<th style={{ minWidth: 110 }}>Rate *</th>
																<th style={{ minWidth: 120 }}>Amount</th>
																<th style={{ minWidth: 110 }}>Disc %</th>
																<th style={{ minWidth: 120 }}>Disc ₹</th>
																<th style={{ minWidth: 130 }}>After Disc</th>
																<th style={{ minWidth: 90 }}>GST %</th>
																<th style={{ minWidth: 120 }}>GST ₹</th>
																<th style={{ minWidth: 130 }}>Total ₹</th>
																<th style={{ minWidth: 220 }}>Remark</th>
																<th style={{ width: 60 }}> </th>
															</tr>
														</thead>

														<tbody>
															{(values.items || []).map(
																(row: any, idx: number) => {
																	const filteredSubs = getFilteredSubCategories(
																		row.itemsCategory,
																	);
																	const filteredItemsList = getFilteredItems(
																		row.itemsSubCategory,
																	);

																	const rowTouched = itemsTouched?.[idx] || {};
																	const rowErr =
																		(itemsErrors?.[idx] as any) || {};

																	return (
																		<tr key={idx}>
																			<td>
																				<Form.Select
																					value={row.itemsCategory}
																					disabled={locked}
																					onChange={(e) => {
																						const catName = e.target.value;
																						const newItems = [...values.items];
																						newItems[idx] = calcRow({
																							...newItems[idx],
																							itemsCategory: catName,
																							itemsSubCategory: "",
																							itemsName: "",
																							itemsCode: "",
																							itemsUnit: "",
																							gstRate: 0,
																						});
																						setFieldValue("items", newItems);
																					}}
																					isInvalid={
																						!!rowTouched.itemsCategory &&
																						!!rowErr.itemsCategory
																					}
																					style={{ borderRadius: 8 }}
																				>
																					<option value=''>
																						{categoriesLoading
																							? "Loading..."
																							: "Select"}
																					</option>
																					{(categories || []).map((c: any) => {
																						const cname =
																							c.name ||
																							c.categoryName ||
																							c.label ||
																							"";
																						return (
																							<option key={cname} value={cname}>
																								{cname}
																							</option>
																						);
																					})}
																				</Form.Select>
																			</td>

																			<td>
																				<Form.Select
																					value={row.itemsSubCategory}
																					disabled={
																						locked || !row.itemsCategory
																					}
																					onChange={(e) => {
																						const subName = e.target.value;
																						const newItems = [...values.items];
																						newItems[idx] = calcRow({
																							...newItems[idx],
																							itemsSubCategory: subName,
																							itemsName: "",
																							itemsCode: "",
																							itemsUnit: "",
																							gstRate: 0,
																						});
																						setFieldValue("items", newItems);
																					}}
																					isInvalid={
																						!!rowTouched.itemsSubCategory &&
																						!!rowErr.itemsSubCategory
																					}
																					style={{ borderRadius: 8 }}
																				>
																					<option value=''>
																						{!row.itemsCategory
																							? "Select category"
																							: subCategoriesLoading
																								? "Loading..."
																								: filteredSubs.length === 0
																									? "No sub-categories"
																									: "Select"}
																					</option>
																					{filteredSubs.map((sc: any) => {
																						const scname =
																							sc.name ||
																							sc.subCategoryName ||
																							sc.label ||
																							"";
																						return (
																							<option
																								key={scname}
																								value={scname}
																							>
																								{scname}
																							</option>
																						);
																					})}
																				</Form.Select>
																			</td>

																			<td>
																				<Form.Select
																					value={row.itemsName}
																					disabled={
																						locked || !row.itemsSubCategory
																					}
																					onChange={(e) => {
																						const itemName = e.target.value;

																						const normalize = (v: any) =>
																							String(v ?? "")
																								.trim()
																								.toLowerCase();

																						//   Find selected item: prefer current row's filtered list, then fallback to all items
																						const it =
																							(filteredItemsList || []).find(
																								(x: any) => {
																									const nm =
																										x.itemName ||
																										x.name ||
																										x.label ||
																										"";
																									return (
																										normalize(nm) ===
																										normalize(itemName)
																									);
																								},
																							) ||
																							(items || []).find((x: any) => {
																								const nm =
																									x.itemName ||
																									x.name ||
																									x.label ||
																									"";
																								return (
																									normalize(nm) ===
																									normalize(itemName)
																								);
																							});

																						//   GST fetched ONLY from item master
																						const gstRate = parseGstRate(
																							it?.gstRate ??
																								it?.gst ??
																								it?.gstPercentage ??
																								it?.gstPercent ??
																								it?.gst_rate ??
																								0,
																						);

																						const newItems = [...values.items];
																						newItems[idx] = calcRow({
																							...newItems[idx],
																							itemsName: itemName,
																							itemsCode:
																								it?.itemCode || it?.code || "",
																							itemsUnit:
																								it?.unit || it?.unitName || "",
																							gstRate: gstRate,
																						});
																						setFieldValue("items", newItems);
																					}}
																					isInvalid={
																						!!rowTouched.itemsName &&
																						!!rowErr.itemsName
																					}
																					style={{ borderRadius: 8 }}
																				>
																					<option value=''>
																						{!row.itemsSubCategory
																							? "Select sub-category"
																							: itemsLoading
																								? "Loading..."
																								: filteredItemsList.length === 0
																									? "No items"
																									: "Select"}
																					</option>
																					{filteredItemsList.map((it: any) => {
																						const nm =
																							it.itemName ||
																							it.name ||
																							it.label ||
																							"";
																						return (
																							<option key={nm} value={nm}>
																								{nm}
																							</option>
																						);
																					})}
																				</Form.Select>
																			</td>

																			<td>
																				<Form.Control
																					value={row.itemsCode || ""}
																					readOnly
																					style={{ borderRadius: 8 }}
																				/>
																			</td>

																			<td>
																				<Form.Control
																					value={row.itemsUnit || ""}
																					readOnly
																					style={{ borderRadius: 8 }}
																				/>
																			</td>

																			<td>
																				<Form.Control
																					value={row.quantity ?? ""}
																					disabled={locked}
																					onChange={(e) => {
																						const newItems = [...values.items];
																						newItems[idx] = calcRow({
																							...newItems[idx],
																							quantity: e.target.value,
																						});
																						setFieldValue("items", newItems);
																					}}
																					isInvalid={
																						!!rowTouched.quantity &&
																						!!rowErr.quantity
																					}
																					style={{ borderRadius: 8 }}
																				/>
																			</td>

																			<td>
																				<Form.Control
																					value={row.rate ?? ""}
																					disabled={locked}
																					onChange={(e) => {
																						const newItems = [...values.items];
																						newItems[idx] = calcRow({
																							...newItems[idx],
																							rate: e.target.value,
																						});
																						setFieldValue("items", newItems);
																					}}
																					isInvalid={
																						!!rowTouched.rate && !!rowErr.rate
																					}
																					style={{ borderRadius: 8 }}
																				/>
																			</td>

																			<td>
																				<Form.Control
																					value={round2(row.amount)}
																					readOnly
																					style={{ borderRadius: 8 }}
																				/>
																			</td>

																			<td>
																				<Form.Control
																					value={row.discountPercent ?? 0}
																					disabled={locked}
																					onChange={(e) => {
																						const newItems = [...values.items];
																						newItems[idx] = calcRow({
																							...newItems[idx],
																							discountPercent: e.target.value,
																						});
																						setFieldValue("items", newItems);
																					}}
																					isInvalid={
																						!!rowTouched.discountPercent &&
																						!!rowErr.discountPercent
																					}
																					style={{ borderRadius: 8 }}
																				/>
																			</td>

																			<td>
																				<Form.Control
																					value={round2(row.discountPrice)}
																					readOnly
																					style={{ borderRadius: 8 }}
																				/>
																			</td>

																			<td>
																				<Form.Control
																					value={round2(row.discountedAmount)}
																					readOnly
																					style={{ borderRadius: 8 }}
																				/>
																			</td>

																			<td>
																				<Form.Control
																					value={row.gstRate || 0}
																					readOnly
																					style={{ borderRadius: 8 }}
																				/>
																			</td>

																			<td>
																				<Form.Control
																					value={round2(row.gstAmount)}
																					readOnly
																					style={{ borderRadius: 8 }}
																				/>
																			</td>

																			<td>
																				<Form.Control
																					value={round2(row.totalAmount)}
																					readOnly
																					style={{ borderRadius: 8 }}
																				/>
																			</td>

																			<td>
																				<Form.Control
																					value={row.itemsRemark || ""}
																					disabled={locked}
																					onChange={(e) => {
																						const newItems = [...values.items];
																						newItems[idx] = {
																							...newItems[idx],
																							itemsRemark: e.target.value,
																						};
																						setFieldValue("items", newItems);
																					}}
																					style={{ borderRadius: 8 }}
																				/>
																			</td>

																			<td className='text-center'>
																				{(values.items?.length || 0) > 1 &&
																				!locked ? (
																					<Button
																						size='sm'
																						variant='danger'
																						onClick={() => {
																							const newItems =
																								values.items.filter(
																									(_: any, i: number) =>
																										i !== idx,
																								);
																							setFieldValue("items", newItems);
																						}}
																						style={{
																							padding: "4px 8px",
																							fontSize: 12,
																						}}
																						title='Remove'
																					>
																						<i className='ri-delete-bin-line' />
																					</Button>
																				) : null}
																			</td>
																		</tr>
																	);
																},
															)}
														</tbody>
													</Table>
												</div>

												<Button
													variant='outline-primary'
													disabled={locked}
													onClick={() => {
														setFieldValue("items", [
															...values.items,
															calcRow({
																itemsCategory: "",
																itemsSubCategory: "",
																itemsName: "",
																itemsCode: "",
																itemsUnit: "",
																gstRate: 0,
																quantity: 1,
																rate: 0,
																discountPercent: 0,
																itemsRemark: "",
															}),
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
													<i className='ri-add-circle-line' /> Add Row
												</Button>
											</div>

											{/* Submit buttons */}
											<div className='mt-3 d-flex gap-2'>
												{!locked && (
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
																isEdit ? "ri-save-3-line" : "ri-add-circle-line"
															}
														/>
														{isSubmitting || saving
															? isEdit
																? "Updating..."
																: "Creating..."
															: isEdit
																? "Update Quotation"
																: "Create Quotation"}
													</Button>
												)}

												<Button
													variant='light'
													onClick={() => nav("/orders/quotations")}
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
										</Col>

										{/* RIGHT: Summary */}
										<Col lg={4}>
											<div
												className='p-3'
												style={{
													background: "#ffffff",
													border: "1px solid #eef2f1",
													borderRadius: 10,
													position: "sticky",
													top: 12,
												}}
											>
												<div className='d-flex align-items-center gap-2 mb-3'>
													<i
														className='ri-calculator-line'
														style={{ color: theme }}
													/>
													<div style={{ fontWeight: 700 }}>Summary</div>
												</div>

												<div className='d-flex justify-content-between mb-2'>
													<div style={{ color: "#6c757d" }}>Subtotal</div>
													<div style={{ fontWeight: 700 }}>
														{round2(totals.subtotal)}
													</div>
												</div>

												<div className='d-flex justify-content-between mb-2'>
													<div style={{ color: "#6c757d" }}>Total Discount</div>
													<div style={{ fontWeight: 700 }}>
														{round2(totals.totalDiscount)}
													</div>
												</div>

												<div className='d-flex justify-content-between mb-2'>
													<div style={{ color: "#6c757d" }}>Total GST</div>
													<div style={{ fontWeight: 700 }}>
														{round2(totals.totalGst)}
													</div>
												</div>

												<hr />

												<div className='d-flex justify-content-between'>
													<div style={{ fontWeight: 800, fontSize: 16 }}>
														Grand Total
													</div>
													<div
														style={{
															fontWeight: 900,
															fontSize: 18,
															color: theme,
														}}
													>
														{round2(totals.grandTotal)}
													</div>
												</div>

												<div
													style={{
														marginTop: 12,
														fontSize: 12,
														color: "#6c757d",
													}}
												>
													Amounts auto-calculate using:
													<div>amount = qty × rate</div>
													<div>discount = % of amount</div>
													<div>GST = % of discounted amount</div>
												</div>
											</div>
										</Col>
									</Row>
								</Form>
							);
						}}
					</Formik>
				)}
			</Card>
		</>
	);
}
