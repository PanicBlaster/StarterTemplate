import { Module } from '@nestjs/common';
import { AccessModule } from '../access/access.module';
import { AccountController } from './account.controller';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    AccessModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '30d' },
    }),
  ],
  controllers: [AccountController],
})
export class ManagerModule {}
