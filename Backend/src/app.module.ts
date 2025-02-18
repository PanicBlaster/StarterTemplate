import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './config/database.config';
import { AccessModule } from './access/access.module';
import { ManagerModule } from './manager/manager.module';
import { Client } from 'pg';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { VersionInterceptor } from './common/interceptors/version.interceptor';

const ENV = process.env.NODE_ENV;
console.log('ENV', ENV);
console.log('databaseConfig', databaseConfig);
console.log('Database name', process.env.DB_NAME);
console.log('Database username', process.env.DB_USERNAME);
console.log('Database host', process.env.DB_HOST);
console.log('Database port', process.env.DB_PORT);

async function testConnection() {
  const client = new Client({
    user: process.env.DB_USERNAME || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'dontpanic',
    password: process.env.DB_PASSWORD || 'postgres',
    port: parseInt(process.env.DB_PORT) || 5432,
  });

  try {
    await client.connect();
    console.log('Successfully connected to PostgreSQL');
    const res = await client.query('SELECT current_user, current_database()');
    console.log('Connected as:', res.rows[0]);
  } catch (err) {
    console.error('PostgreSQL connection error:', err);
  } finally {
    await client.end();
  }
}

@Module({
  imports: [TypeOrmModule.forRoot(databaseConfig), AccessModule, ManagerModule],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: VersionInterceptor,
    },
  ],
})
export class AppModule implements OnModuleInit {
  async onModuleInit() {
    await testConnection();
  }
}
