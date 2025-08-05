import express from 'express';
import {
  getAllTransactions,
  createTransaction,
  getSingleTransaction,
  deleteTransaction,
  updateTransaction,
} from '@/controllers/transactionsController';
import userExtractor from '@/middleware/userExtractor';

const router = express.Router();

router.use(userExtractor);

router.get('/', getAllTransactions as any);
router.post('/', createTransaction as any);
router.get('/:id', getSingleTransaction as any);
router.delete('/:id', deleteTransaction as any);
router.patch('/:id', updateTransaction as any);

export default router;
