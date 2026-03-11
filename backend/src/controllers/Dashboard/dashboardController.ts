import { Response } from "express";
import { AuthRequest } from "../../middleware/auth";
import { getDashboardSummary } from "../../services/Dashboard/dashboardService"

export const getDashboard = async (req: AuthRequest, res: Response) => {
	const data = await getDashboardSummary({
		from: req.query.from ? String(req.query.from) : undefined,
		to: req.query.to ? String(req.query.to) : undefined,
		warehouseName: req.query.warehouseName
			? String(req.query.warehouseName)
			: undefined,
	});

	return res.status(200).json({
		success: true,
		data,
	});
};