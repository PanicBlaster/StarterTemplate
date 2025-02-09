import { IsNumber, IsOptional, IsObject, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
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

  @ApiPropertyOptional({ description: 'Where conditions' })
  @IsObject()
  @IsOptional()
  where?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Order conditions' })
  @IsObject()
  @IsOptional()
  order?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Filter by tenant ID' })
  @IsOptional()
  tenantId?: string;
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
