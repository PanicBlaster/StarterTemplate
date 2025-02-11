import { Test, TestingModule } from '@nestjs/testing';
import { UserAccess } from '../../access/services/user-access.service';
import { TenantAccess } from '../../access/services/tenant-access.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import {
  CreateAccountDto,
  UpdateAccountDto,
  ChangePasswordDto,
} from '../../common/dto/account.dto';
import { AccountController } from '../account.controller';
import { QueryOptionsDto } from 'src/common/dto/query.dto';
import { HttpService } from '@nestjs/axios';
import { UserCreateDto } from 'src/common/dto/user.dto';

describe('AccountController', () => {
  let controller: AccountController;
  let userAccess: UserAccess;
  let tenantAccess: TenantAccess;

  const mockUser = {
    id: '123',
    username: 'testuser',
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    tenants: [{ id: 'tenant1', name: 'Test Tenant' }],
  };

  const mockUserAccess = {
    findOneUser: jest.fn(),
    queryUsers: jest.fn(),
    upsertUser: jest.fn(),
    changePassword: jest.fn(),
    addToTenant: jest.fn(),
  };

  const mockTenantAccess = {
    validateTenantId: jest.fn(),
    findOneTenant: jest.fn(),
  };

  const mockHttpService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountController],
      providers: [
        {
          provide: UserAccess,
          useValue: mockUserAccess,
        },
        {
          provide: TenantAccess,
          useValue: mockTenantAccess,
        },
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
      ],
    }).compile();

    controller = module.get<AccountController>(AccountController);
    userAccess = module.get<UserAccess>(UserAccess);
    tenantAccess = module.get<TenantAccess>(TenantAccess);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('query', () => {
    it('should return paginated users for tenant', async () => {
      const tenantId = 'tenant1';
      const queryOptions: QueryOptionsDto = { take: 10, skip: 0 };
      const req = { user: { userId: '123' } };
      mockTenantAccess.validateTenantId.mockResolvedValue(true);
      mockUserAccess.queryUsers.mockResolvedValue({
        items: [{ item: mockUser, id: mockUser.id }],
        total: 1,
        take: 10,
        skip: 0,
      });

      const result = await controller.findAll(queryOptions, req, tenantId);

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(mockTenantAccess.validateTenantId).toHaveBeenCalledWith(tenantId);
    });
  });

  describe('create', () => {
    it('should create user and return id', async () => {
      const createDto: UserCreateDto = {
        username: 'newuser',
        password: 'password123',
        email: 'new@example.com',
        firstName: 'New',
        lastName: 'User',
      };

      mockUserAccess.upsertUser.mockResolvedValue('new-user-id');

      const result = await controller.create(createDto);

      expect(result).toEqual({
        id: 'new-user-id',
        success: true,
        message: 'Account created successfully',
      });
    });
  });

  describe('update', () => {
    it('should update user and return id', async () => {
      const userId = '123';
      const updateDto: UpdateAccountDto = {
        firstName: 'Updated',
      };

      mockUserAccess.findOneUser.mockResolvedValue({
        item: mockUser,
        id: userId,
      });
      mockUserAccess.upsertUser.mockResolvedValue(userId);

      const result = await controller.update(userId, updateDto);

      expect(result).toEqual({
        id: userId,
        success: true,
        message: 'Account updated successfully',
      });
    });
  });

  describe('changePassword', () => {
    it('should successfully change password', async () => {
      const changePasswordDto: ChangePasswordDto = {
        currentPassword: 'oldpass',
        newPassword: 'newpass',
      };

      const req = {
        user: {
          userId: '123',
        },
      };

      mockUserAccess.changePassword.mockResolvedValue(undefined);

      await controller.changePassword(changePasswordDto, req);

      expect(mockUserAccess.changePassword).toHaveBeenCalledWith(
        '123',
        changePasswordDto.currentPassword,
        changePasswordDto.newPassword
      );
    });
  });
});
