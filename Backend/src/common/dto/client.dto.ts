import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsBoolean,
} from 'class-validator';

export class CreateClientDto {
  @ApiProperty({ example: 'Acme Corp' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Additional notes about the client' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ description: 'Whether the client is active' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ description: 'Associated tenant ID' })
  @IsUUID()
  @IsNotEmpty()
  tenantId: string;
}

export class UpdateClientDto {
  @ApiPropertyOptional({ example: 'Acme Corp Updated' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Additional notes about the client' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ description: 'Whether the client is active' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Associated tenant ID' })
  @IsUUID()
  @IsOptional()
  tenantId?: string;
}

export class ClientQueryDto {
  @ApiPropertyOptional({ description: 'Filter by tenant ID' })
  @IsUUID()
  @IsOptional()
  tenantId?: string;

  @ApiPropertyOptional({ description: 'Filter by active status' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
