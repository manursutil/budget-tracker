import { Request, Response } from 'express';
import mongoose from 'mongoose';
import * as transactionController from '@/controllers/transactionsController';
import Transaction from '@/models/transaction';
import * as validationHelpers from '@/utils/validationHelpers';
import { ZodError } from 'zod';

jest.mock('@/models/transaction');
jest.mock('@/utils/validationHelpers');

const mockRes = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.end = jest.fn().mockReturnValue(res);
  return res;
};

const mockUser = { id: 'user123' };

describe('Transaction Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllTransactions', () => {
    it('should return all transactions for a user', async () => {
      const req = { query: {}, user: mockUser } as any;
      const res = mockRes();

      (validationHelpers.validateTransactionInput as jest.Mock).mockReturnValue(
        {
          success: true,
          data: {},
        },
      );

      (Transaction.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockResolvedValue(['tx1', 'tx2']),
      });

      await transactionController.getAllTransactions(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: ['tx1', 'tx2'],
      });
    });

    it('should return 400 if validation fails', async () => {
      const req = { query: {}, user: mockUser } as any;
      const res = mockRes();

      (validationHelpers.validateTransactionInput as jest.Mock).mockReturnValue(
        {
          success: false,
          message: new ZodError([{ message: 'Invalid type' }] as any),
        },
      );

      await transactionController.getAllTransactions(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('createTransaction', () => {
    it('should create a new transaction', async () => {
      const req = {
        body: {
          type: 'income',
          amount: 100,
          category: 'cat123',
          date: '2025-08-01',
          description: 'Test',
        },
        user: mockUser,
      } as any;
      const res = mockRes();

      const mockTx = {
        _id: 'tx123',
        save: jest.fn().mockResolvedValue(undefined),
      };

      (validationHelpers.validateTransactionInput as jest.Mock).mockReturnValue(
        {
          success: true,
          data: req.body,
        },
      );

      (validationHelpers.validateCategoryExists as jest.Mock).mockResolvedValue(
        true,
      );

      (Transaction as any).mockImplementation(() => mockTx);

      (Transaction.findById as jest.Mock).mockReturnValue({
        populate: jest.fn().mockResolvedValue({ populated: true }),
      });

      await transactionController.createTransaction(req, res);

      expect(mockTx.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { populated: true },
      });
    });

    it('should return 400 if category is invalid', async () => {
      const req = {
        body: {
          type: 'income',
          amount: 100,
          category: 'cat123',
        },
        user: mockUser,
      } as any;
      const res = mockRes();

      (validationHelpers.validateTransactionInput as jest.Mock).mockReturnValue(
        {
          success: true,
          data: req.body,
        },
      );

      (validationHelpers.validateCategoryExists as jest.Mock).mockResolvedValue(
        false,
      );

      await transactionController.createTransaction(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('getSingleTransaction', () => {
    it('should return a transaction', async () => {
      const req = {
        params: { id: new mongoose.Types.ObjectId().toString() },
        user: mockUser,
      } as any;
      const res = mockRes();

      (Transaction.findOne as jest.Mock).mockReturnValue({
        populate: jest.fn().mockResolvedValue({ id: 'tx123' }),
      });

      await transactionController.getSingleTransaction(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 400 for invalid ID', async () => {
      const req = {
        params: { id: 'invalid-id' },
        user: mockUser,
      } as any;
      const res = mockRes();

      await transactionController.getSingleTransaction(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('deleteTransaction', () => {
    it('should delete a transaction', async () => {
      const req = {
        params: { id: new mongoose.Types.ObjectId().toString() },
        user: mockUser,
      } as any;
      const res = mockRes();

      (Transaction.findOneAndDelete as jest.Mock).mockResolvedValue({
        _id: 'tx1',
      });

      await transactionController.deleteTransaction(req, res);

      expect(res.status).toHaveBeenCalledWith(204);
    });

    it('should return 404 if transaction not found', async () => {
      const req = {
        params: { id: new mongoose.Types.ObjectId().toString() },
        user: mockUser,
      } as any;
      const res = mockRes();

      (Transaction.findOneAndDelete as jest.Mock).mockResolvedValue(null);

      await transactionController.deleteTransaction(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
