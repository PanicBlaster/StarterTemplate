import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HttpService } from '@nestjs/axios';
import { Repository } from 'typeorm';
import { TenantAccess } from './tenant-access.service';
import { Tenant } from '../entities/tenant.entity';
import { find } from 'rxjs';

describe('TenantAccess', () => {
  let service: TenantAccess;
  let repository: Repository<Tenant>;

  const mockTenant = {
    id: '123',
    name: 'Test Tenant',
    description: 'Test Description',
    notes: 'Test Notes',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      take: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn(),
    })),
    findAndCount: jest.fn(),
  };

  const mockHttpService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantAccess,
        {
          provide: getRepositoryToken(Tenant),
          useValue: mockRepository,
        },
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
      ],
    }).compile();

    service = module.get<TenantAccess>(TenantAccess);
    repository = module.get<Repository<Tenant>>(getRepositoryToken(Tenant));
  });

  describe('findOneTenant', () => {
    it('should return a tenant when found', async () => {
      mockRepository.findOne.mockResolvedValue(mockTenant);

      const result = await service.findOneTenant({ id: '123' });

      expect(result).toBeDefined();
      expect(result.id).toBe('123');
      expect(result.item).toEqual({
        name: mockTenant.name,
        description: mockTenant.description,
        notes: mockTenant.notes,
      });
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: '123' },
      });
    });

    it('should return null when tenant is not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findOneTenant({ id: 'nonexistent' });

      expect(result).toBeNull();
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'nonexistent' },
      });
    });
  });

  describe('queryTenants', () => {
    const mockTenants = [
      {
        id: '123',
        name: 'Tenant 1',
        description: 'Description 1',
        notes: 'Notes 1',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '456',
        name: 'Tenant 2',
        description: 'Description 2',
        notes: 'Notes 2',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    it('should return paginated tenants with default options', async () => {
      mockRepository.findAndCount.mockReturnValue([mockTenants, 2]);

      const result = await service.queryTenants({});

      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.take).toBe(10);
      expect(result.skip).toBe(0);
    });

    it('should respect custom pagination and sorting options', async () => {
      mockRepository.findAndCount.mockReturnValue([mockTenants, 2]);

      const options = {
        take: 5,
        skip: 5,
        order: {
          field: 'tenant.name',
          direction: 'ASC',
        },
      };

      const result = await service.queryTenants(options);

      expect(result.take).toBe(5);
      expect(result.skip).toBe(5);
    });

    it('should handle empty result set', async () => {
      mockRepository.findAndCount.mockReturnValue([[], 0]);

      const result = await service.queryTenants({});

      expect(result.items).toHaveLength(0);
      expect(result.total).toBe(0);
      expect(result.take).toBe(10);
      expect(result.skip).toBe(0);
    });
  });

  describe('upsertTenant', () => {
    const createTenantDto = {
      name: 'New Tenant',
      description: 'New Description',
      notes: 'New Notes',
    };

    const updateTenantDto = {
      name: 'Updated Tenant',
      description: 'Updated Description',
      notes: 'Updated Notes',
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should create a new tenant when id is not provided', async () => {
      const newTenant = { ...createTenantDto, id: '123' };
      mockRepository.create.mockReturnValue(newTenant);
      mockRepository.save.mockResolvedValue(newTenant);

      const result = await service.upsertTenant(createTenantDto);

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ...createTenantDto,
          id: expect.any(String),
        })
      );
      expect(mockRepository.save).toHaveBeenCalledWith(newTenant);
    });

    it('should update existing tenant when id is provided', async () => {
      const existingId = '123';
      const existingTenant = {
        id: existingId,
        item: {
          name: 'Old Name',
          description: 'Old Description',
          notes: 'Old Notes',
        },
      };

      mockRepository.findOne.mockResolvedValue(existingTenant);
      mockRepository.save.mockResolvedValue({
        ...existingTenant,
        ...updateTenantDto,
      });

      const result = await service.upsertTenant(updateTenantDto, existingId);

      expect(result).toBe(existingId);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: existingId },
      });
      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          ...updateTenantDto,
        })
      );
    });

    it('should throw NotFoundException when updating non-existent tenant', async () => {
      const nonExistentId = 'nonexistent';
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.upsertTenant(updateTenantDto, nonExistentId)
      ).rejects.toThrow('Tenant not found');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: nonExistentId },
      });
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });
});
