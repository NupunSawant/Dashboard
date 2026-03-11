export const formatUser = (user?: any) => {
	if (!user) return null;
	const nameParts = [user.firstName, user.lastName].filter(Boolean);
	const name =
		nameParts.join(" ") || user.userName || user.email || user.phone || "";
	return {
		id: user._id || user.id,
		name: name || "-",
	};
};
