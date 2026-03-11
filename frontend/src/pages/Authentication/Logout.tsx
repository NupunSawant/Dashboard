// pages/auth/Logout.tsx
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../slices/store";
import { logoutThunk } from "../../slices/auth/thunks";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Card, Spinner } from "react-bootstrap";

const theme = "#1a8376";

export default function Logout() {
	const dispatch = useDispatch<AppDispatch>();
	const nav = useNavigate();

	useEffect(() => {
		(async () => {
			await dispatch(logoutThunk());
			toast.info("Logged out");
			nav("/login");
		})();
	}, [dispatch, nav]);

	return (
		<div
			className='d-flex justify-content-center align-items-center'
			style={{ minHeight: "70vh" }}
		>
			<Card
				className='text-center p-4 shadow-sm border-0'
				style={{ width: 320 }}
			>
				<Spinner animation='border' style={{ color: theme }} className='mb-3' />
				<h5 style={{ color: theme }}>Logging out...</h5>
				<p className='text-muted mb-0' style={{ fontSize: 14 }}>
					Please wait while we securely log you out.
				</p>
			</Card>
		</div>
	);
}
