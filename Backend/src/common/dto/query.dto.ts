import {
  IsNumber,
  IsOptional,
  IsObject,
  IsUUID,
  IsString,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryOptionsDto {
  @ApiPropertyOptional({ description: 'Id of the item to retrieve' })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({ description: 'Number of items to take' })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  take?: number;

  @ApiPropertyOptional({ description: 'Number of items to skip' })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  skip?: number;

  @ApiPropertyOptional({
    description: 'Where conditions as JSON string. Example: {"field":"value"}',
    example: 'where={"name":"test","isActive":true}',
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => {
    try {
      return value ? JSON.parse(value) : undefined;
    } catch (e) {
      return undefined;
    }
  })
  where?: Record<string, any>;

  @ApiPropertyOptional({
    description:
      'Order conditions as JSON string. Example: {"createdAt":"DESC"}',
    example: '{"createdAt":"DESC"}',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;

    try {
      // Check if the value is already an object
      if (typeof value === 'object' && value !== null) {
        return value;
      }

      // Try to parse the string
      return JSON.parse(value);
    } catch (e) {
      console.log(`Failed to parse order parameter: ${value}`, e);
      return undefined;
    }
  })
  order?: Record<string, 'ASC' | 'DESC'>;

  @ApiPropertyOptional({ description: 'Filter by tenant ID' })
  @IsOptional()
  tenantId?: string;

  @ApiPropertyOptional({ description: 'Filter by user ID' })
  @IsOptional()
  userId?: string;

  @ApiPropertyOptional({ description: 'Filter text' })
  @IsOptional()
  filter?: string;

  @ApiPropertyOptional({ description: 'All data' })
  @IsOptional()
  all?: boolean;

  @ApiPropertyOptional({
    description: 'Exclude items that belong to the current user',
  })
  @IsOptional()
  excludeMine?: boolean;
}

export interface QueryResultItem<T> {
  item: T;
  id: string;
}

export interface QueryResult<T> {
  items: QueryResultItem<T>[];
  total: number;
  take: number;
  skip: number;
}

export interface ProcessResult {
  id: string;
  success: boolean;
  message?: string;
}
