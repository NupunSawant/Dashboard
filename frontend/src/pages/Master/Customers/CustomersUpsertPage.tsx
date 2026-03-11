// customersUpsertPage.tsx (CustomerUpsertPage)

import { useEffect } from "react";
import { Card, Button, Spinner, Form, Row, Col } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { Formik } from "formik";
import * as Yup from "yup";
import type { AppDispatch, RootState } from "../../../slices/store";
import {
	createCustomerThunk,
	getCustomerThunk,
	updateCustomerThunk,
} from "../../../slices/Masters/customers/thunks";
import { clearSelected } from "../../../slices/Masters/customers/reducer";
import React from "react";
import { toast } from "react-toastify";
import { Country, State, City } from "country-state-city";

const theme = "#1a8376";

const Schema = Yup.object({
	customerName: Yup.string().required("Customer name required"),
	companyName: Yup.string().required("Company name required"),
	customerType: Yup.string().required("Customer type required"),

	customerEmail: Yup.string()
		.required("Customer email required")
		.email("Invalid email"),
	customerPhone: Yup.number()
		.typeError("Phone must be a number")
		.required("Customer phone required"),

	customerAadhar: Yup.string().required("Customer Aadhar required"),
	customerGst: Yup.string().required("Customer GST required"),

	customerContactPersonName: Yup.string().optional(),
	customerContactPersonPhone: Yup.number()
		.typeError("Contact phone must be a number")
		.optional(),

	customerAddress: Yup.string().required("Customer address required"),
	customerState: Yup.string().required("Customer state required"),
	customerCity: Yup.string().required("Customer city required"),
	customerPincode: Yup.string().required("Customer pincode required"),
});

export default function CustomerUpsertPage() {
	const dispatch = useDispatch<AppDispatch>();
	const nav = useNavigate();
	const { id } = useParams();
	const isEdit = !!id;

	const { selected, loadingOne } = useSelector((s: RootState) => s.customers);

	const [initialValues, setInitialValues] = React.useState({
		customerName: "",
		companyName: "",
		customerType: "",
		customerEmail: "",
		customerPhone: "" as any, // keep string in input, convert to number in payload

		customerAadhar: "",
		customerGst: "",

		customerContactPersonName: "",
		customerContactPersonPhone: "" as any, // input string

		customerAddress: "",
		customerState: "",
		customerCity: "",
		customerPincode: "",
	});

	useEffect(() => {
		if (isEdit && id) {
			dispatch(getCustomerThunk(id));
		}
		return () => {
			dispatch(clearSelected());
		};
	}, [dispatch, id, isEdit]);

	useEffect(() => {
		if (selected) {
			setInitialValues({
				customerName: (selected as any).customerName ?? "",
				companyName: (selected as any).companyName ?? "",
				customerType: (selected as any).customerType ?? "",
				customerEmail: (selected as any).customerEmail ?? "",
				customerPhone:
					(selected as any).customerPhone !== undefined &&
					(selected as any).customerPhone !== null
						? String((selected as any).customerPhone)
						: "",

				customerAadhar: (selected as any).customerAadhar ?? "",
				customerGst: (selected as any).customerGst ?? "",

				customerContactPersonName:
					(selected as any).customerContactPersonName ?? "",
				customerContactPersonPhone:
					(selected as any).customerContactPersonPhone !== undefined &&
					(selected as any).customerContactPersonPhone !== null
						? String((selected as any).customerContactPersonPhone)
						: "",

				customerAddress: (selected as any).customerAddress ?? "",
				customerState: (selected as any).customerState ?? "",
				customerCity: (selected as any).customerCity ?? "",
				customerPincode: (selected as any).customerPincode ?? "",
			});
		}
	}, [selected]);

	return (
		<Card
			className='p-3'
			style={{
				border: "1px solid #e9ebec",
				borderRadius: "10px",
			}}
		>
			{/* Header */}
			<div className='d-flex justify-content-between align-items-center mb-3'>
				<div>
					<h5 className='m-0'>
						{isEdit ? "Edit Customer" : "Create Customer"}
					</h5>
					<div style={{ fontSize: 13, color: "#6c757d", marginTop: 2 }}>
						{isEdit ? "Update customer details" : "Add a new customer"}
					</div>
				</div>

				<Button
					variant='light'
					size='sm'
					onClick={() => nav("/masters/customers")}
					style={{
						border: "1px solid #e9ebec",
						fontSize: "13px",
						borderRadius: "6px",
						display: "inline-flex",
						alignItems: "center",
						gap: "6px",
					}}
				>
					<i className='ri-arrow-left-line' /> Back to List
				</Button>
			</div>

			{loadingOne ? (
				<div className='d-flex justify-content-center py-5'>
					<Spinner animation='border' style={{ color: theme }} />
				</div>
			) : (
				<Formik
					enableReinitialize
					initialValues={initialValues}
					validationSchema={Schema}
					onSubmit={async (values, { setSubmitting }) => {
						const payload = {
							customerName: values.customerName.trim(),
							companyName: values.companyName?.trim() || undefined,
							customerType: values.customerType?.trim() || undefined,
							customerEmail: values.customerEmail.trim(),
							customerPhone: Number(values.customerPhone),

							customerAadhar: values.customerAadhar?.trim() || undefined,
							customerGst: values.customerGst?.trim() || undefined,

							customerContactPersonName:
								values.customerContactPersonName?.trim() || undefined,
							customerContactPersonPhone:
								values.customerContactPersonPhone !== "" &&
								values.customerContactPersonPhone !== null &&
								values.customerContactPersonPhone !== undefined
									? Number(values.customerContactPersonPhone)
									: undefined,

							customerAddress: values.customerAddress?.trim() || undefined,
							customerState: values.customerState?.trim() || undefined,
							customerCity: values.customerCity?.trim() || undefined,
							customerPincode: values.customerPincode?.trim() || undefined,
						};

						if (isEdit) {
							const res = await dispatch(
								updateCustomerThunk({ id: id!, payload }),
							);
							if (updateCustomerThunk.fulfilled.match(res)) {
								toast.success("Customer updated");
								nav("/masters/customers", { replace: true });
							} else {
								toast.error(String(res.payload || "Update failed"));
							}
						} else {
							const res = await dispatch(createCustomerThunk(payload));
							if (createCustomerThunk.fulfilled.match(res)) {
								toast.success("Customer created");
								nav("/masters/customers", { replace: true });
							} else {
								toast.error(String(res.payload || "Create failed"));
							}
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
						setFieldValue,
					}) => {
						// Always fixed to India
						const countryIsoCode = "IN";

						// Get all states of India
						const states = State.getStatesOfCountry(countryIsoCode);

						// Find selected state object
						const stateObj = states.find((s) => s.name === values.customerState);

						// Get cities based on selected state
						const cities = stateObj
							? City.getCitiesOfState(countryIsoCode, stateObj.isoCode)
							: [];
						return (
							<Form onSubmit={handleSubmit}>
								<Row className='g-3'>
									<Col md={6}>
										<Form.Label style={{ fontWeight: "bold" }}>
											Customer Name
										</Form.Label>
										<Form.Control
											name='customerName'
											value={values.customerName}
											onChange={handleChange}
											placeholder='Enter customer name'
											isInvalid={
												!!touched.customerName && !!errors.customerName
											}
											style={{ borderRadius: 8 }}
										/>
										<Form.Control.Feedback type='invalid'>
											{errors.customerName as any}
										</Form.Control.Feedback>
									</Col>

									<Col md={6}>
										<Form.Label style={{ fontWeight: "bold" }}>
											Company Name
										</Form.Label>
										<Form.Control
											name='companyName'
											value={values.companyName}
											onChange={handleChange}
											placeholder='Enter company name'
											style={{ borderRadius: 8 }}
											isInvalid={!!touched.companyName && !!errors.companyName}
										/>
										<Form.Control.Feedback type='invalid'>
											{errors.companyName as any}
										</Form.Control.Feedback>
									</Col>

									<Col md={6}>
										<Form.Label style={{ fontWeight: "bold" }}>
											Customer Type
										</Form.Label>
										<Form.Control
											name='customerType'
											value={values.customerType}
											onChange={handleChange}
											placeholder='Enter customer type'
											style={{ borderRadius: 8 }}
											isInvalid={
												!!touched.customerType && !!errors.customerType
											}
										/>
										<Form.Control.Feedback type='invalid'>
											{errors.customerType as any}
										</Form.Control.Feedback>
									</Col>

									<Col md={6}>
										<Form.Label style={{ fontWeight: "bold" }}>
											Email
										</Form.Label>
										<Form.Control
											name='customerEmail'
											value={values.customerEmail}
											onChange={handleChange}
											placeholder='Enter email'
											isInvalid={
												!!touched.customerEmail && !!errors.customerEmail
											}
											style={{ borderRadius: 8 }}
										/>
										<Form.Control.Feedback type='invalid'>
											{errors.customerEmail as any}
										</Form.Control.Feedback>
									</Col>

									<Col md={6}>
										<Form.Label style={{ fontWeight: "bold" }}>
											Phone
										</Form.Label>
										<Form.Control
											name='customerPhone'
											value={values.customerPhone}
											onChange={handleChange}
											placeholder='Enter phone'
											isInvalid={
												!!touched.customerPhone && !!errors.customerPhone
											}
											style={{ borderRadius: 8 }}
										/>
										<Form.Control.Feedback type='invalid'>
											{errors.customerPhone as any}
										</Form.Control.Feedback>
									</Col>

									<Col md={6}>
										<Form.Label style={{ fontWeight: "bold" }}>
											Aadhar Number
										</Form.Label>
										<Form.Control
											name='customerAadhar'
											value={values.customerAadhar}
											onChange={handleChange}
											placeholder='Enter aadhar'
											style={{ borderRadius: 8 }}
											isInvalid={
												!!touched.customerAadhar && !!errors.customerAadhar
											}
										/>
										<Form.Control.Feedback type='invalid'>
											{errors.customerAadhar as any}
										</Form.Control.Feedback>
									</Col>

									<Col md={6}>
										<Form.Label style={{ fontWeight: "bold" }}>GST</Form.Label>
										<Form.Control
											name='customerGst'
											value={values.customerGst}
											onChange={handleChange}
											placeholder='Enter GST'
											style={{ borderRadius: 8 }}
											isInvalid={!!touched.customerGst && !!errors.customerGst}
										/>
										<Form.Control.Feedback type='invalid'>
											{errors.customerGst as any}
										</Form.Control.Feedback>
									</Col>

									<Col md={12}>
										<Form.Label style={{ fontWeight: "bold" }}>
											Address
										</Form.Label>
										<Form.Control
											name='customerAddress'
											value={values.customerAddress}
											onChange={handleChange}
											placeholder='Enter address'
											style={{ borderRadius: 8 }}
											isInvalid={
												!!touched.customerAddress && !!errors.customerAddress
											}
										/>
										<Form.Control.Feedback type='invalid'>
											{errors.customerAddress as any}
										</Form.Control.Feedback>
									</Col>

									<Col md={4}>
										<Form.Label style={{ fontWeight: "bold" }}>
											State
										</Form.Label>
										<Form.Select
											name='customerState'
											value={values.customerState}
											onChange={(e) => {
												const val = e.target.value;
												setFieldValue("customerState", val);
												setFieldValue("customerCity", "");
											}}
											style={{ borderRadius: 8 }}
											isInvalid={
												!!touched.customerState && !!errors.customerState
											}
										>
											<option value=''>Select State</option>
											{states.map((c) => (
												<option key={c.isoCode} value={c.name}>
													{c.name}
												</option>
											))}
										</Form.Select>
										<Form.Control.Feedback type='invalid'>
											{errors.customerState as any}
										</Form.Control.Feedback>
									</Col>

									<Col md={4}>
										<Form.Label style={{ fontWeight: "bold" }}>City</Form.Label>
										<Form.Select
											name='customerCity'
											value={values.customerCity}
											onChange={handleChange}
											style={{ borderRadius: 8 }}
											isInvalid={
												!!touched.customerCity && !!errors.customerCity
											}
										>
											<option value=''>Select City</option>
											{cities.map((c) => (
												<option key={c.name} value={c.name}>
													{c.name}
												</option>
											))}
										</Form.Select>
										<Form.Control.Feedback type='invalid'>
											{errors.customerCity as any}
										</Form.Control.Feedback>
									</Col>

									<Col md={4}>
										<Form.Label style={{ fontWeight: "bold" }}>
											Pincode
										</Form.Label>
										<Form.Control
											name='customerPincode'
											value={values.customerPincode}
											onChange={handleChange}
											placeholder='Enter pincode'
											style={{ borderRadius: 8 }}
											isInvalid={
												!!touched.customerPincode && !!errors.customerPincode
											}
										/>
										<Form.Control.Feedback type='invalid'>
											{errors.customerPincode as any}
										</Form.Control.Feedback>
									</Col>
								</Row>
								<Row className='g-3 mt-1'>
									<Col md={6}>
										<Form.Label style={{ fontWeight: "bold" }}>
											Contact Person Name
										</Form.Label>
										<Form.Control
											name='customerContactPersonName'
											value={values.customerContactPersonName}
											onChange={handleChange}
											placeholder='Enter contact person name'
											style={{ borderRadius: 8 }}
											isInvalid={
												!!touched.customerContactPersonName &&
												!!errors.customerContactPersonName
											}
										/>
									</Col>

									<Col md={6}>
										<Form.Label style={{ fontWeight: "bold" }}>
											Contact Person Phone
										</Form.Label>
										<Form.Control
											name='customerContactPersonPhone'
											value={values.customerContactPersonPhone}
											onChange={handleChange}
											placeholder='Enter contact person phone'
											style={{ borderRadius: 8 }}
										/>
									</Col>
								</Row>
								{/* Actions */}
								<div className='mt-4 d-flex gap-2'>
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
										<i
											className={
												isEdit ? "ri-save-3-line" : "ri-add-circle-line"
											}
										/>
										{isSubmitting
											? isEdit
												? "Updating..."
												: "Creating..."
											: isEdit
												? "Update"
												: "Create"}
									</Button>

									<Button
										variant='light'
										onClick={() => nav("/masters/customers")}
										disabled={isSubmitting}
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
