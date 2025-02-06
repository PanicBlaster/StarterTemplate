import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { Tenant } from 'src/access/entities/tenant.entity';
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
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantAccess,
        {
          provide: getRepositoryToken(Tenant),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<TenantAccess>(TenantAccess);
    repository = module.get<Repository<Tenant>>(getRepositoryToken(Tenant));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('find', () => {
    it('should return a tenant by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockTenant);
      const result = await service.find(mockTenant.id);
      expect(result).toEqual(mockTenant);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: mockTenant.id },
        relations: ['projects'],
      });
    });

    it('should return null if tenant not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      const result = await service.find('non-existent-id');
      expect(result).toBeNull();
    });
  });

  describe('findByName', () => {
    it('should return a tenant by name', async () => {
      mockRepository.findOne.mockResolvedValue(mockTenant);
      const result = await service.findByName(mockTenant.name);
      expect(result).toEqual(mockTenant);
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

  describe('findAll', () => {
    it('should return paginated tenants', async () => {
      const mockTenants = [mockTenant];
      const mockTotal = 1;
      mockRepository.findAndCount.mockResolvedValue([mockTenants, mockTotal]);

      const options = { take: 10, skip: 0 };
      const result = await service.findAll(options);

      expect(result).toEqual({
        items: mockTenants,
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

  describe('upsert', () => {
    const createTenantDto = {
      name: 'New Tenant',
      notes: 'New Notes',
      isActive: true,
    };

    it('should create a new tenant', async () => {
      mockRepository.create.mockReturnValue({ ...createTenantDto });
      mockRepository.save.mockResolvedValue({
        id: 'new-id',
        ...createTenantDto,
      });

      const result = await service.upsert(createTenantDto);

      expect(result).toHaveProperty('id');
      expect(result.name).toBe(createTenantDto.name);
      expect(repository.create).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalled();
    });

    it('should update an existing tenant', async () => {
      const updateTenantDto = {
        name: 'Updated Tenant',
        notes: 'Updated Notes',
      };

      mockRepository.findOne.mockResolvedValue(mockTenant);
      mockRepository.save.mockResolvedValue({
        ...mockTenant,
        ...updateTenantDto,
      });

      const result = await service.upsert(updateTenantDto, mockTenant.id);

      expect(result.name).toBe(updateTenantDto.name);
      expect(result.notes).toBe(updateTenantDto.notes);
      expect(repository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when updating non-existent tenant', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.upsert({ name: 'Test' }, 'non-existent-id')
      ).rejects.toThrow(NotFoundException);
    });
  });
});
