import { Response } from "express";
import { AuthRequest } from "../../middleware/auth";
import { getDashboardSummary } from "../../services/Dashboard/dashboardService";
import { getDashboardInventoryTable } from "../../services/Dashboard/dashboardInventoryTableService";

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

export const getDashboardInventoryTableController = async (
	req: AuthRequest,
	res: Response,
) => {
	const data = await getDashboardInventoryTable({
		warehouseName: req.query.warehouseName
			? String(req.query.warehouseName)
			: undefined,
		category: req.query.category ? String(req.query.category) : undefined,
		search: req.query.search ? String(req.query.search) : undefined,
		page: req.query.page ? Number(req.query.page) : 1,
		limit: req.query.limit ? Number(req.query.limit) : 10,
		sortBy: req.query.sortBy ? String(req.query.sortBy) : undefined,
		sortOrder:
			req.query.sortOrder === "desc" || req.query.sortOrder === "asc"
				? (String(req.query.sortOrder) as "asc" | "desc")
				: undefined,
	});

	return res.status(200).json({
		success: true,
		data,
	});
};
