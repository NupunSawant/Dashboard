import dotenv from "dotenv";
import type { SignOptions } from "jsonwebtoken";

// Load environment variables from .env file
dotenv.config();

// Helper function to get required env variables
const mustGet = (key: string): string => {
	const val = process.env[key];
	if (!val) throw new Error(`Missing env: ${key}`);
	return val;
};

// Export the environment configuration
export const env = {
	// General
	NODE_ENV: process.env.NODE_ENV || "development",
	PORT: Number(process.env.PORT) || 3000,

	// Database
	MONGODB_URI: mustGet("MONGODB_URI"),

	// JWT
	JWT_ACCESS_SECRET: mustGet("JWT_ACCESS_SECRET"),
	JWT_REFRESH_SECRET: mustGet("JWT_REFRESH_SECRET"),

	// Token expiration times
	ACCESS_TOKEN_EXPIRES: (process.env.ACCESS_TOKEN_EXPIRES ||
		"15m") as SignOptions["expiresIn"],
	REFRESH_TOKEN_EXPIRES: (process.env.REFRESH_TOKEN_EXPIRES ||
		"7d") as SignOptions["expiresIn"],

	// CORS_ORIGIN can be a comma-separated list of origins
	CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:3000",
	COOKIE_SECURE:
		(process.env.COOKIE_SECURE || "false").toLowerCase() === "true",
};
