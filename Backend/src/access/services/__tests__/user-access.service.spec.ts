import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { UserAccess } from '../user-access.service';
import { User } from '../../entities/user.entity';
import { UnauthorizedException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { TenantAccess } from '../tenant-access.service';
import {
  CreateAccountDto,
  UpdateAccountDto,
} from '../../../common/dto/account.dto';

describe('UserAccess', () => {
  let service: UserAccess;
  let userRepository: Repository<User>;
  let jwtService: JwtService;
  let tenantAccess: TenantAccess;

  const mockUser = {
    id: '1',
    username: 'testuser',
    passwordHash: 'hashedpassword123',
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    role: 'user',
    tenants: [{ id: '1', name: 'Tenant1' }],
  };

  const mockUserRepository = {
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    preload: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockTenantAccess = {
    findOneTenant: jest.fn(),
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

  describe('findOneUser', () => {
    it('should return a user by id', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      const result = await service.findOneUser({ id: mockUser.id });
      expect(result).toEqual({
        item: mockUser,
        id: mockUser.id,
      });
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        relations: ['tenants'],
      });
    });

    it('should return null if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      const result = await service.findOneUser({ id: 'non-existent-id' });
      expect(result).toBeNull();
    });
  });

  describe('queryUsers', () => {
    it('should return paginated users', async () => {
      const mockUsers = [mockUser];
      const mockTotal = 1;
      mockUserRepository.findAndCount.mockResolvedValue([mockUsers, mockTotal]);

      const options = { take: 10, skip: 0 };
      const result = await service.queryUsers(options);

      expect(result).toEqual({
        items: mockUsers.map((item) => ({
          item,
          id: item.id,
        })),
        total: mockTotal,
        take: 10,
        skip: 0,
      });
    });
  });

  describe('upsertUser', () => {
    it('should create a new user and return id', async () => {
      const createUserDto: CreateAccountDto = {
        username: 'newuser',
        password: 'password123',
        email: 'new@example.com',
        firstName: 'New',
        lastName: 'User',
      };

      const savedUser = { ...mockUser, ...createUserDto, id: 'new-id' };
      mockUserRepository.create.mockReturnValue(savedUser);
      mockUserRepository.save.mockResolvedValue(savedUser);

      const result = await service.upsertUser(createUserDto);

      expect(result).toBe(savedUser.id);
      expect(userRepository.create).toHaveBeenCalled();
      expect(userRepository.save).toHaveBeenCalled();
    });

    it('should update existing user and return id', async () => {
      const updateUserDto: UpdateAccountDto = {
        firstName: 'Updated',
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.preload.mockResolvedValue({
        ...mockUser,
        ...updateUserDto,
      });
      mockUserRepository.save.mockResolvedValue({
        ...mockUser,
        ...updateUserDto,
      });

      const result = await service.upsertUser(updateUserDto, mockUser.id);

      expect(result).toBe(mockUser.id);
      expect(userRepository.preload).toHaveBeenCalled();
      expect(userRepository.save).toHaveBeenCalled();
    });
  });

  describe('verifyAuth', () => {
    it('should authenticate valid credentials', async () => {
      const mockUser = {
        id: '123',
        username: 'testuser',
        passwordHash: await bcrypt.hash('password123', 10),
        tenants: [{ id: 'tenant1', name: 'Test Tenant' }],
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('jwt_token');
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(true));

      const result = await service.verifyAuth({
        username: 'testuser',
        password: 'password123',
      });

      expect(result.accessToken).toBe('jwt_token');
      expect(result.user.username).toBe('testuser');
      expect(result.user.tenants).toHaveLength(1);
      expect(result.user.tenants[0].id).toBe('tenant1');
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      const hashedPassword = await bcrypt.hash('rightpassword', 10);
      const userWithHash = { ...mockUser, passwordHash: hashedPassword };

      mockUserRepository.findOne.mockResolvedValue(userWithHash);

      await expect(
        service.verifyAuth('testuser', 'wrongpassword')
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const oldPassword = 'oldpassword';
      const oldHash = await bcrypt.hash(oldPassword, 10);
      const userWithHash = { ...mockUser, passwordHash: oldHash };

      mockUserRepository.findOne.mockResolvedValue(userWithHash);
      mockUserRepository.save.mockImplementation((user) => user);

      await service.changePassword(mockUser.id, oldPassword, 'newpassword');

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
      const mockTenant = {
        item: { id: '2', name: 'Tenant2' },
        id: '2',
      };
      const userWithTenants = { ...mockUser, tenants: [] };

      mockUserRepository.findOne.mockResolvedValue(userWithTenants);
      mockTenantAccess.findOneTenant.mockResolvedValue(mockTenant);
      mockUserRepository.save.mockImplementation((user) => user);

      await service.addToTenant('1', '2');

      expect(userRepository.save).toHaveBeenCalled();
      const savedUser = mockUserRepository.save.mock.calls[0][0];
      expect(savedUser.tenants).toContainEqual(mockTenant.item);
    });

    it('should not add duplicate tenant', async () => {
      const existingTenant = { id: '1', name: 'Tenant1' };
      const userWithTenant = { ...mockUser, tenants: [existingTenant] };

      mockUserRepository.findOne.mockResolvedValue(userWithTenant);
      mockTenantAccess.findOneTenant.mockResolvedValue({
        item: existingTenant,
        id: '1',
      });

      await service.addToTenant('1', '1');

      expect(userRepository.save).not.toHaveBeenCalled();
    });
  });
});
