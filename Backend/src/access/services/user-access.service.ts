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
import { QueryOptionsDto, QueryResult } from 'src/common/dto/query.dto';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsNotEmpty()
  role: string;

  @IsUUID()
  tenantId: string;

  @IsString()
  @IsOptional()
  source?: string;
}

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  role?: string;

  @IsUUID()
  @IsOptional()
  tenantId?: string;
}

@Injectable()
export class UserAccess {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly tenantAccess: TenantAccess
  ) {}

  async find(id: string): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (user) {
      delete user.passwordHash;
    }
    return user;
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { username } });
  }

  async findAll(options: QueryOptionsDto): Promise<QueryResult<User>> {
    const [items, total] = await this.userRepository.findAndCount({
      take: options.take || 10,
      skip: options.skip || 0,
      where: options.where || {},
      order: options.order || { createdAt: 'DESC' },
      relations: ['tenants'],
    });

    // Remove password hashes from response
    items.forEach((user) => delete user.passwordHash);

    return {
      items,
      total,
      take: options.take || 10,
      skip: options.skip || 0,
    };
  }

  async upsert(
    data: CreateUserDto | UpdateUserDto,
    id?: string
  ): Promise<User> {
    if (id) {
      await this.find(id);
    }

    if ('tenantId' in data) {
      await this.tenantAccess.find(data.tenantId);
    }

    // Create data object without password
    const { password, ...restData } = data;

    // Create base user object
    const user = id
      ? await this.userRepository.preload({ id, ...restData })
      : this.userRepository.create(restData);

    // Hash password if provided
    if (password) {
      user.passwordHash = await this.hashPassword(password);
    }

    const savedUser = await this.userRepository.save(user);
    delete savedUser.passwordHash; // Remove hash before returning
    return savedUser;
  }

  async verifyAuth(
    usernameOrEmail: string,
    password: string
  ): Promise<AuthResponse> {
    const user = await this.userRepository.findOne({
      where: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
      relations: ['tenants'],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      if (password !== user.passwordHash) {
        throw new UnauthorizedException('Invalid credentials');
      }
    }

    const payload: JwtPayload = {
      userId: user.id,
      username: user.username,
    };

    const accessToken = this.jwtService.sign(payload);

    delete user.passwordHash;
    return {
      accessToken,
      user: {
        id: user.id,
        username: user.username,
        first_name: user.firstName,
        last_name: user.lastName,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        tenants: user.tenants.map((t) => ({ id: t.id, name: t.name })),
      },
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

  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(password, salt);
  }

  async delete(id: string): Promise<void> {
    const user = await this.find(id);
    await this.userRepository.remove(user);
  }

  async addToTenant(userId: string, tenantId: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['tenants'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const tenant = await this.tenantAccess.find(tenantId);
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    if (!user.tenants) {
      user.tenants = [];
    }

    // Check if user is already in tenant
    if (!user.tenants.some((t) => t.id === tenantId)) {
      user.tenants.push(tenant);
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

    user.passwordHash = await this.hashPassword(newPassword);
    await this.userRepository.save(user);
  }

  async create(data: CreateUserDto): Promise<User> {
    const user = this.userRepository.create({
      ...data,
      source: data.source || 'LOCAL',
    });
    return this.userRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }
}
