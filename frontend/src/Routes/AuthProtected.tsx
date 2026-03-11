import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../slices/store";
import { getToken } from "../helpers/auth_helper";
import { meThunk, refreshThunk } from "../slices/auth/thunks";
import { canView, canCreate, canUpdate } from "../utils/permission";
import type { UserPermissions } from "../types/auth";

type Props = {
	children: ReactNode;
	section?: keyof UserPermissions;
	module?: string;
	action?: "view" | "create" | "update";
};

export default function AuthProtected({
	children,
	section,
	module,
	action = "view",
}: Props) {
	const location = useLocation();
	const dispatch = useDispatch<AppDispatch>();

	const reduxToken = useSelector((s: RootState) => s.auth.token);
	const authUser = useSelector((s: RootState) => s.auth.user);

	const [checking, setChecking] = useState(true);
	const [allowed, setAllowed] = useState(false);

	useEffect(() => {
		(async () => {
			const token = reduxToken || getToken();

			if (token) {
				setAllowed(true);
				await dispatch(meThunk());
				setChecking(false);
				return;
			}

			const res = await dispatch(refreshThunk());
			if (refreshThunk.fulfilled.match(res)) {
				setAllowed(true);
				await dispatch(meThunk());
			} else {
				setAllowed(false);
			}

			setChecking(false);
		})();
	}, [dispatch, reduxToken, location.pathname]);

	if (checking) return null;

	if (!allowed) {
		return <Navigate to='/login' replace state={{ from: location.pathname }} />;
	}

	if (section && module) {
		let hasAccess = false;

		if (action === "view") {
			hasAccess = canView(authUser, section, module);
		} else if (action === "create") {
			hasAccess = canCreate(authUser, section, module);
		} else if (action === "update") {
			hasAccess = canUpdate(authUser, section, module);
		}

		if (!hasAccess) {
			return <Navigate to='/access-denied' replace />;
		}
	}

	return <>{children}</>;
}