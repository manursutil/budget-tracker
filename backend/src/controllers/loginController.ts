import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

import { Request, Response } from 'express';

import User from '@/models/user';
import config from '@/config';

const loginUser = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ error: 'Username and password are required' });
    }

    const user = await User.findOne({ username });
    if (!user || typeof user.passwordHash !== 'string') {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const passwordCorrect = await bcrypt.compare(password, user.passwordHash);
    if (!passwordCorrect) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const userForToken = {
      username: user.username,
      id: user.id,
    };

    const token = jwt.sign(userForToken, config.SECRET as string, {
      expiresIn: '1h',
    });

    return res.status(200).json({
      token,
      username: user.username,
      name: user.name,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export default loginUser;
