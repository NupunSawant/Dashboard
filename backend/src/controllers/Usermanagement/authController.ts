import { Request, Response } from "express";
import {
	loginUser,
	logoutUser,
	refreshAccessToken,
	registerUser,
} from "../../services/Usermanagement/authService";
import { User } from "../../models/User";
import { env } from "../../config/env";
import { AuthRequest } from "../../middleware/auth";
import { registerSchema } from "../../validation/Usermanagement/authValidation";

const refreshCookieName = "refreshToken";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const cookieOptions = {
	httpOnly: true,
	secure: env.COOKIE_SECURE,
	sameSite: "lax" as const,
	path: "/",
	maxAge: ONE_DAY_MS,
};

export const register = async (req: Request, res: Response) => {
	console.log("REGISTER BODY:", req.body);

	const payload = registerSchema.parse(req.body);

	const { user } = await registerUser({
		name: payload.name,
		phone: payload.phone,
		email: payload.email,
		password: payload.password,
	});

	return res.status(201).json({
		success: true,
		message: "Registration successful",
		data: {
			id: user._id,
			name: `${user.firstName} ${user.lastName}`.trim(),
			email: user.email,
			phone: user.phone,
			permissions: user.permissions,
		},
	});
};

export const login = async (req: Request, res: Response) => {
	const { user, accessToken, refreshToken } = await loginUser(req.body);

	res.cookie(refreshCookieName, refreshToken, cookieOptions);

	return res.json({
		success: true,
		message: "Login successful",
		data: {
			accessToken,
			user: {
				id: user._id,
				name: user.firstName,
				email: user.email,
				phone: user.phone,
				permissions: user.permissions,
			},
		},
	});
};

export const refresh = async (req: Request, res: Response) => {
	const refreshToken = req.cookies?.[refreshCookieName];
	if (!refreshToken) {
		return res
			.status(401)
			.json({ success: false, message: "No refresh token" });
	}

	const { accessToken } = await refreshAccessToken(refreshToken);

	return res.json({
		success: true,
		message: "Access token refreshed",
		data: {
			accessToken,
		},
	});
};

export const logout = async (req: AuthRequest, res: Response) => {
	const refreshToken = req.cookies?.[refreshCookieName];
	await logoutUser(refreshToken);

	res.clearCookie(refreshCookieName, { ...cookieOptions, maxAge: undefined });

	return res.status(200).json({
		success: true,
		message: "Logged out successfully",
	});
};

export const me = async (req: AuthRequest, res: Response) => {
	const user = await User.findById(req.userId).select(
		"firstName phone email permissions createdAt",
	);

	if (!user)
		return res.status(404).json({ success: false, message: "User not found" });

	return res.status(200).json({
		success: true,
		data: {
			id: user._id,
			name: user.firstName,
			phone: user.phone,
			email: user.email,
			permissions: user.permissions,
		},
	});
};