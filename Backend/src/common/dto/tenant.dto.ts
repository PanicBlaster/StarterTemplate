import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsUUID,
} from 'class-validator';

export class CreateTenantDto {
  @ApiProperty({ description: 'Name of the tenant' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Description of the tenant' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Additional notes about the tenant' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ description: 'Whether the tenant is active' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateTenantDto {
  @ApiProperty({ description: 'Name of the tenant' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: 'Description of the tenant' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Additional notes about the tenant' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ description: 'Whether the tenant is active' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class TenantDto implements CreateTenantDto {
  @ApiProperty({ description: 'The name of the tenant', example: 'Acme Corp' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Optional description of the tenant',
    example: 'Global technology company',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Additional notes about the tenant' })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class TenantIdDto {
  @IsUUID()
  tenantId: string;
}
