import { Response } from "express";
import { AuthRequest } from "../../middleware/auth";
import {
	createUnit,
	deleteUnit,
	getUnitById,
	listUnits,
	updateUnit,
} from "../../services/Masters/unitService";
import { formatUser } from "../../utils/formatUser";

export const addUnit = async (req: AuthRequest, res: Response) => {
	const unit = (await createUnit(req.body, req.userId)) as any;

	if (!unit) {
		return res
			.status(500)
			.json({ success: false, message: "Failed to create unit" });
	}

	return res.status(201).json({
		success: true,
		message: "Unit created successfully",
		data: {
			id: unit._id,
			srNo: unit.srNo,
			unitName: unit.unitName,
			unitSymbol: unit.unitSymbol,
			createdAt: unit.createdAt,
			updatedAt: unit.updatedAt,
			createdBy: formatUser(unit.createdBy),
			updatedBy: formatUser(unit.updatedBy),
		},
	});
};

export const getUnits = async (_req: AuthRequest, res: Response) => {
	const units = await listUnits();

	return res.status(200).json({
		success: true,
		data: units.map((u: any) => ({
			id: u._id,
			srNo: u.srNo,
			unitName: u.unitName,
			unitSymbol: u.unitSymbol,
			createdAt: u.createdAt,
			updatedAt: u.updatedAt,
			createdBy: formatUser(u.createdBy),
			updatedBy: formatUser(u.updatedBy),
		})),
	});
};

export const getUnit = async (req: AuthRequest, res: Response) => {
	const unit = await getUnitById(String(req.params.id));

	return res.status(200).json({
		success: true,
		data: {
			id: unit._id,
			srNo: unit.srNo,
			unitName: unit.unitName,
			unitSymbol: unit.unitSymbol,
			createdAt: unit.createdAt,
			updatedAt: unit.updatedAt,
			createdBy: formatUser(unit.createdBy),
			updatedBy: formatUser(unit.updatedBy),
		},
	});
};

export const editUnit = async (req: AuthRequest, res: Response) => {
	const unit = await updateUnit(String(req.params.id), req.body, req.userId);

	return res.status(200).json({
		success: true,
		message: "Unit updated successfully",
		data: {
			id: unit._id,
			srNo: (unit as any).srNo,
			unitName: (unit as any).unitName,
			unitSymbol: (unit as any).unitSymbol,
			updatedAt: (unit as any).updatedAt,
			updatedBy: formatUser((unit as any).updatedBy),
		},
	});
};

export const removeUnit = async (req: AuthRequest, res: Response) => {
	await deleteUnit(String(req.params.id));

	return res.status(200).json({
		success: true,
		message: "Unit deleted successfully",
	});
};
