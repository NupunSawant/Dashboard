import { useEffect } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../slices/store";
import { logoutThunk } from "../../slices/auth/thunks";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

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
	return null;
}
