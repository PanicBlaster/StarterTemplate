import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { UserAccess } from './user-access.service';
import { User } from '../entities/user.entity';
import { Tenant } from '../entities/tenant.entity';

describe('UserAccess', () => {
  let service: UserAccess;
  let repository: Repository<User>;

  const mockUser = {
    id: '123',
    username: 'testuser',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'user',
    source: 'LOCAL',
    tenants: [
      {
        id: 'tenant1',
        name: 'Test Tenant',
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    passwordHash: 'hashedpassword',
  };

  const mockRepository = {
    findOne: jest.fn(),
    findAndCount: jest.fn(),
  };

  const mockTenantRepository = {
    findOne: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserAccess,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Tenant),
          useValue: mockTenantRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<UserAccess>(UserAccess);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  describe('findOneUser', () => {
    it('should return a user when found', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findOneUser({ id: '123' });

      expect(result).toBeDefined();
      expect(result.id).toBe('123');
      expect(result.item).toEqual({
        username: mockUser.username,
        email: mockUser.email,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        role: mockUser.role,
        source: mockUser.source,
        tenants: mockUser.tenants,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: '123' },
        relations: ['tenants'],
      });
    });

    it('should return null when user is not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findOneUser({ id: 'nonexistent' });

      expect(result).toBeNull();
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'nonexistent' },
        relations: ['tenants'],
      });
    });
  });

  describe('queryUsers', () => {
    const mockUsers = [
      {
        id: '123',
        username: 'user1',
        email: 'user1@example.com',
        firstName: 'User',
        lastName: 'One',
        role: 'user',
        source: 'LOCAL',
        tenants: [{ id: 'tenant1', name: 'Tenant 1' }],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '456',
        username: 'user2',
        email: 'user2@example.com',
        firstName: 'User',
        lastName: 'Two',
        role: 'user',
        source: 'LOCAL',
        tenants: [{ id: 'tenant1', name: 'Tenant 1' }],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    it('should return paginated users with default options', async () => {
      mockRepository.findAndCount.mockResolvedValue([mockUsers, 2]);

      const result = await service.queryUsers({});

      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.take).toBe(10);
      expect(result.skip).toBe(0);
      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        take: 10,
        skip: 0,
        where: {},
        order: { createdAt: 'DESC' },
        relations: ['tenants'],
      });
    });

    it('should respect custom pagination and sorting options', async () => {
      mockRepository.findAndCount.mockResolvedValue([mockUsers.slice(0, 1), 2]);

      const options = {
        take: 1,
        skip: 1,
        order: {
          field: 'username',
          direction: 'ASC',
        },
      };

      const result = await service.queryUsers(options);

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(2);
      expect(result.take).toBe(1);
      expect(result.skip).toBe(1);
      expect(mockRepository.findAndCount).toHaveBeenCalled();
    });

    it('should handle empty result set', async () => {
      mockRepository.findAndCount.mockResolvedValue([[], 0]);

      const result = await service.queryUsers({});

      expect(result.items).toHaveLength(0);
      expect(result.total).toBe(0);
      expect(result.take).toBe(10);
      expect(result.skip).toBe(0);
    });

    it('should apply where conditions when provided', async () => {
      mockRepository.findAndCount.mockResolvedValue([mockUsers, 2]);

      const options = {
        where: {
          role: 'user',
        },
      };

      await service.queryUsers(options);

      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        take: 10,
        skip: 0,
        where: { role: 'user' },
        order: { createdAt: 'DESC' },
        relations: ['tenants'],
      });
    });
  });
});
