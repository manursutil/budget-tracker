import bcrypt from 'bcrypt';
import User from '@/models/user';
import { Request, Response } from 'express';

const getAllUsers = async (_req: Request, res: Response) => {
  try {
    const users = await User.find({}).populate('transactions');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch all users' });
  }
};

const createNewUser = async (req: Request, res: Response) => {
  try {
    const { username, name, password } = req.body;

    if (!username || !name || !password) {
      return res
        .status(400)
        .json({ error: 'username, name, and password are required' });
    }

    if (typeof password !== 'string' || password.length < 3) {
      return res
        .status(400)
        .json({ error: 'password length must be at least 3 characters long' });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ error: 'username already exists' });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = new User({
      username,
      name,
      passwordHash,
    });

    const savedUser = await user.save();
    const { passwordHash: _, ...userWithoutPassword } = savedUser.toObject();

    res.status(201).json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create new user' });
  }
};

export default { getAllUsers, createNewUser };
