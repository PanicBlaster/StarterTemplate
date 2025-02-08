import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantAccess } from '../tenant-access.service';
import { Tenant } from '../../entities/tenant.entity';
import { NotFoundException } from '@nestjs/common';

describe('TenantAccess', () => {
  let service: TenantAccess;
  let repository: Repository<Tenant>;
  let httpService: HttpService;

  const mockTenant = {
    id: '123',
    name: 'Test Tenant',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRepository = {
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    preload: jest.fn(),
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
    httpService = module.get<HttpService>(HttpService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findOneTenant', () => {
    it('should return a tenant when found', async () => {
      mockRepository.findOne.mockResolvedValue(mockTenant);

      const result = await service.findOneTenant({ id: '123' });

      expect(result).toEqual({
        item: mockTenant,
        id: mockTenant.id,
      });
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: '123' },
      });
    });

    it('should return null when tenant not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findOneTenant({ id: '123' });

      expect(result).toBeNull();
    });
  });

  describe('findByName', () => {
    it('should return a tenant when found by name', async () => {
      mockRepository.findOne.mockResolvedValue(mockTenant);

      const result = await service.findByName('Test Tenant');

      expect(result).toEqual({
        item: mockTenant,
        id: mockTenant.id,
      });
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { name: 'Test Tenant' },
      });
    });

    it('should return null when tenant not found by name', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findByName('Nonexistent Tenant');

      expect(result).toBeNull();
    });
  });

  describe('queryTenants', () => {
    it('should return paginated tenants', async () => {
      const tenants = [mockTenant];
      mockRepository.findAndCount.mockResolvedValue([tenants, 1]);

      const result = await service.queryTenants({ take: 10, skip: 0 });

      expect(result).toEqual({
        items: [{ item: mockTenant, id: mockTenant.id }],
        total: 1,
        take: 10,
        skip: 0,
      });
      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        take: 10,
        skip: 0,
        where: {},
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('upsertTenant', () => {
    it('should create a new tenant when id is not provided', async () => {
      const newTenant = { name: 'New Tenant' };
      mockRepository.create.mockReturnValue({ ...newTenant, id: '456' });
      mockRepository.save.mockResolvedValue({ ...newTenant, id: '456' });

      const result = await service.upsertTenant(newTenant);

      expect(result).toBe('456');
      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should update existing tenant when id is provided', async () => {
      const updateData = { name: 'Updated Tenant' };
      mockRepository.findOne.mockResolvedValue(mockTenant);
      mockRepository.preload.mockResolvedValue({
        ...mockTenant,
        ...updateData,
      });
      mockRepository.save.mockResolvedValue({ ...mockTenant, ...updateData });

      const result = await service.upsertTenant(updateData, '123');

      expect(result).toBe('123');
      expect(mockRepository.preload).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when updating non-existent tenant', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.upsertTenant({ name: 'Updated Tenant' }, '999')
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeTenant', () => {
    it('should delete a tenant', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      await service.removeTenant({ id: '123' });

      expect(mockRepository.delete).toHaveBeenCalledWith('123');
    });
  });

  describe('validateTenantId', () => {
    it('should return true for valid tenant id', async () => {
      mockRepository.findOne.mockResolvedValue(mockTenant);

      const result = await service.validateTenantId('123');

      expect(result).toBe(true);
    });

    it('should return false for invalid tenant id', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.validateTenantId('999');

      expect(result).toBe(false);
    });

    it('should return false for empty tenant id', async () => {
      const result = await service.validateTenantId('');

      expect(result).toBe(false);
      expect(mockRepository.findOne).not.toHaveBeenCalled();
    });
  });
});
