import { success, z } from 'zod';
import Category from '@/models/category';
import mongoose from 'mongoose';
import logger from '@/middleware/logger';

export const validateTransactionInput = (data: any, schema: z.ZodSchema) => {
  try {
    return { success: true, data: schema.parse(data) };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error;
      return { success: false, message };
    }
    return { success: false, message: 'Invalid input data' };
  }
};

export const validateCategoryExists = async (
  categoryId: string,
  userId: string,
) => {
  try {
    const categoryExists = await Category.findOne({
      _id: categoryId,
      userId,
      isActive: true,
    }).lean();

    return !!categoryExists;
  } catch (error) {
    logger.error('Error validating category:', error);
    return false;
  }
};

export const validateObjectId = (id: string, fieldName = 'ID') => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return { isValid: false, message: `Invalid ${fieldName}` };
  }
  return { isValid: true };
};
