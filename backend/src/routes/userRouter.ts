import express from 'express';
import {
  getAllUsers,
  createNewUser,
  getCurrentUser,
} from '@/controllers/usersController';
import userExtractor from '@/middleware/userExtractor';

const router = express.Router();

router.get('/', getAllUsers);
router.post('/register', createNewUser);
router.get('/me', userExtractor, getCurrentUser);

export default router;
