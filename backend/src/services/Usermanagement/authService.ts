import { User } from "../../models/User";
import { RefreshSession } from "../../models/RefreshSession";
import { hashPassword, verifyPassword } from "../../utils/password";
import {
	sha256,
	signAccessToken,
	signRefreshToken,
	verifyRefreshToken,
} from "../../utils/jwt";

const parseExpiryMs = (value: string) => {
	// supports "1d", "7d", "15m", "24h"
	const match = /^(\d+)([mhd])$/.exec(value.trim());
	if (!match) return 24 * 60 * 60 * 1000; // default 1 day

	const num = Number(match[1]);
	const unit = match[2];

	if (unit === "m") return num * 60 * 1000;
	if (unit === "h") return num * 60 * 60 * 1000;
	return num * 24 * 60 * 60 * 1000; // "d"
};

export const registerUser = async (data: {
	name: string;
	phone: string;
	email: string;
	password: string;
}) => {
	const trimmedName = data.name.trim();
	const [firstNameRaw, ...lastNameParts] = trimmedName.split(/\s+/);
	const firstName = firstNameRaw || trimmedName;
	const lastName = lastNameParts.join(" ");
	const email = data.email.toLowerCase().trim();
	const phone = data.phone.trim();
	const userName = email;

	const existing = await User.findOne({
		$or: [{ phone }, { email }, { userName }],
	});

	if (existing) {
		throw Object.assign(new Error("Phone or email already registered"), {
			statusCode: 409,
		});
	}

	const passwordHash = await hashPassword(data.password);

	const user = await User.create({
		firstName,
		lastName,
		userName,
		userType: "Staff", //   default role for signup
		phone,
		email,
		passwordHash,

		//   do NOT pass empty strings for optional fields
	});

	return { user };
};

export const loginUser = async (data: {
	phoneOrEmail: string;
	password: string;
}) => {
	const key = data.phoneOrEmail.trim().toLowerCase();

	const user = await User.findOne({
		$or: [{ email: key }, { phone: data.phoneOrEmail.trim() }],
	});

	if (!user) {
		throw Object.assign(new Error("Invalid credentials"), { statusCode: 401 });
	}

	const ok = await verifyPassword(data.password, user.passwordHash);
	if (!ok) {
		throw Object.assign(new Error("Invalid credentials"), { statusCode: 401 });
	}

	const accessToken = signAccessToken(user.id);
	const refreshToken = signRefreshToken(user.id);

	const refreshTokenHash = sha256(refreshToken);
	const expiresAt = new Date(
		Date.now() + parseExpiryMs(process.env.REFRESH_TOKEN_EXPIRES || "1d"),
	);

	await RefreshSession.create({
		userId: user._id,
		refreshTokenHash,
		expiresAt,
	});

	return {
		user,
		accessToken,
		refreshToken,
	};
};

export const refreshAccessToken = async (refreshToken: string) => {
	const decoded = verifyRefreshToken(refreshToken);
	const userId = decoded.sub as string;

	const tokenHash = sha256(refreshToken);

	const session = await RefreshSession.findOne({
		userId,
		refreshTokenHash: tokenHash,
	});

	if (!session) {
		throw Object.assign(new Error("Refresh session not found"), {
			statusCode: 401,
		});
	}

	const accessToken = signAccessToken(userId);
	return { accessToken };
};

export const logoutUser = async (refreshToken?: string) => {
	if (!refreshToken) return;

	const tokenHash = sha256(refreshToken);
	await RefreshSession.deleteOne({ refreshTokenHash: tokenHash });
};
