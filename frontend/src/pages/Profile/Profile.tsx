// Profile.tsx
import { useEffect, useMemo, useState } from "react";
import {
	Card,
	Button,
	Form,
	Alert,
	Row,
	Col,
	Spinner,
	Badge,
} from "react-bootstrap";
import { Formik } from "formik";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../slices/store";
import { toast } from "react-toastify";

import {
	fetchUsersThunk,
	updateUserThunk,
	updatePasswordThunk,
} from "../../slices/users/thunks";

const theme = "#1a8376";

type ProfileUser = {
	_id?: string;
	id?: string;

	firstName?: string;
	lastName?: string;
	userName?: string;
	desgination?: string;
	userType?: string;

	phone?: string;
	email?: string;

	address?: string;
	country?: string;
	state?: string;
	city?: string;
	pincode?: string;

	createdAt?: string;
	updatedAt?: string;
};

const ProfileSchema = Yup.object({
	firstName: Yup.string().trim().required("First name is required"),
	lastName: Yup.string().trim().required("Last name is required"),
	userName: Yup.string().trim().required("Username is required"),
	desgination: Yup.string().trim().required("Desgination is required"),
	userType: Yup.string().trim().required("User type is required"),
	phone: Yup.string().trim().required("Phone is required"),
	email: Yup.string()
		.trim()
		.lowercase()
		.email("Invalid email")
		.required("Email is required"),
	address: Yup.string().trim().required("Address is required"),
	country: Yup.string().trim().required("Country is required"),
	state: Yup.string().trim().required("State is required"),
	city: Yup.string().trim().required("City is required"),
	pincode: Yup.string().trim().required("Pincode is required"),
});

const PasswordSchema = Yup.object({
	currentPassword: Yup.string().required("Current password required"),
	newPassword: Yup.string()
		.min(6, "Min 6 chars")
		.required("New password required"),
	confirmPassword: Yup.string()
		.oneOf([Yup.ref("newPassword")], "Passwords do not match")
		.required("Confirm password required"),
});

function pickUserFromPayload(payload: any): ProfileUser | null {
	// handles common response shapes:
	// payload.user, payload.data.user, payload.data, payload (object), payload.users[], payload.data.users[]
	const directUser = payload?.user || payload?.data?.user;
	if (
		directUser &&
		typeof directUser === "object" &&
		!Array.isArray(directUser)
	) {
		return directUser as ProfileUser;
	}

	const maybeObj = payload?.data || payload;
	if (maybeObj && typeof maybeObj === "object" && !Array.isArray(maybeObj)) {
		// if this looks like a user object
		if (maybeObj.email || maybeObj.userName || maybeObj.firstName)
			return maybeObj as ProfileUser;
	}

	const usersArray =
		payload?.users || payload?.data?.users || payload?.data || payload;
	if (Array.isArray(usersArray) && usersArray.length > 0) {
		// If API returns list, pick first (or you can customize matching)
		return usersArray[0] as ProfileUser;
	}

	return null;
}

export default function Profile() {
	const dispatch = useDispatch<AppDispatch>();

	// Keep your existing auth selector (for loading/error), but DON'T trust it for profile data
	const { loading, error } = useSelector((s: RootState) => s.auth) as {
		loading: boolean;
		error: string | null;
	};

	//   Local state that will definitely hold fetched user
	const [profileUser, setProfileUser] = useState<ProfileUser | null>(null);

	const [editMode, setEditMode] = useState(false);
	const [showPassword, setShowPassword] = useState(false);

	useEffect(() => {
		(async () => {
			try {
				const res: any = await dispatch(fetchUsersThunk() as any);
				const u = pickUserFromPayload(res?.payload);

				if (u) {
					setProfileUser(u);
				} else {
					// If thunk didn't return user payload, still try reading from store (optional fallback)
					// You can remove this if not needed.
					toast.error("Profile data not found in API response");
				}
			} catch {
				// ignore here, error is already shown from store
			}
		})();
	}, [dispatch]);

	const initialProfileValues = useMemo(
		() => ({
			firstName: profileUser?.firstName || "",
			lastName: profileUser?.lastName || "",
			userName: profileUser?.userName || "",
			desgination: profileUser?.desgination || "",
			userType: profileUser?.userType || "",
			phone: profileUser?.phone || "",
			email: profileUser?.email || "",
			address: profileUser?.address || "",
			country: profileUser?.country || "",
			state: profileUser?.state || "",
			city: profileUser?.city || "",
			pincode: profileUser?.pincode || "",
		}),
		[profileUser],
	);

	const initialPasswordValues = useMemo(
		() => ({
			currentPassword: "",
			newPassword: "",
			confirmPassword: "",
		}),
		[],
	);

	const fmtDate = (d?: string) => {
		if (!d) return "-";
		const dt = new Date(d);
		if (Number.isNaN(dt.getTime())) return d;
		return dt.toLocaleString();
	};

	const displayName =
		`${profileUser?.firstName || ""} ${profileUser?.lastName || ""}`.trim();
	const userId = profileUser?.id || profileUser?._id;

	return (
		<div className='container-fluid'>
			<Row className='mb-3'>
				<Col>
					<div className='d-flex align-items-center justify-content-between'>
						<div>
							<h4 className='mb-1'>Profile</h4>
							<div className='text-muted'>Manage your account details</div>
						</div>

						<div className='d-flex gap-2'>
							<Button
								variant={editMode ? "outline-secondary" : "outline-success"}
								style={
									!editMode ? { borderColor: theme, color: theme } : undefined
								}
								onClick={() => setEditMode((v) => !v)}
								disabled={loading || !profileUser}
							>
								{editMode ? "Cancel Edit" : "Edit Profile"}
							</Button>

							<Button
								variant={showPassword ? "outline-secondary" : "outline-success"}
								style={
									!showPassword
										? { borderColor: theme, color: theme }
										: undefined
								}
								onClick={() => setShowPassword((v) => !v)}
								disabled={loading || !profileUser}
							>
								{showPassword ? "Hide Password" : "Change Password"}
							</Button>
						</div>
					</div>
				</Col>
			</Row>

			{error ? (
				<Alert variant='danger' className='mb-3'>
					{error}
				</Alert>
			) : null}

			{!profileUser ? (
				<Card className='shadow-sm border-0'>
					<Card.Body className='d-flex align-items-center gap-2'>
						<Spinner size='sm' />
						<div className='text-muted'>Loading profile...</div>
					</Card.Body>
				</Card>
			) : (
				<Row className='g-3'>
					<Col lg={7}>
						<Card className='shadow-sm border-0'>
							<Card.Header className='bg-white border-0 d-flex justify-content-between align-items-center'>
								<div className='d-flex align-items-center gap-2'>
									<span className='fw-semibold'>
										Account Details{displayName ? ` — ${displayName}` : ""}
									</span>
									{userId ? (
										<Badge bg='light' text='dark'>
											ID: {userId}
										</Badge>
									) : null}
								</div>
								{loading ? (
									<div className='d-flex align-items-center gap-2 text-muted'>
										<Spinner size='sm' />
										Loading...
									</div>
								) : null}
							</Card.Header>

							<Card.Body>
								<Formik
									//   Force remount when user arrives (fixes “still empty” issues)
									key={userId || "profile"}
									enableReinitialize
									initialValues={initialProfileValues as any}
									validationSchema={ProfileSchema}
									onSubmit={async (values, { setSubmitting }) => {
										try {
											if (!userId) {
												toast.error("User ID is missing");
												setSubmitting(false);
												return;
											}

											const payload = {
												firstName: values.firstName.trim(),
												lastName: values.lastName.trim(),
												userName: values.userName.trim(),
												desgination: values.desgination.trim(),
												userType: values.userType.trim(),
												phone: String(values.phone).trim(),
												email: values.email.trim().toLowerCase(),
												address: values.address.trim(),
												country: values.country.trim(),
												state: values.state.trim(),
												city: values.city.trim(),
												pincode: values.pincode.trim(),
											};

											const res: any = await dispatch(
												updateUserThunk({ id: userId, payload }) as any,
											);

											if (res?.meta?.requestStatus === "rejected") {
												throw new Error(res?.payload || "Update failed");
											}

											toast.success("Profile updated");
											setEditMode(false);

											// refresh & set local profile again
											const fresh: any = await dispatch(
												fetchUsersThunk() as any,
											);
											const u = pickUserFromPayload(fresh?.payload);
											if (u) setProfileUser(u);
										} catch (e: any) {
											toast.error(e?.message || "Failed to update profile");
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
										resetForm,
									}) => (
										<Form
											onSubmit={(e) => {
												e.preventDefault();
												handleSubmit();
											}}
										>
											<Row className='g-3'>
												<Col md={6}>
													<Form.Label className='fw-semibold'>
														First Name
													</Form.Label>
													<Form.Control
														name='firstName'
														value={values.firstName}
														onChange={handleChange}
														disabled={!editMode || loading || isSubmitting}
														isInvalid={
															!!(touched.firstName && errors.firstName)
														}
														placeholder='Enter first name'
													/>
													<Form.Control.Feedback type='invalid'>
														{errors.firstName as any}
													</Form.Control.Feedback>
												</Col>

												<Col md={6}>
													<Form.Label className='fw-semibold'>
														Last Name
													</Form.Label>
													<Form.Control
														name='lastName'
														value={values.lastName}
														onChange={handleChange}
														disabled={!editMode || loading || isSubmitting}
														isInvalid={!!(touched.lastName && errors.lastName)}
														placeholder='Enter last name'
													/>
													<Form.Control.Feedback type='invalid'>
														{errors.lastName as any}
													</Form.Control.Feedback>
												</Col>

												<Col md={6}>
													<Form.Label className='fw-semibold'>
														Username
													</Form.Label>
													<Form.Control
														name='userName'
														value={values.userName}
														onChange={handleChange}
														disabled={!editMode || loading || isSubmitting}
														isInvalid={!!(touched.userName && errors.userName)}
														placeholder='Enter username'
													/>
													<Form.Control.Feedback type='invalid'>
														{errors.userName as any}
													</Form.Control.Feedback>
												</Col>

												<Col md={6}>
													<Form.Label className='fw-semibold'>
														Desgination
													</Form.Label>
													<Form.Control
														name='desgination'
														value={values.desgination}
														onChange={handleChange}
														disabled={!editMode || loading || isSubmitting}
														isInvalid={
															!!(touched.desgination && errors.desgination)
														}
														placeholder='Enter desgination'
													/>
													<Form.Control.Feedback type='invalid'>
														{errors.desgination as any}
													</Form.Control.Feedback>
												</Col>

												<Col md={6}>
													<Form.Label className='fw-semibold'>
														User Type
													</Form.Label>
													<Form.Control
														name='userType'
														value={values.userType}
														onChange={handleChange}
														disabled={!editMode || loading || isSubmitting}
														isInvalid={!!(touched.userType && errors.userType)}
														placeholder='Enter user type'
													/>
													<Form.Control.Feedback type='invalid'>
														{errors.userType as any}
													</Form.Control.Feedback>
												</Col>

												<Col md={6}>
													<Form.Label className='fw-semibold'>Phone</Form.Label>
													<Form.Control
														name='phone'
														value={values.phone}
														onChange={handleChange}
														disabled={!editMode || loading || isSubmitting}
														isInvalid={!!(touched.phone && errors.phone)}
														placeholder='Enter phone number'
													/>
													<Form.Control.Feedback type='invalid'>
														{errors.phone as any}
													</Form.Control.Feedback>
												</Col>

												<Col md={12}>
													<Form.Label className='fw-semibold'>Email</Form.Label>
													<Form.Control
														name='email'
														value={values.email}
														onChange={handleChange}
														disabled={!editMode || loading || isSubmitting}
														isInvalid={!!(touched.email && errors.email)}
														placeholder='Enter email'
													/>
													<Form.Control.Feedback type='invalid'>
														{errors.email as any}
													</Form.Control.Feedback>
												</Col>

												<Col md={12}>
													<Form.Label className='fw-semibold'>
														Address
													</Form.Label>
													<Form.Control
														name='address'
														value={values.address}
														onChange={handleChange}
														disabled={!editMode || loading || isSubmitting}
														isInvalid={!!(touched.address && errors.address)}
														placeholder='Enter address'
													/>
													<Form.Control.Feedback type='invalid'>
														{errors.address as any}
													</Form.Control.Feedback>
												</Col>

												<Col md={6}>
													<Form.Label className='fw-semibold'>
														Country
													</Form.Label>
													<Form.Control
														name='country'
														value={values.country}
														onChange={handleChange}
														disabled={!editMode || loading || isSubmitting}
														isInvalid={!!(touched.country && errors.country)}
														placeholder='Enter country'
													/>
													<Form.Control.Feedback type='invalid'>
														{errors.country as any}
													</Form.Control.Feedback>
												</Col>

												<Col md={6}>
													<Form.Label className='fw-semibold'>State</Form.Label>
													<Form.Control
														name='state'
														value={values.state}
														onChange={handleChange}
														disabled={!editMode || loading || isSubmitting}
														isInvalid={!!(touched.state && errors.state)}
														placeholder='Enter state'
													/>
													<Form.Control.Feedback type='invalid'>
														{errors.state as any}
													</Form.Control.Feedback>
												</Col>

												<Col md={6}>
													<Form.Label className='fw-semibold'>City</Form.Label>
													<Form.Control
														name='city'
														value={values.city}
														onChange={handleChange}
														disabled={!editMode || loading || isSubmitting}
														isInvalid={!!(touched.city && errors.city)}
														placeholder='Enter city'
													/>
													<Form.Control.Feedback type='invalid'>
														{errors.city as any}
													</Form.Control.Feedback>
												</Col>

												<Col md={6}>
													<Form.Label className='fw-semibold'>
														Pincode
													</Form.Label>
													<Form.Control
														name='pincode'
														value={values.pincode}
														onChange={handleChange}
														disabled={!editMode || loading || isSubmitting}
														isInvalid={!!(touched.pincode && errors.pincode)}
														placeholder='Enter pincode'
													/>
													<Form.Control.Feedback type='invalid'>
														{errors.pincode as any}
													</Form.Control.Feedback>
												</Col>

												<Col md={6}>
													<div className='text-muted small'>Created</div>
													<div className='fw-semibold'>
														{fmtDate(profileUser?.createdAt)}
													</div>
												</Col>
												<Col md={6}>
													<div className='text-muted small'>Updated</div>
													<div className='fw-semibold'>
														{fmtDate(profileUser?.updatedAt)}
													</div>
												</Col>

												{editMode ? (
													<Col md={12} className='d-flex gap-2 mt-2'>
														<Button
															type='submit'
															variant='success'
															style={{
																backgroundColor: theme,
																borderColor: theme,
															}}
															disabled={loading || isSubmitting}
														>
															{isSubmitting ? (
																<>
																	<Spinner size='sm' className='me-2' />
																	Saving...
																</>
															) : (
																"Save Changes"
															)}
														</Button>

														<Button
															type='button'
															variant='outline-secondary'
															disabled={loading || isSubmitting}
															onClick={() => {
																resetForm();
																setEditMode(false);
															}}
														>
															Cancel
														</Button>
													</Col>
												) : null}
											</Row>
										</Form>
									)}
								</Formik>
							</Card.Body>
						</Card>
					</Col>

					<Col lg={5}>
						<Card className='shadow-sm border-0'>
							<Card.Header className='bg-white border-0'>
								<span className='fw-semibold'>Security</span>
							</Card.Header>

							<Card.Body>
								{!showPassword ? (
									<Alert variant='light' className='mb-0'>
										Click <b>Change Password</b> to update your password.
									</Alert>
								) : (
									<Formik
										initialValues={initialPasswordValues}
										validationSchema={PasswordSchema}
										onSubmit={async (values, { setSubmitting, resetForm }) => {
											try {
												if (!profileUser?._id && !profileUser?.id) {
													toast.error("User ID is missing");
													setSubmitting(false);
													return;
												}

												const id = (profileUser?._id ||
													profileUser?.id) as string;

												const res: any = await dispatch(
													updatePasswordThunk({
														id,
														payload: { password: values.newPassword },
													}) as any,
												);

												if (res?.meta?.requestStatus === "rejected") {
													throw new Error(
														res?.payload || "Password change failed",
													);
												}

												toast.success("Password updated");
												resetForm();
												setShowPassword(false);
											} catch (e: any) {
												toast.error(e?.message || "Failed to change password");
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
											<Form
												onSubmit={(e) => {
													e.preventDefault();
													handleSubmit();
												}}
											>
												<Row className='g-3'>
													<Col md={12}>
														<Form.Label className='fw-semibold'>
															Current Password
														</Form.Label>
														<Form.Control
															type='password'
															name='currentPassword'
															value={values.currentPassword}
															onChange={handleChange}
															disabled={loading || isSubmitting}
															isInvalid={
																!!(
																	touched.currentPassword &&
																	errors.currentPassword
																)
															}
														/>
														<Form.Control.Feedback type='invalid'>
															{errors.currentPassword as any}
														</Form.Control.Feedback>
													</Col>

													<Col md={12}>
														<Form.Label className='fw-semibold'>
															New Password
														</Form.Label>
														<Form.Control
															type='password'
															name='newPassword'
															value={values.newPassword}
															onChange={handleChange}
															disabled={loading || isSubmitting}
															isInvalid={
																!!(touched.newPassword && errors.newPassword)
															}
														/>
														<Form.Control.Feedback type='invalid'>
															{errors.newPassword as any}
														</Form.Control.Feedback>
													</Col>

													<Col md={12}>
														<Form.Label className='fw-semibold'>
															Confirm Password
														</Form.Label>
														<Form.Control
															type='password'
															name='confirmPassword'
															value={values.confirmPassword}
															onChange={handleChange}
															disabled={loading || isSubmitting}
															isInvalid={
																!!(
																	touched.confirmPassword &&
																	errors.confirmPassword
																)
															}
														/>
														<Form.Control.Feedback type='invalid'>
															{errors.confirmPassword as any}
														</Form.Control.Feedback>
													</Col>

													<Col md={12} className='d-flex gap-2'>
														<Button
															type='submit'
															variant='success'
															style={{
																backgroundColor: theme,
																borderColor: theme,
															}}
															disabled={loading || isSubmitting}
														>
															{isSubmitting ? (
																<>
																	<Spinner size='sm' className='me-2' />
																	Updating...
																</>
															) : (
																"Update Password"
															)}
														</Button>

														<Button
															type='button'
															variant='outline-secondary'
															disabled={loading || isSubmitting}
															onClick={() => setShowPassword(false)}
														>
															Cancel
														</Button>
													</Col>
												</Row>
											</Form>
										)}
									</Formik>
								)}
							</Card.Body>
						</Card>
					</Col>
				</Row>
			)}
		</div>
	);
}
