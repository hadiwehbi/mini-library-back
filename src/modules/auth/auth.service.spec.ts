import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ConfigService } from '../../config/config.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { UserRole } from './dto/dev-login.dto';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let config: ConfigService;

  const mockPrisma = {
    user: {
      upsert: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  const mockConfig = {
    devAuthEnabled: true,
    jwtSecret: 'test-secret',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    config = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('devLogin', () => {
    it('should return a JWT token', async () => {
      const dto = {
        sub: 'test-user',
        email: 'test@example.com',
        name: 'Test User',
        role: UserRole.ADMIN,
      };

      mockPrisma.user.upsert.mockResolvedValue({
        id: dto.sub,
        email: dto.email,
        name: dto.name,
        role: dto.role,
      });

      const result = await service.devLogin(dto);

      expect(result.accessToken).toBeDefined();
      expect(typeof result.accessToken).toBe('string');
      expect(result.expiresIn).toBe(86400);
    });

    it('should throw ForbiddenException when dev auth is disabled', async () => {
      const disabledConfig = { ...mockConfig, devAuthEnabled: false };
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          AuthService,
          { provide: PrismaService, useValue: mockPrisma },
          { provide: ConfigService, useValue: disabledConfig },
        ],
      }).compile();

      const disabledService = module.get<AuthService>(AuthService);

      await expect(
        disabledService.devLogin({
          sub: 'test',
          email: 'test@test.com',
          name: 'Test',
          role: UserRole.MEMBER,
        }),
      ).rejects.toThrow(ForbiddenException);
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

      mockPrisma.user.findUnique.mockResolvedValue(user);

      const result = await service.getMe('test-user');
      expect(result).toEqual(user);
    });
  });
});
