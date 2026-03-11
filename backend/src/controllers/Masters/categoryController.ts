import { Response } from "express";
import { AuthRequest } from "../../middleware/auth";
import {
	createCategory,
	deleteCategory,
	getCategoryById,
	listCategories,
	updateCategory,
} from "../../services/Masters/categoryService";
import { formatUser } from "../../utils/formatUser";

export const addCategory = async (req: AuthRequest, res: Response) => {
	const category = await createCategory(req.body, req.userId);

	return res.status(201).json({
		success: true,
		message: "Category created successfully",
		data: {
			id: category._id,
			srNo: category.srNo,
			name: category.name,
			remark: category.remark || "",
			createdAt: category.createdAt,
			updatedAt: category.updatedAt,
			createdBy: formatUser(category.createdBy),
			updatedBy: formatUser(category.updatedBy),
		},
	});
};

export const getCategories = async (_req: AuthRequest, res: Response) => {
	const categories = await listCategories();

	return res.status(200).json({
		success: true,
		data: categories.map((c: any) => ({
			id: c._id,
			srNo: c.srNo,
			name: c.name,
			remark: c.remark || "",
			createdAt: c.createdAt,
			updatedAt: c.updatedAt,
			createdBy: formatUser(c.createdBy),
			updatedBy: formatUser(c.updatedBy),
		})),
	});
};

export const getCategory = async (req: AuthRequest, res: Response) => {
	const category = await getCategoryById(String(req.params.id));

	return res.status(200).json({
		success: true,
		data: {
			id: category._id,
			srNo: category.srNo,
			name: category.name,
			remark: category.remark || "",
			createdAt: category.createdAt,
			updatedAt: category.updatedAt,
			createdBy: formatUser(category.createdBy),
			updatedBy: formatUser(category.updatedBy),
		},
	});
};

export const editCategory = async (req: AuthRequest, res: Response) => {
	const category = await updateCategory(
		String(req.params.id),
		req.body,
		req.userId,
	);

	return res.status(200).json({
		success: true,
		message: "Category updated",
		data: {
			id: category._id,
			srNo: (category as any).srNo,
			name: (category as any).name,
			remark: (category as any).remark || "",
			updatedAt: (category as any).updatedAt,
			updatedBy: formatUser((category as any).updatedBy),
		},
	});
};

export const removeCategory = async (req: AuthRequest, res: Response) => {
	await deleteCategory(String(req.params.id));

	return res.status(200).json({
		success: true,
		message: "Category deleted",
	});
};
