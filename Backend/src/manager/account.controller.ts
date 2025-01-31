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

export class LoginDto {
  @ApiProperty({ example: 'john.doe' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class CreateAccountDto {
  @ApiProperty({ example: 'john.doe' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  fullName: string;
}

export class UpdateAccountDto {
  @ApiPropertyOptional({ example: 'john@newdomain.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: 'John Smith' })
  @IsString()
  @IsOptional()
  fullName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  password?: string;
}

export class AccountQueryDto implements PaginationOptions {
  @ApiPropertyOptional({
    description: 'Page number (1-based)',
    minimum: 1,
    type: Number,
  })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    minimum: 1,
    type: Number,
  })
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ description: 'Filter by tenant ID' })
  @IsUUID()
  @IsOptional()
  tenantId?: string;
}

export class SignupDto {
  @ApiProperty({ example: 'john.doe' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({ example: 'John' })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Doe' })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional({ example: '+1234567890' })
  @IsString()
  @IsOptional()
  phone?: string;
}

export class ChangePasswordDto {
  @ApiProperty({ description: 'Current password' })
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @ApiProperty({ description: 'New password' })
  @IsString()
  @IsNotEmpty()
  newPassword: string;
}

@ApiTags('accounts')
@Controller('api/account')
export class AccountController {
  constructor(private readonly userAccess: UserAccess) {}

  @Post('login')
  @ApiOperation({ summary: 'Authenticate user' })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body(ValidationPipe) loginDto: LoginDto): Promise<AuthResponse> {
    return this.userAccess.verifyAuth(loginDto.username, loginDto.password);
  }

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

    return this.userAccess.findAll({
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
    const user = await this.userAccess.find(id);
    if (!user) {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }
    return user;
  }

  @Post()
  @ApiOperation({ summary: 'Create a new account' })
  @ApiResponse({ status: 201, description: 'Account created successfully' })
  async create(@Body(ValidationPipe) createAccountDto: CreateAccountDto) {
    return this.userAccess.upsert(createAccountDto);
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
      return await this.userAccess.upsert(updateAccountDto, id);
    } catch {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }
  }

  @Post('signup')
  @ApiOperation({ summary: 'Sign up a new user' })
  @ApiResponse({
    status: 201,
    description: 'Account created successfully',
    type: AuthResponseDto,
  })
  async signup(
    @Body(ValidationPipe) signupDto: SignupDto
  ): Promise<AuthResponse> {
    // Create the user
    const user = await this.userAccess.upsert(signupDto);

    // Generate token and return auth response
    return this.userAccess.verifyAuth(user.username, signupDto.password);
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
