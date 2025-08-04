import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Category from '@/models/category';
import { CustomRequest } from '@/types/CustomRequest';
import {
  getAllCategories,
  createCategory,
  getSingleCategory,
  updateCategory,
  deleteCategory,
} from '@/controllers/categoryController';
import '@/tests/setup'; // Import your test setup

// Mock response object
const mockResponse = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.end = jest.fn().mockReturnValue(res);
  return res;
};

// Helper to create mock authenticated request
const mockAuthRequest = (
  body = {},
  params = {},
  userId?: string,
): CustomRequest => {
  const req = {
    body,
    params,
    user: { id: userId || new mongoose.Types.ObjectId().toString() },
  } as CustomRequest;
  return req;
};

describe('Category Controller', () => {
  let testUserId: string;
  let otherUserId: string;

  beforeEach(() => {
    testUserId = new mongoose.Types.ObjectId().toString();
    otherUserId = new mongoose.Types.ObjectId().toString();
  });

  describe('getAllCategories', () => {
    it('should return all active categories for the authenticated user', async () => {
      await Category.create([
        {
          userId: testUserId,
          name: 'Food',
          type: 'expense',
          color: '#FF0000',
          isActive: true,
        },
        {
          userId: testUserId,
          name: 'Salary',
          type: 'income',
          color: '#00FF00',
          isActive: true,
        },
        {
          userId: testUserId,
          name: 'Inactive Category',
          type: 'expense',
          color: '#0000FF',
          isActive: false,
        },
        {
          userId: otherUserId,
          name: 'Other User Category',
          type: 'expense',
          color: '#FF00FF',
          isActive: true,
        },
      ]);

      const req = mockAuthRequest({}, {}, testUserId);
      const res = mockResponse();

      await getAllCategories(req, res);

      const categories = (res.json as jest.Mock).mock.calls[0][0];
      const names = categories.map((c: any) => c.name);

      expect(names).toContain('Food');
      expect(names).toContain('Salary');
      expect(names).not.toContain('Inactive Category');
      expect(names).not.toContain('Other User Category');

      categories.forEach((cat: any) => {
        expect(cat.userId.toString()).toBe(testUserId);
        expect(cat.isActive).toBe(true);
      });
    });
  });

  describe('createCategory', () => {
    it('should create a new category successfully', async () => {
      const categoryData = {
        name: 'Food',
        type: 'expense',
        color: '#FF0000',
      };

      const req = mockAuthRequest(categoryData, {}, testUserId);
      const res = mockResponse();

      await createCategory(req, res);

      expect(res.status).toHaveBeenCalledWith(201);

      const category = (res.json as jest.Mock).mock.calls[0][0];
      expect(category.name).toBe('Food');
      expect(category.type).toBe('expense');
      expect(category.color).toBe('#FF0000');
      expect(category.isActive).toBe(true);
      expect(category.isDefault).toBe(false);
      expect(category.userId.toString()).toBe(testUserId);

      const saved = await Category.findOne({
        name: 'Food',
        userId: testUserId,
      });
      expect(saved).toBeTruthy();
    });

    it('should allow same category name for different users', async () => {
      await Category.create({
        userId: otherUserId,
        name: 'Food',
        type: 'expense',
        color: '#FF0000',
      });

      const categoryData = {
        name: 'Food',
        type: 'expense',
        color: '#00FF00',
      };

      const req = mockAuthRequest(categoryData, {}, testUserId);
      const res = mockResponse();

      await createCategory(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      const category = (res.json as jest.Mock).mock.calls[0][0];
      expect(category.name).toBe('Food');
      expect(category.userId.toString()).toBe(testUserId);
    });
  });

  describe('getSingleCategory', () => {
    let categoryId: string;

    beforeEach(async () => {
      const category = await Category.create({
        userId: testUserId,
        name: 'Food',
        type: 'expense',
        color: '#FF0000',
      });
      categoryId = category._id.toString();
    });

    it('should return a single category for authenticated user', async () => {
      const req = mockAuthRequest({}, { id: categoryId }, testUserId);
      const res = mockResponse();

      await getSingleCategory(req as any, res);

      const category = (res.json as jest.Mock).mock.calls[0][0];
      expect(category.id).toBe(categoryId);
      expect(category.name).toBe('Food');
      expect(category.type).toBe('expense');
      expect(category.userId.toString()).toBe(testUserId);
    });
  });

  describe('updateCategory', () => {
    let categoryId: string;

    beforeEach(async () => {
      const category = await Category.create({
        userId: testUserId,
        name: 'Food',
        type: 'expense',
        color: '#FF0000',
      });
      categoryId = category._id.toString();
    });

    it('should only update allowed fields', async () => {
      const updateData = {
        name: 'Updated Food',
        userId: otherUserId,
        createdAt: new Date(),
      };

      const req = mockAuthRequest(updateData, { id: categoryId }, testUserId);
      const res = mockResponse();

      await updateCategory(req as any, res);

      const updatedCategory = (res.json as jest.Mock).mock.calls[0][0];
      expect(updatedCategory.name).toBe('Updated Food');
      expect(updatedCategory.userId.toString()).toBe(testUserId); // fixed
    });
  });
});
