import { Request, Response } from 'express';
import { createNewUser } from '@/controllers/usersController';
import loginUser from '@/controllers/loginController';
import User from '@/models/user';
import jwt from 'jsonwebtoken';
import config from '@/config';

// Mock response object
const createMockResponse = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('User Authentication Integration', () => {
  describe('Complete user registration and login flow', () => {
    it('should allow a user to register and then login successfully', async () => {
      const userData = {
        username: 'integrationuser',
        name: 'Integration Test User',
        password: 'securepassword123',
      };

      // Step 1: Register the user
      const registerReq = {
        body: userData,
      } as Request;
      const registerRes = createMockResponse();

      await createNewUser(registerReq, registerRes);

      expect(registerRes.status).toHaveBeenCalledWith(201);
      const registerResponseBody = (registerRes.json as jest.Mock).mock
        .calls[0][0];
      expect(registerResponseBody.username).toBe(userData.username);
      expect(registerResponseBody.name).toBe(userData.name);

      // Step 2: Login with the created user
      const loginReq = {
        body: {
          username: userData.username,
          password: userData.password,
        },
      } as Request;
      const loginRes = createMockResponse();

      await loginUser(loginReq, loginRes);

      expect(loginRes.status).toHaveBeenCalledWith(200);
      const loginResponseBody = (loginRes.json as jest.Mock).mock.calls[0][0];
      expect(loginResponseBody).toHaveProperty('token');
      expect(loginResponseBody.username).toBe(userData.username);
      expect(loginResponseBody.name).toBe(userData.name);

      // Step 3: Verify the JWT token
      const decoded = jwt.verify(
        loginResponseBody.token,
        config.SECRET as string,
      ) as any;
      expect(decoded.username).toBe(userData.username);
      expect(decoded.id).toBeDefined();
    });

    it('should prevent login with wrong password after registration', async () => {
      const userData = {
        username: 'wrongpassworduser',
        name: 'Wrong Password User',
        password: 'correctpassword',
      };

      // Register user
      const registerReq = {
        body: userData,
      } as Request;
      const registerRes = createMockResponse();

      await createNewUser(registerReq, registerRes);
      expect(registerRes.status).toHaveBeenCalledWith(201);

      // Try to login with wrong password
      const loginReq = {
        body: {
          username: userData.username,
          password: 'wrongpassword',
        },
      } as Request;
      const loginRes = createMockResponse();

      await loginUser(loginReq, loginRes);

      expect(loginRes.status).toHaveBeenCalledWith(401);
      expect(loginRes.json).toHaveBeenCalledWith({
        error: 'Invalid username or password',
      });
    });

    it('should handle multiple user registrations and logins', async () => {
      const users = [
        {
          username: 'user1',
          name: 'User One',
          password: 'password1',
        },
        {
          username: 'user2',
          name: 'User Two',
          password: 'password2',
        },
        {
          username: 'user3',
          name: 'User Three',
          password: 'password3',
        },
      ];

      // Register all users
      const registeredUsers = [];
      for (const userData of users) {
        const registerReq = {
          body: userData,
        } as Request;
        const registerRes = createMockResponse();

        await createNewUser(registerReq, registerRes);
        expect(registerRes.status).toHaveBeenCalledWith(201);

        const responseBody = (registerRes.json as jest.Mock).mock.calls[0][0];
        registeredUsers.push(responseBody);
      }

      // Login all users and verify tokens
      for (let i = 0; i < users.length; i++) {
        const loginReq = {
          body: {
            username: users[i].username,
            password: users[i].password,
          },
        } as Request;
        const loginRes = createMockResponse();

        await loginUser(loginReq, loginRes);
        expect(loginRes.status).toHaveBeenCalledWith(200);

        const loginResponseBody = (loginRes.json as jest.Mock).mock.calls[0][0];
        const decoded = jwt.verify(
          loginResponseBody.token,
          config.SECRET as string,
        ) as any;
        expect(decoded.username).toBe(users[i].username);
        expect(decoded.id).toBeDefined();
      }
    });

    it('should maintain data integrity across registration and login', async () => {
      const userData = {
        username: 'integrityuser',
        name: 'Integrity Test User',
        password: 'integritypassword',
      };

      // Register user
      const registerReq = {
        body: userData,
      } as Request;
      const registerRes = createMockResponse();

      await createNewUser(registerReq, registerRes);
      expect(registerRes.status).toHaveBeenCalledWith(201);

      const registerResponseBody = (registerRes.json as jest.Mock).mock
        .calls[0][0];

      // Verify user exists in database
      const savedUser = await User.findOne({ username: userData.username });
      expect(savedUser).toBeTruthy();
      expect(savedUser?.username).toBe(userData.username);
      expect(savedUser?.name).toBe(userData.name);
      expect(savedUser?.passwordHash).toBeDefined();

      // Login and verify same user data
      const loginReq = {
        body: {
          username: userData.username,
          password: userData.password,
        },
      } as Request;
      const loginRes = createMockResponse();

      await loginUser(loginReq, loginRes);
      expect(loginRes.status).toHaveBeenCalledWith(200);

      const loginResponseBody = (loginRes.json as jest.Mock).mock.calls[0][0];
      expect(loginResponseBody.username).toBe(savedUser?.username);
      expect(loginResponseBody.name).toBe(savedUser?.name);
    });
  });
});
