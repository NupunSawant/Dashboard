// pages/auth/Register.tsx
import { Card, Button, Form, Alert } from "react-bootstrap";
import { Formik } from "formik";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../slices/store";
import { registerThunk } from "../../slices/auth/thunks";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";

const theme = "#1a8376";

const Schema = Yup.object({
	name: Yup.string()
		.trim()
		.min(2, "Min 2 characters")
		.required("Name is required"),
	phone: Yup.string()
		.trim()
		.matches(/^\d+$/, "Phone must contain only digits")
		.min(10, "Min 10 digits")
		.max(15, "Max 15 digits")
		.required("Phone is required"),
	email: Yup.string()
		.trim()
		.email("Invalid email")
		.required("Email is required"),
	password: Yup.string()
		.min(6, "Min 6 characters")
		.required("Password is required"),
});

export default function Register() {
	const dispatch = useDispatch<AppDispatch>();
	const nav = useNavigate();
	const { loading, error } = useSelector((s: RootState) => s.auth);

	return (
		<Card
			className='p-4 shadow-sm border-0'
			style={{
				maxWidth: 420,
				margin: "80px auto",
				borderRadius: 12,
			}}
		>
			<h4
				className='mb-4 text-center'
				style={{ color: theme, fontWeight: 600 }}
			>
				Register
			</h4>

			{error && <Alert variant='danger'>{error}</Alert>}

			<Formik
				initialValues={{ name: "", phone: "", email: "", password: "" }}
				validationSchema={Schema}
				onSubmit={async (values, { setSubmitting, resetForm }) => {
					try {
						const payload = {
							name: values.name.trim(),
							phone: values.phone.trim(),
							email: values.email.trim(),
							password: values.password,
						};

						await dispatch(registerThunk(payload)).unwrap();

						toast.success("Registered successfully. Please login.");
						resetForm();
						nav("/login", { replace: true });
					} catch (e: any) {
						toast.error(String(e || "Register failed"));
					} finally {
						setSubmitting(false);
					}
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
						<Form.Group className='mb-3'>
							<Form.Label className='fw-semibold'>Name</Form.Label>
							<Form.Control
								name='name'
								placeholder='Enter full name'
								value={values.name}
								onChange={handleChange}
								isInvalid={!!touched.name && !!errors.name}
								style={{ borderRadius: 8 }}
							/>
							<Form.Control.Feedback type='invalid'>
								{errors.name}
							</Form.Control.Feedback>
						</Form.Group>

						<Form.Group className='mb-3'>
							<Form.Label className='fw-semibold'>Phone</Form.Label>
							<Form.Control
								name='phone'
								placeholder='Enter phone number'
								value={values.phone}
								onChange={handleChange}
								isInvalid={!!touched.phone && !!errors.phone}
								style={{ borderRadius: 8 }}
							/>
							<Form.Control.Feedback type='invalid'>
								{errors.phone}
							</Form.Control.Feedback>
						</Form.Group>

						<Form.Group className='mb-3'>
							<Form.Label className='fw-semibold'>Email</Form.Label>
							<Form.Control
								name='email'
								type='email'
								placeholder='Enter email'
								value={values.email}
								onChange={handleChange}
								isInvalid={!!touched.email && !!errors.email}
								style={{ borderRadius: 8 }}
							/>
							<Form.Control.Feedback type='invalid'>
								{errors.email}
							</Form.Control.Feedback>
						</Form.Group>

						<Form.Group className='mb-3'>
							<Form.Label className='fw-semibold'>Password</Form.Label>
							<Form.Control
								name='password'
								type='password'
								placeholder='Create password'
								value={values.password}
								onChange={handleChange}
								isInvalid={!!touched.password && !!errors.password}
								style={{ borderRadius: 8 }}
							/>
							<Form.Control.Feedback type='invalid'>
								{errors.password}
							</Form.Control.Feedback>
						</Form.Group>

						<Button
							type='submit'
							className='w-100'
							style={{
								backgroundColor: theme,
								borderColor: theme,
								borderRadius: 8,
								fontWeight: 600,
							}}
							disabled={loading || isSubmitting}
						>
							{loading || isSubmitting ? "Creating..." : "Register"}
						</Button>

						<div className='mt-3 text-center'>
							<small>
								Already have an account?{" "}
								<Link to='/login' style={{ color: theme }}>
									Login
								</Link>
							</small>
						</div>
					</Form>
				)}
			</Formik>
		</Card>
	);
}
