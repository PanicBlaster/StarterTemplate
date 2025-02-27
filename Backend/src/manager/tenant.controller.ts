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
  ApiHeader,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateTenantDto, UpdateTenantDto } from '../common/dto/tenant.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { TenantAccess } from '../access/services/tenant-access.service';
import { QueryOptionsDto } from '../common/dto/query.dto';
import { UserAccess } from '../access/services/user-access.service';

@ApiTags('tenant')
@Controller('api/v1/tenant')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class TenantController {
  constructor(
    private readonly tenantAccess: TenantAccess,
    private readonly userAccess: UserAccess
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all tenants' })
  @ApiResponse({
    status: 200,
    description: 'Return all tenants with pagination',
  })
  @ApiHeader({
    name: 'X-Tenant-ID',
    required: false,
    description: 'Optional tenant ID',
  })
  async queryTenants(
    @Query('user') userIdentifier?: string,
    @Query(ValidationPipe) query?: QueryOptionsDto,
    @Headers('X-Tenant-ID') tenantId?: string
  ) {
    let userId = undefined;

    if (userIdentifier) {
      // Try to find user by id, email or username
      const userQuery = {
        where: [
          { id: userIdentifier },
          { email: userIdentifier },
          { username: userIdentifier },
        ],
      };
      const users = await this.userAccess.queryUsers(userQuery);
      if (users.total > 0) {
        userId = users.items[0].id;
      }
    }

    if (tenantId && !query.all) {
      query.where = {
        ...(query.where || {}),
        id: tenantId,
      };
    }

    return this.tenantAccess.queryTenants({
      ...query,
      userId,
      where: {
        ...(query.where || {}),
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
    return tenant.item;
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

    const id = this.tenantAccess.upsertTenant(data);
    return {
      id,
      success: true,
      message: 'Tenant created successfully',
    };
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

    this.tenantAccess.upsertTenant(data, id);
    return {
      id,
      success: true,
      message: 'Tenant updated successfully',
    };
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
