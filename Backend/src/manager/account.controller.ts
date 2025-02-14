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
  ApiBearerAuth,
} from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEmail,
  IsNotEmpty,
  IsUUID,
} from 'class-validator';
import { UserAccess } from '../access/services/user-access.service';
import { AuthResponse, AuthResponseDto } from '../common/dto/auth.dto';
import { QueryOptionsDto, QueryResult } from '../common/dto/query.dto';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '../auth/jwt.guard';
import {
  AddUserToTenantDto,
  ChangePasswordDto,
} from '../common/dto/account.dto';
import { TenantAccess } from '../access/services/tenant-access.service';
import { UserCreateDto, UserDto } from '../common/dto/user.dto';

@ApiTags('accounts')
@Controller('api/v1/account')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class AccountController {
  private readonly logger = new Logger(AccountController.name);

  constructor(
    private readonly userAccess: UserAccess,
    private readonly tenantAccess: TenantAccess
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
    @Request() req,
    @Headers('X-Tenant-ID') headerTenantId?: string
  ) {
    let tenantId = query.tenantId || headerTenantId;

    if (tenantId) {
      const isValidTenant = await this.tenantAccess.validateTenantId(tenantId);
      if (!isValidTenant) {
        throw new BadRequestException('Invalid tenant ID provided');
      }
    } else {
      // ensure the user is an admin
      const user = await this.userAccess.findOneUser({
        id: req.user.userId,
      });
      if (user?.item?.role !== 'admin') {
        throw new UnauthorizedException('User must be an admin');
      }
    }

    return this.userAccess.queryUsers({
      take: query.take || 10,
      skip: query.skip || 0,
      where: tenantId ? { tenants: { id: tenantId } } : query.where,
      order: query.order || { createdAt: 'DESC' },
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an account by ID' })
  @ApiParam({ name: 'id', description: 'The account ID' })
  @ApiResponse({ status: 200, description: 'Account found' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  async findOne(
    @Param('id') id: string,
    @Headers('X-Tenant-ID') headerTenantId?: string
  ) {
    const user = await this.userAccess.findOneUser({
      id,
      tenantId: headerTenantId,
    });
    if (!user) {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }
    return user.item;
  }

  @Post()
  @ApiOperation({ summary: 'Create a new account' })
  @ApiResponse({ status: 201, description: 'Account created successfully' })
  async create(@Body(ValidationPipe) createAccountDto: UserCreateDto) {
    const id = await this.userAccess.upsertUser(createAccountDto);
    return {
      id,
      success: true,
      message: 'Account created successfully',
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an account' })
  @ApiParam({ name: 'id', description: 'The account ID to update' })
  @ApiResponse({ status: 200, description: 'Account updated successfully' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateAccountDto: UserDto
  ) {
    await this.userAccess.upsertUser(updateAccountDto, id);
    return {
      id,
      success: true,
      message: 'Account updated successfully',
    };
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
