// pages/Order/Order/OrderUpsertPage.tsx
//   SAME UI/CODING STRUCTURE as QuotationUpsertPage
//   Backend requires item snapshots: itemsName, itemsCode, itemsUnit
//   Item selection: Category -> SubCategory -> Item (value=itemId) auto-fills snapshots
//   Includes calculations + Summary panel
//   Locks editing when status is DISPATCHED / DELIVERED / CANCELLED
//   NO normalizeUnit (unit can be any string)

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
import type { AppDispatch, RootState } from "../../slices/store";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import { fetchCategoriesThunk } from "../../slices/Masters/categories/thunks";
import { fetchSubCategoriesThunk } from "../../slices/Masters/subCategories/thunks";
import { fetchItemsThunk } from "../../slices/Masters/items/thunks";
import { fetchWarehousesThunk } from "../../slices/Masters/warehouses/thunks";
import { fetchCustomersThunk } from "../../slices/Masters/customers/thunks";

import {
	createOrderThunk,
	getOrderThunk,
	updateOrderThunk,
} from "../../slices/orders/thunks";
import { clearSelectedOrder } from "../../slices/orders/reducer";

import type { OrderStatus } from "../../types/Orders/order";

const theme = "#1a8376";

// ---------------- helpers ----------------
const round2 = (n: any) => {
	const x = Number(n || 0);
	return Math.round(x * 100) / 100;
};

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
		quantity: Number.isFinite(qty) ? qty : 0,
		rate: Number.isFinite(rate) ? rate : 0,
		discountPercent: Number.isFinite(discP) ? discP : 0,
		gstRate: Number.isFinite(gstR) ? gstR : 0,

		amount: Number.isFinite(amount) ? amount : 0,
		discountPrice: Number.isFinite(discountPrice) ? discountPrice : 0,
		discountedAmount: Number.isFinite(discountedAmount) ? discountedAmount : 0,
		gstAmount: Number.isFinite(gstAmount) ? gstAmount : 0,
		totalAmount: Number.isFinite(totalAmount) ? totalAmount : 0,
	};
};

const statusBadge = (status?: OrderStatus | string | null) => {
	const s = String(status || "PENDING");
	const map: Record<string, { bg: string; text: string; label: string }> = {
		PENDING: { bg: "#fff7e6", text: "#ad6800", label: "Pending" },
		REQUESTED_FOR_DISPATCH: {
			bg: "#e6f7ff",
			text: "#096dd9",
			label: "Requested",
		},
		DISPATCHED: { bg: "#f6ffed", text: "#389e0d", label: "Dispatched" },
		DELIVERED: { bg: "#f0f5ff", text: "#2f54eb", label: "Delivered" },
		CANCELLED: { bg: "#fff1f0", text: "#cf1322", label: "Cancelled" },
	};
	const cfg = map[s] || map.PENDING;
	return (
		<span
			className='badge'
			style={{
				background: cfg.bg,
				color: cfg.text,
				border: `1px solid ${cfg.bg}`,
				fontWeight: 700,
			}}
		>
			{cfg.label}
		</span>
	);
};

// ---------------- validation ----------------
const Schema = Yup.object({
	orderDate: Yup.string().required("Order date required"),
	dispatchFromWarehouseName: Yup.string().required("Warehouse required"),
	customerName: Yup.string().required("Customer name required"),
	remarks: Yup.string().optional(),

	items: Yup.array()
		.of(
			Yup.object({
				itemsCategory: Yup.string().required("Category required"),
				itemsSubCategory: Yup.string().required("Sub-category required"),
				itemId: Yup.string().required("Item required"),

				//   snapshots required by mongoose
				itemsName: Yup.string().required("Item name snapshot required"),
				itemsCode: Yup.string().required("Item code snapshot required"),
				itemsUnit: Yup.string().required("Item unit snapshot required"),

				quantity: Yup.number()
					.typeError("Qty must be number")
					.min(1, "Qty must be >= 1"),

				rate: Yup.number().typeError("Rate must be number").min(0).optional(),
				discountPercent: Yup.number()
					.typeError("Discount must be number")
					.min(0, "Min 0")
					.max(100, "Max 100")
					.optional(),
				gstRate: Yup.number()
					.typeError("GST must be number")
					.min(0, "Min 0")
					.max(100, "Max 100")
					.optional(),

				remark: Yup.string().optional(),
			}),
		)
		.min(1, "At least one item is required"),
});

// ---------------- page ----------------
export default function OrderUpsertPage() {
	const dispatch = useDispatch<AppDispatch>();
	const nav = useNavigate();
	const { id } = useParams();
	const isEdit = !!id;

	const [loading, setLoading] = useState(false);
	const [apiError, setApiError] = useState<string | null>(null);

	//   order slice flags
	const { saving, error, loadingOne } = useSelector((s: RootState) => {
		const st =
			(s as any).orders ||
			(s as any).order ||
			(s as any).orderSlice ||
			(s as any).Order;
		return {
			saving: !!st?.saving,
			loadingOne: !!st?.loadingOne,
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

	const [lockStatus, setLockStatus] = useState<OrderStatus | null>(null);
	const locked =
		lockStatus === "DISPATCHED" ||
		lockStatus === "DELIVERED" ||
		lockStatus === "CANCELLED";

	const [initialValues, setInitialValues] = useState<any>({
		orderNo: "",
		orderStatus: "PENDING",
		quotationNo: "",
		enquiryNo: "",

		orderDate: new Date().toISOString().slice(0, 10),
		dispatchFromWarehouseName: "",
		customerName: "",
		remarks: "",

		items: [
			calcRow({
				itemsCategory: "",
				itemsSubCategory: "",
				itemId: "",

				//   snapshots (required)
				itemsName: "",
				itemsCode: "",
				itemsUnit: "",

				quantity: 1,

				rate: 0,
				discountPercent: 0,
				gstRate: 0,

				amount: 0,
				discountPrice: 0,
				discountedAmount: 0,
				gstAmount: 0,
				totalAmount: 0,

				remark: "",
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

	//   Load order for edit
	useEffect(() => {
		if (!isEdit) return;

		(async () => {
			setLoading(true);
			setApiError(null);

			const res = await dispatch(getOrderThunk(id!));
			if (getOrderThunk.fulfilled.match(res)) {
				const o: any = res.payload;

				const status: OrderStatus = (o.orderStatus as any) || "PENDING";
				setLockStatus(status);

				setInitialValues({
					orderNo: o.orderNo ?? "",
					orderStatus: status,
					quotationNo: o.quotationNo ?? "",
					enquiryNo: o.enquiryNo ?? "",

					orderDate: o.orderDate
						? new Date(o.orderDate).toISOString().slice(0, 10)
						: new Date().toISOString().slice(0, 10),

					dispatchFromWarehouseName: o.dispatchFromWarehouseName ?? "",
					customerName: o.customerName ?? "",
					remarks: o.remarks ?? "",

					items:
						Array.isArray(o.items) && o.items.length > 0
							? o.items.map((r: any) =>
									calcRow({
										itemsCategory: r.itemsCategory ?? "",
										itemsSubCategory: r.itemsSubCategory ?? "",
										itemId: String(r.itemId ?? ""),

										//   snapshots
										itemsName: r.itemsName ?? "",
										itemsCode: r.itemsCode ?? "",
										itemsUnit: r.itemsUnit ?? "",

										quantity: r.quantity ?? 1,
										rate: r.rate ?? 0,
										discountPercent: r.discountPercent ?? 0,
										gstRate: r.gstRate ?? 0,

										remark: r.remark ?? "",
									}),
								)
							: initialValues.items,
				});
			} else {
				setApiError(String(res.payload || "Failed to load order"));
			}

			setLoading(false);
		})();

		return () => {
			dispatch(clearSelectedOrder());
		};
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
		<Card
			className='p-3'
			style={{ border: "1px solid #e9ebec", borderRadius: "10px" }}
		>
			{/* Header */}
			<div className='d-flex justify-content-between align-items-center mb-3'>
				<div>
					<div className='d-flex align-items-center gap-2'>
						<h5 className='m-0'>{isEdit ? "Update Order" : "Create Order"}</h5>
						{isEdit ? statusBadge(lockStatus) : null}
					</div>

					<div style={{ fontSize: 13, color: "#6c757d", marginTop: 2 }}>
						{isEdit ? "Update order details" : "Add a new order"}
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
					onClick={() => nav("/orders-list")}
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

			{loading || loadingOne ? (
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

						if (locked) {
							toast.error(
								"This order is locked (DISPATCHED/DELIVERED/CANCELLED).",
							);
							setSubmitting(false);
							return;
						}

						//   frontend guard: snapshots must be present
						const missing = (values.items || []).findIndex((r: any) => {
							const name = String(r.itemsName || "").trim();
							const code = String(r.itemsCode || "").trim();
							const unit = String(r.itemsUnit || "").trim();
							return !name || !code || !unit;
						});

						if (missing >= 0) {
							toast.error(
								`Row ${missing + 1}: select Item again (snapshot missing).`,
							);
							setSubmitting(false);
							return;
						}

						const payload: any = {
							orderDate: values.orderDate
								? new Date(values.orderDate as any).toISOString()
								: undefined,

							customerName: String(values.customerName || "").trim(),
							dispatchFromWarehouseName: String(
								values.dispatchFromWarehouseName || "",
							).trim(),

							remarks: values.remarks ? String(values.remarks).trim() : "",

							items: values.items.map((r: any) => {
								const rr = calcRow(r);

								return {
									itemsCategory: String(rr.itemsCategory || "").trim(),
									itemsSubCategory: String(rr.itemsSubCategory || "").trim(),

									itemId: String(rr.itemId || "").trim(),

									//   required snapshots
									itemsName: String(rr.itemsName || "").trim(),
									itemsCode: String(rr.itemsCode || "").trim(),
									itemsUnit: String(rr.itemsUnit || "").trim(),

									quantity: Number(rr.quantity || 0),

									// optional (send undefined if empty)
									rate:
										rr.rate === "" || rr.rate === null || rr.rate === undefined
											? undefined
											: Number(rr.rate),
									discountPercent:
										rr.discountPercent === "" ||
										rr.discountPercent === null ||
										rr.discountPercent === undefined
											? undefined
											: Number(rr.discountPercent),
									gstRate:
										rr.gstRate === "" ||
										rr.gstRate === null ||
										rr.gstRate === undefined
											? undefined
											: Number(rr.gstRate),

									remark: rr.remark ? String(rr.remark) : "",
								};
							}),
						};

						//   optional totals (frontend only)
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

						try {
							if (!isEdit) {
								const res = await dispatch(createOrderThunk(payload));
								if (createOrderThunk.fulfilled.match(res)) {
									const created: any = res.payload;
									toast.success("Order created");
									nav(`/orders/${created._id || created.id}/edit`, {
										replace: true,
									});
								} else {
									setApiError(String(res.payload || "Create failed"));
									toast.error(String(res.payload || "Create failed"));
								}
							} else {
								const res = await dispatch(
									updateOrderThunk({ id: id!, payload }),
								);
								if (updateOrderThunk.fulfilled.match(res)) {
									toast.success("Order updated");
									nav("/orders-list", { replace: true });
								} else {
									setApiError(String(res.payload || "Update failed"));
									toast.error(String(res.payload || "Update failed"));
								}
							}
						} catch (e: any) {
							setApiError(e?.message || "Validation error");
							toast.error(e?.message || "Validation error");
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
										{/* ===== Order Details ===== */}
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
												<div style={{ fontWeight: 700 }}>Order Details</div>
											</div>

											<Row className='g-3'>
												{isEdit ? (
													<>
														<Col md={4}>
															<Form.Label style={{ fontWeight: "bold" }}>
																Order No
															</Form.Label>
															<Form.Control
																value={values.orderNo || "-"}
																readOnly
																style={{ borderRadius: 8 }}
															/>
														</Col>

														<Col md={4}>
															<Form.Label style={{ fontWeight: "bold" }}>
																Status
															</Form.Label>
															<Form.Control
																value={values.orderStatus || "PENDING"}
																readOnly
																style={{ borderRadius: 8 }}
															/>
														</Col>

														<Col md={4}>
															<Form.Label style={{ fontWeight: "bold" }}>
																Quotation / Enquiry
															</Form.Label>
															<Form.Control
																value={`${values.quotationNo || "-"} / ${
																	values.enquiryNo || "-"
																}`}
																readOnly
																style={{ borderRadius: 8 }}
															/>
														</Col>
													</>
												) : null}

												<Col md={6}>
													<Form.Label style={{ fontWeight: "bold" }}>
														Order Date <span style={{ color: "red" }}>*</span>
													</Form.Label>
													<Form.Control
														type='date'
														name='orderDate'
														value={values.orderDate}
														onChange={handleChange}
														disabled={locked}
														isInvalid={
															!!(touched as any).orderDate &&
															!!(errors as any).orderDate
														}
														style={{ borderRadius: 8 }}
													/>
													<Form.Control.Feedback type='invalid'>
														{(errors as any).orderDate}
													</Form.Control.Feedback>
												</Col>

												<Col md={6}>
													<Form.Label style={{ fontWeight: "bold" }}>
														Dispatch From Warehouse{" "}
														<span style={{ color: "red" }}>*</span>
													</Form.Label>
													<Form.Select
														name='dispatchFromWarehouseName'
														value={values.dispatchFromWarehouseName}
														onChange={handleChange}
														disabled={locked}
														isInvalid={
															!!(touched as any).dispatchFromWarehouseName &&
															!!(errors as any).dispatchFromWarehouseName
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
														{(errors as any).dispatchFromWarehouseName}
													</Form.Control.Feedback>
												</Col>

												<Col md={12}>
													<Form.Label style={{ fontWeight: "bold" }}>
														Customer Name{" "}
														<span style={{ color: "red" }}>*</span>
													</Form.Label>
													<Form.Select
														name='customerName'
														value={values.customerName}
														onChange={(e) => {
															const selectedName = e.target.value;
															setFieldValue("customerName", selectedName);
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

												<Col md={12}>
													<Form.Label style={{ fontWeight: "bold" }}>
														Remarks
													</Form.Label>
													<Form.Control
														name='remarks'
														value={values.remarks}
														onChange={handleChange}
														disabled={locked}
														placeholder='Optional remarks'
														style={{ borderRadius: 8 }}
													/>
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
												<i className='ri-box-3-line' style={{ color: theme }} />
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
															<th style={{ minWidth: 180 }}>Sub Category *</th>
															<th style={{ minWidth: 240 }}>Item *</th>
															<th style={{ minWidth: 110 }}>Code</th>
															<th style={{ minWidth: 90 }}>Unit</th>
															<th style={{ minWidth: 90 }}>Qty *</th>
															<th style={{ minWidth: 110 }}>Rate</th>
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
																						itemId: "",
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
																				disabled={locked || !row.itemsCategory}
																				onChange={(e) => {
																					const subName = e.target.value;
																					const newItems = [...values.items];
																					newItems[idx] = calcRow({
																						...newItems[idx],
																						itemsSubCategory: subName,
																						itemId: "",
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
																						<option key={scname} value={scname}>
																							{scname}
																						</option>
																					);
																				})}
																			</Form.Select>
																		</td>

																		<td>
																			<Form.Select
																				value={row.itemId}
																				disabled={
																					locked || !row.itemsSubCategory
																				}
																				onChange={(e) => {
																					const itemId = e.target.value;

																					const it = (items || []).find(
																						(x: any) => {
																							const xid = x._id || x.id;
																							return (
																								String(xid) === String(itemId)
																							);
																						},
																					);

																					const itemsName = String(
																						it?.itemName ||
																							it?.name ||
																							it?.label ||
																							"",
																					).trim();
																					const itemsCode = String(
																						it?.itemCode || it?.code || "",
																					).trim();
																					const itemsUnit = String(
																						it?.unit ||
																							it?.unitName ||
																							it?.itemsUnit ||
																							"",
																					).trim();

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
																						itemId,
																						itemsName,
																						itemsCode,
																						itemsUnit,
																						gstRate,
																					});

																					setFieldValue("items", newItems);
																				}}
																				isInvalid={
																					!!rowTouched.itemId && !!rowErr.itemId
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
																					const iid = it._id || it.id;
																					const nm =
																						it.itemName ||
																						it.name ||
																						it.label ||
																						"";
																					return (
																						<option
																							key={String(iid)}
																							value={String(iid)}
																						>
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
																				value={row.rate ?? 0}
																				disabled={locked}
																				onChange={(e) => {
																					const newItems = [...values.items];
																					newItems[idx] = calcRow({
																						...newItems[idx],
																						rate: e.target.value,
																					});
																					setFieldValue("items", newItems);
																				}}
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
																				disabled={locked}
																				onChange={(e) => {
																					const newItems = [...values.items];
																					newItems[idx] = calcRow({
																						...newItems[idx],
																						gstRate: e.target.value,
																					});
																					setFieldValue("items", newItems);
																				}}
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
																				value={row.remark || ""}
																				disabled={locked}
																				onChange={(e) => {
																					const newItems = [...values.items];
																					newItems[idx] = {
																						...newItems[idx],
																						remark: e.target.value,
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
															itemId: "",
															itemsName: "",
															itemsCode: "",
															itemsUnit: "",
															quantity: 1,
															rate: 0,
															discountPercent: 0,
															gstRate: 0,
															remark: "",
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
															? "Update Order"
															: "Create Order"}
												</Button>
											)}

											<Button
												variant='light'
												onClick={() => nav("/orders-list")}
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
	);
}
