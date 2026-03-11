import { User } from "../../models/User";
import { RefreshSession } from "../../models/RefreshSession";
import { hashPassword, verifyPassword } from "../../utils/password";
import {
	sha256,
	signAccessToken,
	signRefreshToken,
	verifyRefreshToken,
} from "../../utils/jwt";
import type { StringValue } from "ms";

const DEFAULT_REFRESH_EXPIRY = (process.env.REFRESH_TOKEN_EXPIRES ||
	"1d") as StringValue;

const REMEMBER_ME_REFRESH_EXPIRY: StringValue = "7d";

const parseExpiryMs = (value: StringValue) => {
	const match = /^(\d+)([mhd])$/.exec(String(value).trim());

	if (!match) return 24 * 60 * 60 * 1000;

	const num = Number(match[1]);
	const unit = match[2];

	if (unit === "m") return num * 60 * 1000;
	if (unit === "h") return num * 60 * 60 * 1000;

	return num * 24 * 60 * 60 * 1000;
};

const getRefreshExpiry = (rememberMe = false): StringValue =>
	rememberMe ? REMEMBER_ME_REFRESH_EXPIRY : DEFAULT_REFRESH_EXPIRY;

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
		userType: "Staff",
		phone,
		email,
		passwordHash,
	});

	return { user };
};

export const loginUser = async (data: {
	phoneOrEmail: string;
	password: string;
	rememberMe?: boolean;
}) => {
	const key = data.phoneOrEmail.trim().toLowerCase();
	const rememberMe = Boolean(data.rememberMe);

	const user = await User.findOne({
		$or: [{ email: key }, { phone: data.phoneOrEmail.trim() }],
	});

	if (!user) {
		throw Object.assign(new Error("Invalid credentials"), {
			statusCode: 401,
		});
	}

	const ok = await verifyPassword(data.password, user.passwordHash);

	if (!ok) {
		throw Object.assign(new Error("Invalid credentials"), {
			statusCode: 401,
		});
	}

	const refreshExpiry = getRefreshExpiry(rememberMe);

	const accessToken = signAccessToken(user.id);
	const refreshToken = signRefreshToken(user.id, refreshExpiry);

	const refreshTokenHash = sha256(refreshToken);

	const expiresAt = new Date(Date.now() + parseExpiryMs(refreshExpiry));

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

	if (session.expiresAt.getTime() <= Date.now()) {
		await RefreshSession.deleteOne({ _id: session._id });

		throw Object.assign(new Error("Refresh session expired"), {
			statusCode: 401,
		});
	}

	const accessToken = signAccessToken(userId);

	return { accessToken };
};

export const logoutUser = async (refreshToken?: string) => {
	if (!refreshToken) return;

	const tokenHash = sha256(refreshToken);

	await RefreshSession.deleteOne({
		refreshTokenHash: tokenHash,
	});
};
