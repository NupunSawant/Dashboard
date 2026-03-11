import { z } from 'zod';

export const createItemSchema = z.object({
    itemName: z.string().min(1),
    itemCode: z.string().min(1),
    category: z.string().min(1),
    subCategory: z.string().min(1),
    gst: z.string().min(1),
    unit: z.string().min(1),
    remark: z.string().optional(),
});

export const updateItemSchema = z.object({
  itemName: z.string().min(1).optional(),
  itemCode: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  subCategory: z.string().min(1).optional(),
  gst: z.string().min(1).optional(), 
  unit: z.string().min(1).optional(),
  remark: z.string().optional()
});