import  { z } from "zod";

export const createInventorySchema = z.object({
    itemName: z.string().min(1, "Item name is required"),
    category: z.string().optional(),
    subCategory: z.string().optional(),
    unit: z.string().optional(),
    availableQuantity: z.number().optional(),
})

export const updateInventorySchema = z.object({
    itemName: z.string().min(1, "Item name is required").optional(),
    category: z.string().optional(),
    subCategory: z.string().optional(),
    unit: z.string().optional(),
    availableQuantity: z.number().optional(),
})