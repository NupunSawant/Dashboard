import { z } from 'zod'

export const createGstSchema = z.object({
    gstRate: z.string().min(1),
    remark: z.string().optional(),
})

export const updateGstSchema = z.object({
    gstRate: z.string().min(1).optional(),
    remark: z.string().optional(),
}).refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
    path: []
})