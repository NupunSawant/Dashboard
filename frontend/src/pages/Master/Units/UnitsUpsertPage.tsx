// UnitUpsertPage.tsx

import React, { useEffect } from "react";
import { Card, Button, Spinner, Form, Row, Col } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { Formik } from "formik";
import * as Yup from "yup";
import type { AppDispatch, RootState } from "../../../slices/store";
import {
	createUnitThunk,
	getUnitThunk,
	updateUnitThunk,
	fetchUnitsThunk,
} from "../../../slices/Masters/units/thunks";
import { clearSelectedUnit } from "../../../slices/Masters/units/reducer";
import { toast } from "react-toastify";

const theme = "#1a8376";

const Schema = Yup.object({
	unitName: Yup.string().required("Unit name required"),
	unitSymbol: Yup.string().optional(),
});

export default function UnitUpsertPage() {
	const dispatch = useDispatch<AppDispatch>();
	const nav = useNavigate();
	const { id } = useParams();
	const isEdit = !!id;

	const { selected, loadingOne } = useSelector((s: RootState) => s.units);

	useSelector((s: RootState) => s.units);

	const [initialValues, setInitialValues] = React.useState({
		unitName: selected?.unitName || "",
		unitSymbol: selected?.unitSymbol || "",
	});

	useEffect(() => {
		dispatch(fetchUnitsThunk());

		const onFocus = () => dispatch(fetchUnitsThunk());
		window.addEventListener("focus", onFocus);
	}, [dispatch]);

	useEffect(() => {
		if (isEdit && id) {
			dispatch(getUnitThunk(id));
		}
		return () => {
			dispatch(clearSelectedUnit());
		};
	}, [dispatch, id, isEdit]);

	useEffect(() => {
		if (selected) {
			setInitialValues({
				unitName: selected.unitName || "",
				unitSymbol: selected.unitSymbol || "",
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
					<h5 className="m-0">{isEdit ? "Edit Unit" : "Create Unit"}</h5>
					<div style={{ fontSize: 13, color: "#6c757d", marginTop: 2 }}>
						{isEdit ? "Update unit details" : "Add a new unit"}
					</div>
				</div>

				<Button
					variant="light"
					size="sm"
					onClick={() => nav("/masters/units")}
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
					onSubmit={async (values, { setSubmitting }) => {
						const payload = {
							unitName: values.unitName.trim(),
							unitSymbol: values.unitSymbol.trim(),
						};

						if (isEdit) {
							const res = await dispatch(updateUnitThunk({ id: id!, payload }));
							if (updateUnitThunk.fulfilled.match(res)) {
								toast.success("Unit updated successfully");
								nav("/masters/units", { replace: true });
							} else {
								toast.error(String(res.payload || "Update failed"));
							}
						} else {
							const res = await dispatch(createUnitThunk(payload));
							if (createUnitThunk.fulfilled.match(res)) {
								toast.success("Unit created successfully");
								nav("/masters/units", { replace: true });
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
					}) => (
						<Form onSubmit={handleSubmit}>
							<Row className="g-3">
								<Col md={6}>
									<Form.Label style={{ fontWeight: "bold" }}>Unit Name</Form.Label>
									<Form.Control
										name="unitName"
										value={values.unitName}
										onChange={handleChange}
										placeholder="Enter unit name"
										isInvalid={!!touched.unitName && !!errors.unitName}
										style={{ borderRadius: 8 }}
									/>
									<Form.Control.Feedback type="invalid">
										{errors.unitName}
									</Form.Control.Feedback>
								</Col>

								<Col md={6}>
									<Form.Label style={{ fontWeight: "bold" }}>Unit Symbol</Form.Label>
									<Form.Control
										name="unitSymbol"
										value={values.unitSymbol}
										onChange={handleChange}
										placeholder="Enter unit symbol"
										style={{ borderRadius: 8 }}
									/>
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
									<i className={isEdit ? "ri-save-3-line" : "ri-add-circle-line"} />
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
									onClick={() => nav("/masters/units")}
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
					)}
				</Formik>
			)}
		</Card>
	);
}