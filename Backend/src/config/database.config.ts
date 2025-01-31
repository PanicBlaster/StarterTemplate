import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../access/entities/user.entity';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'dontpanictemplate',
  entities: [User],
  synchronize: true,
  logging: true,
};
