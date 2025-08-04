import Transaction from '@/models/transaction';
import Category from '@/models/category';
import { CustomRequest } from '@/types/CustomRequest';
import { Response } from 'express';
import mongoose from 'mongoose';

export const getAllTransactions = async (req: CustomRequest, res: Response) => {
  try {
    const { type } = req.query;

    const filter: Record<string, any> = {
      userId: req.user.id,
    };

    if (type && ['income', 'expense'].includes(type as string)) {
      filter.type = type;
    }

    const transactions = await Transaction.find(filter).sort({
      date: -1,
      createdAt: -1,
    });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch all transactions' });
  }
};

export const createTransaction = async (req: CustomRequest, res: Response) => {
  try {
    const { type, amount, category, date, description } = req.body;

    if (!type || !amount || !category) {
      return res
        .status(400)
        .json({ message: 'Type, amount and category are required' });
    }

    if (!mongoose.Types.ObjectId.isValid(category)) {
      return res.status(400).json({ message: 'Invalid category ID' });
    }

    const categoryExists = await Category.findOne({
      _id: category,
      userId: req.user.id,
      isActive: true,
    });

    if (!categoryExists) {
      return res
        .status(400)
        .json({ message: 'Category not found or inactive' });
    }

    if (typeof amount !== 'number' || amount <= 0) {
      return res
        .status(400)
        .json({ message: 'Amount must be a positive number' });
    }

    if (!['income', 'expense'].includes(type)) {
      return res
        .status(400)
        .json({ message: 'Type must be either income or expense' });
    }

    if (description && description.trim().length > 500) {
      return res.status(400).json({ message: 'Description is too long' });
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
    res.status(201).json(populatedTransaction);
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Invalid transaction data' });
    }
    res.status(500).json({ message: 'Failed to create new transaction' });
  }
};

export const getSingleTransaction = async (
  req: CustomRequest<{ id: string }>,
  res: Response,
) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid transaction ID' });
  }

  try {
    const transaction = await Transaction.findOne({
      _id: id,
      userId: req.user.id,
    }).populate('category', 'name type color');

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json(transaction);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch transaction' });
  }
};

export const deleteTransaction = async (
  req: CustomRequest<{ id: string }>,
  res: Response,
) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid transaction ID' });
  }

  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: id,
      userId: req.user.id,
    });

    if (!transaction) {
      return res
        .status(404)
        .json({ message: 'Transaction not found or not authorized' });
    }

    return res.status(204).end();
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete transaction' });
  }
};

export const updateTransaction = async (
  req: CustomRequest<{ id: string }>,
  res: Response,
) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid transaction ID' });
  }

  try {
    const transaction = await Transaction.findOne({
      _id: id,
      userId: req.user.id,
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    const allowFields = ['type', 'amount', 'category', 'date', 'description'];

    for (const key of allowFields) {
      const value = req.body[key];

      if (value !== undefined) {
        if (key === 'amount') {
          if (typeof value !== 'number' || value <= 0) {
            return res
              .status(400)
              .json({ message: 'Amount must be a positive number' });
          }

          transaction.amount = Math.round(value * 100) / 100;
        } else if (key === 'type') {
          if (!['income', 'expense'].includes(value)) {
            return res
              .status(400)
              .json({ message: 'Type must be income or expense' });
          }

          transaction.type = value;
        } else if (key === 'category') {
          if (!mongoose.Types.ObjectId.isValid(value)) {
            return res.status(400).json({ message: 'Invalid category ID' });
          }

          const categoryExists = await Category.findOne({
            _id: value,
            userId: req.user.id,
            isActive: true,
          });

          if (!categoryExists) {
            return res
              .status(400)
              .json({ message: 'Category not found or inactive' });
          }

          transaction.category = value;
        } else if (key === 'date') {
          if (isNaN(Date.parse(value))) {
            return res.status(400).json({ message: 'Invalid date format' });
          }

          transaction.date = new Date(value);
        } else if (key === 'description') {
          if (typeof value !== 'string' || value.trim().length > 500) {
            return res.status(400).json({ message: 'Description is too long' });
          }

          transaction.description = value.trim();
        }
      }
    }

    await transaction.save();
    const populated = await Transaction.findById(transaction._id).populate(
      'category',
      'name type color',
    );

    return res.json(populated);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to update category' });
  }
};
