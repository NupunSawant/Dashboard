import dotenv from "dotenv";
import type { SignOptions } from "jsonwebtoken";
import type { StringValue } from "ms";

dotenv.config();

const mustGet = (key: string): string => {
	const val = process.env[key];
	if (!val) throw new Error(`Missing env: ${key}`);
	return val;
};

export const env = {
	NODE_ENV: process.env.NODE_ENV || "development",
	PORT: Number(process.env.PORT) || 3000,

	MONGODB_URI: mustGet("MONGODB_URI"),

	JWT_ACCESS_SECRET: mustGet("JWT_ACCESS_SECRET"),
	JWT_REFRESH_SECRET: mustGet("JWT_REFRESH_SECRET"),

	ACCESS_TOKEN_EXPIRES: (process.env.ACCESS_TOKEN_EXPIRES ||
		"15m") as SignOptions["expiresIn"],

	REFRESH_TOKEN_EXPIRES: (process.env.REFRESH_TOKEN_EXPIRES ||
		"1d") as StringValue,

	CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:3000",

	COOKIE_SECURE:
		(process.env.COOKIE_SECURE || "false").toLowerCase() === "true",
};