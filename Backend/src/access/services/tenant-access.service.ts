import { Injectable, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import {
  QueryOptionsDto,
  QueryResult,
  QueryResultItem,
} from '../../common/dto/query.dto';
import { CreateTenantDto, UpdateTenantDto } from '../../common/dto/tenant.dto';
import { Tenant } from '../entities/tenant.entity';

@Injectable()
export class TenantAccess {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
    private readonly httpService: HttpService
  ) {}

  async findOneTenant(
    options: QueryOptionsDto
  ): Promise<QueryResultItem<Tenant> | null> {
    const tenant = await this.tenantRepository.findOne({
      where: { id: options.id },
    });

    if (!tenant) return null;

    return {
      item: tenant,
      id: tenant.id,
    };
  }

  async findByName(name: string): Promise<QueryResultItem<Tenant> | null> {
    const tenant = await this.tenantRepository.findOne({
      where: { name },
    });

    if (!tenant) return null;

    return {
      item: tenant,
      id: tenant.id,
    };
  }

  async queryTenants(options: QueryOptionsDto): Promise<QueryResult<Tenant>> {
    const [items, total] = await this.tenantRepository.findAndCount({
      take: options.take || 10,
      skip: options.skip || 0,
      where: options.where || {},
      order: options.order || { createdAt: 'DESC' },
    });

    return {
      items: items.map((item) => ({
        item,
        id: item.id,
      })),
      total,
      take: options.take || 10,
      skip: options.skip || 0,
    };
  }

  async upsertTenant(
    data: CreateTenantDto | UpdateTenantDto,
    id?: string
  ): Promise<string> {
    if (id) {
      const existingTenant = await this.findOneTenant({ id });
      if (!existingTenant) {
        throw new NotFoundException('Tenant not found');
      }
    }

    const tenant = id
      ? await this.tenantRepository.preload({ id, ...data })
      : this.tenantRepository.create({
          id: uuidv4(),
          ...data,
        });

    const savedTenant = await this.tenantRepository.save(tenant);

    return savedTenant.id;
  }

  async removeTenant(options: QueryOptionsDto): Promise<void> {
    await this.tenantRepository.delete(options.id);
  }

  async validateTenantId(tenantId: string): Promise<boolean> {
    if (!tenantId) {
      return false;
    }

    const tenant = await this.findOneTenant({ id: tenantId });
    return !!tenant;
  }
}
