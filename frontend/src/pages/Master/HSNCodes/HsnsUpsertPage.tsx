// HsnUpsertPage.tsx

import React, { useEffect } from "react";
import { Card, Button, Spinner, Form, Row, Col } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { Formik } from "formik";
import * as Yup from "yup";
import type { AppDispatch, RootState } from "../../../slices/store";
import {
	createHSNCodeThunk,
	getHSNCodeThunk,
	updateHSNCodeThunk,
	fetchHSNCodesThunk,
} from "../../../slices/Masters/hsnCodes/thunks";
import { clearSelectedHSNCode } from "../../../slices/Masters/hsnCodes/reducer";
import { toast } from "react-toastify";

const theme = "#1a8376";

const Schema = Yup.object({
	gstRate: Yup.string().optional(),
	hsnCode: Yup.string().required("HSN Code required"),
	hsnDescription: Yup.string().optional(),
});

export default function HsnUpsertPage() {
	const dispatch = useDispatch<AppDispatch>();
	const nav = useNavigate();
	const { id } = useParams();
	const isEdit = !!id;

	const { selected, loadingOne } = useSelector((s: RootState) => s.hsnCodes);

	const { gsts, loadingList: loadingGSTs } = useSelector(
		(s: RootState) => s.gsts,
	);

	const [initialValues, setInitialValues] = React.useState({
		gstRate: selected?.gstRate || "",
		hsnCode: selected?.hsnCode || "",
		hsnDescription: selected?.hsnDescription || "",
	});

	useEffect(() => {
		dispatch(fetchHSNCodesThunk());

		const onFocus = () => dispatch(fetchHSNCodesThunk());
		window.addEventListener("focus", onFocus);
	}, [dispatch]);

	useEffect(() => {
		if (isEdit && id) {
			dispatch(getHSNCodeThunk(id));
		}
		return () => {
			dispatch(clearSelectedHSNCode());
		};
	}, [dispatch, id, isEdit]);

	useEffect(() => {
		if (selected) {
			setInitialValues({
				gstRate: selected.gstRate || "",
				hsnCode: selected.hsnCode || "",
				hsnDescription: selected.hsnDescription || "",
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
						{isEdit ? "Edit HSN Code" : "Create HSN Code"}
					</h5>
					<div style={{ fontSize: 13, color: "#6c757d", marginTop: 2 }}>
						{isEdit ? "Update HSN Code details" : "Add a new HSN Code"}
					</div>
				</div>

				<Button
					variant='light'
					size='sm'
					onClick={() => nav("/masters/hsn-codes")}
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
							gstRate: values.gstRate.trim(),
							hsnCode: values.hsnCode.trim(),
							hsnDescription: values.hsnDescription.trim(),
						};

						if (isEdit) {
							const res = await dispatch(
								updateHSNCodeThunk({ id: id!, payload }),
							);
							if (updateHSNCodeThunk.fulfilled.match(res)) {
								toast.success("HSN Code updated successfully");
								nav("/masters/hsn-codes", { replace: true });
							} else {
								toast.error(String(res.payload || "Update failed"));
							}
						} else {
							const res = await dispatch(createHSNCodeThunk(payload));
							if (createHSNCodeThunk.fulfilled.match(res)) {
								toast.success("HSN Code created successfully");
								nav("/masters/hsn-codes", { replace: true });
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
							<Row className='g-3'>
								{/* GST */}
								<Col md={6}>
									<Form.Label style={{ fontWeight: "bold" }}>
										GST <span style={{ color: "red" }}>*</span>
									</Form.Label>
									<Form.Select
										name='gstRate'
										value={values.gstRate}
										onChange={handleChange}
										isInvalid={!!touched.gstRate && !!errors.gstRate}
										style={{ borderRadius: 8 }}
									>
										<option value=''>
											{loadingGSTs
												? "Loading GST..."
												: (gsts || []).length === 0
													? "No GST available"
													: "Select GST"}
										</option>
										{(gsts || []).map((g: any) => {
											const gid =
												g.id || g._id || g.percentage || g.rate || g.gst;
											const gpercentage = String(
												g.percentage ?? g.gstRate ?? g.gst ?? "",
											);
											return (
												<option key={gid} value={gpercentage}>
													{gpercentage}
												</option>
											);
										})}
									</Form.Select>
									<Form.Control.Feedback type='invalid'>
										{errors.gstRate as any}
									</Form.Control.Feedback>
								</Col>
								<Col md={4}>
									<Form.Label style={{ fontWeight: "bold" }}>
										HSN Code
									</Form.Label>
									<Form.Control
										name='hsnCode'
										value={values.hsnCode}
										onChange={handleChange}
										placeholder='Enter HSN Code'
										isInvalid={!!touched.hsnCode && !!errors.hsnCode}
										style={{ borderRadius: 8 }}
									/>
									<Form.Control.Feedback type='invalid'>
										{errors.hsnCode}
									</Form.Control.Feedback>
								</Col>

								<Col md={4}>
									<Form.Label style={{ fontWeight: "bold" }}>
										HSN Description
									</Form.Label>
									<Form.Control
										name='hsnDescription'
										value={values.hsnDescription}
										onChange={handleChange}
										placeholder='Enter HSN Description'
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
									variant='light'
									onClick={() => nav("/masters/hsn-codes")}
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
					)}
				</Formik>
			)}
		</Card>
	);
}
