// pages/Warehouse/Dispatch/DispatchUpsertPage.tsx

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

import { getOrderThunk } from "../../../slices/orders/thunks";
import { getQuotationThunk } from "../../../slices/orders/Quotation/thunks";
import { fetchWarehousesThunk } from "../../../slices/Masters/warehouses/thunks";
import { createDispatchThunk } from "../../../slices/Warehouse/Dispatch/thunks";
import { fetchCustomersThunk } from "../../../slices/Masters/customers/thunks";

const theme = "#1a8376";

const norm = (v: any) =>
	String(v ?? "")
		.trim()
		.toLowerCase();

const findCustomerByName = (customersArr: any[], name: string) => {
	const key = norm(name);
	if (!key) return null;
	return (
		(customersArr || []).find((c: any) => norm(c.customerName) === key) || null
	);
};

// ---------------- helpers ----------------
const round2 = (n: any) => {
	const x = Number(n || 0);
	return Math.round(x * 100) / 100;
};

const parseNumber = (v: any) => {
	const n = Number(v);
	return Number.isFinite(n) ? n : 0;
};

const calcRow = (r: any) => {
	const orderQty = parseNumber(r.orderQuantity);
	const dispatchQty = parseNumber(r.dispatchQuantity);

	const rate = parseNumber(r.rate);
	const discP = parseNumber(r.discountPercent);
	const gstR = parseNumber(r.gstRate);

	const amount = dispatchQty * rate;
	const discountAmount = (discP / 100) * amount;
	const taxable = amount - discountAmount;
	const gstAmount = (gstR / 100) * taxable;
	const totalAmount = taxable + gstAmount;

	return {
		...r,
		orderQuantity: Number.isFinite(orderQty) ? orderQty : 0,
		dispatchQuantity: Number.isFinite(dispatchQty) ? dispatchQty : 0,

		rate: Number.isFinite(rate) ? rate : 0,
		discountPercent: Number.isFinite(discP) ? discP : 0,
		gstRate: Number.isFinite(gstR) ? gstR : 0,

		amount: Number.isFinite(amount) ? amount : 0,
		discountAmount: Number.isFinite(discountAmount) ? discountAmount : 0,
		gstAmount: Number.isFinite(gstAmount) ? gstAmount : 0,
		totalAmount: Number.isFinite(totalAmount) ? totalAmount : 0,
	};
};

const totalsFrom = (itemsArr: any[]) =>
	(itemsArr || []).reduce(
		(acc: any, r: any) => {
			const rr = calcRow(r);
			acc.subtotal += rr.amount || 0;
			acc.totalDiscount += rr.discountAmount || 0;
			acc.totalGst += rr.gstAmount || 0;
			acc.grandTotal += rr.totalAmount || 0;
			return acc;
		},
		{ subtotal: 0, totalDiscount: 0, totalGst: 0, grandTotal: 0 },
	);

// ---------------- validation ----------------
const Schema = Yup.object({
	issuedFromWarehouseName: Yup.string().required(
		"Issued from warehouse required",
	),
	dispatchedBy: Yup.string().required("Dispatched by required"),
	remark: Yup.string().optional(),
});

export default function DispatchUpsertPage() {
	const dispatch = useDispatch<AppDispatch>();
	const nav = useNavigate();
	const { orderId } = useParams();
	const [sp] = useSearchParams();

	const sourceTypeParam = String(sp.get("sourceType") || "").toUpperCase();
	const sourceIdParam = String(sp.get("sourceId") || "");

	const isOrderMode = !!orderId;
	const isQuotationMode = sourceTypeParam === "QUOTATION" && !!sourceIdParam;

	const [loading, setLoading] = useState(false);
	const [apiError, setApiError] = useState<string | null>(null);

	// masters: warehouses
	const { warehouses, loadingList: warehousesLoading } = useSelector(
		(s: RootState) => (s as any).warehouses,
	);

	const { customers } = useSelector((s: RootState) => (s as any).customers);

	// dispatch slice (your store key is warehouseDispatch)
	const { creating, error } = useSelector((s: RootState) => {
		const st = (s as any).warehouseDispatch;
		return {
			creating: !!st?.creating,
			error: st?.error ?? null,
		};
	});

	// auth/user names for dropdown
	const authState = useSelector((s: RootState) => (s as any).auth) as any;

	const authName =
		String(
			authState?.user?.name ||
				authState?.user?.fullName ||
				authState?.profile?.name ||
				authState?.username ||
				"",
		).trim() || "admin";

	// try to read users list from state (no extra thunk imports)
	const usersState = useSelector((s: RootState) => (s as any).users) as any;
	const userOptions = useMemo(() => {
		const list =
			usersState?.users ||
			usersState?.list ||
			usersState?.data ||
			usersState?.userList ||
			[];
		const names = Array.isArray(list)
			? list
					.map((u: any) =>
						String(u?.name || u?.fullName || u?.username || "").trim(),
					)
					.filter(Boolean)
			: [];
		return Array.from(new Set([authName, ...names]));
	}, [usersState, authName]);

	const [initialValues, setInitialValues] = useState<any>({
		// ✅ new common source fields
		sourceType: isQuotationMode ? "QUOTATION" : "ORDER",
		sourceId: isQuotationMode ? sourceIdParam : orderId || "",

		dispatchDate: new Date().toISOString().slice(0, 10),

		// order/quotation numbers
		orderNo: "",
		orderId: orderId || "",
		quotationNo: "",

		dispatchType: isQuotationMode ? "QUOTATION" : "ORDER",
		invoiceNo: "",

		// editable
		issuedFromWarehouseName: "",
		dispatchedBy: authName,
		remark: "",

		// auto fetched customer section (read-only)
		customerName: "",
		customerNameForTransport: "",
		transporterName: "",
		contactPerson: "",
		contactNumber: "",
		address: "",
		city: "",
		state: "",
		country: "",
		pincode: "",

		// auto fetched items (read-only)
		items: [
			calcRow({
				itemsCategory: "",
				itemsSubCategory: "",
				itemId: "",
				itemsName: "",
				itemsCode: "",
				itemsUnit: "",
				orderQuantity: 0,
				dispatchQuantity: 0,
				rate: 0,
				discountPercent: 0,
				gstRate: 0,
				remark: "",
			}),
		],
	});

	useEffect(() => {
		dispatch(fetchWarehousesThunk());
		dispatch(fetchCustomersThunk());

		const onFocus = () => {
			dispatch(fetchWarehousesThunk());
			dispatch(fetchCustomersThunk());
		};
		window.addEventListener("focus", onFocus);
		return () => window.removeEventListener("focus", onFocus);
	}, [dispatch]);

	// ✅ Load from Order OR Quotation based on mode
	useEffect(() => {
		if (!isOrderMode && !isQuotationMode) return;

		(async () => {
			setLoading(true);
			setApiError(null);

			// -------- ORDER MODE --------
			if (isOrderMode) {
				const res = await dispatch(getOrderThunk(orderId!));
				if (getOrderThunk.fulfilled.match(res)) {
					const o: any = res.payload;

					const orderItems =
						Array.isArray(o.items) && o.items.length > 0
							? o.items.map((r: any) =>
									calcRow({
										itemsCategory: r.itemsCategory ?? "",
										itemsSubCategory: r.itemsSubCategory ?? "",
										itemId: String(r.itemId ?? ""),

										itemsName: r.itemsName ?? "",
										itemsCode: r.itemsCode ?? "",
										itemsUnit: r.itemsUnit ?? "",

										orderQuantity: Number(r.quantity ?? 0),
										dispatchQuantity: Number(r.quantity ?? 0),

										rate: r.rate ?? 0,
										discountPercent: r.discountPercent ?? 0,
										gstRate: r.gstRate ?? 0,

										remark: r.remark ?? "",
									}),
								)
							: initialValues.items;

					setInitialValues((prev: any) => ({
						...prev,
						sourceType: "ORDER",
						sourceId: orderId,

						orderId: orderId,
						orderNo: o.orderNo ?? "",
						quotationNo: o.quotationNo ?? "",

						dispatchDate: new Date().toISOString().slice(0, 10),
						dispatchType: "ORDER",

						issuedFromWarehouseName: o.dispatchFromWarehouseName ?? "",
						customerName: o.customerName ?? "",

						customerNameForTransport: o.customerNameForTransport ?? "",
						transporterName: o.transporterName ?? "",
						contactPerson: o.contactPerson ?? "",
						contactNumber: o.contactNumber ?? "",
						address: o.address ?? "",
						city: o.city ?? "",
						state: o.state ?? "",
						country: o.country ?? "",
						pincode: o.pincode ?? "",

						items: orderItems,
					}));
				} else {
					setApiError(String((res as any).payload || "Failed to load order"));
				}
			}

			// -------- QUOTATION MODE --------
			if (isQuotationMode) {
				const res = await dispatch(getQuotationThunk(sourceIdParam));
				if (getQuotationThunk.fulfilled.match(res)) {
					const q: any = res.payload;

					const qItems =
						Array.isArray(q.items) && q.items.length > 0
							? q.items.map((r: any) =>
									calcRow({
										itemsCategory: r.itemsCategory ?? "",
										itemsSubCategory: r.itemsSubCategory ?? "",
										itemId: String(r.itemId ?? ""),

										itemsName: r.itemsName ?? "",
										itemsCode: r.itemsCode ?? "",
										itemsUnit: r.itemsUnit ?? "",

										orderQuantity: Number(r.quantity ?? r.orderQuantity ?? 0),
										dispatchQuantity: Number(
											r.quantity ?? r.orderQuantity ?? 0,
										),

										rate: r.rate ?? 0,
										discountPercent: r.discountPercent ?? 0,
										gstRate: r.gstRate ?? 0,

										remark: r.remark ?? "",
									}),
								)
							: initialValues.items;

					setInitialValues((prev: any) => ({
						...prev,
						sourceType: "QUOTATION",
						sourceId: sourceIdParam,

						orderId: "",
						orderNo: "",
						quotationNo: q.quotationNo ?? "",

						dispatchDate: new Date().toISOString().slice(0, 10),
						dispatchType: "QUOTATION",

						issuedFromWarehouseName: q.warehouseName ?? "",
						customerName: q.customerName ?? "",
						contactPerson: q.contactPersonName ?? "",
						contactNumber: q.contactPersonPhone ?? "",

						items: qItems,
					}));
				} else {
					setApiError(
						String((res as any).payload || "Failed to load quotation"),
					);
				}
			}

			setLoading(false);
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [dispatch, orderId, isOrderMode, isQuotationMode, sourceIdParam]);

	useEffect(() => {
		if (!customers || customers.length === 0) return;

		setInitialValues((prev: any) => {
			if (!prev.customerName) return prev;

			const cust = findCustomerByName(customers, prev.customerName);
			if (!cust) return prev;

			return {
				...prev,
				contactPerson:
					prev.contactPerson || cust.customerContactPersonName || "",
				contactNumber:
					prev.contactNumber ||
					(cust.customerContactPersonPhone !== null &&
					cust.customerContactPersonPhone !== undefined
						? String(cust.customerContactPersonPhone)
						: ""),
				address: prev.address || cust.customerAddress || "",
				city: prev.city || cust.customerCity || "",
				state: prev.state || cust.customerState || "",
				pincode: prev.pincode || cust.customerPincode || "",
			};
		});
	}, [customers]);

	const loadingUi = loading;

	const missingSource = !isOrderMode && !isQuotationMode;

	return (
		<Card
			className='p-3'
			style={{ border: "1px solid #e9ebec", borderRadius: "10px" }}
		>
			<div className='d-flex justify-content-between align-items-center mb-3'>
				<div>
					<h5 className='m-0'>Create Dispatch</h5>
					<div style={{ fontSize: 13, color: "#6c757d", marginTop: 2 }}>
						{isQuotationMode
							? "Dispatch details are fetched from Quotation and locked (only 3 fields editable)"
							: "Dispatch details are fetched from Order and locked (only 3 fields editable)"}
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

			{(missingSource || apiError || error) && (
				<Alert variant='danger' className='mb-3'>
					{missingSource
						? "Order ID / Quotation ID missing in URL"
						: apiError || error}
				</Alert>
			)}

			{loadingUi ? (
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

						if (!values.sourceId) {
							toast.error(
								isQuotationMode ? "Quotation ID missing" : "Order ID missing",
							);
							setSubmitting(false);
							return;
						}

						const items = (values.items || []).map((r: any) => {
							const rr = calcRow(r);
							return {
								itemsCategory: String(rr.itemsCategory || "").trim(),
								itemsSubCategory: String(rr.itemsSubCategory || "").trim(),

								itemId: String(rr.itemId || "").trim(),
								itemsName: String(rr.itemsName || "").trim(),
								itemsCode: String(rr.itemsCode || "").trim(),
								itemsUnit: String(rr.itemsUnit || "").trim(),

								orderQuantity: Number(rr.orderQuantity || 0),
								dispatchQuantity: Number(rr.dispatchQuantity || 0),

								rate: rr.rate ?? 0,
								discountPercent: rr.discountPercent ?? 0,
								gstRate: rr.gstRate ?? 0,

								remark: rr.remark ? String(rr.remark) : "",
							};
						});

						const t = totalsFrom(values.items || []);

						const payload: any = {
							// ✅ NEW (required for both flows)
							sourceType: values.sourceType,
							sourceId: values.sourceId,

							// ✅ backward compatible for ORDER flow
							orderId:
								values.sourceType === "ORDER"
									? String(values.sourceId)
									: undefined,

							dispatchDate: new Date(values.dispatchDate).toISOString(),
							dispatchType: values.dispatchType,

							issuedFromWarehouseName: String(
								values.issuedFromWarehouseName || "",
							).trim(),
							dispatchedBy: String(values.dispatchedBy || "").trim(),
							remark: values.remark ? String(values.remark).trim() : "",

							orderNo: values.orderNo || "",
							quotationNo: values.quotationNo || "",

							customerName: values.customerName || "",

							customerNameForTransport: values.customerNameForTransport || "",
							transporterName: values.transporterName || "",
							contactPerson: values.contactPerson || "",
							contactNumber:
								values.contactNumber === "" ||
								values.contactNumber === null ||
								values.contactNumber === undefined
									? undefined
									: Number(values.contactNumber),
							address: values.address || "",
							city: values.city || "",
							state: values.state || "",
							country: values.country || "",
							pincode: values.pincode || "",

							items,

							totals: {
								subtotal: round2(t.subtotal),
								totalDiscount: round2(t.totalDiscount),
								totalGst: round2(t.totalGst),
								grandTotal: round2(t.grandTotal),
							},
						};

						try {
							const res = await dispatch(createDispatchThunk(payload));
							if (createDispatchThunk.fulfilled.match(res)) {
								toast.success("Dispatch created successfully");
								nav("/warehouses/dispatch", { replace: true });
							} else {
								setApiError(
									String((res as any).payload || "Create dispatch failed"),
								);
								toast.error(
									String((res as any).payload || "Create dispatch failed"),
								);
							}
						} catch (e: any) {
							setApiError(e?.message || "Create dispatch failed");
							toast.error(e?.message || "Create dispatch failed");
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
						isValid,
						dirty,
					}) => {
						const t = totalsFrom(values.items || []);

						return (
							<Form onSubmit={handleSubmit}>
								<Row className='g-3'>
									<Col lg={8}>
										<div
											className='p-3 mb-3'
											style={{
												background: "#f8fbfa",
												border: "1px solid #eef2f1",
												borderRadius: 10,
											}}
										>
											<div className='d-flex align-items-center gap-2 mb-2'>
												<i className='ri-truck-line' style={{ color: theme }} />
												<div style={{ fontWeight: 700 }}>Dispatch Details</div>
											</div>

											<Row className='g-3'>
												<Col md={4}>
													<Form.Label style={{ fontWeight: "bold" }}>
														Dispatch Date
													</Form.Label>
													<Form.Control
														type='date'
														name='dispatchDate'
														value={values.dispatchDate}
														readOnly
														disabled
														style={{ borderRadius: 8 }}
													/>
												</Col>

												<Col md={4}>
													<Form.Label style={{ fontWeight: "bold" }}>
														{values.sourceType === "QUOTATION"
															? "Quotation No"
															: "Order No"}
													</Form.Label>
													<Form.Control
														value={
															values.sourceType === "QUOTATION"
																? values.quotationNo || "-"
																: values.orderNo || "-"
														}
														readOnly
														disabled
														style={{ borderRadius: 8 }}
													/>
												</Col>

												<Col md={4}>
													<Form.Label style={{ fontWeight: "bold" }}>
														Dispatch Type
													</Form.Label>
													<Form.Control
														value={values.dispatchType || "-"}
														readOnly
														disabled
														style={{ borderRadius: 8 }}
													/>
												</Col>

												<Col md={6}>
													<Form.Label style={{ fontWeight: "bold" }}>
														Issued From Warehouse{" "}
														<span style={{ color: "red" }}>*</span>
													</Form.Label>
													<Form.Select
														name='issuedFromWarehouseName'
														value={values.issuedFromWarehouseName}
														onChange={handleChange}
														isInvalid={
															!!(touched as any).issuedFromWarehouseName &&
															!!(errors as any).issuedFromWarehouseName
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
														{(errors as any).issuedFromWarehouseName}
													</Form.Control.Feedback>
												</Col>

												<Col md={6}>
													<Form.Label style={{ fontWeight: "bold" }}>
														Dispatched By{" "}
														<span style={{ color: "red" }}>*</span>
													</Form.Label>
													<Form.Select
														name='dispatchedBy'
														value={values.dispatchedBy}
														onChange={handleChange}
														isInvalid={
															!!(touched as any).dispatchedBy &&
															!!(errors as any).dispatchedBy
														}
														style={{ borderRadius: 8 }}
													>
														<option value='' disabled>
															Select name
														</option>
														{userOptions.map((nm: string) => (
															<option key={nm} value={nm}>
																{nm}
															</option>
														))}
													</Form.Select>
													<Form.Control.Feedback type='invalid'>
														{(errors as any).dispatchedBy}
													</Form.Control.Feedback>
												</Col>

												<Col md={12}>
													<Form.Label style={{ fontWeight: "bold" }}>
														Remark
													</Form.Label>
													<Form.Control
														name='remark'
														value={values.remark}
														onChange={handleChange}
														placeholder='Optional remark'
														style={{ borderRadius: 8 }}
													/>
												</Col>
											</Row>
										</div>

										{/* Customer Details */}
										<div
											className='p-3 mb-3'
											style={{
												background: "#ffffff",
												border: "1px solid #eef2f1",
												borderRadius: 10,
											}}
										>
											<div className='d-flex align-items-center gap-2 mb-2'>
												<i
													className='ri-user-3-line'
													style={{ color: theme }}
												/>
												<div style={{ fontWeight: 700 }}>Customer Details</div>
											</div>

											<Row className='g-3'>
												<Col md={6}>
													<Form.Label style={{ fontWeight: "bold" }}>
														Customer Name
													</Form.Label>
													<Form.Control
														value={values.customerName || "-"}
														readOnly
														disabled
														style={{ borderRadius: 8 }}
													/>
												</Col>

												<Col md={6}>
													<Form.Label style={{ fontWeight: "bold" }}>
														Customer Name for Transport
													</Form.Label>
													<Form.Control
														value={values.customerNameForTransport || "-"}
														readOnly
														disabled
														style={{ borderRadius: 8 }}
													/>
												</Col>

												<Col md={6}>
													<Form.Label style={{ fontWeight: "bold" }}>
														Transporter Name
													</Form.Label>
													<Form.Control
														value={values.transporterName || "-"}
														readOnly
														disabled
														style={{ borderRadius: 8 }}
													/>
												</Col>

												<Col md={6}>
													<Form.Label style={{ fontWeight: "bold" }}>
														Contact Person
													</Form.Label>
													<Form.Control
														value={values.contactPerson || "-"}
														readOnly
														disabled
														style={{ borderRadius: 8 }}
													/>
												</Col>

												<Col md={6}>
													<Form.Label style={{ fontWeight: "bold" }}>
														Contact Number
													</Form.Label>
													<Form.Control
														value={values.contactNumber || "-"}
														readOnly
														disabled
														style={{ borderRadius: 8 }}
													/>
												</Col>

												<Col md={12}>
													<Form.Label style={{ fontWeight: "bold" }}>
														Address
													</Form.Label>
													<Form.Control
														value={values.address || "-"}
														readOnly
														disabled
														style={{ borderRadius: 8 }}
													/>
												</Col>

												<Col md={4}>
													<Form.Label style={{ fontWeight: "bold" }}>
														City
													</Form.Label>
													<Form.Control
														value={values.city || "-"}
														readOnly
														disabled
														style={{ borderRadius: 8 }}
													/>
												</Col>

												<Col md={4}>
													<Form.Label style={{ fontWeight: "bold" }}>
														State
													</Form.Label>
													<Form.Control
														value={values.state || "-"}
														readOnly
														disabled
														style={{ borderRadius: 8 }}
													/>
												</Col>

												<Col md={4}>
													<Form.Label style={{ fontWeight: "bold" }}>
														Country
													</Form.Label>
													<Form.Control
														value={values.country || "-"}
														readOnly
														disabled
														style={{ borderRadius: 8 }}
													/>
												</Col>

												<Col md={4}>
													<Form.Label style={{ fontWeight: "bold" }}>
														Pincode
													</Form.Label>
													<Form.Control
														value={values.pincode || "-"}
														readOnly
														disabled
														style={{ borderRadius: 8 }}
													/>
												</Col>
											</Row>
										</div>

										{/* Items */}
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
												<div style={{ fontWeight: 700 }}>Items Details</div>
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
															<th style={{ width: 70 }}>Sr No</th>
															<th style={{ minWidth: 160 }}>Category</th>
															<th style={{ minWidth: 180 }}>Sub Category</th>
															<th style={{ minWidth: 240 }}>Item Name</th>
															<th style={{ minWidth: 110 }}>Item Code</th>
															<th style={{ minWidth: 90 }}>Unit</th>
															<th style={{ minWidth: 120 }}>Order Qty</th>
															<th style={{ minWidth: 120 }}>Dispatch Qty</th>
															<th style={{ minWidth: 110 }}>Rate</th>
															<th style={{ minWidth: 120 }}>Amount</th>
															<th style={{ minWidth: 110 }}>Disc %</th>
															<th style={{ minWidth: 130 }}>Disc ₹</th>
															<th style={{ minWidth: 90 }}>GST %</th>
															<th style={{ minWidth: 120 }}>GST ₹</th>
															<th style={{ minWidth: 130 }}>Total ₹</th>
														</tr>
													</thead>

													<tbody>
														{(values.items || []).map(
															(row: any, idx: number) => {
																const rr = calcRow(row);
																return (
																	<tr key={idx}>
																		<td className='text-center'>{idx + 1}</td>

																		<td>
																			<Form.Control
																				value={row.itemsCategory || "-"}
																				readOnly
																				disabled
																				style={{ borderRadius: 8 }}
																			/>
																		</td>
																		<td>
																			<Form.Control
																				value={row.itemsSubCategory || "-"}
																				readOnly
																				disabled
																				style={{ borderRadius: 8 }}
																			/>
																		</td>
																		<td>
																			<Form.Control
																				value={row.itemsName || "-"}
																				readOnly
																				disabled
																				style={{ borderRadius: 8 }}
																			/>
																		</td>
																		<td>
																			<Form.Control
																				value={row.itemsCode || "-"}
																				readOnly
																				disabled
																				style={{ borderRadius: 8 }}
																			/>
																		</td>
																		<td>
																			<Form.Control
																				value={row.itemsUnit || "-"}
																				readOnly
																				disabled
																				style={{ borderRadius: 8 }}
																			/>
																		</td>

																		<td>
																			<Form.Control
																				value={row.orderQuantity ?? 0}
																				readOnly
																				disabled
																				style={{ borderRadius: 8 }}
																			/>
																		</td>
																		<td>
																			<Form.Control
																				value={row.dispatchQuantity ?? 0}
																				readOnly
																				disabled
																				style={{ borderRadius: 8 }}
																			/>
																		</td>

																		<td>
																			<Form.Control
																				value={row.rate ?? 0}
																				readOnly
																				disabled
																				style={{ borderRadius: 8 }}
																			/>
																		</td>
																		<td>
																			<Form.Control
																				value={round2(rr.amount)}
																				readOnly
																				disabled
																				style={{ borderRadius: 8 }}
																			/>
																		</td>

																		<td>
																			<Form.Control
																				value={row.discountPercent ?? 0}
																				readOnly
																				disabled
																				style={{ borderRadius: 8 }}
																			/>
																		</td>
																		<td>
																			<Form.Control
																				value={round2(rr.discountAmount)}
																				readOnly
																				disabled
																				style={{ borderRadius: 8 }}
																			/>
																		</td>

																		<td>
																			<Form.Control
																				value={row.gstRate ?? 0}
																				readOnly
																				disabled
																				style={{ borderRadius: 8 }}
																			/>
																		</td>
																		<td>
																			<Form.Control
																				value={round2(rr.gstAmount)}
																				readOnly
																				disabled
																				style={{ borderRadius: 8 }}
																			/>
																		</td>

																		<td>
																			<Form.Control
																				value={round2(rr.totalAmount)}
																				readOnly
																				disabled
																				style={{ borderRadius: 8 }}
																			/>
																		</td>
																	</tr>
																);
															},
														)}
													</tbody>
												</Table>
											</div>
										</div>

										<div className='mt-3 d-flex gap-2'>
											<Button
												type='submit'
												disabled={
													isSubmitting || creating || !dirty || !isValid
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
												<i className='ri-truck-line' />
												{isSubmitting || creating
													? "Creating..."
													: "Create Dispatch"}
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
									</Col>

									{/* RIGHT: Totals */}
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
												<div style={{ fontWeight: 700 }}>Totals</div>
											</div>

											<div className='d-flex justify-content-between mb-2'>
												<div style={{ color: "#6c757d" }}>Sub Total</div>
												<div style={{ fontWeight: 700 }}>
													{round2(t.subtotal)}
												</div>
											</div>

											<div className='d-flex justify-content-between mb-2'>
												<div style={{ color: "#6c757d" }}>Total Discount</div>
												<div style={{ fontWeight: 700 }}>
													{round2(t.totalDiscount)}
												</div>
											</div>

											<div className='d-flex justify-content-between mb-2'>
												<div style={{ color: "#6c757d" }}>Total GST</div>
												<div style={{ fontWeight: 700 }}>
													{round2(t.totalGst)}
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
													{round2(t.grandTotal)}
												</div>
											</div>

											<div
												style={{
													marginTop: 12,
													fontSize: 12,
													color: "#6c757d",
												}}
											>
												All values are fetched from {values.sourceType}{" "}
												(read-only).
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
