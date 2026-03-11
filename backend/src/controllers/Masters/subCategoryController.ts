import { Response } from "express";
import { AuthRequest } from "../../middleware/auth";
import {
	createSubCategory,
	deleteSubCategory,
	getSubCategoryById,
	listSubCategories,
	updateSubCategory,
} from "../../services/Masters/subCategoryService";
import { success } from "zod";
import { formatUser } from "../../utils/formatUser";

export const addSubCategory = async (req: AuthRequest, res: Response) => {
	const subCategory = (await createSubCategory(req.body, req.userId)) as any;

	if (!subCategory) {
		return res
			.status(500)
			.json({ success: false, message: "Failed to create sub-category" });
	}

	return res.status(201).json({
		success: true,
		message: "Sub-category created successfully",
		data: {
			id: subCategory._id,
			srNo: subCategory.srNo,
			name: subCategory.name,
			category: subCategory.category,
			remark: subCategory.remark || "",
			createdAt: subCategory.createdAt,
			updatedAt: subCategory.updatedAt,
			createdBy: formatUser(subCategory.createdBy),
			updatedBy: formatUser(subCategory.updatedBy),
		},
	});
};

export const getSubCategories = async (_req: AuthRequest, res: Response) => {
	const subCategories = await listSubCategories();

	return res.status(200).json({
		success: true,
		data: subCategories.map((sc: any) => ({
			id: sc._id,
			srNo: sc.srNo,
			name: sc.name,
			category: sc.category,
			remark: sc.remark || "",
			createdAt: sc.createdAt,
			updatedAt: sc.updatedAt,
			createdBy: formatUser(sc.createdBy),
			updatedBy: formatUser(sc.updatedBy),
		})),
	});
};

export const getSubCategory = async (req: AuthRequest, res: Response) => {
	const subCategory = await getSubCategoryById(String(req.params.id));

	return res.status(200).json({
		success: true,
		data: {
			id: subCategory._id,
			srNo: subCategory.srNo,
			name: subCategory.name,
			category: subCategory.category,
			remark: subCategory.remark || "",
			createdAt: subCategory.createdAt,
			updatedAt: subCategory.updatedAt,
			createdBy: formatUser(subCategory.createdBy),
			updatedBy: formatUser(subCategory.updatedBy),
		},
	});
};

export const editSubCategory = async (req: AuthRequest, res: Response) => {
	const subCategory = await updateSubCategory(
		String(req.params.id),
		req.body,
		req.userId,
	);

	return res.status(200).json({
		success: true,
		message: "Sub-category updated successfully",
		data: {
			id: subCategory._id,
			srNo: (subCategory as any).srNo,
			name: (subCategory as any).name,
			category: (subCategory as any).category,
			remark: (subCategory as any).remark || "",
			updatedAt: (subCategory as any).updatedAt,
			updatedBy: formatUser((subCategory as any).updatedBy),
		},
	});
};

export const removeSubCategory = async (req: AuthRequest, res: Response) => {
	await deleteSubCategory(String(req.params.id));

	return res.status(200).json({
		success: true,
		message: "Sub-category deleted successfully",
	});
};
