import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../access/entities/user.entity';
import { Tenant } from '../access/entities/tenant.entity';
export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'startertemplate',
  entities: [User, Tenant],
  synchronize: true,
  logging: true,
};
