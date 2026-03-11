// GstUpsertPage.tsx

import React, {  useEffect } from "react";
import { Card, Button, Spinner, Form, Row, Col } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { Formik } from "formik";
import * as Yup from "yup";
import type { AppDispatch, RootState } from "../../../slices/store";
import {
	createGstThunk,
	getGstThunk,
	updateGstThunk,
	fetchGSTsThunk,
} from "../../../slices/Masters/gst/thunks";
import { clearSelectedGst } from "../../../slices/Masters/gst/reducer";
import { toast } from "react-toastify";

const theme = "#1a8376";

const Schema = Yup.object({
	gstRate: Yup.string().required("GST rate required"),
	remark: Yup.string().optional(),
});

export default function GstUpsertPage() {
	const dispatch = useDispatch<AppDispatch>();
	const nav = useNavigate();
	const { id } = useParams();
	const isEdit = !!id;

	const { selected, loadingOne } = useSelector((s: RootState) => s.gsts);

	const [initialValues, setInitialValues] = React.useState({
		gstRate: selected?.gstRate || "",
		remark: selected?.remark || "",
	});

	useEffect(() => {
		dispatch(fetchGSTsThunk());

		const onFocus = () => dispatch(fetchGSTsThunk());
		window.addEventListener("focus", onFocus);
	}, [dispatch]);

	useEffect(() => {
		if (isEdit && id) {
			dispatch(getGstThunk(id));
		}
		return () => {
			dispatch(clearSelectedGst());
		};
	}, [dispatch, id, isEdit]);

	useEffect(() => {
		if (selected) {
			setInitialValues({
				gstRate: selected.gstRate || "",
				remark: selected.remark || "",
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
					<h5 className="m-0">{isEdit ? "Edit GST" : "Create GST"}</h5>
					<div style={{ fontSize: 13, color: "#6c757d", marginTop: 2 }}>
						{isEdit ? "Update GST details" : "Add a new GST"}
					</div>
				</div>

				<Button
					variant="light"
					size="sm"
					onClick={() => nav("/masters/gsts")}
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
							gstRate: values.gstRate.trim(),
							remark: values.remark.trim(),
						};

						if (isEdit) {
							const res = await dispatch(updateGstThunk({ id: id!, payload }));
							if (updateGstThunk.fulfilled.match(res)) {
								toast.success("GST updated successfully");
								nav("/masters/gsts", { replace: true });
							} else {
								toast.error(String(res.payload || "Update failed"));
							}
						} else {
							const res = await dispatch(createGstThunk(payload));
							if (createGstThunk.fulfilled.match(res)) {
								toast.success("GST created successfully");
								nav("/masters/gsts", { replace: true });
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
									<Form.Label style={{ fontWeight: "bold" }}>GST Rate</Form.Label>
									<Form.Control
										name="gstRate"
										value={values.gstRate}
										onChange={handleChange}
										placeholder="Enter GST Rate"
										isInvalid={!!touched.gstRate && !!errors.gstRate}
										style={{ borderRadius: 8 }}
									/>
									<Form.Control.Feedback type="invalid">
										{errors.gstRate}
									</Form.Control.Feedback>
								</Col>

								<Col md={6}>
									<Form.Label style={{ fontWeight: "bold" }}>Remark</Form.Label>
									<Form.Control
										name="remark"
										value={values.remark}
										onChange={handleChange}
										placeholder="Enter remark"
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
									onClick={() => nav("/masters/gsts")}
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