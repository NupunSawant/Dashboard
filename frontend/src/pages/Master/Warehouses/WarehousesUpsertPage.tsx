// WarehouseUpsertPage.tsx

import { useEffect } from "react";
import { Card, Button, Spinner, Form, Row, Col } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { Formik } from "formik";
import * as Yup from "yup";
import type { AppDispatch, RootState } from "../../../slices/store";
import {
	createWarehouseThunk,
	getWarehouseThunk,
	updateWarehouseThunk,
} from "../../../slices/Masters/warehouses/thunks";
import { clearSelected } from "../../../slices/Masters/warehouses/reducer";
import React from "react";
import { toast } from "react-toastify";
import { Country, State, City } from "country-state-city";

const theme = "#1a8376";

const Schema = Yup.object({
	warehouseName: Yup.string().required("Warehouse name required"),
	warehouseType: Yup.string().min(1),
	warehouseAddress: Yup.string().min(1),
	warehouseCity: Yup.string().min(1),
	warehouseState: Yup.string().min(1),
	warehouseCountry: Yup.string().min(1),
	warehousePincode: Yup.string().min(1),
	remarks: Yup.string().optional(),
});

export default function WarehouseUpsertPage() {
	const dispatch = useDispatch<AppDispatch>();
	const nav = useNavigate();
	const { id } = useParams();
	const isEdit = !!id;

	const { selected, loadingOne } = useSelector((s: RootState) => s.warehouses);

	const [initialValues, setInitialValues] = React.useState({
		warehouseName: "",
		warehouseType: "",
		warehouseAddress: "",
		warehouseCity: "",
		warehouseState: "",
		warehouseCountry: "",
		warehousePincode: "",
		remarks: "",
	});

	useEffect(() => {
		if (isEdit && id) {
			dispatch(getWarehouseThunk(id));
		}
		return () => {
			dispatch(clearSelected());
		};
	}, [dispatch, id, isEdit]);

	useEffect(() => {
		if (selected) {
			setInitialValues({
				warehouseName: selected.warehouseName ?? "",
				warehouseType: selected.warehouseType ?? "",
				warehouseAddress: selected.warehouseAddress ?? "",
				warehouseCity: selected.warehouseCity ?? "",
				warehouseState: selected.warehouseState ?? "",
				warehouseCountry: selected.warehouseCountry ?? "",
				warehousePincode: selected.warehousePincode ?? "",
				remarks: selected.remarks ?? "",
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
						{isEdit ? "Edit Warehouse" : "Create Warehouse"}
					</h5>
					<div style={{ fontSize: 13, color: "#6c757d", marginTop: 2 }}>
						{isEdit ? "Update warehouse details" : "Add a new warehouse"}
					</div>
				</div>

				<Button
					variant='light'
					size='sm'
					onClick={() => nav("/masters/warehouses")}
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
							warehouseName: values.warehouseName.trim(),
							warehouseType: values.warehouseType.trim() || undefined,
							warehouseAddress: values.warehouseAddress.trim() || undefined,
							warehouseCity: values.warehouseCity.trim() || undefined,
							warehouseState: values.warehouseState.trim() || undefined,
							warehouseCountry: values.warehouseCountry.trim() || undefined,
							warehousePincode: values.warehousePincode.trim() || undefined,
							remarks: values.remarks?.trim() || undefined,
						};

						if (isEdit) {
							const res = await dispatch(
								updateWarehouseThunk({ id: id!, payload }),
							);
							if (updateWarehouseThunk.fulfilled.match(res)) {
								toast.success("Warehouse updated successfully");
							} else {
								toast.error("Failed to update warehouse");
							}
						} else {
							const res = await dispatch(createWarehouseThunk(payload));
							if (createWarehouseThunk.fulfilled.match(res)) {
								toast.success("Warehouse created successfully");
								nav("/masters/warehouses", { replace: true });
							} else {
								toast.error(
									String(res.payload || "Failed to create warehouse"),
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

						// Keep storing NAME in form values (no backend changes)
						const countryObj = countries.find(
							(c) => c.name === values.warehouseCountry,
						);

						const states = countryObj
							? State.getStatesOfCountry(countryObj.isoCode)
							: [];

						const stateObj = states.find(
							(s) => s.name === values.warehouseState,
						);

						const cities =
							countryObj && stateObj
								? City.getCitiesOfState(countryObj.isoCode, stateObj.isoCode)
								: [];

						return (
							<Form onSubmit={handleSubmit}>
								<Row className='g-3'>
									<Col md={6}>
										<Form.Label style={{ fontWeight: "bold" }}>
											Warehouse Name
										</Form.Label>
										<Form.Control
											name='warehouseName'
											value={values.warehouseName}
											onChange={handleChange}
											placeholder='Enter warehouse name'
											isInvalid={
												!!touched.warehouseName && !!errors.warehouseName
											}
											style={{ borderRadius: 8 }}
										/>
										<Form.Control.Feedback type='invalid'>
											{errors.warehouseName as any}
										</Form.Control.Feedback>
									</Col>

									<Col md={6}>
										<Form.Label style={{ fontWeight: "bold" }}>
											WareHouse Types
										</Form.Label>
										<Form.Control
											name='warehouseType'
											value={values.warehouseType}
											onChange={handleChange}
											placeholder='Enter warehouse type'
											isInvalid={
												!!touched.warehouseType && !!errors.warehouseType
											}
											style={{ borderRadius: 8 }}
										/>
										<Form.Control.Feedback type='invalid'>
											{errors.warehouseType as any}
										</Form.Control.Feedback>
									</Col>
								</Row>

								<Row className='g-3 mt-1'>
									<Col md={3}>
										<Form.Label style={{ fontWeight: "bold" }}>
											WareHouse Address
										</Form.Label>
										<Form.Control
											name='warehouseAddress'
											value={values.warehouseAddress}
											onChange={handleChange}
											placeholder='Enter warehouse Address'
											isInvalid={
												!!touched.warehouseAddress && !!errors.warehouseAddress
											}
											style={{ borderRadius: 8 }}
										/>
										<Form.Control.Feedback type='invalid'>
											{errors.warehouseAddress as any}
										</Form.Control.Feedback>
									</Col>

									{/* UPDATED: Country */}
									<Col md={3}>
										<Form.Label style={{ fontWeight: "bold" }}>
											WareHouse Country
										</Form.Label>
										<Form.Select
											name='warehouseCountry'
											value={values.warehouseCountry}
											onChange={(e) => {
												const val = e.target.value;
												setFieldValue("warehouseCountry", val);
												setFieldValue("warehouseState", "");
												setFieldValue("warehouseCity", "");
											}}
											isInvalid={
												!!touched.warehouseCountry && !!errors.warehouseCountry
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
											{errors.warehouseCountry as any}
										</Form.Control.Feedback>
									</Col>

									{/* UPDATED: State */}
									<Col md={3}>
										<Form.Label style={{ fontWeight: "bold" }}>
											WareHouse State
										</Form.Label>
										<Form.Select
											name='warehouseState'
											value={values.warehouseState}
											onChange={(e) => {
												const val = e.target.value;
												setFieldValue("warehouseState", val);
												setFieldValue("warehouseCity", "");
											}}
											disabled={!values.warehouseCountry}
											isInvalid={
												!!touched.warehouseState && !!errors.warehouseState
											}
											style={{ borderRadius: 8 }}
										>
											<option value=''>
												{values.warehouseCountry
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
											{errors.warehouseState as any}
										</Form.Control.Feedback>
									</Col>

									{/* UPDATED: City */}
									<Col md={3}>
										<Form.Label style={{ fontWeight: "bold" }}>
											WareHouse City
										</Form.Label>
										<Form.Select
											name='warehouseCity'
											value={values.warehouseCity}
											onChange={(e) =>
												setFieldValue("warehouseCity", e.target.value)
											}
											disabled={
												!values.warehouseCountry || !values.warehouseState
											}
											isInvalid={
												!!touched.warehouseCity && !!errors.warehouseCity
											}
											style={{ borderRadius: 8 }}
										>
											<option value=''>
												{values.warehouseState
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
											{errors.warehouseCity as any}
										</Form.Control.Feedback>
									</Col>
								</Row>

								<Row className='g-3 mt-1'>
									<Col md={3}>
										<Form.Label style={{ fontWeight: "bold" }}>
											WareHouse Pincode
										</Form.Label>
										<Form.Control
											name='warehousePincode'
											value={values.warehousePincode}
											onChange={handleChange}
											placeholder='Enter warehouse Pincode'
											isInvalid={
												!!touched.warehousePincode && !!errors.warehousePincode
											}
											style={{ borderRadius: 8 }}
										/>
										<Form.Control.Feedback type='invalid'>
											{errors.warehousePincode as any}
										</Form.Control.Feedback>
									</Col>

									<Col md={9}>
										<Form.Label style={{ fontWeight: "bold" }}>
											Remarks
										</Form.Label>
										<Form.Control
											name='remarks'
											value={values.remarks}
											onChange={handleChange}
											placeholder='Enter remarks'
											isInvalid={!!touched.remarks && !!errors.remarks}
											style={{ borderRadius: 8 }}
										/>
										<Form.Control.Feedback type='invalid'>
											{errors.remarks as any}
										</Form.Control.Feedback>
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
										onClick={() => nav("/masters/warehouses")}
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
