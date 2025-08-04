import express from 'express';
import {
  getAllCategories,
  createCategory,
  getSingleCategory,
  deleteCategory,
  updateCategory,
} from '@/controllers/categoryController';
import userExtractor from '@/middleware/userExtractor';

const router = express.Router();

router.use(userExtractor);

router.get('/', getAllCategories as any);
router.post('/', createCategory as any);
router.get('/:id', getSingleCategory as any);
router.delete('/:id', deleteCategory as any);
router.patch('/:id', updateCategory as any);

export default router;
