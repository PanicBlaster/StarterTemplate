import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { UserAccess } from '../../access/services/user-access.service';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { TenantAccess } from '../../access/services/tenant-access.service';

describe('AuthController', () => {
  let controller: AuthController;
  let userAccess: UserAccess;
  let httpService: HttpService;
  const mockUser = {
    id: '123',
    username: 'testuser',
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    role: 'user',
    tenants: [{ id: 'tenant1', name: 'Test Tenant' }],
  };

  const mockUserAccess = {
    verifyAuth: jest.fn(),
    findOneUser: jest.fn(),
    upsertUser: jest.fn(),
  };

  const mockTenantAccess = {
    validateTenantId: jest.fn(),
  };

  const mockHttpService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: UserAccess,
          useValue: mockUserAccess,
        },
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
        {
          provide: TenantAccess,
          useValue: mockTenantAccess,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    userAccess = module.get<UserAccess>(UserAccess);
    httpService = module.get<HttpService>(HttpService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signin', () => {
    it('should successfully authenticate user and return token', async () => {
      const credentials = {
        username: 'testuser',
        password: 'password123',
      };

      const authResponse = {
        accessToken: 'jwt_token',
        user: mockUser,
      };

      mockUserAccess.verifyAuth.mockResolvedValue(authResponse);

      const result = await controller.signin(credentials);

      expect(result).toEqual(authResponse);
      expect(userAccess.verifyAuth).toHaveBeenCalledWith(
        credentials.username,
        credentials.password
      );
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      const credentials = {
        username: 'testuser',
        password: 'wrongpassword',
      };

      mockUserAccess.verifyAuth.mockRejectedValue(new UnauthorizedException());

      await expect(controller.signin(credentials)).rejects.toThrow(
        UnauthorizedException
      );
    });
  });

  describe('signup', () => {
    it('should successfully create new user and return token', async () => {
      const signupData = {
        username: 'newuser',
        password: 'password123',
        email: 'new@example.com',
        firstName: 'New',
        lastName: 'User',
      };

      const newUser = {
        ...mockUser,
        ...signupData,
        id: 'new-user-id',
      };

      const authResponse = {
        accessToken: 'jwt_token',
        user: newUser,
      };

      mockUserAccess.upsertUser.mockResolvedValue(newUser.id);
      mockUserAccess.verifyAuth.mockResolvedValue(authResponse);

      const result = await controller.signup(signupData);

      expect(result).toEqual(authResponse);
      expect(userAccess.upsertUser).toHaveBeenCalledWith({
        role: 'user',
        tenantId: undefined,
        ...signupData,
      });
      expect(userAccess.verifyAuth).toHaveBeenCalledWith(
        signupData.username,
        signupData.password
      );
    });

    it('should throw BadRequestException when username already exists', async () => {
      const signupData = {
        username: 'existinguser',
        password: 'password123',
        email: 'existing@example.com',
        firstName: 'Existing',
        lastName: 'User',
      };

      mockUserAccess.upsertUser.mockRejectedValue(
        new BadRequestException('Username already exists')
      );

      await expect(controller.signup(signupData)).rejects.toThrow(
        BadRequestException
      );
      expect(userAccess.upsertUser).toHaveBeenCalledWith({
        role: 'user',
        tenantId: undefined,
        ...signupData,
      });
      expect(userAccess.verifyAuth).not.toHaveBeenCalled();
    });
  });
});
