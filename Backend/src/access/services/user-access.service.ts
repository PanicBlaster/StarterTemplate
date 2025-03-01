import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { User } from '../entities/user.entity';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { AuthResponse } from '../../common/dto/auth.dto';
import {
  QueryOptionsDto,
  QueryResult,
  QueryResultItem,
} from '../../common/dto/query.dto';

import { UserCreateDto, UserDto } from '../../common/dto/user.dto';
import { Tenant } from '../entities/tenant.entity';

@Injectable()
export class UserAccess {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>
  ) {}

  private mapToDto(user: User): UserDto {
    return {
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      source: user.source,
      tenants: user.tenants.map((tenant) => ({
        id: tenant.id,
        name: tenant.name,
      })),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private async isUserAdmin(userId: string): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    return user?.role === 'admin';
  }

  async findOneUser(
    options: QueryOptionsDto
  ): Promise<QueryResultItem<UserDto> | null> {
    const user = await this.userRepository.findOne({
      where: { id: options.id },
      relations: ['tenants'],
    });

    if (!user) return null;

    if (options.tenantId) {
      const isAdmin = await this.isUserAdmin(options.currentUserId);
      if (!isAdmin) {
        const tenant = user.tenants.find((t) => t.id === options.tenantId);
        if (!tenant) {
          return null;
        }
      }
    }

    return {
      item: this.mapToDto(user),
      id: user.id,
    };
  }

  async queryUsers(options: QueryOptionsDto): Promise<QueryResult<UserDto>> {
    let where = options.where || {};
    if (options.filter) {
      where = {
        ...where,
        username: ILike(`%${options.filter}%`),
      };
    }

    const [items, total] = await this.userRepository.findAndCount({
      take: options.take || 10,
      skip: options.skip || 0,
      where: where,
      order: { createdAt: 'DESC' },
      relations: ['tenants'],
    });

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

  async upsertUser(
    data: UserCreateDto | UserDto,
    id?: string
  ): Promise<string> {
    if (id) {
      const existingUser = await this.userRepository.findOne({
        where: { id },
      });
      if (!existingUser) {
        throw new NotFoundException('User not found');
      }

      existingUser.firstName = (data as any).firstName;
      existingUser.lastName = (data as any).lastName;
      existingUser.source = 'LOCAL';
      existingUser.role = 'user';
      existingUser.tenants = [];
      existingUser.updatedAt = new Date();

      await this.userRepository.save(existingUser);
      return existingUser.id;
    } else {
      let passwordHash = undefined;
      passwordHash = (data as any).password
        ? await bcrypt.hash((data as any).password, 10)
        : undefined;

      const newUser = this.userRepository.create({
        id: uuidv4(),
        username: (data as any).username,
        email: (data as any).email,
        firstName: (data as any).firstName,
        lastName: (data as any).lastName,
        source: 'LOCAL',
        role: 'user',
        tenants: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        passwordHash: passwordHash,
      });
      await this.userRepository.save(newUser);
      return newUser.id;
    }

    return id;
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
    if (!isPasswordValid && user.passwordHash != password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const userDto = this.mapToDto(user);

    const token = await this.jwtService.signAsync({ userId: user.id });

    return {
      accessToken: token,
      user: {
        id: user.id,
        username: user.username || '',
        email: user.email || '',
        role: user.role || '',
        lastName: user.lastName || '',
        firstName: user.firstName || '',
        tenants: user.tenants.map((tenant) => ({
          id: tenant.id,
          name: tenant.name,
        })),
      },
    };
  }

  async authForExternal(username: string): Promise<AuthResponse> {
    const email = username;
    let user = await this.userRepository.findOne({
      where: { username },
      relations: ['tenants'],
    });

    if (!user) {
      user = await this.userRepository.findOne({
        where: { email },
        relations: ['tenants'],
      });
    }

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.verifyAuth(user.username, user.passwordHash);
  }

  async delete(options: QueryOptionsDto): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: options.id },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
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

    const tenant = await this.tenantRepository.findOne({
      where: { id: tenantId },
    });
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    if (!user.tenants) {
      user.tenants = [];
    }

    // Check if user is already in tenant
    if (!user.tenants.some((t) => t.id === tenantId)) {
      user.tenants.push();
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

  async updatePassword(userId: string, password: string): Promise<void> {
    const passwordHash = await bcrypt.hash(password, 10);

    await this.userRepository.update(userId, { passwordHash });
  }
}
