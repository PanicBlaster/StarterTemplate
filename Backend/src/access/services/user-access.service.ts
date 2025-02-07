import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import {
  PaginationOptions,
  PaginatedResult,
} from '../../common/dto/pagination.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload, AuthResponse } from '../../common/dto/auth.dto';
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { TenantAccess } from './tenant-access.service';
import {
  QueryOptionsDto,
  QueryResult,
  QueryResultItem,
} from '../../common/dto/query.dto';
import {
  CreateAccountDto,
  UpdateAccountDto,
} from '../../common/dto/account.dto';

@Injectable()
export class UserAccess {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly tenantAccess: TenantAccess
  ) {}

  async findOneUser(
    options: QueryOptionsDto
  ): Promise<QueryResultItem<User> | null> {
    const user = await this.userRepository.findOne({
      where: { id: options.id },
      relations: ['tenants'],
    });

    if (!user) return null;

    return {
      item: user,
      id: user.id,
    };
  }

  async queryUsers(options: QueryOptionsDto): Promise<QueryResult<User>> {
    const [items, total] = await this.userRepository.findAndCount({
      take: options.take || 10,
      skip: options.skip || 0,
      where: options.where || {},
      order: options.order || { createdAt: 'DESC' },
      relations: ['tenants'],
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

  async upsertUser(
    data: CreateAccountDto | UpdateAccountDto,
    id?: string
  ): Promise<string> {
    if (id) {
      const existingUser = await this.findOneUser({ id });
      if (!existingUser) {
        throw new NotFoundException('User not found');
      }
    }

    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    if (data.tenantId) {
      const tenant = await this.tenantAccess.findOneTenant({
        id: data.tenantId,
      });
      if (!tenant) {
        throw new NotFoundException('Tenant not found');
      }
    }

    const user = id
      ? await this.userRepository.preload({ id, ...data })
      : this.userRepository.create({ id: uuidv4(), ...data });

    const savedUser = await this.userRepository.save(user);

    return savedUser.id;
  }

  async verifyAuth(username: string, password: string): Promise<AuthResponse> {
    const user = await this.userRepository.findOne({
      where: { username },
      relations: ['tenants'],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const userDto = {
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.firstName,
      email: user.email,
      role: user.role,
      tenants: user.tenants,
    };

    const token = this.jwtService.sign({ userId: user.id });

    return {
      accessToken: token,
      user: userDto,
    };
  }

  async authForExternal(username: string): Promise<AuthResponse> {
    const user = await this.userRepository.findOne({
      where: { username },
      relations: ['tenants'],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.verifyAuth(user.username, user.passwordHash);
  }

  async delete(options: QueryOptionsDto): Promise<void> {
    const user = await this.findOneUser(options);
    await this.userRepository.remove(user.item);
  }

  async addToTenant(userId: string, tenantId: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['tenants'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const tenant = await this.tenantAccess.findOneTenant({ id: tenantId });
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    if (!user.tenants) {
      user.tenants = [];
    }

    // Check if user is already in tenant
    if (!user.tenants.some((t) => t.id === tenantId)) {
      user.tenants.push(tenant.item);
      await this.userRepository.save(user);
    }
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.passwordHash
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await this.userRepository.save(user);
  }
}
