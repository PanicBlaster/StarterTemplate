import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Tenant } from '../../entities/tenant.entity';
import { TenantAccess } from '../tenant-access.service';

describe('TenantAccess', () => {
  let service: TenantAccess;
  let repository: Repository<Tenant>;

  const mockTenant = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Test Tenant',
    notes: 'Test Notes',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRepository = {
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    preload: jest.fn(),
  };

  const mockHttpService = {
    get: jest.fn(),
    post: jest.fn(),
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

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findOneTenant', () => {
    it('should return a tenant by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockTenant);
      const result = await service.findOneTenant({ id: mockTenant.id });
      expect(result).toEqual({
        item: mockTenant,
        id: mockTenant.id,
      });
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: mockTenant.id },
        relations: ['projects'],
      });
    });

    it('should return null if tenant not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      const result = await service.findOneTenant({ id: 'non-existent-id' });
      expect(result).toBeNull();
    });
  });

  describe('findByName', () => {
    it('should return a tenant by name', async () => {
      mockRepository.findOne.mockResolvedValue(mockTenant);
      const result = await service.findByName(mockTenant.name);
      expect(result).toEqual({
        item: mockTenant,
        id: mockTenant.id,
      });
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { name: mockTenant.name },
      });
    });

    it('should return null if tenant not found by name', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      const result = await service.findByName('non-existent-name');
      expect(result).toBeNull();
    });
  });

  describe('queryTenants', () => {
    it('should return paginated tenants', async () => {
      const mockTenants = [mockTenant];
      const mockTotal = 1;
      mockRepository.findAndCount.mockResolvedValue([mockTenants, mockTotal]);

      const options = { take: 10, skip: 0 };
      const result = await service.queryTenants(options);

      expect(result).toEqual({
        items: mockTenants.map((item) => ({
          item,
          id: item.id,
        })),
        total: mockTotal,
        take: 10,
        skip: 0,
      });
      expect(repository.findAndCount).toHaveBeenCalledWith({
        take: 10,
        skip: 0,
        where: {},
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('upsertTenant', () => {
    const createTenantDto = {
      name: 'New Tenant',
      notes: 'New Notes',
      isActive: true,
    };

    it('should create a new tenant and return id', async () => {
      const savedTenant = { ...mockTenant, ...createTenantDto };
      mockRepository.create.mockReturnValue(savedTenant);
      mockRepository.save.mockResolvedValue(savedTenant);

      const result = await service.upsertTenant(createTenantDto);

      expect(result).toBe(savedTenant.id);
      expect(repository.create).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalled();
    });

    it('should update an existing tenant and return id', async () => {
      const updateTenantDto = {
        name: 'Updated Tenant',
        notes: 'Updated Notes',
      };

      mockRepository.findOne.mockResolvedValue(mockTenant);
      mockRepository.preload.mockResolvedValue({
        ...mockTenant,
        ...updateTenantDto,
      });
      mockRepository.save.mockResolvedValue({
        ...mockTenant,
        ...updateTenantDto,
      });

      const result = await service.upsertTenant(updateTenantDto, mockTenant.id);

      expect(result).toBe(mockTenant.id);
      expect(repository.preload).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when updating non-existent tenant', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.upsertTenant({ name: 'Test' }, 'non-existent-id')
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('validateTenantId', () => {
    it('should return true for valid tenant id', async () => {
      mockRepository.findOne.mockResolvedValue(mockTenant);
      const result = await service.validateTenantId(mockTenant.id);
      expect(result).toBe(true);
    });

    it('should return false for invalid tenant id', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      const result = await service.validateTenantId('invalid-id');
      expect(result).toBe(false);
    });

    it('should return false for empty tenant id', async () => {
      const result = await service.validateTenantId('');
      expect(result).toBe(false);
    });
  });
});
