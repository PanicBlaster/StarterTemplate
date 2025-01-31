import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserAccess } from './services/user-access.service';
import { JwtAuthModule } from 'src/auth/jwt.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), JwtAuthModule],
  providers: [UserAccess],
  exports: [UserAccess],
})
export class AccessModule {}
