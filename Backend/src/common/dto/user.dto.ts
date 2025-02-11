import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsArray,
  IsDate,
  IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TenantDto } from './tenant.dto';

export class UserDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  username?: string;

  @ApiProperty()
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  role?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  source?: string;

  @ApiProperty({ type: [TenantDto] })
  @IsArray()
  @IsOptional()
  tenants?: TenantDto[];

  @ApiProperty()
  @IsDate()
  @IsOptional()
  createdAt?: Date;

  @ApiProperty()
  @IsDate()
  @IsOptional()
  updatedAt?: Date;
}

export class UserCreateDto extends UserDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  tenantId?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;
}
