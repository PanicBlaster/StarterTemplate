import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateSystemSettingDto {
  @ApiProperty({ example: 'max_concurrent_builds' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ example: 'setting_value' })
  @IsString()
  @IsNotEmpty()
  value: string;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ description: 'Additional description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Associated tenant ID' })
  @IsUUID()
  @IsNotEmpty()
  tenantId: string;
}

export class UpdateSystemSettingDto {
  @ApiPropertyOptional({ example: 'new_value' })
  @IsString()
  @IsOptional()
  value?: string;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class SystemSettingDto {
  @ApiProperty({ example: 'max_concurrent_builds' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ example: '5' })
  @IsString()
  @IsNotEmpty()
  value: string;

  @ApiPropertyOptional({
    example: 'Maximum number of concurrent builds allowed',
  })
  @IsString()
  @IsOptional()
  description?: string;
}

export class SystemSettingQueryDto {
  @ApiPropertyOptional({ description: 'Filter by tenant ID' })
  @IsUUID()
  @IsOptional()
  tenantId?: string;

  @ApiPropertyOptional({ description: 'Filter by key' })
  @IsString()
  @IsOptional()
  key?: string;
}
