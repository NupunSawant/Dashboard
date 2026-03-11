// categoriesUpsertPage.tsx (CategoryUpsertPage)

import { useEffect } from "react";
import { Card, Button, Spinner, Form, Row, Col } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { Formik } from "formik";
import * as Yup from "yup";
import type { AppDispatch, RootState } from "../../../slices/store";
import {
	createCategoryThunk,
	getCategoryThunk,
	updateCategoryThunk,
} from "../../../slices/Masters/categories/thunks";
import { clearSelected } from "../../../slices/Masters/categories/reducer";
import React from "react";
import { toast } from "react-toastify";

const theme = "#1a8376";

const Schema = Yup.object({
	name: Yup.string().required("Category name required"),
	remark: Yup.string().optional(),
});

export default function CategoryUpsertPage() {
	const dispatch = useDispatch<AppDispatch>();
	const nav = useNavigate();
	const { id } = useParams();
	const isEdit = !!id;

	const { selected, loadingOne } = useSelector((s: RootState) => s.categories);

	const [initialValues, setInitialValues] = React.useState({
		name: "",
		remark: "",
	});

	useEffect(() => {
		if (isEdit && id) {
			dispatch(getCategoryThunk(id));
		}
		return () => {
			dispatch(clearSelected());
		};
	}, [dispatch, id, isEdit]);

	useEffect(() => {
		if (selected) {
			setInitialValues({
				name: selected.name ?? "",
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
					<h5 className="m-0">{isEdit ? "Edit Category" : "Create Category"}</h5>
					<div style={{ fontSize: 13, color: "#6c757d", marginTop: 2 }}>
						{isEdit ? "Update category details" : "Add a new category"}
					</div>
				</div>

				<Button
					variant="light"
					size="sm"
					onClick={() => nav("/masters/categories")}
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
							name: values.name.trim(),
							remark: values.remark?.trim() || undefined,
						};

						if (isEdit) {
							const res = await dispatch(
								updateCategoryThunk({ id: id!, payload }),
							);
							if (updateCategoryThunk.fulfilled.match(res)) {
								toast.success("Category updated");
								nav("/masters/categories", { replace: true });
							} else {
								toast.error(String(res.payload || "Update failed"));
							}
						} else {
							const res = await dispatch(createCategoryThunk(payload));
							if (createCategoryThunk.fulfilled.match(res)) {
								toast.success("Category created");
								nav("/masters/categories", { replace: true });
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
									<Form.Label style={{ fontWeight: "bold" }}>Category Name</Form.Label>
									<Form.Control
										name="name"
										value={values.name}
										onChange={handleChange}
										placeholder="Enter category name"
										isInvalid={!!touched.name && !!errors.name}
										style={{ borderRadius: 8 }}
									/>
									<Form.Control.Feedback type="invalid">
										{errors.name}
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
									onClick={() => nav("/masters/categories")}
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