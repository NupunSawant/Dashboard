// pages/auth/Register.tsx
import { Card, Button, Form, Alert } from "react-bootstrap";
import { Formik } from "formik";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../slices/store";
import { registerThunk } from "../../slices/auth/thunks";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";

const Schema = Yup.object({
	name: Yup.string().trim().min(2, "Min 2 characters").required("Name is required"),
	phone: Yup.string()
		.trim()
		.matches(/^\d+$/, "Phone must contain only digits")
		.min(10, "Min 10 digits")
		.max(15, "Max 15 digits")
		.required("Phone is required"),
	email: Yup.string().trim().email("Invalid email").required("Email is required"),
	password: Yup.string()
		.min(6, "Min 6 characters")
		.required("Password is required"),
});

export default function Register() {
	const dispatch = useDispatch<AppDispatch>();
	const nav = useNavigate();
	const { loading, error } = useSelector((s: RootState) => s.auth);

	return (
		<Card className='p-3'>
			<h4 className='mb-3'>Register</h4>

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
				{({ handleSubmit, handleChange, values, touched, errors, isSubmitting }) => (
					<Form onSubmit={handleSubmit}>
						<Form.Group className='mb-2'>
							<Form.Label>Name</Form.Label>
							<Form.Control
								name='name'
								value={values.name}
								onChange={handleChange}
								isInvalid={!!touched.name && !!errors.name}
							/>
							<Form.Control.Feedback type='invalid'>
								{errors.name}
							</Form.Control.Feedback>
						</Form.Group>

						<Form.Group className='mb-2'>
							<Form.Label>Phone</Form.Label>
							<Form.Control
								name='phone'
								value={values.phone}
								onChange={handleChange}
								isInvalid={!!touched.phone && !!errors.phone}
							/>
							<Form.Control.Feedback type='invalid'>
								{errors.phone}
							</Form.Control.Feedback>
						</Form.Group>

						<Form.Group className='mb-2'>
							<Form.Label>Email</Form.Label>
							<Form.Control
								name='email'
								value={values.email}
								onChange={handleChange}
								isInvalid={!!touched.email && !!errors.email}
							/>
							<Form.Control.Feedback type='invalid'>
								{errors.email}
							</Form.Control.Feedback>
						</Form.Group>

						<Form.Group className='mb-3'>
							<Form.Label>Password</Form.Label>
							<Form.Control
								name='password'
								type='password'
								value={values.password}
								onChange={handleChange}
								isInvalid={!!touched.password && !!errors.password}
							/>
							<Form.Control.Feedback type='invalid'>
								{errors.password}
							</Form.Control.Feedback>
						</Form.Group>

						<Button type='submit' disabled={loading || isSubmitting}>
							{loading || isSubmitting ? "Creating..." : "Register"}
						</Button>

						<div className='mt-3'>
							<small>
								Already have an account? <Link to='/login'>Login</Link>
							</small>
						</div>
					</Form>
				)}
			</Formik>
		</Card>
	);
}