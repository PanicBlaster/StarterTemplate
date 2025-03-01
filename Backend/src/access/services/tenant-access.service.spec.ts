import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HttpService } from '@nestjs/axios';
import { Repository } from 'typeorm';
import { TenantAccess } from './tenant-access.service';
import { Tenant } from '../entities/tenant.entity';
import { User } from '../entities/user.entity';

describe('TenantAccess', () => {
  let service: TenantAccess;
  let tenantRepository: Repository<Tenant>;
  let userRepository: Repository<User>;

  const mockTenant = {
    id: '123',
    name: 'Test Tenant',
    description: 'Test Description',
    notes: 'Test Notes',
    createdAt: new Date(),
    updatedAt: new Date(),
    users: [],
  };

  const mockUser = {
    id: 'user1',
    username: 'testuser',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'user',
    source: 'LOCAL',
    tenants: [],
  };

  const mockTenantRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    findAndCount: jest.fn(),
    delete: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
  };

  const mockHttpService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantAccess,
        {
          provide: getRepositoryToken(Tenant),
          useValue: mockTenantRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
      ],
    }).compile();

    tenantRepository = module.get<Repository<Tenant>>(
      getRepositoryToken(Tenant)
    );
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    service = module.get<TenantAccess>(TenantAccess);
  });

  describe('findOneTenant', () => {
    it('should return a tenant when found', async () => {
      mockTenantRepository.findOne.mockResolvedValue(mockTenant);

      const result = await service.findOneTenant({ id: '123' });

      expect(result).toBeDefined();
      expect(result.id).toBe('123');
      expect(result.item).toEqual({
        name: mockTenant.name,
        description: mockTenant.description,
        notes: mockTenant.notes,
      });
      expect(mockTenantRepository.findOne).toHaveBeenCalledWith({
        where: { id: '123' },
        relations: ['users'],
      });
    });

    it('should return null when tenant is not found', async () => {
      mockTenantRepository.findOne.mockResolvedValue(null);

      const result = await service.findOneTenant({ id: 'nonexistent' });

      expect(result).toBeNull();
    });

    it('should check admin access when currentUserId is provided', async () => {
      // Setup admin user
      mockUserRepository.findOne.mockResolvedValue({ role: 'admin' });
      mockTenantRepository.findOne.mockResolvedValue(mockTenant);

      const result = await service.findOneTenant({
        id: '123',
        currentUserId: 'adminId',
      });

      expect(result).toBeDefined();
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'adminId' },
      });
    });
  });

  describe('queryTenants', () => {
    const mockTenants = [
      mockTenant,
      {
        id: '456',
        name: 'Tenant 2',
        description: 'Description 2',
        notes: 'Notes 2',
        createdAt: new Date(),
        updatedAt: new Date(),
        users: [],
      },
    ];

    it('should return paginated tenants with default options', async () => {
      mockTenantRepository.findAndCount.mockResolvedValue([mockTenants, 2]);

      const result = await service.queryTenants({});

      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.take).toBe(10);
      expect(result.skip).toBe(0);
      expect(mockTenantRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {},
          take: 10,
          skip: 0,
          order: { createdAt: 'DESC' },
        })
      );
    });

    it('should filter by user tenants when userId is provided', async () => {
      const userWithTenants = {
        ...mockUser,
        tenants: [{ id: '123', name: 'Test Tenant' }],
      };

      mockUserRepository.findOne.mockResolvedValue(userWithTenants);
      mockTenantRepository.findAndCount.mockResolvedValue([[mockTenant], 1]);

      const result = await service.queryTenants({ userId: 'user1' });

      expect(result.items).toHaveLength(1);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'user1' },
        relations: ['tenants'],
      });
      expect(mockTenantRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            id: expect.anything(),
          }),
        })
      );
    });

    it('should apply filter when provided', async () => {
      mockTenantRepository.findAndCount.mockResolvedValue([mockTenants, 2]);

      await service.queryTenants({ filter: 'test' });

      expect(mockTenantRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            name: expect.anything(),
          }),
        })
      );
    });
  });

  describe('upsertTenant', () => {
    const createTenantDto = {
      name: 'New Tenant',
      description: 'New Description',
      notes: 'New Notes',
    };

    it('should create a new tenant when id is not provided', async () => {
      const createdTenant = {
        ...createTenantDto,
        id: expect.any(String),
      };

      mockTenantRepository.create.mockReturnValue(createdTenant);
      mockTenantRepository.save.mockResolvedValue(createdTenant);

      const result = await service.upsertTenant(createTenantDto);

      expect(result).toBeDefined();
      expect(mockTenantRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ...createTenantDto,
          id: expect.any(String),
        })
      );
    });

    it('should update existing tenant when id is provided', async () => {
      const existingId = '123';
      const existingTenant = {
        id: existingId,
        item: { ...createTenantDto },
      };

      mockTenantRepository.findOne.mockResolvedValue(mockTenant);
      service.findOneTenant = jest.fn().mockResolvedValue(existingTenant);

      const result = await service.upsertTenant(createTenantDto, existingId);

      expect(result).toBe(existingId);
      expect(mockTenantRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when updating non-existent tenant', async () => {
      service.findOneTenant = jest.fn().mockResolvedValue(null);

      await expect(
        service.upsertTenant(createTenantDto, 'nonexistent')
      ).rejects.toThrow('Tenant not found');
    });
  });

  describe('addUserToTenant', () => {
    it('should add user to tenant', async () => {
      const tenant = { ...mockTenant, users: [] };
      mockTenantRepository.findOne.mockResolvedValue(tenant);
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await service.addUserToTenant('123', 'user1');

      expect(mockTenantRepository.findOne).toHaveBeenCalledWith({
        where: { id: '123' },
        relations: ['users'],
      });
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'user1' },
      });
      expect(mockTenantRepository.save).toHaveBeenCalled();
      expect(tenant.users).toContain(mockUser);
    });

    it('should not add user if already in tenant', async () => {
      const tenant = {
        ...mockTenant,
        users: [{ id: 'user1', username: 'testuser' }],
      };
      mockTenantRepository.findOne.mockResolvedValue(tenant);
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await service.addUserToTenant('123', 'user1');

      expect(mockTenantRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('removeUserFromTenant', () => {
    it('should remove user from tenant', async () => {
      const tenant = {
        ...mockTenant,
        users: [{ id: 'user1', username: 'testuser' }],
      };
      mockTenantRepository.findOne.mockResolvedValue(tenant);

      await service.removeUserFromTenant('123', 'user1');

      expect(mockTenantRepository.findOne).toHaveBeenCalledWith({
        where: { id: '123' },
        relations: ['users'],
      });
      expect(mockTenantRepository.save).toHaveBeenCalled();
      expect(tenant.users).toHaveLength(0);
    });
  });
});
