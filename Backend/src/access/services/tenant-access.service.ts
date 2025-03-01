import { Injectable, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, Not, In, Raw } from 'typeorm';
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
import { stringify } from 'querystring';

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

  private async isUserAdmin(userId: string): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    return user?.role === 'admin';
  }

  async findOneTenant(
    options: QueryOptionsDto
  ): Promise<QueryResultItem<TenantDto>> {
    const tenant = await this.tenantRepository.findOne({
      where: { id: options.id },
      relations: ['users'],
    });

    if (!tenant) return null;

    if (
      (await this.isUserAdmin(options.currentUserId)) ||
      tenant.users.find((u) => u.id === options.currentUserId)
    ) {
      return {
        item: this.mapToDto(tenant),
        id: tenant.id,
      };
    }

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
    options: QueryOptionsDto
  ): Promise<QueryResult<TenantDto>> {
    let items = [];
    let total = 0;

    const userId = options.userId;
    let where = options.where || {};

    if (options.filter) {
      where = {
        ...where,
        name: ILike(`%${options.filter}%`),
      };
    }

    if (userId && !options.excludeMine && !options.all) {
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

      if (user && user.tenants.length > 0) {
        where = {
          ...where,
          id: In(user.tenants.map((t) => t.id)),
        };
      } else {
        return {
          items: [],
          total: 0,
          take: options.take || 10,
          skip: options.skip || 0,
        };
      }

      // Use the transformed order in queries
      [items, total] = await this.tenantRepository.findAndCount({
        where: where,
        take: options.take || 10,
        skip: options.skip || 0,
        order: { createdAt: 'DESC' },
      });
    } else {
      if (options.excludeMine) {
        const user = await this.userRepository.findOne({
          where: { id: options.userId },
          relations: ['tenants'],
        });

        if (user && user.tenants.length > 0) {
          where = {
            ...where,
            id: Not(In(user.tenants.map((t) => t.id))),
          };
        }
      }

      // Use the transformed order in queries
      [items, total] = await this.tenantRepository.findAndCount({
        where: where,
        take: options.take || 10,
        skip: options.skip || 0,
        order: { createdAt: 'DESC' },
      });
    }

    return {
      items: items.map((item) => ({
        item: this.mapToDto(item),
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

  async addUserToTenant(tenantId: string, userId: string): Promise<void> {
    const tenant = await this.tenantRepository.findOne({
      where: { id: tenantId },
      relations: ['users'],
    });
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!tenant.users) {
      tenant.users = [];
    }

    if (!tenant.users.find((u) => u.id === userId)) {
      tenant.users.push(user);
      await this.tenantRepository.save(tenant);
    }
  }

  async removeUserFromTenant(tenantId: string, userId: string): Promise<void> {
    const tenant = await this.tenantRepository.findOne({
      where: { id: tenantId },
      relations: ['users'],
    });
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    tenant.users = tenant.users.filter((user) => user.id !== userId);
    await this.tenantRepository.save(tenant);
  }
}
