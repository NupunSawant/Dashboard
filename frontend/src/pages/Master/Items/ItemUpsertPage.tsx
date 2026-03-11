import { useEffect, useMemo } from "react";
import { Card, Button, Spinner, Form, Row, Col } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { Formik } from "formik";
import * as Yup from "yup";
import type { AppDispatch, RootState } from "../../../slices/store";
import {
	createItemThunk,
	getItemThunk,
	updateItemThunk,
} from "../../../slices/Masters/items/thunks";
import { clearSelected } from "../../../slices/Masters/items/reducer";
import React from "react";
import { toast } from "react-toastify";
import { fetchCategoriesThunk } from "../../../slices/Masters/categories/thunks";
import { fetchUnitsThunk } from "../../../slices/Masters/units/thunks";
import { fetchSubCategoriesThunk } from "../../../slices/Masters/subCategories/thunks";
import { fetchGSTsThunk } from "../../../slices/Masters/gst/thunks";
import { generateNextCode } from "../../../utils/generateNextCode";

const theme = "#1a8376";

const Schema = Yup.object({
	itemName: Yup.string().required("Item name required"),
	itemCode: Yup.string().required("Item code required"),
	category: Yup.string().required("Category required"),
	subCategory: Yup.string().required("Sub-category required"),
	gst: Yup.string().typeError("GST required").required("GST required"),
	unit: Yup.string().required("Unit required"),
	remark: Yup.string().optional(),
});

export default function ItemUpsertPage() {
	const dispatch = useDispatch<AppDispatch>();
	const nav = useNavigate();
	const { id } = useParams();
	const isEdit = !!id;

	const { selected, loadingOne, items } = useSelector(
		(s: RootState) => s.items,
	);

	//   get all existing codes for duplicate check
	const existingCodes = useMemo(
		() => items.map((item) => item.itemCode).filter(Boolean),
		[items],
	);

	const [selectedCategory, setSelectedCategory] = React.useState("");

	const { units, loadingList: loadingUnits } = useSelector(
		(s: RootState) => s.units,
	);
	const { categories, loadingList: loadingCategories } = useSelector(
		(s: RootState) => s.categories,
	);
	const { subCategories, loadingList: loadingSubCategories } = useSelector(
		(s: RootState) => s.subCategories,
	);
	const { gsts, loadingList: loadingGSTs } = useSelector(
		(s: RootState) => s.gsts,
	);

	const [initialValues, setInitialValues] = React.useState({
		itemCode: "",
		itemName: "",
		category: "",
		subCategory: "",
		gst: "",
		unit: "",
		remark: "",
	});

	const filteredSubCategories = useMemo(() => {
		if (!selectedCategory) return [];
		return (subCategories || []).filter((sc: any) => {
			const scCat =
				sc.categoryName ||
				sc.category?.name ||
				sc.categoryId ||
				sc.category ||
				sc.category?._id;
			return String(scCat) === String(selectedCategory);
		});
	}, [subCategories, selectedCategory]);

	useEffect(() => {
		dispatch(fetchCategoriesThunk());
		dispatch(fetchUnitsThunk());
		dispatch(fetchSubCategoriesThunk());
		dispatch(fetchGSTsThunk());

		const onFocus = () => {
			dispatch(fetchCategoriesThunk());
			dispatch(fetchUnitsThunk());
			dispatch(fetchSubCategoriesThunk());
			dispatch(fetchGSTsThunk());
		};

		window.addEventListener("focus", onFocus);
		return () => window.removeEventListener("focus", onFocus);
	}, [dispatch]);

	useEffect(() => {
		if (isEdit && id) {
			dispatch(getItemThunk(id));
		}
		return () => {
			dispatch(clearSelected());
		};
	}, [dispatch, id, isEdit]);

	//   set initial values when selected item loads (edit mode)
	useEffect(() => {
		if (isEdit && selected) {
			setSelectedCategory(selected.category ?? "");
			setInitialValues({
				itemName: selected.itemName ?? "",
				itemCode: selected.itemCode ?? "",
				category: selected.category ?? "",
				subCategory: selected.subCategory ?? "",
				gst: selected.gst ?? "",
				unit: selected.unit ?? "",
				remark: selected.remark ?? "",
			});
		}
	}, [selected, isEdit]);

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
					<h5 className='m-0'>{isEdit ? "Edit Item" : "Create Item"}</h5>
					<div style={{ fontSize: 13, color: "#6c757d", marginTop: 2 }}>
						{isEdit ? "Update item details" : "Add a new item"}
					</div>
				</div>
				<Button
					variant='light'
					size='sm'
					onClick={() => nav("/masters/items")}
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
					validateOnBlur={true}
					validateOnChange={true}
					onSubmit={async (values, { setSubmitting }) => {
						const payload = {
							itemName: values.itemName.trim(),
							itemCode: values.itemCode.trim(),
							category: values.category.trim(),
							subCategory: values.subCategory.trim(),
							gst: values.gst.trim(),
							unit: values.unit.trim(),
							remark: values.remark?.trim() || undefined,
						};

						if (isEdit) {
							const res = await dispatch(updateItemThunk({ id: id!, payload }));
							if (updateItemThunk.fulfilled.match(res)) {
								toast.success("Item updated");
								nav("/masters/items", { replace: true });
							} else {
								toast.error(String(res.payload || "Update failed"));
							}
						} else {
							const res = await dispatch(createItemThunk(payload));
							if (createItemThunk.fulfilled.match(res)) {
								toast.success("Item created");
								nav("/masters/items", { replace: true });
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
						handleBlur,
						setFieldValue,
						values,
						touched,
						errors,
						isSubmitting,
					}) => (
						<Form onSubmit={handleSubmit}>
							<Row className='g-3'>
								{/* Item Name */}
								<Col md={6}>
									<Form.Label style={{ fontWeight: "bold" }}>
										Item Name <span style={{ color: "red" }}>*</span>
									</Form.Label>
									<Form.Control
										name='itemName'
										value={values.itemName}
										onChange={(e) => {
											handleChange(e);
											//   auto generate code from initials as user types
											if (!isEdit) {
												const code = generateNextCode(
													e.target.value,
													existingCodes,
												);
												setFieldValue("itemCode", code);
											}
										}}
										onBlur={handleBlur}
										placeholder='Enter item name'
										isInvalid={!!touched.itemName && !!errors.itemName}
										style={{ borderRadius: 8 }}
									/>
									<Form.Control.Feedback type='invalid'>
										{errors.itemName}
									</Form.Control.Feedback>
								</Col>

								{/* Item Code — auto generated */}
								<Col md={6}>
									<Form.Label style={{ fontWeight: "bold" }}>
										Item Code
									</Form.Label>
									<Form.Control
										name='itemCode'
										value={values.itemCode}
										onChange={handleChange}
										onBlur={handleBlur}
										placeholder='Enter item code'
										isInvalid={!!touched.itemCode && !!errors.itemCode}
										style={{
											borderRadius: 8,
										}}
									/>
									<Form.Control.Feedback type='invalid'>
										{errors.itemCode}
									</Form.Control.Feedback>
								</Col>

								{/* Unit */}
								<Col md={6}>
									<Form.Label style={{ fontWeight: "bold" }}>
										Unit <span style={{ color: "red" }}>*</span>
									</Form.Label>
									<Form.Select
										name='unit'
										value={values.unit}
										onChange={handleChange}
										onBlur={handleBlur}
										isInvalid={!!touched.unit && !!errors.unit}
										style={{ borderRadius: 8 }}
									>
										<option value='' disabled>
											{loadingUnits ? "Loading units..." : "Select unit"}
										</option>
										{(units || []).map((u: any) => {
											const uid = u.id || u._id || u.unitName;
											const uname = u.unitName || u.name || u.label;
											return (
												<option key={uid} value={uname}>
													{uname}
												</option>
											);
										})}
									</Form.Select>
									<Form.Control.Feedback type='invalid'>
										{errors.unit as any}
									</Form.Control.Feedback>
								</Col>

								{/* Category */}
								<Col md={6}>
									<Form.Label style={{ fontWeight: "bold" }}>
										Category <span style={{ color: "red" }}>*</span>
									</Form.Label>
									<Form.Select
										name='category'
										value={values.category}
										onChange={(e) => {
											handleChange(e);
											setSelectedCategory(e.target.value);
											setFieldValue("subCategory", "");
										}}
										onBlur={handleBlur}
										isInvalid={!!touched.category && !!errors.category}
										style={{ borderRadius: 8 }}
									>
										<option value='' disabled>
											{loadingCategories
												? "Loading categories..."
												: "Select category"}
										</option>
										{(categories || []).map((c: any) => {
											const cid = c.id || c._id || c.name;
											const cname = c.name || c.categoryName || c.label;
											return (
												<option key={cid} value={cname}>
													{cname}
												</option>
											);
										})}
									</Form.Select>
									<Form.Control.Feedback type='invalid'>
										{errors.category as any}
									</Form.Control.Feedback>
								</Col>

								{/* Sub Category */}
								<Col md={6}>
									<Form.Label style={{ fontWeight: "bold" }}>
										Sub Category <span style={{ color: "red" }}>*</span>
									</Form.Label>
									<Form.Select
										name='subCategory'
										value={values.subCategory}
										onChange={handleChange}
										onBlur={handleBlur}
										isInvalid={!!touched.subCategory && !!errors.subCategory}
										disabled={!selectedCategory}
										style={{ borderRadius: 8 }}
									>
										<option value=''>
											{!selectedCategory
												? "Select category first"
												: loadingSubCategories
													? "Loading sub-categories..."
													: filteredSubCategories.length === 0
														? "No sub-categories available"
														: "Select sub-category"}
										</option>
										{filteredSubCategories.map((sc: any) => {
											const scid = sc.id || sc._id || sc.name;
											const scname = sc.name || sc.subCategoryName || sc.label;
											return (
												<option key={scid} value={scname}>
													{scname}
												</option>
											);
										})}
									</Form.Select>
									<Form.Control.Feedback type='invalid'>
										{errors.subCategory as any}
									</Form.Control.Feedback>
								</Col>

								{/* GST */}
								<Col md={6}>
									<Form.Label style={{ fontWeight: "bold" }}>
										GST <span style={{ color: "red" }}>*</span>
									</Form.Label>
									<Form.Select
										name='gst'
										value={values.gst}
										onChange={handleChange}
										onBlur={handleBlur}
										isInvalid={!!touched.gst && !!errors.gst}
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
										{errors.gst as any}
									</Form.Control.Feedback>
								</Col>

								{/* Remark */}
								<Col md={12}>
									<Form.Label style={{ fontWeight: "bold" }}>Remark</Form.Label>
									<Form.Control
										name='remark'
										value={values.remark}
										onChange={handleChange}
										onBlur={handleBlur}
										placeholder='Enter remark (optional)'
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
									onClick={() => nav("/masters/items")}
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
