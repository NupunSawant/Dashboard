import type { AuthUser } from "../types/auth";

type Action = "view" | "create" | "update";

/**
 * Generic permission checker
 */
export function hasPermission(
	user: AuthUser | null | undefined,
	section: keyof AuthUser["permissions"],
	module: string,
	action: Action,
) {
	if (!user) return false;

	const sectionPerm = user.permissions?.[section];
	if (!sectionPerm) return false;

	const modulePerm = (sectionPerm as any)?.[module];
	if (!modulePerm) return false;

	return !!modulePerm[action];
}

/**
 * View permission
 */
export function canView(
	user: AuthUser | null | undefined,
	section: keyof AuthUser["permissions"],
	module: string,
) {
	return hasPermission(user, section, module, "view");
}

/**
 * Create permission
 */
export function canCreate(
	user: AuthUser | null | undefined,
	section: keyof AuthUser["permissions"],
	module: string,
) {
	return hasPermission(user, section, module, "create");
}

/**
 * Update permission
 */
export function canUpdate(
	user: AuthUser | null | undefined,
	section: keyof AuthUser["permissions"],
	module: string,
) {
	return hasPermission(user, section, module, "update");
}