import { Request, Response } from "express";
import { AuthRequest } from "../../middleware/auth";
import {
	createDispatch,
	getDispatchById,
	listDispatches,
	listReadyToDispatchOrders,
	markDispatchDelivered,
	revertReadyToDispatch,
	processSalesReturn,
	listPendingSalesReturns,
	completeSalesReturnInward,
} from "../../services/Dispatch/dispatchService";

export const getReadyToDispatch = async (_req: Request, res: Response) => {
	const data = await listReadyToDispatchOrders();
	return res.json({ success: true, data });
};

export const getDispatches = async (_req: Request, res: Response) => {
	const data = await listDispatches();
	return res.json({ success: true, data });
};

export const getPendingSalesReturnDispatches = async (
	_req: Request,
	res: Response,
) => {
	try {
		const data = await listPendingSalesReturns();
		return res.status(200).json({
			success: true,
			data,
		});
	} catch (err: any) {
		return res.status(err?.statusCode || 400).json({
			success: false,
			message:
				err?.message || "Failed to fetch pending sales return dispatches",
		});
	}
};

export const getDispatch = async (req: Request, res: Response) => {
	const data = await getDispatchById(String(req.params.id));
	return res.json({ success: true, data });
};

export const addDispatch = async (req: AuthRequest, res: Response) => {
	try {
		const userId = req.userId;

		const data = await createDispatch(req.body, userId);

		return res.status(201).json({
			success: true,
			message: "Dispatch created",
			data,
		});
	} catch (err: any) {
		return res.status(err?.statusCode || 400).json({
			success: false,
			message: err?.message || "Failed to create dispatch",
		});
	}
};

export const revertReadyDispatch = async (req: AuthRequest, res: Response) => {
	try {
		const userId = req.userId;
		const readyRowId = String(req.params.id);

		const data = await revertReadyToDispatch(readyRowId, userId);

		return res.status(200).json({
			success: true,
			message: "Ready to dispatch reverted successfully",
			data,
		});
	} catch (err: any) {
		return res.status(err?.statusCode || 400).json({
			success: false,
			message: err?.message || "Failed to revert ready dispatch",
		});
	}
};

export const deliverDispatch = async (req: AuthRequest, res: Response) => {
	try {
		const userId = req.userId;
		const dispatchId = String(req.params.id);

		const data = await markDispatchDelivered(dispatchId, userId);

		return res.status(200).json({
			success: true,
			message: "Dispatch marked delivered successfully",
			data,
		});
	} catch (err: any) {
		return res.status(err?.statusCode || 400).json({
			success: false,
			message: err?.message || "Failed to deliver dispatch",
		});
	}
};

export const processDispatchSalesReturn = async (
	req: AuthRequest,
	res: Response,
) => {
	try {
		const userId = req.userId;
		const dispatchId = String(req.params.id);

		const data = await processSalesReturn(dispatchId, req.body, userId);

		return res.status(200).json({
			success: true,
			message: "Sales return processed successfully",
			data,
		});
	} catch (err: any) {
		return res.status(err?.statusCode || 400).json({
			success: false,
			message: err?.message || "Failed to process sales return",
		});
	}
};

export const completeDispatchSalesReturnInward = async (
	req: AuthRequest,
	res: Response,
) => {
	try {
		const userId = req.userId;
		const dispatchId = String(req.params.id);

		const data = await completeSalesReturnInward(dispatchId, userId);

		return res.status(200).json({
			success: true,
			message: "Sales return inward completed successfully",
			data,
		});
	} catch (err: any) {
		return res.status(err?.statusCode || 400).json({
			success: false,
			message: err?.message || "Failed to complete sales return inward",
		});
	}
};
