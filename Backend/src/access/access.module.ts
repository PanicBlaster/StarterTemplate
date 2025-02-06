import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserAccess } from './services/user-access.service';
import { JwtAuthModule } from 'src/auth/jwt.module';
import { TenantAccess } from './services/tenant-access.service';
import { Tenant } from './entities/tenant.entity';
import { HttpModule } from '@nestjs/axios';
@Module({
  imports: [
    TypeOrmModule.forFeature([Tenant, User]),
    JwtAuthModule,
    HttpModule,
  ],
  providers: [TenantAccess, UserAccess],
  exports: [TenantAccess, UserAccess],
})
export class AccessModule {}
