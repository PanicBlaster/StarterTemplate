import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { UserAccess } from '../user-access.service';
import { User } from '../../entities/user.entity';
import { UnauthorizedException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { TenantAccess } from '../tenant-access.service';

describe('UserAccess', () => {
  let service: UserAccess;
  let userRepository: Repository<User>;
  let jwtService: JwtService;
  let tenantAccess: TenantAccess;

  const mockUserRepository = {
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockTenantAccess = {
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserAccess,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: TenantAccess,
          useValue: mockTenantAccess,
        },
      ],
    }).compile();

    service = module.get<UserAccess>(UserAccess);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
    tenantAccess = module.get<TenantAccess>(TenantAccess);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('verifyAuth', () => {
    it('should authenticate valid credentials', async () => {
      const mockUser = {
        id: '1',
        username: 'testuser',
        passwordHash: await bcrypt.hash('password123', 10),
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        tenants: [{ id: '1', name: 'Tenant1' }],
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('jwt_token');

      const result = await service.verifyAuth('testuser', 'password123');

      expect(result.accessToken).toBe('jwt_token');
      expect(result.user.username).toBe('testuser');
      expect(result.user.tenants).toHaveLength(1);
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      const mockUser = {
        passwordHash: await bcrypt.hash('password123', 10),
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await expect(
        service.verifyAuth('testuser', 'wrongpassword')
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const oldHash = await bcrypt.hash('oldpassword', 10);
      const mockUser = {
        id: '1',
        passwordHash: oldHash,
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.save.mockImplementation((user) => user);

      await service.changePassword('1', 'oldpassword', 'newpassword');

      expect(mockUserRepository.save).toHaveBeenCalled();
      const savedUser = mockUserRepository.save.mock.calls[0][0];
      expect(await bcrypt.compare('newpassword', savedUser.passwordHash)).toBe(
        true
      );
    });

    it('should throw UnauthorizedException for incorrect current password', async () => {
      const mockUser = {
        id: '1',
        passwordHash: await bcrypt.hash('currentpassword', 10),
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await expect(
        service.changePassword('1', 'wrongpassword', 'newpassword')
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw NotFoundException for non-existent user', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(
        service.changePassword('1', 'oldpassword', 'newpassword')
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('addToTenant', () => {
    it('should add user to tenant', async () => {
      const mockUser = {
        id: '1',
        tenants: [],
      };
      const mockTenant = { id: '1', name: 'Tenant1' };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockTenantAccess.find.mockResolvedValue(mockTenant);
      mockUserRepository.save.mockImplementation((user) => user);

      await service.addToTenant('1', '1');

      expect(mockUserRepository.save).toHaveBeenCalled();
      const savedUser = mockUserRepository.save.mock.calls[0][0];
      expect(savedUser.tenants).toContainEqual(mockTenant);
    });

    it('should not add duplicate tenant', async () => {
      const mockTenant = { id: '1', name: 'Tenant1' };
      const mockUser = {
        id: '1',
        tenants: [mockTenant],
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockTenantAccess.find.mockResolvedValue(mockTenant);

      await service.addToTenant('1', '1');

      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });
  });
});
