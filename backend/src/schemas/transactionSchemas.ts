import { z } from 'zod';
import { TRANSACTION_TYPES, MAX_DESCRIPTION_LENGTH } from '@/constants';
import mongoose from 'mongoose';

export const createTransactionSchema = z.object({
  type: z.enum(TRANSACTION_TYPES),
  amount: z.number().positive(),
  category: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: 'Invalid category ID format',
  }),
  date: z.string().optional(),
  description: z.string().max(MAX_DESCRIPTION_LENGTH).optional(),
});

export const updateTransactionSchema = z.object({
  type: z.enum(TRANSACTION_TYPES).optional(),
  amount: z.number().positive().optional(),
  category: z
    .string()
    .refine((val) => mongoose.Types.ObjectId.isValid(val), {
      message: 'Invalid category ID format',
    })
    .optional(),
  date: z.string().optional(),
  description: z.string().max(MAX_DESCRIPTION_LENGTH).optional(),
});

export const getAllTransactionsSchema = z.object({
  type: z.enum(TRANSACTION_TYPES).optional(),
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
});
