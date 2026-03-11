// subCategoryUpsertPage.tsx

import React, { useEffect } from "react";
import { Card, Button, Spinner, Form, Row, Col } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { Formik } from "formik";
import * as Yup from "yup";
import type { AppDispatch, RootState } from "../../../slices/store";
import {
	createSubCategoryThunk,
	getSubCategoryThunk,
	updateSubCategoryThunk,
} from "../../../slices/Masters/subCategories/thunks";
import { clearSelectedSubCategory } from "../../../slices/Masters/subCategories/reducer";
import { fetchCategoriesThunk } from "../../../slices/Masters/categories/thunks";
import { toast } from "react-toastify";

const theme = "#1a8376";

const Schema = Yup.object({
	name: Yup.string().required("Sub-category name required"),
	category: Yup.string().required("Category required"),
	remark: Yup.string().optional(),
});

export default function SubCategoryUpsertPage() {
	const dispatch = useDispatch<AppDispatch>();
	const nav = useNavigate();
	const { id } = useParams();
	const isEdit = !!id;

	const { selected, loadingOne } = useSelector((s: RootState) => s.subCategories);

	const { categories, loadingList: loadingCats } = useSelector(
		(s: RootState) => s.categories,
	);

	const [initialValues, setInitialValues] = React.useState({
		name: "",
		category: "",
		remark: "",
	});

	useEffect(() => {
		dispatch(fetchCategoriesThunk());

		const onFocus = () => dispatch(fetchCategoriesThunk());
		window.addEventListener("focus", onFocus);

		return () => window.removeEventListener("focus", onFocus);
	}, [dispatch]);

	useEffect(() => {
		if (isEdit && id) {
			dispatch(getSubCategoryThunk(id));
		}
		return () => {
			dispatch(clearSelectedSubCategory());
		};
	}, [dispatch, id, isEdit]);

	useEffect(() => {
		if (selected) {
			setInitialValues({
				name: selected.name ?? "",
				category: selected.category ?? "",
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
					<h5 className="m-0">
						{isEdit ? "Edit Sub-Category" : "Create Sub-Category"}
					</h5>
					<div style={{ fontSize: 13, color: "#6c757d", marginTop: 2 }}>
						{isEdit ? "Update sub-category details" : "Add a new sub-category"}
					</div>
				</div>

				<Button
					variant="light"
					size="sm"
					onClick={() => nav("/masters/sub-categories")}
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
							category: values.category.trim(),
							remark: values.remark?.trim() || undefined,
						};

						if (isEdit) {
							const res = await dispatch(
								updateSubCategoryThunk({ id: id!, payload }),
							);
							if (updateSubCategoryThunk.fulfilled.match(res)) {
								toast.success("Sub-category updated successfully");
								nav("/masters/sub-categories", { replace: true });
							} else {
								toast.error(String(res.payload || "Update failed"));
							}
						} else {
							const res = await dispatch(createSubCategoryThunk(payload));
							if (createSubCategoryThunk.fulfilled.match(res)) {
								toast.success("Sub-category created successfully");
								nav("/masters/sub-categories", { replace: true });
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
									<Form.Label style={{ fontWeight: "bold" }}>Sub-Category Name</Form.Label>
									<Form.Control
										name="name"
										value={values.name}
										onChange={handleChange}
										placeholder="Enter sub-category name"
										isInvalid={!!touched.name && !!errors.name}
										style={{ borderRadius: 8 }}
									/>
									<Form.Control.Feedback type="invalid">
										{errors.name}
									</Form.Control.Feedback>
								</Col>

								<Col md={6}>
									<Form.Label style={{ fontWeight: "bold" }}>Category</Form.Label>
									<Form.Select
										name="category"
										value={values.category}
										onChange={handleChange}
										isInvalid={!!touched.category && !!errors.category}
										style={{ borderRadius: 8 }}
									>
										<option value="" disabled>
											{loadingCats ? "Loading categories..." : "Select category"}
										</option>
										{(categories || []).map((c: any) => {
											const cid = c.id || c._id || c.name;
											return (
												<option key={cid} value={c.name}>
													{c.name}
												</option>
											);
										})}
									</Form.Select>
									<Form.Control.Feedback type="invalid">
										{errors.category}
									</Form.Control.Feedback>
								</Col>

								<Col md={12}>
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
									onClick={() => nav("/masters/sub-categories")}
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