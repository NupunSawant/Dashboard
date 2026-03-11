// LaboursUpsertPage.tsx

import React, { useEffect } from "react";
import { Card, Button, Spinner, Form, Row, Col } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { Formik } from "formik";
import * as Yup from "yup";
import type { AppDispatch, RootState } from "../../../slices/store";
import {
	createLabourThunk,
	getLabourThunk,
	updateLabourThunk,
} from "../../../slices/Masters/labours/thunks";
import { clearSelected } from "../../../slices/Masters/labours/reducer";
import { toast } from "react-toastify";
import { Country, State, City } from "country-state-city";

const theme = "#1a8376";

const Schema = Yup.object({
	labourName: Yup.string().required("Labour Name is required"),
	contactNumber: Yup.string().required("Contact Number is required"),
	panNumber: Yup.string().required("PAN Number is required"),
	panDocument: Yup.string().required("PAN Document is required"),
	aadharNumber: Yup.string().required("Aadhar Number is required"),
	aadharDocument: Yup.string().required("Aadhar Document is required"),
	address: Yup.string().required("Address is required"),
	state: Yup.string().required("State is required"),
	city: Yup.string().required("City is required"),
	country: Yup.string().required("Country is required"),
	pincode: Yup.string().required("Pincode is required"),
	remark: Yup.string().optional(),
});

export default function LaboursUpsertPage() {
	const dispatch = useDispatch<AppDispatch>();
	const nav = useNavigate();
	const { id } = useParams();
	const isEdit = !!id;

	const { selected, loadingOne } = useSelector((s: RootState) => s.labours);

	const [initialValues, setInitialValues] = React.useState({
		labourName: "",
		contactNumber: "",
		panNumber: "",
		panDocument: "",
		aadharNumber: "",
		aadharDocument: "",
		address: "",
		state: "",
		city: "",
		country: "",
		pincode: "",
		remark: "",
	});

	useEffect(() => {
		if (isEdit && id) {
			dispatch(getLabourThunk(id));
		}
		return () => {
			dispatch(clearSelected());
		};
	}, [dispatch, id, isEdit]);

	useEffect(() => {
		if (selected) {
			setInitialValues({
				labourName: selected.labourName ?? "",
				contactNumber: selected.contactNumber ?? "",
				panNumber: selected.panNumber ?? "",
				panDocument: selected.panDocument ?? "",
				aadharNumber: selected.aadharNumber ?? "",
				aadharDocument: selected.aadharDocument ?? "",
				address: selected.address ?? "",
				state: selected.state ?? "",
				city: selected.city ?? "",
				country: selected.country ?? "",
				pincode: selected.pincode ?? "",
				remark: selected.remark ?? "",
			});
		}
	}, [selected]);

	return (
		<Card
			className="p-3"
			style={{
				border: "1px solid #e9ebec",
				borderRadius: "10px",
			}}
		>
			{/* Header */}
			<div className="d-flex justify-content-between align-items-center mb-3">
				<div>
					<h5 className="m-0">{isEdit ? "Edit Labour" : "Create Labour"}</h5>
					<div style={{ fontSize: 13, color: "#6c757d", marginTop: 2 }}>
						{isEdit ? "Update labour details" : "Add a new labour"}
					</div>
				</div>

				<Button
					variant="light"
					size="sm"
					onClick={() => nav("/masters/labours")}
					style={{
						border: "1px solid #e9ebec",
						fontSize: "13px",
						borderRadius: "6px",
						display: "inline-flex",
						alignItems: "center",
						gap: "6px",
					}}
				>
					<i className="ri-arrow-left-line" /> Back to List
				</Button>
			</div>

			{loadingOne ? (
				<div className="d-flex justify-content-center py-5">
					<Spinner animation="border" style={{ color: theme }} />
				</div>
			) : (
				<Formik
					enableReinitialize
					initialValues={initialValues}
					validationSchema={Schema}
					validate={(values) => {
						const errors: any = {};
						// Make files optional in edit mode if not changed
						if (!isEdit) {
							if (!values.panDocument) {
								errors.panDocument = "PAN Document is required";
							}
							if (!values.aadharDocument) {
								errors.aadharDocument = "Aadhar Document is required";
							}
						}
						return errors;
					}}
					onSubmit={async (values, { setSubmitting }) => {
						const payload = {
							labourName: values.labourName.trim(),
							contactNumber: values.contactNumber.trim(),
							panNumber: values.panNumber.trim(),
							panDocument: values.panDocument.trim(),
							aadharNumber: values.aadharNumber.trim(),
							aadharDocument: values.aadharDocument.trim(),
							address: values.address.trim(),
							state: values.state.trim(),
							city: values.city.trim(),
							country: values.country.trim(),
							pincode: values.pincode.trim(),
							remark: values.remark?.trim() || undefined,
						};

						if (isEdit) {
							const res = await dispatch(
								updateLabourThunk({ id: id!, payload }),
							);
							if (updateLabourThunk.fulfilled.match(res)) {
								toast.success("Labour updated successfully");
								nav("/masters/labours", { replace: true });
							} else {
								toast.error(String(res.payload || "Update failed"));
							}
						} else {
							const res = await dispatch(createLabourThunk(payload));
							if (createLabourThunk.fulfilled.match(res)) {
								toast.success("Labour created successfully");
								nav("/masters/labours", { replace: true });
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
						const countries = Country.getAllCountries();

						// Keep storing NAME in form values (no backend change)
						const countryObj = countries.find((c) => c.name === values.country);

						const states = countryObj
							? State.getStatesOfCountry(countryObj.isoCode)
							: [];

						const stateObj = states.find((s) => s.name === values.state);

						const cities =
							countryObj && stateObj
								? City.getCitiesOfState(countryObj.isoCode, stateObj.isoCode)
								: [];

						return (
							<Form onSubmit={handleSubmit}>
								<Row className="g-3">
									<Col md={6}>
										<Form.Label style={{ fontWeight: "bold" }}>
											Labour Name
										</Form.Label>
										<Form.Control
											name="labourName"
											value={values.labourName}
											onChange={handleChange}
											placeholder="Enter labour name"
											isInvalid={!!touched.labourName && !!errors.labourName}
											style={{ borderRadius: 8 }}
										/>
										<Form.Control.Feedback type="invalid">
											{errors.labourName as any}
										</Form.Control.Feedback>
									</Col>

									<Col md={6}>
										<Form.Label style={{ fontWeight: "bold" }}>
											Contact Number
										</Form.Label>
										<Form.Control
											name="contactNumber"
											value={values.contactNumber}
											onChange={handleChange}
											placeholder="Enter contact number"
											isInvalid={!!touched.contactNumber && !!errors.contactNumber}
											style={{ borderRadius: 8 }}
										/>
										<Form.Control.Feedback type="invalid">
											{errors.contactNumber as any}
										</Form.Control.Feedback>
									</Col>
								</Row>

								<Row className="g-3 mt-1">
									<Col md={3}>
										<Form.Label style={{ fontWeight: "bold" }}>PAN Number</Form.Label>
										<Form.Control
											name="panNumber"
											value={values.panNumber}
											onChange={handleChange}
											placeholder="Enter PAN number"
											isInvalid={!!touched.panNumber && !!errors.panNumber}
											style={{ borderRadius: 8 }}
										/>
										<Form.Control.Feedback type="invalid">
											{errors.panNumber as any}
										</Form.Control.Feedback>
									</Col>

									<Col md={3}>
										<Form.Label style={{ fontWeight: "bold" }}>
											PAN Document {!isEdit && "*"}
										</Form.Label>
										<Form.Control
											type="file"
											name="panDocument"
											onChange={handleChange}
											accept=".pdf,.jpg,.jpeg,.png"
											isInvalid={!!touched.panDocument && !!errors.panDocument}
											style={{ borderRadius: 8 }}
										/>
										<Form.Text className="text-muted d-block">
											Allowed: PDF, JPG, PNG
										</Form.Text>
										<Form.Control.Feedback type="invalid">
											{errors.panDocument as any}
										</Form.Control.Feedback>
									</Col>

									<Col md={3}>
										<Form.Label style={{ fontWeight: "bold" }}>
											Aadhar Number
										</Form.Label>
										<Form.Control
											name="aadharNumber"
											value={values.aadharNumber}
											onChange={handleChange}
											placeholder="Enter Aadhar number"
											isInvalid={!!touched.aadharNumber && !!errors.aadharNumber}
											style={{ borderRadius: 8 }}
										/>
										<Form.Control.Feedback type="invalid">
											{errors.aadharNumber as any}
										</Form.Control.Feedback>
									</Col>

									<Col md={3}>
										<Form.Label style={{ fontWeight: "bold" }}>
											Aadhar Document {!isEdit && "*"}
										</Form.Label>
										<Form.Control
											type="file"
											name="aadharDocument"
											onChange={handleChange}
											accept=".pdf,.jpg,.jpeg,.png"
											isInvalid={!!touched.aadharDocument && !!errors.aadharDocument}
											style={{ borderRadius: 8 }}
										/>
										<Form.Text className="text-muted d-block">
											Allowed: PDF, JPG, PNG
										</Form.Text>
										<Form.Control.Feedback type="invalid">
											{errors.aadharDocument as any}
										</Form.Control.Feedback>
									</Col>
								</Row>

								<Row className="g-3 mt-1">
									<Col md={6}>
										<Form.Label style={{ fontWeight: "bold" }}>Address</Form.Label>
										<Form.Control
											name="address"
											value={values.address}
											onChange={handleChange}
											placeholder="Enter address"
											isInvalid={!!touched.address && !!errors.address}
											style={{ borderRadius: 8 }}
										/>
										<Form.Control.Feedback type="invalid">
											{errors.address as any}
										</Form.Control.Feedback>
									</Col>

									{/* UPDATED: Country dropdown */}
									<Col md={6}>
										<Form.Label style={{ fontWeight: "bold" }}>Country</Form.Label>
										<Form.Select
											name="country"
											value={values.country}
											onChange={(e) => {
												const val = e.target.value;
												setFieldValue("country", val);
												setFieldValue("state", "");
												setFieldValue("city", "");
											}}
											isInvalid={!!touched.country && !!errors.country}
											style={{ borderRadius: 8 }}
										>
											<option value="">Select Country</option>
											{countries.map((c) => (
												<option key={c.isoCode} value={c.name}>
													{c.name}
												</option>
											))}
										</Form.Select>
										<Form.Control.Feedback type="invalid">
											{errors.country as any}
										</Form.Control.Feedback>
									</Col>
								</Row>

								<Row className="g-3 mt-1">
									{/* UPDATED: State dropdown */}
									<Col md={6}>
										<Form.Label style={{ fontWeight: "bold" }}>State</Form.Label>
										<Form.Select
											name="state"
											value={values.state}
											onChange={(e) => {
												const val = e.target.value;
												setFieldValue("state", val);
												setFieldValue("city", "");
											}}
											disabled={!values.country}
											isInvalid={!!touched.state && !!errors.state}
											style={{ borderRadius: 8 }}
										>
											<option value="">
												{values.country ? "Select State" : "Select Country first"}
											</option>
											{states.map((s) => (
												<option key={s.isoCode} value={s.name}>
													{s.name}
												</option>
											))}
										</Form.Select>
										<Form.Control.Feedback type="invalid">
											{errors.state as any}
										</Form.Control.Feedback>
									</Col>

									{/* UPDATED: City dropdown */}
									<Col md={6}>
										<Form.Label style={{ fontWeight: "bold" }}>City</Form.Label>
										<Form.Select
											name="city"
											value={values.city}
											onChange={(e) => setFieldValue("city", e.target.value)}
											disabled={!values.country || !values.state}
											isInvalid={!!touched.city && !!errors.city}
											style={{ borderRadius: 8 }}
										>
											<option value="">
												{values.state ? "Select City" : "Select State first"}
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
										<Form.Control.Feedback type="invalid">
											{errors.city as any}
										</Form.Control.Feedback>
									</Col>
								</Row>

								<Row className="g-3 mt-1">
									<Col md={6}>
										<Form.Label style={{ fontWeight: "bold" }}>Pincode</Form.Label>
										<Form.Control
											name="pincode"
											value={values.pincode}
											onChange={handleChange}
											placeholder="Enter pincode"
											isInvalid={!!touched.pincode && !!errors.pincode}
											style={{ borderRadius: 8 }}
										/>
										<Form.Control.Feedback type="invalid">
											{errors.pincode as any}
										</Form.Control.Feedback>
									</Col>

									<Col md={6}>
										<Form.Label style={{ fontWeight: "bold" }}>Remark</Form.Label>
										<Form.Control
											name="remark"
											value={values.remark}
											onChange={handleChange}
											placeholder="Enter remark"
											isInvalid={!!touched.remark && !!errors.remark}
											style={{ borderRadius: 8 }}
										/>
										<Form.Control.Feedback type="invalid">
											{errors.remark as any}
										</Form.Control.Feedback>
									</Col>
								</Row>

								{/* Actions */}
								<div className="mt-4 d-flex gap-2">
									<Button
										type="submit"
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
											className={isEdit ? "ri-save-3-line" : "ri-add-circle-line"}
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
										variant="light"
										onClick={() => nav("/masters/labours")}
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
										<i className="ri-close-line" /> Cancel
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