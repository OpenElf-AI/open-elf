import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CryptoService } from '../../common/crypto/crypto.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('UserService', () => {
  let service: UserService;
  let prismaService: jest.Mocked<PrismaService>;
  let cryptoService: jest.Mocked<CryptoService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
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

    service = module.get<UserService>(UserService);
    prismaService = module.get<PrismaService>(PrismaService) as jest.Mocked<PrismaService>;
    cryptoService = module.get<CryptoService>(CryptoService) as jest.Mocked<CryptoService>;
  });

  describe('getUserById', () => {
    it('should return user if found', async () => {
      const userId = 'user123';
      const user = {
        id: userId,
        phone: 'encrypted_13800138000',
        name: 'Test User',
        avatar: 'avatar_url',
        role: 'user',
        verificationStatus: 'unverified',
        createdAt: new Date(),
      };

      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(user);

      const result = await service.getUserById(userId);

      expect(result.id).toBe(userId);
      expect(result.phone).toBe('13800138000');
    });

    it('should throw NotFoundException if user not found', async () => {
      const userId = 'user123';

      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.getUserById(userId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getUsers', () => {
    it('should return users with pagination', async () => {
      const users = [
        {
          id: 'user1',
          phone: 'encrypted_13800138001',
          name: 'User 1',
          avatar: 'avatar1_url',
          role: 'user',
          verificationStatus: 'unverified',
          createdAt: new Date(),
        },
        {
          id: 'user2',
          phone: 'encrypted_13800138002',
          name: 'User 2',
          avatar: 'avatar2_url',
          role: 'user',
          verificationStatus: 'unverified',
          createdAt: new Date(),
        },
      ];

      (prismaService.user.findMany as jest.Mock).mockResolvedValue(users);

      const result = await service.getUsers({ page: 1, pageSize: 10 });

      expect(result.data).toHaveLength(2);
      expect(result.data[0].phone).toBe('13800138001');
      expect(result.data[1].phone).toBe('13800138002');
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const userId = 'user123';
      const updateData = { name: 'Updated Name', avatar: 'new_avatar_url' };
      const updatedUser = {
        id: userId,
        phone: 'encrypted_13800138000',
        name: 'Updated Name',
        avatar: 'new_avatar_url',
        role: 'user',
        verificationStatus: 'unverified',
        createdAt: new Date(),
      };

      (prismaService.user.findUnique as jest.Mock).mockResolvedValue({ id: userId });
      (prismaService.user.update as jest.Mock).mockResolvedValue(updatedUser);

      const result = await service.updateUser(userId, updateData);

      expect(result.name).toBe('Updated Name');
      expect(result.avatar).toBe('new_avatar_url');
    });

    it('should throw NotFoundException if user not found', async () => {
      const userId = 'user123';
      const updateData = { name: 'Updated Name' };

      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.updateUser(userId, updateData)).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      const userId = 'user123';

      (prismaService.user.findUnique as jest.Mock).mockResolvedValue({ id: userId });
      (prismaService.user.delete as jest.Mock).mockResolvedValue({ id: userId });

      const result = await service.deleteUser(userId);

      expect(result).toEqual({ id: userId });
    });

    it('should throw NotFoundException if user not found', async () => {
      const userId = 'user123';

      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.deleteUser(userId)).rejects.toThrow(NotFoundException);
    });
  });
});
