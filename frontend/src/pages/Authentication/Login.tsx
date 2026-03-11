// pages/auth/Login.tsx
import { Card, Button, Form, Alert } from "react-bootstrap";
import { Formik } from "formik";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../slices/store";
import { loginThunk } from "../../slices/auth/thunks";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { toast } from "react-toastify";

const theme = "#1a8376";

const Schema = Yup.object({
	phoneOrEmail: Yup.string()
		.trim()
		.min(3, "Min 3 characters")
		.required("Phone or Email is required"),
	password: Yup.string()
		.min(6, "Min 6 characters")
		.required("Password is required"),
	rememberMe: Yup.boolean(),
});

export default function Login() {
	const dispatch = useDispatch<AppDispatch>();
	const nav = useNavigate();
	const loc = useLocation() as any;
	const { loading, error } = useSelector((s: RootState) => s.auth);

	const redirectTo = loc?.state?.from || "/masters/items";

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
				Login
			</h4>

			{error && <Alert variant='danger'>{error}</Alert>}

			<Formik
				initialValues={{ phoneOrEmail: "", password: "", rememberMe: false }}
				validationSchema={Schema}
				onSubmit={async (values, { setSubmitting }) => {
					try {
						await dispatch(
							loginThunk({
								phoneOrEmail: values.phoneOrEmail.trim(),
								password: values.password,
								rememberMe: values.rememberMe,
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
					setFieldValue,
				}) => (
					<Form onSubmit={handleSubmit}>
						<Form.Group className='mb-3'>
							<Form.Label className='fw-semibold'>Phone or Email</Form.Label>
							<Form.Control
								name='phoneOrEmail'
								placeholder='Enter phone or email'
								value={values.phoneOrEmail}
								onChange={handleChange}
								isInvalid={!!touched.phoneOrEmail && !!errors.phoneOrEmail}
								style={{ borderRadius: 8 }}
							/>
							<Form.Control.Feedback type='invalid'>
								{errors.phoneOrEmail}
							</Form.Control.Feedback>
						</Form.Group>

						<Form.Group className='mb-3'>
							<Form.Label className='fw-semibold'>Password</Form.Label>
							<Form.Control
								name='password'
								type='password'
								placeholder='Enter password'
								value={values.password}
								onChange={handleChange}
								isInvalid={!!touched.password && !!errors.password}
								style={{ borderRadius: 8 }}
							/>
							<Form.Control.Feedback type='invalid'>
								{errors.password}
							</Form.Control.Feedback>
						</Form.Group>

						<Form.Group className='mb-3'>
							<Form.Check
								id='rememberMe'
								name='rememberMe'
								type='checkbox'
								label='Remember me for 7 days'
								checked={values.rememberMe}
								onChange={(e) =>
									setFieldValue("rememberMe", e.currentTarget.checked)
								}
							/>
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
							{loading || isSubmitting ? "Signing in..." : "Login"}
						</Button>

						<div className='mt-3 text-center'>
							<small>
								Don&apos;t have an account?{" "}
								<Link to='/register' style={{ color: theme }}>
									Register
								</Link>
							</small>
						</div>
					</Form>
				)}
			</Formik>
		</Card>
	);
}
