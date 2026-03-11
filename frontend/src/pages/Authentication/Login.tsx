// pages/auth/Login.tsx
import { Card, Button, Form, Alert } from "react-bootstrap";
import { Formik } from "formik";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../slices/store";
import { loginThunk } from "../../slices/auth/thunks";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { toast } from "react-toastify";

const Schema = Yup.object({
	phoneOrEmail: Yup.string()
		.trim()
		.min(3, "Min 3 characters")
		.required("Phone or Email is required"),
	password: Yup.string()
		.min(6, "Min 6 characters")
		.required("Password is required"),
});

export default function Login() {
	const dispatch = useDispatch<AppDispatch>();
	const nav = useNavigate();
	const loc = useLocation() as any;
	const { loading, error } = useSelector((s: RootState) => s.auth);

	const redirectTo = loc?.state?.from || "/masters/items";

	return (
		<Card className='p-3'>
			<h4 className='mb-3'>Login</h4>
			{error && <Alert variant='danger'>{error}</Alert>}

			<Formik
				initialValues={{ phoneOrEmail: "", password: "" }}
				validationSchema={Schema}
				onSubmit={async (values, { setSubmitting }) => {
					try {
						await dispatch(
							loginThunk({
								phoneOrEmail: values.phoneOrEmail.trim(),
								password: values.password,
							}),
						).unwrap();

						toast.success("Logged in");
						nav(redirectTo, { replace: true });
					} catch (e: any) {
						toast.error(String(e || "Login failed"));
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
						<Form.Group className='mb-2'>
							<Form.Label>Phone or Email</Form.Label>
							<Form.Control
								name='phoneOrEmail'
								value={values.phoneOrEmail}
								onChange={handleChange}
								isInvalid={!!touched.phoneOrEmail && !!errors.phoneOrEmail}
							/>
							<Form.Control.Feedback type='invalid'>
								{errors.phoneOrEmail}
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
							{loading || isSubmitting ? "Signing in..." : "Login"}
						</Button>

						<div className='mt-3'>
							<small>
								Don&apos;t have an account? <Link to='/register'>Register</Link>
							</small>
						</div>
					</Form>
				)}
			</Formik>
		</Card>
	);
}
