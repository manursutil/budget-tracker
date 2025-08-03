import { Request, Response } from 'express';
import { createNewUser } from '@/controllers/usersController';
import loginUser from '@/controllers/loginController';
import User from '@/models/user';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from '@/config';

// Mock response object
const createMockResponse = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('User Controller Tests', () => {
  describe('createNewUser', () => {
    it('should create a new user with valid data', async () => {
      const req = {
        body: {
          username: 'testuser',
          name: 'Test User',
          password: 'password123',
        },
      } as Request;

      const res = createMockResponse();

      await createNewUser(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'testuser',
          name: 'Test User',
        })
      );

      // Verify user was saved to database
      const savedUser = await User.findOne({ username: 'testuser' });
      expect(savedUser).toBeTruthy();
      expect(savedUser?.name).toBe('Test User');
    });

    it('should return 400 when username is missing', async () => {
      const req = {
        body: {
          name: 'Test User',
          password: 'password123',
        },
      } as Request;

      const res = createMockResponse();

      await createNewUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'username, name, and password are required',
      });
    });

    it('should return 400 when password is too short', async () => {
      const req = {
        body: {
          username: 'testuser',
          name: 'Test User',
          password: 'ab',
        },
      } as Request;

      const res = createMockResponse();

      await createNewUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'password length must be at least 3 characters long',
      });
    });

    it('should return 409 when username already exists', async () => {
      // Create a user first
      const passwordHash = await bcrypt.hash('password123', 10);
      const existingUser = new User({
        username: 'testuser',
        name: 'Existing User',
        passwordHash,
      });
      await existingUser.save();

      const req = {
        body: {
          username: 'testuser',
          name: 'Test User',
          password: 'password123',
        },
      } as Request;

      const res = createMockResponse();

      await createNewUser(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        error: 'username already exists',
      });
    });

    it('should hash the password before saving', async () => {
      const req = {
        body: {
          username: 'hashuser',
          name: 'Hash User',
          password: 'password123',
        },
      } as Request;

      const res = createMockResponse();

      await createNewUser(req, res);

      expect(res.status).toHaveBeenCalledWith(201);

      // Verify password was hashed
      const savedUser = await User.findOne({ username: 'hashuser' });
      expect(savedUser?.passwordHash).toBeDefined();
      expect(savedUser?.passwordHash).not.toBe('password123');
      expect(savedUser?.passwordHash).toMatch(/^\$2[aby]\$\d{1,2}\$[./A-Za-z0-9]{53}$/);
    });
  });

  describe('loginUser', () => {
    beforeEach(async () => {
      // Create a test user before each test
      const passwordHash = await bcrypt.hash('password123', 10);
      const testUser = new User({
        username: 'testuser',
        name: 'Test User',
        passwordHash,
      });
      await testUser.save();
    });

    it('should login successfully with valid credentials', async () => {
      const req = {
        body: {
          username: 'testuser',
          password: 'password123',
        },
      } as Request;

      const res = createMockResponse();

      await loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          token: expect.any(String),
          username: 'testuser',
          name: 'Test User',
        })
      );

      // Verify token is valid
      const responseBody = (res.json as jest.Mock).mock.calls[0][0];
      const decoded = jwt.verify(responseBody.token, config.SECRET as string) as any;
      expect(decoded.username).toBe('testuser');
    });

    it('should return 400 when username is missing', async () => {
      const req = {
        body: {
          password: 'password123',
        },
      } as Request;

      const res = createMockResponse();

      await loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Username and password are required',
      });
    });

    it('should return 401 when username does not exist', async () => {
      const req = {
        body: {
          username: 'nonexistentuser',
          password: 'password123',
        },
      } as Request;

      const res = createMockResponse();

      await loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid username or password',
      });
    });

    it('should return 401 when password is incorrect', async () => {
      const req = {
        body: {
          username: 'testuser',
          password: 'wrongpassword',
        },
      } as Request;

      const res = createMockResponse();

      await loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid username or password',
      });
    });

    it('should generate a valid JWT token with correct payload', async () => {
      const req = {
        body: {
          username: 'testuser',
          password: 'password123',
        },
      } as Request;

      const res = createMockResponse();

      await loginUser(req, res);

      const responseBody = (res.json as jest.Mock).mock.calls[0][0];
      const decoded = jwt.verify(responseBody.token, config.SECRET as string) as any;

      expect(decoded).toHaveProperty('username', 'testuser');
      expect(decoded).toHaveProperty('id');
      expect(decoded).toHaveProperty('iat');
      expect(decoded).toHaveProperty('exp');
    });
  });
}); 