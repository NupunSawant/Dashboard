import { NextFunction, Request, Response } from "express";

import { verifyAccessToken } from "../utils/jwt";

export interface AuthRequest extends Request {
	userId?: string;
}

export const authenticateToken = (
	req: AuthRequest,
	res: Response,
	next: NextFunction,
) => {
	const header = req.headers.authorization;
	if (!header?.startsWith("Bearer ")) {
		return res
			.status(401)
			.json({ success: false, message: "Missing access Token" });
	}

	const token = header.split(" ")[1];
	try {
		const decoded = verifyAccessToken(token);
		req.userId = decoded.sub as string;
		next();
	} catch {
		return res
			.status(401)
			.json({ success: false, message: "Invalid/Expired access Token" });
	}
};
