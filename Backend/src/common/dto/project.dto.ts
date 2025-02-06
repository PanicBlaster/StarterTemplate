import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsNumber,
  IsDateString,
  IsBoolean,
} from 'class-validator';
import { QueryOptionsDto } from './query.dto';

export class CreateProjectDto {
  @ApiProperty({ example: 'MeepleMayham' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'https://github.com/org/repo', required: false })
  @IsString()
  @IsOptional()
  repoUri?: string;

  @ApiProperty({ example: 'gh_123456', required: false })
  @IsString()
  @IsOptional()
  repoKey?: string;

  @ApiProperty({ example: 'https://aml.example.com', required: false })
  @IsString()
  @IsOptional()
  amlUri?: string;

  @ApiProperty({ example: 'aml_123456', required: false })
  @IsString()
  @IsOptional()
  amlKey?: string;

  @ApiPropertyOptional({ description: 'Additional notes about the project' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ description: 'Whether the project is active' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ description: 'Associated client ID' })
  @IsUUID()
  @IsOptional()
  clientId: string;

  @IsUUID()
  @IsOptional()
  tenantId?: string;
}

export class CreateVelocityDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsNumber()
  @IsNotEmpty()
  velocity: number;
}

export class CreateProjectHoursDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsUUID()
  @IsNotEmpty()
  projectId: string;

  @IsNumber()
  @IsNotEmpty()
  billableHours: number;

  @IsNumber()
  @IsNotEmpty()
  nonBillableHours: number;

  @IsDateString()
  @IsNotEmpty()
  date: string;
}

export class UpdateProjectHoursDto {
  @IsNumber()
  @IsOptional()
  billableHours?: number;

  @IsNumber()
  @IsOptional()
  nonBillableHours?: number;

  @IsDateString()
  @IsOptional()
  date?: string;
}

export interface CreatePullRequestDto {
  prNumber: number;
  title: string;
  status: string;
  changes?: number;
  frontendChanges?: number;
  backendChanges?: number;
  authorEmail: string;
  reviewerEmail?: string;
  comments?: string;
  projectId: string;
  tenantId: string;
  externalId: string;
}

export interface UpdatePullRequestDto {
  title?: string;
  description?: string;
  sourceBranch?: string;
  targetBranch?: string;
  status?: string;
}

export enum FileType {
  BACKEND = 'backend',
  FRONTEND = 'frontend',
  LOG = 'log',
}

export interface LogResponse {
  items: LogFile[];
  total: number;
}

export class ProjectDto {
  @ApiProperty({ example: 'MeepleMayham' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'https://github.com/org/repo', required: false })
  @IsString()
  @IsOptional()
  repoUri?: string;

  @ApiProperty({ example: 'gh_123456', required: false })
  @IsString()
  @IsOptional()
  repoKey?: string;

  @ApiProperty({ example: 'https://aml.example.com', required: false })
  @IsString()
  @IsOptional()
  amlUri?: string;

  @ApiProperty({ example: 'aml_123456', required: false })
  @IsString()
  @IsOptional()
  amlKey?: string;

  @ApiPropertyOptional({ description: 'Additional notes about the project' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ description: 'Whether the project is active' })
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ description: 'Associated client ID' })
  @IsUUID()
  @IsOptional()
  clientId: string;

  @IsUUID()
  @IsOptional()
  tenantId?: string;
}

export class CreateEnvironmentDto {
  @ApiProperty({ example: 'qa', description: 'Environment name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Associated hosting node ID' })
  @IsUUID()
  @IsNotEmpty()
  hostingNodeId: string;

  @ApiPropertyOptional({
    description: 'Additional notes about the environment',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateEnvironmentDto {
  @ApiPropertyOptional({ description: 'Environment notes' })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class ProjectQueryDto extends QueryOptionsDto {
  @ApiPropertyOptional({ description: 'Filter by client ID' })
  @IsString()
  @IsOptional()
  client?: string;

  @ApiPropertyOptional({ description: 'Filter by tenant ID' })
  @IsString()
  @IsOptional()
  tenant?: string;

  @ApiPropertyOptional({ description: 'Filter by active status' })
  @IsOptional()
  active?: boolean;
}

export class CreatePullRequestDto {
  @ApiProperty({ description: 'External system ID' })
  @IsString()
  @IsNotEmpty()
  externalId: string;

  @ApiProperty({ description: 'Pull request number' })
  @IsNumber()
  @IsNotEmpty()
  prNumber: number;

  @ApiProperty({ description: 'Pull request title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Pull request status' })
  @IsString()
  @IsNotEmpty()
  status: string;

  @ApiProperty({ description: 'Total number of changes' })
  @IsNumber()
  @IsOptional()
  changes?: number;

  @ApiProperty({ description: 'Number of frontend changes' })
  @IsNumber()
  @IsOptional()
  frontendChanges?: number;

  @ApiProperty({ description: 'Number of backend changes' })
  @IsNumber()
  @IsOptional()
  backendChanges?: number;

  @ApiProperty({ description: 'Author email' })
  @IsString()
  @IsNotEmpty()
  authorEmail: string;

  @ApiProperty({ description: 'Reviewer email' })
  @IsString()
  @IsOptional()
  reviewerEmail?: string;

  @ApiProperty({ description: 'Comments' })
  @IsString()
  @IsOptional()
  comments?: string;

  @IsUUID()
  @IsNotEmpty()
  projectId: string;

  @IsUUID()
  @IsOptional()
  tenantId: string;
}

export class UpdatePullRequestDto {
  @ApiPropertyOptional({ description: 'External system ID' })
  @IsString()
  @IsOptional()
  externalId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  changes?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  frontendChanges?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  backendChanges?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  reviewerEmail?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  comments?: string;
}

export class LogFile {
  @ApiProperty()
  name: string;

  @ApiProperty()
  size: number;

  @ApiProperty()
  lastModified: Date;
}

export interface LogResponse {
  items: LogFile[];
  total: number;
}

export class ServiceStatusDto {
  @ApiProperty()
  serviceName: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  port: number;

  @ApiPropertyOptional()
  message?: string;
}
