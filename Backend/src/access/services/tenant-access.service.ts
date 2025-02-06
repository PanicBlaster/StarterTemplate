import { Injectable, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from '../entities/tenant.entity';
import { v4 as uuidv4 } from 'uuid';
import {
  PaginationOptions,
  PaginatedResult,
} from '../../common/dto/pagination.dto';
import { QueryOptionsDto, QueryResult } from '../../common/dto/query.dto';
import { CreateTenantDto, UpdateTenantDto } from '../../common/dto/tenant.dto';

@Injectable()
export class TenantAccess {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
    private readonly httpService: HttpService
  ) {}

  async find(id: string): Promise<Tenant | null> {
    return this.tenantRepository.findOne({
      where: { id },
      relations: ['projects'],
    });
  }

  async findByName(name: string): Promise<Tenant | null> {
    return this.tenantRepository.findOne({
      where: { name },
    });
  }

  async findAll(options: QueryOptionsDto): Promise<QueryResult<Tenant>> {
    const [items, total] = await this.tenantRepository.findAndCount({
      take: options.take || 10,
      skip: options.skip || 0,
      where: options.where || {},
      order: options.order || { createdAt: 'DESC' },
    });

    return {
      items,
      total,
      take: options.take || 10,
      skip: options.skip || 0,
    };
  }

  async upsert(
    data: CreateTenantDto | UpdateTenantDto,
    id?: string
  ): Promise<Tenant> {
    if (id) {
      // For updates, first fetch existing tenant
      const existingTenant = await this.find(id);
      if (!existingTenant) {
        throw new NotFoundException('Tenant not found');
      }

      // Create update data without relations
      const updateData = {
        ...existingTenant,
        ...data,
        id, // Ensure ID is preserved
      };

      return this.tenantRepository.save(updateData);
    }

    // For create, just create new entity
    const tenant = this.tenantRepository.create({
      id: uuidv4(),
      ...data,
    });
    return this.tenantRepository.save(tenant);
  }

  async validateTenantId(tenantId: string): Promise<boolean> {
    if (!tenantId) {
      return false;
    }

    const tenant = await this.find(tenantId);
    return !!tenant;
  }

  async findWithValidation(id: string): Promise<Tenant> {
    const tenant = await this.find(id);
    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${id} not found`);
    }
    return tenant;
  }
}
