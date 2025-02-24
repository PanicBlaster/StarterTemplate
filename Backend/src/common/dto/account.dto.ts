import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsUUID,
} from 'class-validator';

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
  @ApiProperty({ description: 'User ID' })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ description: 'Current password' })
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @ApiProperty({ description: 'New password' })
  @IsString()
  @IsNotEmpty()
  newPassword: string;
}

export class ResetPasswordDto {
  @ApiProperty({ description: 'User ID' })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ description: 'New password' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
