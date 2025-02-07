import { Module } from '@nestjs/common';
import { AccessModule } from '../access/access.module';
import { AccountController } from './account.controller';
import { JwtModule } from '@nestjs/jwt';
import { HttpModule } from '@nestjs/axios';
import { AuthController } from './auth.controller';
import { TenantController } from './tenant.controller';
@Module({
  imports: [
    AccessModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '30d' },
    }),
    HttpModule,
  ],
  controllers: [AccountController, AuthController, TenantController],
})
export class ManagerModule {}
