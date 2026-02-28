import jwt from 'jsonwebtoken';

// Mock prisma before importing service
jest.mock('../prisma', () => ({
  prisma: {
    user: {
      upsert: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}));

// Mock config
jest.mock('../config', () => ({
  config: {
    devAuthEnabled: true,
    jwtSecret: 'test-secret',
  },
}));

import { devLogin, getMe } from './auth.service';
import { prisma } from '../prisma';
import { ForbiddenError, NotFoundError } from '../errors';

describe('AuthService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('devLogin', () => {
    it('should return a JWT token', async () => {
      const dto = {
        sub: 'test-user',
        email: 'test@example.com',
        name: 'Test User',
        role: 'ADMIN' as const,
      };

      (prisma.user.upsert as jest.Mock).mockResolvedValue({
        id: dto.sub,
        email: dto.email,
        name: dto.name,
        role: dto.role,
      });

      const result = await devLogin(dto);

      expect(result.accessToken).toBeDefined();
      expect(typeof result.accessToken).toBe('string');
      expect(result.expiresIn).toBe(86400);

      // Verify the token is valid
      const decoded = jwt.verify(result.accessToken, 'test-secret') as any;
      expect(decoded.sub).toBe('test-user');
      expect(decoded.role).toBe('ADMIN');
    });

    it('should throw ForbiddenError when dev auth is disabled', async () => {
      // Temporarily override config
      const configModule = require('../config');
      const original = configModule.config.devAuthEnabled;
      configModule.config.devAuthEnabled = false;

      await expect(
        devLogin({
          sub: 'test',
          email: 'test@test.com',
          name: 'Test',
          role: 'MEMBER',
        }),
      ).rejects.toThrow(ForbiddenError);

      configModule.config.devAuthEnabled = original;
    });
  });

  describe('getMe', () => {
    it('should return user profile', async () => {
      const user = {
        id: 'test-user',
        email: 'test@example.com',
        name: 'Test User',
        role: 'ADMIN',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(user);

      const result = await getMe('test-user');
      expect(result).toEqual(user);
    });

    it('should throw NotFoundError for non-existent user', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(getMe('nonexistent')).rejects.toThrow(NotFoundError);
    });
  });
});
