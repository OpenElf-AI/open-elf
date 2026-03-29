import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { YidunService } from '../yidun/yidun.service';
import { CryptoService } from '../../common/crypto/crypto.service';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: jest.Mocked<PrismaService>;
  let jwtService: jest.Mocked<JwtService>;
  let yidunService: jest.Mocked<YidunService>;
  let cryptoService: jest.Mocked<CryptoService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findFirst: jest.fn(),
              create: jest.fn(),
              findUnique: jest.fn(),
            },
            wallet: {
              create: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
        {
          provide: YidunService,
          useValue: {
            verifySmsCode: jest.fn(),
            verifyMobileNumber: jest.fn(),
            sendSmsCode: jest.fn(),
            verifyCaptcha: jest.fn(),
          },
        },
        {
          provide: CryptoService,
          useValue: {
            encrypt: jest.fn((value) => `encrypted_${value}`),
            decrypt: jest.fn((value) => value.replace('encrypted_', '')),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService) as jest.Mocked<PrismaService>;
    jwtService = module.get<JwtService>(JwtService) as jest.Mocked<JwtService>;
    yidunService = module.get<YidunService>(YidunService) as jest.Mocked<YidunService>;
    cryptoService = module.get<CryptoService>(CryptoService) as jest.Mocked<CryptoService>;
  });

  describe('loginWithPhone', () => {
    it('should login with existing user', async () => {
      const phone = '13800138000';
      const code = '123456';
      const user = {
        id: 'user123',
        phone: 'encrypted_13800138000',
        name: '用户8000',
        avatar: 'avatar_url',
        role: 'user',
        verificationStatus: 'unverified',
        createdAt: new Date(),
      };
      const token = 'jwt_token';
      const refreshToken = 'refresh_token';

      (yidunService.verifySmsCode as jest.Mock).mockResolvedValue({ valid: true });
      (prismaService.user.findFirst as jest.Mock).mockResolvedValue(user);
      (jwtService.sign as jest.Mock).mockReturnValueOnce(token).mockReturnValueOnce(refreshToken);

      const result = await service.loginWithPhone(phone, code);

      expect(result.access_token).toBe(token);
      expect(result.refresh_token).toBe(refreshToken);
      expect(result.user.phone).toBe(phone);
    });

    it('should create new user if not exists', async () => {
      const phone = '13800138000';
      const code = '123456';
      const newUser = {
        id: 'user123',
        phone: 'encrypted_13800138000',
        name: '用户8000',
        avatar: 'avatar_url',
        role: 'user',
        verificationStatus: 'unverified',
        createdAt: new Date(),
      };
      const token = 'jwt_token';
      const refreshToken = 'refresh_token';

      (yidunService.verifySmsCode as jest.Mock).mockResolvedValue({ valid: true });
      (prismaService.user.findFirst as jest.Mock).mockResolvedValue(null);
      (prismaService.user.create as jest.Mock).mockResolvedValue(newUser);
      (prismaService.wallet.create as jest.Mock).mockResolvedValue({ userId: newUser.id, balance: 0 });
      (jwtService.sign as jest.Mock).mockReturnValueOnce(token).mockReturnValueOnce(refreshToken);

      const result = await service.loginWithPhone(phone, code);

      expect(result.access_token).toBe(token);
      expect(result.refresh_token).toBe(refreshToken);
      expect(result.user.phone).toBe(phone);
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      const refreshToken = 'refresh_token';
      const decoded = { sub: 'user123', type: 'refresh' };
      const user = {
        id: 'user123',
        phone: 'encrypted_13800138000',
        email: 'encrypted_user@example.com',
      };
      const newAccessToken = 'new_access_token';
      const newRefreshToken = 'new_refresh_token';

      (jwtService.verify as jest.Mock).mockReturnValue(decoded);
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(user);
      (jwtService.sign as jest.Mock).mockReturnValueOnce(newAccessToken).mockReturnValueOnce(newRefreshToken);

      const result = await service.refreshToken(refreshToken);

      expect(result.access_token).toBe(newAccessToken);
      expect(result.refresh_token).toBe(newRefreshToken);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      const refreshToken = 'refresh_token';
      const decoded = { sub: 'user123', type: 'refresh' };

      (jwtService.verify as jest.Mock).mockReturnValue(decoded);
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.refreshToken(refreshToken)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validateUser', () => {
    it('should return user if found', async () => {
      const userId = 'user123';
      const user = { id: userId, name: 'Test User' };

      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(user);

      const result = await service.validateUser(userId);

      expect(result).toBe(user);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      const userId = 'user123';

      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.validateUser(userId)).rejects.toThrow(UnauthorizedException);
    });
  });
});
