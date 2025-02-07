import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  NotFoundException,
  ValidationPipe,
  Headers,
  BadRequestException,
  Request,
  UnauthorizedException,
  Logger,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiProperty,
  ApiPropertyOptional,
  ApiHeader,
} from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEmail,
  IsNotEmpty,
  IsUUID,
} from 'class-validator';
import { UserAccess } from '../access/services/user-access.service';
import {
  PaginationOptions,
  PaginationQueryDto,
} from '../common/dto/pagination.dto';
import { AuthResponse, AuthResponseDto } from '../common/dto/auth.dto';
import { QueryOptionsDto, QueryResult } from '../common/dto/query.dto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import {
  CreateAccountDto,
  UpdateAccountDto,
  AccountQueryDto,
  AddUserToTenantDto,
  ChangePasswordDto,
} from '../common/dto/account.dto';
import { LoginDto, SignupDto } from '../common/dto/auth.dto';

@ApiTags('accounts')
@Controller('api/account')
@UseGuards(JwtAuthGuard)
export class AccountController {
  private readonly logger = new Logger(AccountController.name);

  constructor(
    private readonly userAccess: UserAccess,
    private readonly httpService: HttpService
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all accounts' })
  @ApiResponse({ status: 200, description: 'List of accounts retrieved' })
  @ApiHeader({
    name: 'X-Tenant-ID',
    required: false,
    description: 'Optional tenant ID filter',
  })
  async findAll(
    @Query(ValidationPipe) query: QueryOptionsDto,
    @Headers('X-Tenant-ID') headerTenantId?: string
  ) {
    const tenantId = query.tenantId || headerTenantId;

    return this.userAccess.queryUsers({
      take: query.take,
      skip: query.skip,
      where: tenantId ? { tenants: { id: tenantId } } : query.where,
      order: query.order,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an account by ID' })
  @ApiParam({ name: 'id', description: 'The account ID' })
  @ApiResponse({ status: 200, description: 'Account found' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  async findOne(@Param('id') id: string) {
    const user = await this.userAccess.findOneUser({ id });
    if (!user) {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }
    return user;
  }

  @Post()
  @ApiOperation({ summary: 'Create a new account' })
  @ApiResponse({ status: 201, description: 'Account created successfully' })
  async create(@Body(ValidationPipe) createAccountDto: CreateAccountDto) {
    return this.userAccess.upsertUser(createAccountDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an account' })
  @ApiParam({ name: 'id', description: 'The account ID to update' })
  @ApiResponse({ status: 200, description: 'Account updated successfully' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateAccountDto: UpdateAccountDto
  ) {
    try {
      return await this.userAccess.upsertUser(updateAccountDto, id);
    } catch {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }
  }

  @Post('tenant/add-user')
  @ApiOperation({ summary: 'Add a user to a tenant' })
  @ApiResponse({
    status: 200,
    description: 'User added to tenant successfully',
  })
  @ApiResponse({ status: 404, description: 'User or tenant not found' })
  @ApiHeader({
    name: 'X-Tenant-ID',
    required: false,
    description: 'Optional tenant ID',
  })
  async addUserToTenant(
    @Body(ValidationPipe) data: AddUserToTenantDto,
    @Headers('X-Tenant-ID') headerTenantId?: string
  ): Promise<void> {
    const tenantId = data.tenantId || headerTenantId;
    if (!tenantId) {
      throw new BadRequestException(
        'Tenant ID must be provided in body or header'
      );
    }

    const user = await this.userAccess.findOneUser({ id: data.userId });
    if (!user) {
      throw new NotFoundException(`User with ID ${data.userId} not found`);
    }
  }

  @Post('changepassword')
  @ApiOperation({ summary: 'Change user password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 401, description: 'Current password is incorrect' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async changePassword(
    @Body(ValidationPipe) changePasswordDto: ChangePasswordDto,
    @Request() req
  ): Promise<void> {
    const userId = req.user.userId; // From JWT token
    await this.userAccess.changePassword(
      userId,
      changePasswordDto.currentPassword,
      changePasswordDto.newPassword
    );
  }
}
