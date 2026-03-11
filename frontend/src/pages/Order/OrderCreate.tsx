import { useEffect, useMemo } from "react";
import { Button, Form, Alert, Row, Col, Spinner, Card } from "react-bootstrap";
import { Formik } from "formik";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../slices/store";
import { fetchItemsThunk } from "../../slices/Masters/items/thunks";
import { createOrderThunk } from "../../slices/orders/thunks";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import type { Item } from "../../types/Masters/item";

const theme = "#1a8376";

const Schema = Yup.object({
	orderDate: Yup.string().required("Order date required"),
	customerName: Yup.string().required("Customer name required"),
	category: Yup.string().required("Category required"),
	itemId: Yup.string().required("Select an item"),
	unit: Yup.string().required("Unit required"),
	quantity: Yup.number()
		.typeError("Qty must be number")
		.min(1, "Min 1")
		.required("Qty required"),
});

export default function OrderCreate() {
	const dispatch = useDispatch<AppDispatch>();
	const nav = useNavigate();

	const { items } = useSelector((s: RootState) => s.items);
	const { creating, error } = useSelector((s: RootState) => s.orders);

	useEffect(() => {
		dispatch(fetchItemsThunk());
	}, [dispatch]);

	const itemsSafe = useMemo(() => (Array.isArray(items) ? items : []), [items]);

	return (
		<>
			<Card
				className='p-3'
				style={{
					border: "1px solid #e9ebec",
					borderRadius: "8px",
				}}
			>
				{/*   Template-style page header */}
				<div className='d-flex justify-content-between align-items-center mb-3'>
					<div>
						<h5 className='m-0'>Create Order</h5>
						<div style={{ fontSize: 13, color: "#6c757d", marginTop: 2 }}>
							Add a new order with item details
						</div>
					</div>

					<Button
						variant='light'
						size='sm'
						onClick={() => nav("/orders")}
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

				{error && <Alert variant='danger'>{error}</Alert>}

				<Formik
					initialValues={{
						orderDate: new Date().toISOString().slice(0, 10),
						customerName: "",
						category: "",
						itemId: "",
						itemName: "",
						itemCode: "",
						unit: "meter",
						quantity: 1,
						remark: "",
					}}
					validationSchema={Schema}
					onSubmit={async (values) => {
						const res = await dispatch(
							createOrderThunk({
								orderDate: values.orderDate,
								customerName: values.customerName,
								category: values.category,
								itemId: values.itemId,
								itemName: values.itemName,
								itemCode: values.itemCode,
								unit: values.unit,
								quantity: Number(values.quantity),
								remark: values.remark || "",
							}),
						);

						if (createOrderThunk.fulfilled.match(res)) {
							toast.success("Order created");
							nav("/orders", { replace: true });
						} else {
							toast.error(String(res.payload || "Create order failed"));
						}
					}}
				>
					{({
						handleSubmit,
						handleChange,
						values,
						setFieldValue,
						touched,
						errors,
					}) => (
						<Form onSubmit={handleSubmit}>
							<Row className='g-3'>
								<Col md={4}>
									<Form.Label style={{ fontWeight: "bold" }}>
										Order Date
									</Form.Label>
									<Form.Control
										type='date'
										name='orderDate'
										value={values.orderDate}
										onChange={handleChange}
										isInvalid={!!touched.orderDate && !!errors.orderDate}
										style={{ borderRadius: 8 }}
									/>
									<Form.Control.Feedback type='invalid'>
										{errors.orderDate}
									</Form.Control.Feedback>
								</Col>

								<Col md={4}>
									<Form.Label style={{ fontWeight: "bold" }}>
										Customer Name
									</Form.Label>
									<Form.Control
										name='customerName'
										value={values.customerName}
										onChange={handleChange}
										placeholder='Enter customer name'
										isInvalid={!!touched.customerName && !!errors.customerName}
										style={{ borderRadius: 8 }}
									/>
									<Form.Control.Feedback type='invalid'>
										{errors.customerName}
									</Form.Control.Feedback>
								</Col>

								<Col md={4}>
									<Form.Label style={{ fontWeight: "bold" }}>
										Category
									</Form.Label>
									<Form.Control
										name='category'
										value={values.category}
										onChange={handleChange}
										placeholder='Enter category'
										isInvalid={!!touched.category && !!errors.category}
										style={{ borderRadius: 8 }}
									/>
									<Form.Control.Feedback type='invalid'>
										{errors.category}
									</Form.Control.Feedback>
								</Col>

								<Col md={6}>
									<Form.Label style={{ fontWeight: "bold" }}>Item</Form.Label>
									<Form.Select
										name='itemId'
										value={values.itemId}
										onChange={(e) => {
											const id = e.target.value;
											setFieldValue("itemId", id);

											const it = itemsSafe.find(
												(x: any) => (x.id || x._id) === id,
											) as Item | undefined;

											setFieldValue("itemName", it?.itemName || "");
											setFieldValue("itemCode", it?.itemCode || "");
											setFieldValue("unit", it?.unit || "meter");
										}}
										isInvalid={!!touched.itemId && !!errors.itemId}
										style={{ borderRadius: 8 }}
									>
										<option value=''>-- Select Item --</option>
										{itemsSafe.map((it: any) => {
											const id = it.id || it._id;
											return (
												<option key={id} value={id}>
													{it.itemName} ({it.itemCode})
												</option>
											);
										})}
									</Form.Select>
									<Form.Control.Feedback type='invalid'>
										{errors.itemId}
									</Form.Control.Feedback>
								</Col>

								<Col md={3}>
									<Form.Label style={{ fontWeight: "bold" }}>
										Item Code
									</Form.Label>
									<Form.Control
										value={values.itemCode}
										readOnly
										style={{ borderRadius: 8 }}
									/>
								</Col>

								<Col md={3}>
									<Form.Label style={{ fontWeight: "bold" }}>Unit</Form.Label>
									<Form.Control
										value={values.unit}
										readOnly
										style={{ borderRadius: 8 }}
									/>
								</Col>

								<Col md={3}>
									<Form.Label style={{ fontWeight: "bold" }}>
										Quantity
									</Form.Label>
									<Form.Control
										name='quantity'
										type='number'
										value={values.quantity}
										onChange={handleChange}
										isInvalid={!!touched.quantity && !!errors.quantity}
										style={{ borderRadius: 8 }}
									/>
									<Form.Control.Feedback type='invalid'>
										{errors.quantity}
									</Form.Control.Feedback>
								</Col>

								<Col md={9}>
									<Form.Label style={{ fontWeight: "bold" }}>Remark</Form.Label>
									<Form.Control
										name='remark'
										value={values.remark}
										onChange={handleChange}
										placeholder='Enter remark'
										style={{ borderRadius: 8 }}
									/>
								</Col>
							</Row>

							<div className='mt-4 d-flex gap-2'>
								<Button
									type='submit'
									disabled={creating || !values.itemId}
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
									<i className='ri-add-circle-line' />
									{creating ? "Adding..." : "Add Order"}
								</Button>

								<Button
									variant='light'
									onClick={() => nav("/orders")}
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

							{/* Optional: show spinner state inline if you want */}
							{creating && (
								<div className='d-flex align-items-center gap-2 mt-3'>
									<Spinner
										animation='border'
										size='sm'
										style={{ color: theme }}
									/>
									<span style={{ fontSize: 13, color: "#6c757d" }}>
										Saving order...
									</span>
								</div>
							)}
						</Form>
					)}
				</Formik>
			</Card>
		</>
	);
}
