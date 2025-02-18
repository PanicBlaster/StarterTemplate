import { Test, TestingModule } from '@nestjs/testing';
import { AccountController } from './account.controller';
import { UserAccess } from '../access/services/user-access.service';
import { TenantAccess } from '../access/services/tenant-access.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CommandSucceededEvent } from 'typeorm';

describe('AccountController', () => {
  let controller: AccountController;
  let userAccess: UserAccess;
  let tenantAccess: TenantAccess;

  const mockUser = {
    id: '123',
    item: {
      username: 'testuser',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'user',
      source: 'LOCAL',
      tenants: [{ id: 'tenant1', name: 'Test Tenant' }],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };

  const mockUserAccess = {
    findOneUser: jest.fn(),
    queryUsers: jest.fn(),
    upsertUser: jest.fn(),
    delete: jest.fn(),
    addToTenant: jest.fn(),
    changePassword: jest.fn(),
  };

  const mockTenantAccess = {
    validateTenantId: jest.fn(),
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
      ],
    }).compile();

    controller = module.get<AccountController>(AccountController);
    userAccess = module.get<UserAccess>(UserAccess);
    tenantAccess = module.get<TenantAccess>(TenantAccess);
  });

  describe('findOneUser', () => {
    it('should return a user when found', async () => {
      mockUserAccess.findOneUser.mockResolvedValue(mockUser);
      mockTenantAccess.validateTenantId.mockResolvedValue(true);

      const result = await controller.findOneUser('tenant1', '123');

      expect(result).toEqual(mockUser.item);
    });

    it('should throw NotFoundException when user not found', async () => {
      mockUserAccess.findOneUser.mockResolvedValue(null);
      mockTenantAccess.validateTenantId.mockResolvedValue(true);

      await expect(controller.findOneUser('tenant1', '123')).rejects.toThrow(
        NotFoundException
      );
    });

    it('should throw BadRequestException when tenant validation fails', async () => {
      mockTenantAccess.validateTenantId.mockResolvedValue(false);

      await expect(
        controller.findOneUser('invalid-tenant', '123')
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('queryUsers', () => {
    const mockQueryResult = {
      items: [mockUser],
      total: 1,
      take: 10,
      skip: 0,
    };

    const req = {
      user: { userId: '123', role: 'admin' },
    };

    it('should return paginated users', async () => {
      mockUserAccess.queryUsers.mockResolvedValue(mockQueryResult);
      mockTenantAccess.validateTenantId.mockResolvedValue(true);

      const result = await controller.queryUsers(
        { take: 10, skip: 0 },
        req,
        'tenant1'
      );

      expect(result).toEqual(mockQueryResult);
      expect(mockUserAccess.queryUsers).toHaveBeenCalled();
    });

    it('should throw BadRequestException when tenant validation fails', async () => {
      mockTenantAccess.validateTenantId.mockResolvedValue(false);

      await expect(
        controller.queryUsers({ take: 10, skip: 0 }, req, 'invalid-tenant')
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateUser', () => {
    const updateData = {
      firstName: 'Updated',
      lastName: 'User',
      email: 'updated@example.com',
    };

    it('should update user successfully', async () => {
      mockUserAccess.findOneUser.mockResolvedValue(mockUser);
      mockUserAccess.upsertUser.mockResolvedValue('123');
      mockTenantAccess.validateTenantId.mockResolvedValue(true);

      const result = await controller.updateUser('123', updateData);

      expect(result).toEqual({
        id: '123',
        message: 'User updated successfully',
        success: true,
      });
      expect(mockUserAccess.upsertUser).toHaveBeenCalledWith(
        expect.objectContaining(updateData),
        '123'
      );
    });
  });

  describe('changePassword', () => {
    const passwordData = {
      userId: '123',
      currentPassword: 'oldpass',
      newPassword: 'newpass',
    };

    const req = {
      user: { userId: '123' },
    };

    it('should change password successfully', async () => {
      mockUserAccess.changePassword.mockResolvedValue(undefined);
      mockTenantAccess.validateTenantId.mockResolvedValue(true);

      const result = await controller.changePassword(passwordData, req);

      expect(result).toEqual({
        message: 'Password changed successfully',
        success: true,
        id: '123',
      });
      expect(mockUserAccess.changePassword).toHaveBeenCalledWith(
        '123',
        passwordData.currentPassword,
        passwordData.newPassword
      );
    });
  });
});
