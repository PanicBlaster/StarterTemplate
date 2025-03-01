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

  where?: Record<string, any>;

  currentUserId?: string;
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
