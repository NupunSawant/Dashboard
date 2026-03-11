import { Request, Response } from "express";
import * as stocktransferService from "../../services/Stocktransfer/stocktransferService";

const ok = (res: Response, data: any, message = "Success") =>
	res.status(200).json({ success: true, message, data });

const fail = (res: Response, err: any, status = 400) =>
	res
		.status(status)
		.json({ success: false, message: String(err?.message || err || "Error") });

export async function getStockTransfers(req: Request, res: Response) {
	try {
		const transfers = await stocktransferService.getAllStockTransfers();
		ok(res, { stockTransfers: transfers });
	} catch (err) {
		fail(res, err, 500);
	}
}

export async function getStockTransfer(req: Request, res: Response) {
	try {
		const transfer = await stocktransferService.getStockTransferById(
			req.params.id as string,
		);
		if (!transfer) return fail(res, "Stock transfer not found", 404);
		ok(res, { stockTransfer: transfer });
	} catch (err) {
		fail(res, err, 500);
	}
}

export async function addStockTransfer(req: Request, res: Response) {
	try {
		const user = (req as any).user;
		const createdBy =
			user?.name || user?.fullName || user?.username || user?.email || "";
		const transfer = await stocktransferService.createStockTransfer(
			req.body,
			createdBy,
		);
		ok(res, { stockTransfer: transfer }, "Stock transfer created successfully");
	} catch (err) {
		fail(res, err, 400);
	}
}

export async function editStockTransfer(req: Request, res: Response) {
	try {
		const user = (req as any).user;
		const updatedBy =
			user?.name || user?.fullName || user?.username || user?.email || "";
		const transfer = await stocktransferService.updateStockTransfer(
			req.params.id as string,
			req.body,
			updatedBy,
		);
		ok(res, { stockTransfer: transfer }, "Stock transfer updated successfully");
	} catch (err) {
		fail(res, err, 400);
	}
}

export async function revertStockTransfer(req: Request, res: Response) {
	try {
		const user = (req as any).user;
		const updatedBy =
			user?.name || user?.fullName || user?.username || user?.email || "";
		const transfer = await stocktransferService.revertStockTransfer(
			req.params.id as string,
			updatedBy,
		);
		ok(res, { stockTransfer: transfer }, "Stock transfer reverted");
	} catch (err) {
		fail(res, err, 400);
	}
}

export async function getPendingTransfers(req: Request, res: Response) {
	try {
		const transfers = await stocktransferService.getPendingStockTransfers();
		ok(res, { stockTransfers: transfers });
	} catch (err) {
		fail(res, err, 500);
	}
}

// Called from WarehouseInward when "Inward" action is done — completes the transfer
export async function completeStockTransferById(req: Request, res: Response) {
	try {
		const user = (req as any).user;
		const updatedBy =
			user?.name || user?.fullName || user?.username || user?.email || "";
		const transfer = await stocktransferService.completeStockTransfer(
			req.params.id as string,
			updatedBy,
		);
		ok(res, { stockTransfer: transfer }, "Stock transfer completed");
	} catch (err) {
		fail(res, err, 400);
	}
}
