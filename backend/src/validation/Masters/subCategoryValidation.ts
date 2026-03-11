import { z} from 'zod'

export const createSubCategorySchema = z.object({
    name: z.string().min(1),
    category: z.string().min(1),
    remark: z.string().optional(),
})

export const updateSubCategorySchema = z.object({
    name: z.string().min(1).optional(),
    category: z.string().min(1).optional(),
    remark: z.string().optional(),
}).refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
    path:[]
})