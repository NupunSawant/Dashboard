import {z }from 'zod'

export const createUnitSchema = z.object({
    unitName: z.string().min(1),
    unitSymbol: z.string().min(1),
})

export const updateUnitSchema = z.object({
    unitName: z.string().min(1).optional(),
    unitSymbol: z.string().min(1).optional(),
}).refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
    path:[]
})