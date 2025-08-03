import express from 'express';
import { getAllUsers, createNewUser } from '@/controllers/usersController';

const router = express.Router();

router.get('/', getAllUsers);
router.post('/', createNewUser);

export default router;
