import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsUUID,
} from 'class-validator';

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

  @ApiProperty({ example: 'John' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: 'LOCAL' })
  @IsString()
  @IsOptional()
  source?: string;

  @ApiProperty({ example: 'user' })
  @IsString()
  @IsOptional()
  role?: string;

  @IsUUID()
  @IsOptional()
  tenantId?: string;
}

export class UpdateAccountDto {
  @ApiPropertyOptional({ example: 'john@newdomain.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  @IsOptional()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  password?: string;

  @ApiProperty({ example: 'LOCAL' })
  @IsString()
  @IsOptional()
  source?: string;

  @ApiProperty({ example: 'user' })
  @IsString()
  @IsOptional()
  role?: string;

  @IsUUID()
  @IsOptional()
  tenantId?: string;
}

export class AccountQueryDto {
  @ApiPropertyOptional({ description: 'Filter by tenant ID' })
  @IsUUID()
  @IsOptional()
  tenantId?: string;
}

export class AddUserToTenantDto {
  @ApiProperty({ description: 'User ID to add to tenant' })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiPropertyOptional({ description: 'Tenant ID to add user to' })
  @IsUUID()
  @IsOptional()
  tenantId?: string;
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
