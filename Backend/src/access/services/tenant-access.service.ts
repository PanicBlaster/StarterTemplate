import { Injectable, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import {
  ProcessResult,
  QueryOptionsDto,
  QueryResult,
  QueryResultItem,
} from '../../common/dto/query.dto';
import {
  CreateTenantDto,
  TenantDto,
  UpdateTenantDto,
} from '../../common/dto/tenant.dto';
import { Tenant } from '../entities/tenant.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class TenantAccess {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly httpService: HttpService
  ) {}

  private mapToDto(tenant: Tenant): TenantDto {
    return {
      name: tenant.name,
      description: tenant.description,
      notes: tenant.notes,
    };
  }

  async findOneTenant(
    options: QueryOptionsDto
  ): Promise<QueryResultItem<TenantDto>> {
    const tenant = await this.tenantRepository.findOne({
      where: { id: options.id },
    });

    if (!tenant) return null;

    const dto = this.mapToDto(tenant);

    return {
      item: dto,
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

  async queryTenants(
    options: QueryOptionsDto & { userId?: string }
  ): Promise<QueryResult<TenantDto>> {
    // Changed return type to TenantDto
    let items = [];
    let total = 0;

    const userId = options.userId;
    if (userId) {
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['tenants'],
      });

      if (!user) {
        return {
          items: [],
          total: 0,
          take: options.take || 10,
          skip: options.skip || 0,
        };
      }

      items = user.tenants;
      total = items.length;
    } else {
      let where = options.where || {};
      if (options.filter) {
        where = {
          ...where,
          name: { $regex: options.filter, $options: 'i' },
        };
      }
      [items, total] = await this.tenantRepository.findAndCount({
        where: where,
        take: options.take || 10,
        skip: options.skip || 0,
        order: options.order || { createdAt: 'DESC' },
      });
    }

    return {
      items: items.map((item) => ({
        item: this.mapToDto(item), // Now this correctly returns TenantDto
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
      existingTenant.item.name = data.name;
      existingTenant.item.description = data.description;
      existingTenant.item.notes = data.notes;
      await this.tenantRepository.save(existingTenant.item);
      return existingTenant.id;
    } else {
      const tenant = this.tenantRepository.create({
        ...data,
        id: uuidv4(),
      });
      await this.tenantRepository.save(tenant);
      return tenant.id;
    }
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
