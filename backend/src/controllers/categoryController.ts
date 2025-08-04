import Category from '@/models/category';
import { CustomRequest } from '@/types/CustomRequest';
import { Response } from 'express';
import mongoose from 'mongoose';

export const getAllCategories = async (req: CustomRequest, res: Response) => {
  try {
    const categories = await Category.find({
      userId: req.user.id,
      isActive: true,
    }).sort({ name: 1 });

    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch all categories' });
  }
};

export const createCategory = async (req: CustomRequest, res: Response) => {
  try {
    const category = new Category({
      ...req.body,
      userId: req.user.id,
    });

    await category.save();
    res.status(201).json(category);
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({ error: 'Category name already exists' });
    } else {
      res.status(400).json({ error: 'Failed to create new category' });
    }
  }
};

export const getSingleCategory = async (
  req: CustomRequest<{ id: string }>,
  res: Response,
) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid category ID' });
  }

  try {
    const category = await Category.findOne({
      _id: id,
      userId: req.user.id,
      isActive: true,
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch category' });
  }
};

export const deleteCategory = async (
  req: CustomRequest<{ id: string }>,
  res: Response,
) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid category ID' });
  }

  try {
    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    if (category.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Category.findByIdAndDelete(id);
    return res.status(204).end();
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete category' });
  }
};

export const updateCategory = async (
  req: CustomRequest<{ id: string }>,
  res: Response,
) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid category ID' });
  }

  try {
    const category = await Category.findOne({
      _id: id,
      userId: req.user.id,
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const allowFields = ['name', 'type', 'color', 'isActive'];
    for (const key of allowFields) {
      if (req.body[key] !== undefined) {
        (category as any)[key] = req.body[key];
      }
    }

    await category.save();
    res.json(category);
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Category name already exists' });
    }

    res.status(500).json({ message: 'Failed to update category' });
  }
};
