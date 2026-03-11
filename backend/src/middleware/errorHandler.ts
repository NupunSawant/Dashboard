import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export const notFoundHandler = (req: Request, res: Response) => {
	return res
		.status(404)
		.json({ success: false, message: `Route not found: ${req.originalUrl}` });
};

export const errorHandler = (
	err: any,
	_req: Request,
	res: Response,
	_next: NextFunction,
) => {
	console.error("Error:", err);

	//   Proper Zod error handling
	if (err instanceof ZodError) {
		return res.status(400).json({
			success: false,
			message: "Validation failed",
			errors: err.issues.map((i) => ({
				path: i.path.join("."),
				message: i.message,
			})),
		});
	}

	//   Mongo duplicate key error
	if (err?.code === 11000) {
		const fields = err?.keyValue ? Object.keys(err.keyValue) : [];
		const fieldLabel = fields.length ? fields.join(", ") : "a unique field";
		return res.status(409).json({
			success: false,
			message: `Duplicate value for ${fieldLabel}`,
		});
	}

	const status = err.statusCode || err.status || 500;
	return res.status(status).json({
		success: false,
		message: err.message || "Internal Server Error",
	});
};
