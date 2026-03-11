import { useEffect, useMemo } from "react";
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
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import {
	fetchDispatchByIdThunk,
	processSalesReturnThunk,
} from "../../../slices/Warehouse/Dispatch/thunks";
import type {
	Dispatch as DispatchType,
	DispatchItem,
} from "../../../types/Warehouses/dispatch";

const theme = "#1a8376";

type ReturnRow = {
	itemId: string;
	selected: boolean;
	returnQty: string;
	returnRemark: string;
};

type FormValues = {
	items: ReturnRow[];
};

const fmtDate = (val: any) => {
	if (!val) return "-";
	try {
		const d = new Date(val);
		return Number.isNaN(d.getTime()) ? String(val) : d.toLocaleDateString();
	} catch {
		return String(val);
	}
};

const SalesReturnSchema = Yup.object({
	items: Yup.array()
		.of(
			Yup.object({
				itemId: Yup.string().required("Item id required"),
				selected: Yup.boolean().required(),
				returnQty: Yup.string().when("selected", {
					is: true,
					then: (schema) =>
						schema
							.required("Return quantity required")
							.test(
								"is-valid-number",
								"Return quantity must be greater than 0",
								(value) => {
									const n = Number(value);
									return Number.isFinite(n) && n > 0;
								},
							),
					otherwise: (schema) => schema.optional(),
				}),
				returnRemark: Yup.string().optional(),
			}),
		)
		.test(
			"at-least-one-selected",
			"Select at least one item for sales return",
			(value) => Array.isArray(value) && value.some((x) => x.selected),
		),
});

const toInitialValues = (dispatchData: DispatchType | null): FormValues => ({
	items: (dispatchData?.items || []).map((item) => ({
		itemId: item.itemId,
		selected: Number(item.returnQty || 0) > 0,
		returnQty:
			Number(item.returnQty || 0) > 0 ? String(item.returnQty || "") : "",
		returnRemark: item.returnRemark || "",
	})),
});

export default function SalesOrderReturnProcessPage() {
	const dispatch = useDispatch<AppDispatch>();
	const nav = useNavigate();
	const { id } = useParams();

	const dispatchState =
		(useSelector((s: RootState) => (s as any).dispatch) as any) ||
		(useSelector((s: RootState) => (s as any).warehouseDispatch) as any) ||
		{};

	const {
		selected: dispatchData,
		loadingOne = false,
		error = null,
		processingSalesReturn = false,
	} = dispatchState || {};

	useEffect(() => {
		if (id) dispatch(fetchDispatchByIdThunk(id));
	}, [dispatch, id]);

	const initialValues = useMemo(
		() => toInitialValues((dispatchData as DispatchType) || null),
		[dispatchData],
	);

	const itemMap = useMemo(() => {
		const map = new Map<string, DispatchItem>();
		(dispatchData?.items || []).forEach((item: DispatchItem) => {
			map.set(item.itemId, item);
		});
		return map;
	}, [dispatchData]);

	if (loadingOne) {
		return (
			<div className='d-flex justify-content-center py-5'>
				<Spinner animation='border' style={{ color: theme }} />
			</div>
		);
	}

	if (!dispatchData) {
		return <Alert variant='danger'>Dispatch not found</Alert>;
	}

	return (
		<Card>
			<Card.Header
				style={{
					background: "#f7f9fa",
					fontWeight: 700,
					fontSize: "16px",
				}}
			>
				Process Sales Return
			</Card.Header>

			<Card.Body>
				{error && <Alert variant='danger'>{error}</Alert>}

				<Row className='g-3 mb-3'>
					<Col md={4}>
						<div>
							<div className='text-muted small'>Dispatch No</div>
							<div className='fw-semibold'>
								{dispatchData.dispatchNo || dispatchData.dispatchId || "-"}
							</div>
						</div>
					</Col>
					<Col md={4}>
						<div>
							<div className='text-muted small'>Dispatch Date</div>
							<div className='fw-semibold'>
								{fmtDate(dispatchData.dispatchDate)}
							</div>
						</div>
					</Col>
					<Col md={4}>
						<div>
							<div className='text-muted small'>Order No</div>
							<div className='fw-semibold'>{dispatchData.orderNo || "-"}</div>
						</div>
					</Col>
				</Row>

				<Row className='g-3 mb-4'>
					<Col md={4}>
						<div>
							<div className='text-muted small'>Customer Name</div>
							<div className='fw-semibold'>
								{dispatchData.customerName || "-"}
							</div>
						</div>
					</Col>
					<Col md={4}>
						<div>
							<div className='text-muted small'>Contact Person</div>
							<div className='fw-semibold'>
								{dispatchData.contactPerson || "-"}
							</div>
						</div>
					</Col>
					<Col md={4}>
						<div>
							<div className='text-muted small'>Contact Number</div>
							<div className='fw-semibold'>
								{dispatchData.contactNumber || "-"}
							</div>
						</div>
					</Col>
					<Col md={6}>
						<div>
							<div className='text-muted small'>Address</div>
							<div className='fw-semibold'>
								{[
									dispatchData.address,
									dispatchData.city,
									dispatchData.state,
									dispatchData.pincode,
								]
									.filter(Boolean)
									.join(", ") || "-"}
							</div>
						</div>
					</Col>
					<Col md={3}>
						<div>
							<div className='text-muted small'>Transport Name</div>
							<div className='fw-semibold'>
								{dispatchData.transporterName || "-"}
							</div>
						</div>
					</Col>
					<Col md={3}>
						<div>
							<div className='text-muted small'>Issued From Warehouse</div>
							<div className='fw-semibold'>
								{dispatchData.issuedFromWarehouseName || "-"}
							</div>
						</div>
					</Col>
				</Row>

				<Formik<FormValues>
					enableReinitialize
					initialValues={initialValues}
					validationSchema={SalesReturnSchema}
					onSubmit={async (values, { setSubmitting, setFieldError }) => {
						try {
							const payloadItems = values.items
								.filter((row) => row.selected)
								.map((row) => {
									const source = itemMap.get(row.itemId);
									const enteredQty = Number(row.returnQty || 0);
									const dispatchQty = Number(source?.dispatchQuantity || 0);

									if (!Number.isFinite(enteredQty) || enteredQty <= 0) {
										throw new Error("Return quantity must be greater than 0");
									}

									if (enteredQty > dispatchQty) {
										throw new Error(
											`Return quantity cannot exceed dispatch quantity for ${
												source?.itemsName || "selected item"
											}`,
										);
									}

									return {
										itemId: row.itemId,
										returnQty: enteredQty,
										returnRemark: row.returnRemark || "",
									};
								});

							if (!payloadItems.length) {
								throw new Error("Select at least one item for sales return");
							}

							await dispatch(
								processSalesReturnThunk({
									id: String(id),
									payload: {
										items: payloadItems,
									},
								}),
							).unwrap();

							toast.success("Sales return processed successfully");
							nav("/warehouses/inward?tab=PENDING_SALE_RETURN");
						} catch (e: any) {
							const msg = String(e || "Failed to process sales return");
							setFieldError("items", msg);
							toast.error(msg);
						} finally {
							setSubmitting(false);
						}
					}}
				>
					{({
						values,
						errors,
						handleSubmit,
						handleChange,
						handleBlur,
						setFieldValue,
						isSubmitting,
					}) => (
						<Form onSubmit={handleSubmit}>
							<div className='table-responsive'>
								<Table bordered hover align='center'>
									<thead>
										<tr>
											<th style={{ width: 70 }}>Select</th>
											<th>Item</th>
											<th>Code</th>
											<th>Unit</th>
											<th style={{ width: 130 }}>Dispatch Qty</th>
											<th style={{ width: 160 }}>Return Qty</th>
											<th>Return Remark</th>
										</tr>
									</thead>
									<tbody>
										{dispatchData.items?.map(
											(item: DispatchItem, idx: number) => {
												const row = values.items[idx];
												const selected = !!row?.selected;
												const qtyError =
													(values.items?.[idx] as any)?.returnQty &&
													(errors.items?.[idx] as any)?.returnQty;
												return (
													<tr key={item.itemId || idx}>
														<td className='text-center'>
															<Form.Check
																type='checkbox'
																checked={selected}
																onChange={(e) => {
																	const checked = e.target.checked;
																	setFieldValue(
																		`items.${idx}.selected`,
																		checked,
																	);
																	if (!checked) {
																		setFieldValue(`items.${idx}.returnQty`, "");
																		setFieldValue(
																			`items.${idx}.returnRemark`,
																			"",
																		);
																	}
																}}
															/>
														</td>
														<td>{item.itemsName || "-"}</td>
														<td>{item.itemsCode || "-"}</td>
														<td>{item.itemsUnit || "-"}</td>
														<td>{item.dispatchQuantity ?? "-"}</td>
														<td>
															<Form.Control
																type='number'
																min={1}
																max={Number(item.dispatchQuantity || 0)}
																name={`items.${idx}.returnQty`}
																value={row?.returnQty || ""}
																onChange={handleChange}
																onBlur={handleBlur}
																disabled={!selected}
																isInvalid={!!qtyError}
															/>
															<Form.Control.Feedback type='invalid'>
																{String(
																	(errors.items?.[idx] as any)?.returnQty || "",
																)}
															</Form.Control.Feedback>
														</td>
														<td>
															<Form.Control
																type='text'
																name={`items.${idx}.returnRemark`}
																value={row?.returnRemark || ""}
																onChange={handleChange}
																onBlur={handleBlur}
																disabled={!selected}
																placeholder='Enter remark'
															/>
														</td>
													</tr>
												);
											},
										)}
									</tbody>
								</Table>
							</div>

							{typeof errors.items === "string" && (
								<Alert variant='danger' className='mt-3 mb-0'>
									{errors.items}
								</Alert>
							)}

							<div className='d-flex justify-content-end gap-2 mt-3'>
								<Button
									variant='light'
									onClick={() => nav("/warehouses/dispatch")}
									type='button'
								>
									Cancel
								</Button>

								<Button
									type='submit'
									disabled={isSubmitting || processingSalesReturn}
									style={{
										background: theme,
										border: "none",
									}}
								>
									{isSubmitting || processingSalesReturn
										? "Processing..."
										: "Process Return"}
								</Button>
							</div>
						</Form>
					)}
				</Formik>
			</Card.Body>
		</Card>
	);
}
