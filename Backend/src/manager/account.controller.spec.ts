import { Test, TestingModule } from '@nestjs/testing';
import { AccountController } from './account.controller';
import { UserAccess } from '../access/services/user-access.service';
import { TenantAccess } from '../access/services/tenant-access.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

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
    isUserAdmin: jest.fn(),
  };

  const mockTenantAccess = {
    validateTenantId: jest.fn(),
    findOneTenant: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

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

      const req = { user: { userId: '123' } };
      const result = await controller.findOneUser('123', req, 'tenant1');

      expect(result).toEqual(mockUser.item);
      expect(mockUserAccess.findOneUser).toHaveBeenCalled();
    });

    it('should throw NotFoundException when user not found', async () => {
      mockUserAccess.findOneUser.mockResolvedValue(null);
      mockTenantAccess.validateTenantId.mockResolvedValue(true);

      const req = { user: { userId: '123' } };
      await expect(
        controller.findOneUser('123', req, 'tenant1')
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when tenant validation fails', async () => {
      mockTenantAccess.validateTenantId.mockResolvedValue(false);

      const req = { user: { userId: '123' } };
      await expect(
        controller.findOneUser('123', req, 'invalid-tenant')
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
      user: { userId: '123' },
    };

    it('should return paginated users', async () => {
      mockUserAccess.queryUsers.mockResolvedValue(mockQueryResult);
      mockTenantAccess.validateTenantId.mockResolvedValue(true);
      mockUserAccess.isUserAdmin.mockResolvedValue(false);

      const result = await controller.queryUsers(
        { take: 10, skip: 0 },
        req,
        'tenant1'
      );

      expect(result).toEqual(mockQueryResult);
      expect(mockUserAccess.queryUsers).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 10,
          skip: 0,
          tenantId: 'tenant1',
          userId: '123',
        })
      );
    });

    it('should throw BadRequestException when tenant validation fails', async () => {
      mockTenantAccess.validateTenantId.mockResolvedValue(false);

      await expect(
        controller.queryUsers({ take: 10, skip: 0 }, req, 'invalid-tenant')
      ).rejects.toThrow(BadRequestException);
    });

    it('should include all parameter when user is admin', async () => {
      mockUserAccess.queryUsers.mockResolvedValue(mockQueryResult);
      mockTenantAccess.validateTenantId.mockResolvedValue(true);
      mockUserAccess.isUserAdmin.mockResolvedValue(true);

      await controller.queryUsers(
        { take: 10, skip: 0, all: true },
        { user: { userId: 'admin1' } },
        'tenant1'
      );

      expect(mockUserAccess.queryUsers).toHaveBeenCalledWith(
        expect.objectContaining({
          all: true,
        })
      );
    });
  });

  describe('updateUser', () => {
    const updateData = {
      firstName: 'Updated',
      lastName: 'User',
      email: 'updated@example.com',
    };

    const req = {
      user: { userId: '123' },
    };

    it('should update user successfully', async () => {
      mockUserAccess.findOneUser.mockResolvedValue(mockUser);
      mockUserAccess.upsertUser.mockResolvedValue('123');

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

    it('should throw NotFoundException when user not found', async () => {
      mockUserAccess.findOneUser.mockResolvedValue(null);

      const result = await controller.updateUser('1234', updateData);
      expect(result).toEqual({
        id: '1234',
        message: 'User updated successfully',
        success: true,
      });
    });
  });

  describe('changePassword', () => {
    const passwordData = {
      currentPassword: 'oldpass',
      newPassword: 'newpass',
    };

    const req = {
      user: { userId: '123' },
    };

    it('should change password successfully', async () => {
      mockUserAccess.changePassword.mockResolvedValue(undefined);

      const result = await controller.changePassword(
        {
          userId: '123',
          ...passwordData,
        },
        req
      );

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

    it('should throw an error if password change fails', async () => {
      const error = new Error('Password change failed');
      mockUserAccess.changePassword.mockRejectedValue(error);

      await expect(
        controller.changePassword(
          {
            userId: '123',
            currentPassword: 'oldpass',
            newPassword: 'newpass',
          },
          req
        )
      ).rejects.toThrow(error);
    });
  });
});
