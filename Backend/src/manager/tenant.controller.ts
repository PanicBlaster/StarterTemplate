import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Query,
  Headers,
  BadRequestException,
  NotFoundException,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  CreateTenantDto,
  UpdateTenantDto,
  TenantQueryDto,
} from '../common/dto/tenant.dto';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { TenantAccess } from 'src/access/services/tenant-access.service';
import { QueryOptionsDto } from 'src/common/dto/query.dto';

@ApiTags('tenant')
@Controller('api/v1/tenant')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TenantController {
  constructor(private readonly tenantAccess: TenantAccess) {}

  @Get()
  @ApiOperation({ summary: 'Get all tenants' })
  @ApiResponse({
    status: 200,
    description: 'Return all tenants with pagination',
  })
  async queryTenants(
    @Query(ValidationPipe) query: QueryOptionsDto,
    @Headers('X-Tenant-ID') tenantId?: string
  ) {
    if (tenantId) {
      query.where = {
        ...(query.where || {}),
        id: tenantId,
      };
    }

    return this.tenantAccess.queryTenants({
      ...query,
      where: {
        ...(query.where || {}),
        ...(tenantId && { id: tenantId }),
      },
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get tenant by id' })
  @ApiResponse({ status: 200, description: 'Return tenant by id' })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  async findOneTenant(
    @Headers('X-Tenant-ID') tenantId: string,
    @Param('id') id: string
  ) {
    if (tenantId && tenantId !== id) {
      throw new BadRequestException(
        'Tenant ID in header must match requested tenant ID'
      );
    }

    const tenant = await this.tenantAccess.findOneTenant({ id });
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }
    return tenant;
  }

  @Post()
  @ApiOperation({ summary: 'Create a new tenant' })
  @ApiResponse({ status: 201, description: 'Tenant successfully created' })
  async create(
    @Headers('X-Tenant-ID') tenantId: string,
    @Body(ValidationPipe) data: CreateTenantDto
  ) {
    if (tenantId) {
      throw new BadRequestException(
        'Cannot specify tenant ID in header when creating a new tenant'
      );
    }

    return this.tenantAccess.upsertTenant(data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update tenant by id' })
  @ApiResponse({ status: 200, description: 'Tenant successfully updated' })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  async update(
    @Headers('X-Tenant-ID') tenantId: string,
    @Param('id') id: string,
    @Body(ValidationPipe) data: UpdateTenantDto
  ) {
    if (tenantId && tenantId !== id) {
      throw new BadRequestException(
        'Tenant ID in header must match tenant ID being updated'
      );
    }

    const tenant = await this.tenantAccess.findOneTenant({ id });
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return this.tenantAccess.upsertTenant(data, id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete tenant by id' })
  @ApiResponse({ status: 200, description: 'Tenant successfully deleted' })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  async remove(
    @Headers('X-Tenant-ID') tenantId: string,
    @Param('id') id: string
  ) {
    if (tenantId && tenantId !== id) {
      throw new BadRequestException(
        'Tenant ID in header must match tenant ID being deleted'
      );
    }

    const tenant = await this.tenantAccess.findOneTenant({ id });
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return this.tenantAccess.removeTenant({ id });
  }
}
