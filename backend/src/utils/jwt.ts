import jwt, { type Secret, type SignOptions } from "jsonwebtoken";
import crypto from "crypto";
import { env } from "../config/env";
import type { StringValue } from "ms";

export type JwtPayload = {
	sub: string;
};

const accessExpires = env.ACCESS_TOKEN_EXPIRES as SignOptions["expiresIn"];
const refreshExpires = env.REFRESH_TOKEN_EXPIRES as StringValue;

export const signAccessToken = (userId: string) => {
	const payload: JwtPayload = { sub: userId };

	return jwt.sign(payload, env.JWT_ACCESS_SECRET as Secret, {
		expiresIn: accessExpires,
	});
};

export const signRefreshToken = (userId: string, expiresIn?: StringValue) => {
	const payload: JwtPayload = { sub: userId };

	return jwt.sign(payload, env.JWT_REFRESH_SECRET as Secret, {
		expiresIn: expiresIn ?? refreshExpires,
	});
};

export const verifyAccessToken = (token: string) => {
	return jwt.verify(token, env.JWT_ACCESS_SECRET as Secret) as jwt.JwtPayload;
};

export const verifyRefreshToken = (token: string) => {
	return jwt.verify(token, env.JWT_REFRESH_SECRET as Secret) as jwt.JwtPayload;
};

export const sha256 = (value: string) => {
	return crypto.createHash("sha256").update(value).digest("hex");
};
