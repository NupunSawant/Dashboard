// SupplierUpsertPage.tsx

import { useEffect } from "react";
import { Card, Button, Spinner, Form, Row, Col } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { Formik } from "formik";
import * as Yup from "yup";
import type { AppDispatch, RootState } from "../../../slices/store";
import {
	createSupplierThunk,
	getSupplierThunk,
	updateSupplierThunk,
} from "../../../slices/Masters/suppliers/thunks";
import { clearSelected } from "../../../slices/Masters/suppliers/reducer";
import React from "react";
import { toast } from "react-toastify";
import { Country, State, City } from "country-state-city";

const theme = "#1a8376";

const Schema = Yup.object({
	supplierName: Yup.string().required("Supplier name required"),
	supplierCode: Yup.string().required("Supplier code required"),
	supplierEmail: Yup.string()
		.email("Invalid email")
		.required("Supplier email required"),
	supplierPhone: Yup.string().required("Supplier phone required"),
	supplierGstNo: Yup.string().required("Supplier GST number required"),
	supplierAddress: Yup.string().required("Supplier address required"),
	supplierCity: Yup.string().required("Supplier city required"),
	supplierState: Yup.string().required("Supplier state required"),
	supplierPincode: Yup.string().required("Supplier pincode required"),
	supplierCountry: Yup.string().required("Supplier country required"),
	supplierContactPerson: Yup.string().required(
		"Supplier contact person required",
	),
	supplierContactPersonPhone: Yup.string().required(
		"Supplier contact person phone required",
	),
	supplierTransporterName1: Yup.string().optional(),
	supplierTransporterPhone1: Yup.string().optional(),
	supplierTransporterContactPerson1: Yup.string().optional(),
	supplierTransporterContactPerson1Phone: Yup.string().optional(),
	supplierTransporterName2: Yup.string().optional(),
	supplierTransporterPhone2: Yup.string().optional(),
	supplierTransporterContactPerson2: Yup.string().optional(),
	supplierTransporterContactPerson2Phone: Yup.string().optional(),
});

export default function SupplierUpsertPage() {
	const dispatch = useDispatch<AppDispatch>();
	const nav = useNavigate();
	const { id } = useParams();
	const isEdit = !!id;

	const { selected, loadingOne } = useSelector((s: RootState) => s.suppliers);

	const [initialValues, setInitialValues] = React.useState({
		supplierName: "",
		supplierCode: "",
		supplierEmail: "",
		supplierPhone: "",
		supplierGstNo: "",
		supplierAddress: "",
		supplierCity: "",
		supplierState: "",
		supplierPincode: "",
		supplierCountry: "",
		supplierContactPerson: "",
		supplierContactPersonPhone: "",
		supplierTransporterName1: "",
		supplierTransporterPhone1: "",
		supplierTransporterContactPerson1: "",
		supplierTransporterContactPerson1Phone: "",
		supplierTransporterName2: "",
		supplierTransporterPhone2: "",
		supplierTransporterContactPerson2: "",
		supplierTransporterContactPerson2Phone: "",
	});

	useEffect(() => {
		if (isEdit && id) {
			dispatch(getSupplierThunk(id));
		}
		return () => {
			dispatch(clearSelected());
		};
	}, [dispatch, id, isEdit]);

	useEffect(() => {
		if (selected) {
			setInitialValues({
				supplierName: selected.name ?? "",
				supplierCode: selected.code ?? "",
				supplierEmail: selected.email ?? "",
				supplierPhone: selected.phone ?? "",
				supplierGstNo: selected.gstNo ?? "",
				supplierAddress: selected.address ?? "",
				supplierCity: selected.city ?? "",
				supplierState: selected.state ?? "",
				supplierPincode: selected.pincode ?? "",
				supplierCountry: selected.country ?? "",
				supplierContactPerson: selected.contactPerson ?? "",
				supplierContactPersonPhone: selected.contactPersonPhone ?? "",
				supplierTransporterName1: selected.transporterName1 ?? "",
				supplierTransporterPhone1: selected.transporterPhone1 ?? "",
				supplierTransporterContactPerson1:
					selected.transporterContactPerson1 ?? "",
				supplierTransporterContactPerson1Phone:
					selected.transporterContactPerson1Phone ?? "",
				supplierTransporterName2: selected.transporterName2 ?? "",
				supplierTransporterPhone2: selected.transporterPhone2 ?? "",
				supplierTransporterContactPerson2:
					selected.transporterContactPerson2 ?? "",
				supplierTransporterContactPerson2Phone:
					selected.transporterContactPerson2Phone ?? "",
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
						{isEdit ? "Edit Supplier" : "Create Supplier"}
					</h5>
					<div style={{ fontSize: 13, color: "#6c757d", marginTop: 2 }}>
						{isEdit ? "Update supplier details" : "Add a new supplier"}
					</div>
				</div>

				<Button
					variant='light'
					size='sm'
					onClick={() => nav("/masters/suppliers")}
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
							supplierName: values.supplierName.trim(),
							supplierCode: values.supplierCode.trim(),
							supplierEmail: values.supplierEmail.trim(),
							supplierPhone: values.supplierPhone.trim(),
							supplierGstNo: values.supplierGstNo.trim(),
							supplierAddress: values.supplierAddress.trim(),
							supplierCity: values.supplierCity.trim(),
							supplierState: values.supplierState.trim(),
							supplierPincode: values.supplierPincode.trim(),
							supplierCountry: values.supplierCountry.trim(),
							supplierContactPerson: values.supplierContactPerson.trim(),
							supplierContactPersonPhone:
								values.supplierContactPersonPhone.trim(),
							supplierTransporterName1:
								values.supplierTransporterName1.trim() || undefined,
							supplierTransporterPhone1:
								values.supplierTransporterPhone1.trim() || undefined,
							supplierTransporterContactPerson1:
								values.supplierTransporterContactPerson1.trim() || undefined,
							supplierTransporterContactPerson1Phone:
								values.supplierTransporterContactPerson1Phone.trim() ||
								undefined,
							supplierTransporterName2:
								values.supplierTransporterName2.trim() || undefined,
							supplierTransporterPhone2:
								values.supplierTransporterPhone2.trim() || undefined,
							supplierTransporterContactPerson2:
								values.supplierTransporterContactPerson2.trim() || undefined,
							supplierTransporterContactPerson2Phone:
								values.supplierTransporterContactPerson2Phone.trim() ||
								undefined,
						};

						if (isEdit) {
							const res = await dispatch(
								updateSupplierThunk({ id: id!, payload }),
							);
							if (updateSupplierThunk.fulfilled.match(res)) {
								toast.success("Supplier updated successfully");
								nav("/masters/suppliers", { replace: true });
							} else {
								toast.error(
									(res.payload as string) || "Failed to update supplier",
								);
							}
						} else {
							const res = await dispatch(createSupplierThunk(payload));
							if (createSupplierThunk.fulfilled.match(res)) {
								toast.success("Supplier created successfully");
								nav("/masters/suppliers", { replace: true });
							} else {
								toast.error(
									(res.payload as string) || "Failed to create supplier",
								);
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
						const countries = Country.getAllCountries();

						// We keep storing NAME in form values to avoid backend changes.
						const countryObj = countries.find(
							(c) => c.name === values.supplierCountry,
						);

						const states = countryObj
							? State.getStatesOfCountry(countryObj.isoCode)
							: [];

						const stateObj = states.find(
							(s) => s.name === values.supplierState,
						);

						const cities =
							countryObj && stateObj
								? City.getCitiesOfState(countryObj.isoCode, stateObj.isoCode)
								: [];

						return (
							<Form onSubmit={handleSubmit}>
								<Row className='g-3'>
									{/* Main details */}
									<Col md={6}>
										<Form.Label style={{ fontWeight: "bold" }}>
											Supplier Name
										</Form.Label>
										<Form.Control
											name='supplierName'
											value={values.supplierName}
											onChange={handleChange}
											placeholder='Enter supplier name'
											isInvalid={
												!!touched.supplierName && !!errors.supplierName
											}
											style={{ borderRadius: 8 }}
										/>
										<Form.Control.Feedback type='invalid'>
											{errors.supplierName as any}
										</Form.Control.Feedback>
									</Col>

									<Col md={6}>
										<Form.Label style={{ fontWeight: "bold" }}>
											Supplier Code
										</Form.Label>
										<Form.Control
											name='supplierCode'
											value={values.supplierCode}
											onChange={handleChange}
											placeholder='Enter supplier code'
											isInvalid={
												!!touched.supplierCode && !!errors.supplierCode
											}
											style={{ borderRadius: 8 }}
										/>
										<Form.Control.Feedback type='invalid'>
											{errors.supplierCode as any}
										</Form.Control.Feedback>
									</Col>

									<Col md={6}>
										<Form.Label style={{ fontWeight: "bold" }}>
											Supplier Email
										</Form.Label>
										<Form.Control
											name='supplierEmail'
											type='email'
											value={values.supplierEmail}
											onChange={handleChange}
											placeholder='Enter supplier email'
											isInvalid={
												!!touched.supplierEmail && !!errors.supplierEmail
											}
											style={{ borderRadius: 8 }}
										/>
										<Form.Control.Feedback type='invalid'>
											{errors.supplierEmail as any}
										</Form.Control.Feedback>
									</Col>

									<Col md={6}>
										<Form.Label style={{ fontWeight: "bold" }}>
											Supplier Phone
										</Form.Label>
										<Form.Control
											name='supplierPhone'
											value={values.supplierPhone}
											onChange={handleChange}
											placeholder='Enter supplier phone'
											isInvalid={
												!!touched.supplierPhone && !!errors.supplierPhone
											}
											style={{ borderRadius: 8 }}
										/>
										<Form.Control.Feedback type='invalid'>
											{errors.supplierPhone as any}
										</Form.Control.Feedback>
									</Col>

									<Col md={6}>
										<Form.Label style={{ fontWeight: "bold" }}>
											Supplier GST No.
										</Form.Label>
										<Form.Control
											name='supplierGstNo'
											value={values.supplierGstNo}
											onChange={handleChange}
											placeholder='Enter supplier GST number'
											isInvalid={
												!!touched.supplierGstNo && !!errors.supplierGstNo
											}
											style={{ borderRadius: 8 }}
										/>
										<Form.Control.Feedback type='invalid'>
											{errors.supplierGstNo as any}
										</Form.Control.Feedback>
									</Col>

									<Col md={6}>
										<Form.Label style={{ fontWeight: "bold" }}>
											Supplier Address
										</Form.Label>
										<Form.Control
											name='supplierAddress'
											value={values.supplierAddress}
											onChange={handleChange}
											placeholder='Enter supplier address'
											isInvalid={
												!!touched.supplierAddress && !!errors.supplierAddress
											}
											style={{ borderRadius: 8 }}
										/>
										<Form.Control.Feedback type='invalid'>
											{errors.supplierAddress as any}
										</Form.Control.Feedback>
									</Col>

									{/* UPDATED: Country / State / City as dependent dropdowns */}

									<Col md={6}>
										<Form.Label style={{ fontWeight: "bold" }}>
											Supplier Country
										</Form.Label>
										<Form.Select
											name='supplierCountry'
											value={values.supplierCountry}
											onChange={(e) => {
												const val = e.target.value;
												setFieldValue("supplierCountry", val);
												setFieldValue("supplierState", "");
												setFieldValue("supplierCity", "");
											}}
											isInvalid={
												!!touched.supplierCountry && !!errors.supplierCountry
											}
											style={{ borderRadius: 8 }}
										>
											<option value=''>Select Country</option>
											{countries.map((c) => (
												<option key={c.isoCode} value={c.name}>
													{c.name}
												</option>
											))}
										</Form.Select>
										<Form.Control.Feedback type='invalid'>
											{errors.supplierCountry as any}
										</Form.Control.Feedback>
									</Col>

									<Col md={6}>
										<Form.Label style={{ fontWeight: "bold" }}>
											Supplier State
										</Form.Label>
										<Form.Select
											name='supplierState'
											value={values.supplierState}
											onChange={(e) => {
												const val = e.target.value;
												setFieldValue("supplierState", val);
												setFieldValue("supplierCity", "");
											}}
											disabled={!values.supplierCountry}
											isInvalid={
												!!touched.supplierState && !!errors.supplierState
											}
											style={{ borderRadius: 8 }}
										>
											<option value=''>
												{values.supplierCountry
													? "Select State"
													: "Select Country first"}
											</option>
											{states.map((s) => (
												<option key={s.isoCode} value={s.name}>
													{s.name}
												</option>
											))}
										</Form.Select>
										<Form.Control.Feedback type='invalid'>
											{errors.supplierState as any}
										</Form.Control.Feedback>
									</Col>

									<Col md={6}>
										<Form.Label style={{ fontWeight: "bold" }}>
											Supplier City
										</Form.Label>
										<Form.Select
											name='supplierCity'
											value={values.supplierCity}
											onChange={(e) =>
												setFieldValue("supplierCity", e.target.value)
											}
											disabled={
												!values.supplierCountry || !values.supplierState
											}
											isInvalid={
												!!touched.supplierCity && !!errors.supplierCity
											}
											style={{ borderRadius: 8 }}
										>
											<option value=''>
												{values.supplierState
													? "Select City"
													: "Select State first"}
											</option>
											{cities.map((c) => (
												<option
													key={`${c.name}-${c.latitude}-${c.longitude}`}
													value={c.name}
												>
													{c.name}
												</option>
											))}
										</Form.Select>
										<Form.Control.Feedback type='invalid'>
											{errors.supplierCity as any}
										</Form.Control.Feedback>
									</Col>

									<Col md={6}>
										<Form.Label style={{ fontWeight: "bold" }}>
											Supplier Pincode
										</Form.Label>
										<Form.Control
											name='supplierPincode'
											value={values.supplierPincode}
											onChange={handleChange}
											placeholder='Enter supplier pincode'
											isInvalid={
												!!touched.supplierPincode && !!errors.supplierPincode
											}
											style={{ borderRadius: 8 }}
										/>
										<Form.Control.Feedback type='invalid'>
											{errors.supplierPincode as any}
										</Form.Control.Feedback>
									</Col>

									<Col md={6}>
										<Form.Label style={{ fontWeight: "bold" }}>
											Supplier Contact Person
										</Form.Label>
										<Form.Control
											name='supplierContactPerson'
											value={values.supplierContactPerson}
											onChange={handleChange}
											placeholder='Enter supplier contact person name'
											isInvalid={
												!!touched.supplierContactPerson &&
												!!errors.supplierContactPerson
											}
											style={{ borderRadius: 8 }}
										/>
										<Form.Control.Feedback type='invalid'>
											{errors.supplierContactPerson as any}
										</Form.Control.Feedback>
									</Col>

									<Col md={6}>
										<Form.Label style={{ fontWeight: "bold" }}>
											Supplier Contact Person Phone
										</Form.Label>
										<Form.Control
											name='supplierContactPersonPhone'
											value={values.supplierContactPersonPhone}
											onChange={handleChange}
											placeholder='Enter supplier contact person phone'
											isInvalid={
												!!touched.supplierContactPersonPhone &&
												!!errors.supplierContactPersonPhone
											}
											style={{ borderRadius: 8 }}
										/>
										<Form.Control.Feedback type='invalid'>
											{errors.supplierContactPersonPhone as any}
										</Form.Control.Feedback>
									</Col>

									{/* Transporter 1 */}
									<Col md={12}>
										<div
											style={{
												borderTop: "1px solid #e9ebec",
												marginTop: 10,
												paddingTop: 14,
											}}
										>
											<div style={{ fontWeight: 600, marginBottom: 6 }}>
												Transporter 1 Details (Optional)
											</div>
											<div style={{ fontSize: 13, color: "#6c757d" }}>
												Add transporter details if applicable.
											</div>
										</div>
									</Col>

									<Col md={6}>
										<Form.Label style={{ fontWeight: "bold" }}>
											Transporter 1 Name
										</Form.Label>
										<Form.Control
											name='supplierTransporterName1'
											value={values.supplierTransporterName1}
											onChange={handleChange}
											placeholder='Enter transporter 1 name'
											isInvalid={
												!!touched.supplierTransporterName1 &&
												!!errors.supplierTransporterName1
											}
											style={{ borderRadius: 8 }}
										/>
										<Form.Control.Feedback type='invalid'>
											{errors.supplierTransporterName1 as any}
										</Form.Control.Feedback>
									</Col>

									<Col md={6}>
										<Form.Label style={{ fontWeight: "bold" }}>
											Transporter 1 Phone
										</Form.Label>
										<Form.Control
											name='supplierTransporterPhone1'
											value={values.supplierTransporterPhone1}
											onChange={handleChange}
											placeholder='Enter transporter 1 phone'
											isInvalid={
												!!touched.supplierTransporterPhone1 &&
												!!errors.supplierTransporterPhone1
											}
											style={{ borderRadius: 8 }}
										/>
										<Form.Control.Feedback type='invalid'>
											{errors.supplierTransporterPhone1 as any}
										</Form.Control.Feedback>
									</Col>

									<Col md={6}>
										<Form.Label style={{ fontWeight: "bold" }}>
											Transporter 1 Contact Person
										</Form.Label>
										<Form.Control
											name='supplierTransporterContactPerson1'
											value={values.supplierTransporterContactPerson1}
											onChange={handleChange}
											placeholder='Enter transporter 1 contact person'
											isInvalid={
												!!touched.supplierTransporterContactPerson1 &&
												!!errors.supplierTransporterContactPerson1
											}
											style={{ borderRadius: 8 }}
										/>
										<Form.Control.Feedback type='invalid'>
											{errors.supplierTransporterContactPerson1 as any}
										</Form.Control.Feedback>
									</Col>

									<Col md={6}>
										<Form.Label style={{ fontWeight: "bold" }}>
											Transporter 1 Contact Person Phone
										</Form.Label>
										<Form.Control
											name='supplierTransporterContactPerson1Phone'
											value={values.supplierTransporterContactPerson1Phone}
											onChange={handleChange}
											placeholder='Enter transporter 1 contact person phone'
											isInvalid={
												!!touched.supplierTransporterContactPerson1Phone &&
												!!errors.supplierTransporterContactPerson1Phone
											}
											style={{ borderRadius: 8 }}
										/>
										<Form.Control.Feedback type='invalid'>
											{errors.supplierTransporterContactPerson1Phone as any}
										</Form.Control.Feedback>
									</Col>

									{/* Transporter 2 */}
									<Col md={12}>
										<div
											style={{
												borderTop: "1px solid #e9ebec",
												marginTop: 10,
												paddingTop: 14,
											}}
										>
											<div style={{ fontWeight: 600, marginBottom: 6 }}>
												Transporter 2 Details (Optional)
											</div>
											<div style={{ fontSize: 13, color: "#6c757d" }}>
												Add second transporter details if applicable.
											</div>
										</div>
									</Col>

									<Col md={6}>
										<Form.Label style={{ fontWeight: "bold" }}>
											Transporter 2 Name
										</Form.Label>
										<Form.Control
											name='supplierTransporterName2'
											value={values.supplierTransporterName2}
											onChange={handleChange}
											placeholder='Enter transporter 2 name'
											isInvalid={
												!!touched.supplierTransporterName2 &&
												!!errors.supplierTransporterName2
											}
											style={{ borderRadius: 8 }}
										/>
										<Form.Control.Feedback type='invalid'>
											{errors.supplierTransporterName2 as any}
										</Form.Control.Feedback>
									</Col>

									<Col md={6}>
										<Form.Label style={{ fontWeight: "bold" }}>
											Transporter 2 Phone
										</Form.Label>
										<Form.Control
											name='supplierTransporterPhone2'
											value={values.supplierTransporterPhone2}
											onChange={handleChange}
											placeholder='Enter transporter 2 phone'
											isInvalid={
												!!touched.supplierTransporterPhone2 &&
												!!errors.supplierTransporterPhone2
											}
											style={{ borderRadius: 8 }}
										/>
										<Form.Control.Feedback type='invalid'>
											{errors.supplierTransporterPhone2 as any}
										</Form.Control.Feedback>
									</Col>

									<Col md={6}>
										<Form.Label style={{ fontWeight: "bold" }}>
											Transporter 2 Contact Person
										</Form.Label>
										<Form.Control
											name='supplierTransporterContactPerson2'
											value={values.supplierTransporterContactPerson2}
											onChange={handleChange}
											placeholder='Enter transporter 2 contact person'
											isInvalid={
												!!touched.supplierTransporterContactPerson2 &&
												!!errors.supplierTransporterContactPerson2
											}
											style={{ borderRadius: 8 }}
										/>
										<Form.Control.Feedback type='invalid'>
											{errors.supplierTransporterContactPerson2 as any}
										</Form.Control.Feedback>
									</Col>

									<Col md={6}>
										<Form.Label style={{ fontWeight: "bold" }}>
											Transporter 2 Contact Person Phone
										</Form.Label>
										<Form.Control
											name='supplierTransporterContactPerson2Phone'
											value={values.supplierTransporterContactPerson2Phone}
											onChange={handleChange}
											placeholder='Enter transporter 2 contact person phone'
											isInvalid={
												!!touched.supplierTransporterContactPerson2Phone &&
												!!errors.supplierTransporterContactPerson2Phone
											}
											style={{ borderRadius: 8 }}
										/>
										<Form.Control.Feedback type='invalid'>
											{errors.supplierTransporterContactPerson2Phone as any}
										</Form.Control.Feedback>
									</Col>

									{/* Actions */}
									<Col md={12} className='mt-3'>
										<div className='d-flex gap-2'>
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
														? "Update Supplier"
														: "Create Supplier"}
											</Button>

											<Button
												type='button'
												variant='light'
												onClick={() => nav("/masters/suppliers")}
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
								</Row>
							</Form>
						);
					}}
				</Formik>
			)}
		</Card>
	);
}
