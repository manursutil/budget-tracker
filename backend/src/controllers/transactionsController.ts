import Transaction from '@/models/transaction';
import { CustomRequest } from '@/types/CustomRequest';
import { Response } from 'express';
import mongoose from 'mongoose';
import {
  validateCategoryExists,
  validateTransactionInput,
} from '@/utils/validationHelpers';
import {
  createTransactionSchema,
  getAllTransactionsSchema,
  updateTransactionSchema,
} from '@/schemas/transactionSchemas';
import { sendError, sendSuccess } from '@/utils/responseHelpers';
import { z, ZodError } from 'zod';

export const getAllTransactions = async (req: CustomRequest, res: Response) => {
  try {
    const validation = validateTransactionInput(
      req.query,
      getAllTransactionsSchema,
    );

    if (!validation.success) {
      const errorMessage =
        validation.message instanceof ZodError
          ? (validation.message as ZodError).issues
              .map((e) => e.message)
              .join(', ')
          : validation.message;

      return sendError(res, errorMessage || 'Validation failed', 400);
    }

    const { type } = validation.data as z.infer<
      typeof getAllTransactionsSchema
    >;

    const filter: Record<string, any> = {
      userId: req.user.id,
    };

    if (type) {
      filter.type = type;
    }

    const transactions = await Transaction.find(filter).sort({
      date: -1,
      createdAt: -1,
    });

    sendSuccess(res, transactions);
  } catch (error) {
    sendError(res, 'Failed to fetch all transactions');
  }
};

export const createTransaction = async (req: CustomRequest, res: Response) => {
  try {
    const validation = validateTransactionInput(
      req.body,
      createTransactionSchema,
    );

    if (!validation.success) {
      const errorMessage =
        validation.message instanceof ZodError
          ? (validation.message as ZodError).issues
              .map((e) => e.message)
              .join(', ')
          : validation.message;

      return sendError(res, errorMessage || 'Validation failed', 400);
    }

    const { type, amount, category, date, description } =
      validation.data as z.infer<typeof createTransactionSchema>;

    const exists = await validateCategoryExists(category, req.user.id);
    if (!exists) {
      return sendError(res, 'Category not found or inactive', 400);
    }

    const transaction = new Transaction({
      userId: req.user.id,
      type,
      amount: Math.round(amount * 100) / 100,
      category,
      date: date ? new Date(date) : new Date(),
      description: description?.trim() || '',
    });

    await transaction.save();

    const populatedTransaction = await Transaction.findById(
      transaction._id,
    ).populate('category', 'name type color');

    sendSuccess(res, populatedTransaction, 201);
  } catch (error: any) {
    sendError(res, 'Failed to create new transaction');
  }
};

export const getSingleTransaction = async (
  req: CustomRequest<{ id: string }>,
  res: Response,
) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendError(res, 'Invalid transaction ID', 400);
  }

  try {
    const transaction = await Transaction.findOne({
      _id: id,
      userId: req.user.id,
    }).populate('category', 'name type color');

    if (!transaction) {
      return sendError(res, 'Transaction not found', 404);
    }

    sendSuccess(res, transaction);
  } catch (error) {
    sendError(res, 'Failed to fetch transaction');
  }
};

export const deleteTransaction = async (
  req: CustomRequest<{ id: string }>,
  res: Response,
) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendError(res, 'Invalid transaction ID', 400);
  }

  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: id,
      userId: req.user.id,
    });

    if (!transaction) {
      return sendError(res, 'Transaction not found or not authorized');
    }

    res.status(204).end();
  } catch (error) {
    sendError(res, 'Failed to delete transaction');
  }
};

export const updateTransaction = async (
  req: CustomRequest<{ id: string }>,
  res: Response,
) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendError(res, 'Invalid transaction ID', 400);
  }

  const validation = validateTransactionInput(
    req.body,
    updateTransactionSchema,
  );

  if (!validation.success) {
    const errorMessage =
      validation.message instanceof ZodError
        ? validation.message.issues.map((e) => e.message).join(', ')
        : validation.message;

    return sendError(res, errorMessage || 'Validation failed', 400);
  }

  try {
    const transaction = await Transaction.findOne({
      _id: id,
      userId: req.user.id,
    });

    if (!transaction) {
      return sendError(res, 'Transaction not found', 404);
    }

    const { type, amount, category, date, description } =
      validation.data as z.infer<typeof updateTransactionSchema>;

    if (type) transaction.type = type;
    if (amount) transaction.amount = Math.round(amount * 100) / 100;
    if (category) {
      const exists = await validateCategoryExists(category, req.user.id);
      if (!exists) return sendError(res, 'Category not found or inactive', 400);
      transaction.category = new mongoose.Types.ObjectId(category);
    }
    if (date) transaction.date = new Date(date);
    if (description !== undefined) transaction.description = description.trim();

    await transaction.save();

    const populated = await Transaction.findById(transaction._id).populate(
      'category',
      'name type color',
    );

    sendSuccess(res, populated);
  } catch (error) {
    sendError(res, 'Failed to update transaction');
  }
};
