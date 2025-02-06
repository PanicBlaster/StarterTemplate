import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsUUID,
} from 'class-validator';

export class CreateTenantDto {
  @ApiProperty({ example: 'Acme Corp' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Additional notes about the tenant' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ description: 'Whether the tenant is active' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateTenantDto {
  @ApiPropertyOptional({ example: 'Acme Corp Updated' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Additional notes about the tenant' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ description: 'Whether the tenant is active' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  description?: string;
}

export class TenantQueryDto {
  @ApiPropertyOptional({ description: 'Filter by active status' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Search by name' })
  @IsString()
  @IsOptional()
  search?: string;
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
