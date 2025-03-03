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
import {
  ProcessResult,
  QueryOptionsDto,
  QueryResult,
} from '../common/dto/query.dto';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '../auth/jwt.guard';
import {
  AddUserToTenantDto,
  ChangePasswordDto,
  ResetPasswordDto,
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
  async queryUsers(
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
    }

    return this.userAccess.queryUsers({
      userId: req.user.userId,
      take: query.take || 10,
      skip: query.skip || 0,
      all: query.all,
      tenantId: tenantId,
      filter: query.filter,
      excludeMine: query.excludeMine,
      where: query.where,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an account by ID' })
  @ApiParam({ name: 'id', description: 'The account ID' })
  @ApiResponse({ status: 200, description: 'Account found' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  async findOneUser(
    @Param('id') id: string,
    @Request() req,
    @Headers('X-Tenant-ID') headerTenantId?: string
  ) {
    const user = await this.userAccess.findOneUser({
      id,
      tenantId: headerTenantId,
      currentUserId: req.user.userId,
    });
    if (!user) {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }
    return user.item;
  }

  @Post()
  @ApiOperation({ summary: 'Create a new account' })
  @ApiResponse({ status: 201, description: 'Account created successfully' })
  async createUser(@Body(ValidationPipe) createAccountDto: UserCreateDto) {
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
  async updateUser(
    @Param('id') id: string,
    @Body(ValidationPipe) updateAccountDto: UserDto
  ) {
    await this.userAccess.upsertUser(updateAccountDto, id);
    return {
      id,
      success: true,
      message: 'User updated successfully',
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
  ): Promise<ProcessResult> {
    const userId = req.user.userId; // From JWT token

    if (userId !== changePasswordDto.userId) {
      throw new UnauthorizedException('User ID does not match');
    }

    await this.userAccess.changePassword(
      userId,
      changePasswordDto.currentPassword,
      changePasswordDto.newPassword
    );

    return {
      message: 'Password changed successfully',
      success: true,
      id: userId,
    };
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset user password' })
  async resetPassword(
    @Body(ValidationPipe) resetPasswordDto: ResetPasswordDto
  ): Promise<ProcessResult> {
    const { userId, password } = resetPasswordDto;

    const user = await this.userAccess.findOneUser({ id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userAccess.updatePassword(userId, password);

    return {
      success: true,
      message: 'Password reset successfully',
      id: userId,
    };
  }
}
