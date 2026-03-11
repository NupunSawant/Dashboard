import type { ReactNode } from "react";
import AuthProtected from "./AuthProtected";
import type { UserPermissions } from "../types/auth";

export function guard(
	element: ReactNode,
	section?: keyof UserPermissions,
	module?: string,
	action: "view" | "create" | "update" = "view",
) {
	if (!section || !module) {
		return <AuthProtected>{element}</AuthProtected>;
	}

	return (
		<AuthProtected section={section} module={module} action={action}>
			{element}
		</AuthProtected>
	);
}