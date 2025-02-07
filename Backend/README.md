# Panic Blaster - Backend Template

<p align="center">
  <img src="./Logo.png" width="400" alt="Panic Blaster Logo" />
</p>

## Description

Backend API is a NestJS application that provides a REST API for the Panic Blaster project.

You can get to the documentation at http://localhost:3001/api-docs. When building calls, you can use the Swagger UI to test the API. Build backend to run against the API.

## Table of Contents

1. [API Call Chains](CALLCHAINS.md)
2. [Project Setup](#project-setup)
3. [Compile and Run](#compile-and-run-the-project)
4. [Run Tests](#run-tests)
5. [Deployment](#deployment)
   - [Production Deployment](#production-deployment)
   - [Cloud Deployment](#cloud-deployment)
6. [API Documentation](#api-documentation)
   - [Swagger UI Features](#swagger-ui-features)
7. [Project Structure](#project-structure)
   - [Architecture Overview](#architecture-overview)
   - [Key Features](#key-features)

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## What if process hang in development?

Mac/Linux

```bash
sudo kill $(lsof -t -i:3001)
```

Windows

```
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

## Deployment

### Production Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

### Cloud Deployment

## API Documentation

This project includes Swagger/OpenAPI documentation for all endpoints. To access the interactive API documentation:

1. Start the application:

```bash
npm run start:dev
```

2. Open your browser and navigate to:

```
http://localhost:3001/api-docs
```

### Swagger UI Features

- Interactive API documentation
- Request/response examples
- Try-it-out functionality
- Schema definitions
- OpenAPI specification

## Project Structure

```
src/
├── access/                           # Data access layer
│   ├── entities/                     # Database entities
│   │   ├── tenant.entity.ts
│   │   ├── user.entity.ts
│   └── services/                     # Data access services
│       ├── tenant-access.service.ts
│       ├── user-access.service.ts
├── manager/                          # API Controllers layer
│   ├── account.controller.ts
│   ├── auth.controller.ts
├── common/                           # Shared code
│   └── dto/                          # Data Transfer Objects
│       └── pagination.dto.ts
│       └── query.dto.ts
│       └── auth.dto.ts
│       └── tenant.dto.ts
│       └── user.dto.ts
└── config/                           # Configuration
    └── database.config.ts
```

### Architecture Overview

The project follows a layered architecture:

1. **Access Layer** (`src/access/`)

   - Handles data persistence and business logic
   - Contains database entities and their relationships
   - Provides services for CRUD operations
   - Implements business rules and validations
   - All access services must be added to the access module.

2. **Manager Layer** (`src/manager/`)

   - Implemented as controller. AccountManager is created as AccountController in src/manager/account.controller.ts
   - Handles HTTP requests and responses
   - Implements REST API endpoints
   - Provides Swagger documentation
   - Handles input validation and error responses
   - All managers must be added to the managers module.

3. **Common Layer** (`src/common/`)

   - Contains shared code and utilities
   - Defines common DTOs and interfaces
   - Implements cross-cutting concerns

4. **Config Layer** (`src/config/`)
   - Database configuration
   - All entities must be added to the config module.

### Key Features

- **Authentication**: User authentication with secure password handling
- **Multi-tenancy**: Support for multiple tenants with isolated projects
- **Project Management**: Full project lifecycle with environment management
- **System Settings**: Global configuration management
- **API Documentation**: Swagger/OpenAPI documentation
- **Type Safety**: TypeScript with strict type checking
- **Input Validation**: Request validation using class-validator
- **Pagination**: Built-in support for paginated responses

For detailed API call chains and data flows, see [CALLCHAINS.md](CALLCHAINS.md).

# Controller/Manager HTTP Call Guidelines

Tenant Id can be passed in the header or in the body. If it is passed in the body, it must match the tenant id in the header. Query options should be passed thru query (QueryOptionsDto) object.

Examples below assume we are building a multi-tenant application. Tenant related information could be removed if we are building a single-tenant application.

## Manager Module

```typescript
@Module({
  imports: [
    AccessModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '30d' },
    }),
    HttpModule,
  ],
  controllers: [AccountController, AuthController, TenantController, NewManagerController],
})
```

## Auth guard

Managers should use the JwtAuthGuard to validate the JWT token.

```
import { JwtAuthGuard } from 'src/auth/jwt.guard';
```

## REST API Call Guidelines

If we are implementing a REST Style API use standard REST guidelines.

- Retrieve a single item: GET /api/v1/items/:id
- Retrieve a list of items: GET /api/v1/items
- Create an item: POST /api/v1/items
- Update an item: PUT /api/v1/items/:id

## List/FindAll/Query

If we are in a findAll type call, we should see if the tenantId is passed in the header and if it is, we should add it to the query.

Query includes pagination, sorting, and filtering.

Query example:

```typescript
  @Get()
  @ApiOperation({ summary: 'Get all clients' })
  async queryClients(
    @Query(ValidationPipe) query: QueryOptionsDto,
    @Headers('X-Tenant-ID') tenantId?: string
  ) {
    this.validateTenantId(tenantId);

    if (tenantId) {
      query.where = {
        ...(query.where || {}),
        tenantId,
      };
    }

    return this.clientAccess.queryClients({
      ...query,
      where: {
        ...(query.where || {}),
        ...(tenantId && { tenantId }),
      },
    });
  }
```

## FindOne

If we are implementing a findOne type call, we should see if the tenantId is passed in the header and if it is, we should add it to the query. In general name these for the item type we are looking up. So a find one for a client would be findOneClient.

FindOne example:

```typescript
  @Get(':id')
  @ApiOperation({ summary: 'Get a client by id' })
  async findOneClient(
    @Headers('X-Tenant-ID') tenantId: string,
    @Param('id') id: string
  ) {
    this.validateTenantId(tenantId);

    const client = await this.clientAccess.findOneClient({id});
    if (client.tenantId !== tenantId) {
      throw new NotFoundException('Client not found');
    }
    return client;
  }
```

## Create

If we are implementing a create type call, we should see if the tenantId is passed in the header and if it is, we should add it to the body.

Create should return the id of the created item.

Create example:

```typescript
  @Post()
  @ApiOperation({ summary: 'Create a new client' })
  async create(
    @Headers('X-Tenant-ID') tenantId: string,
    @Body(ValidationPipe) data: CreateClientDto
  ) {
    this.validateTenantId(tenantId, data.tenantId);
    if (!data.tenantId) {
      data.tenantId = tenantId;
    }
    if (tenantId) {
      if (tenantId !== data.tenantId) {
        throw new BadRequestException(
          'Tenant ID in header must match tenant ID in body'
        );
      }
  }
  return this.clientAccess.upsertClient(data);
}
```

If we are implementing an update type call, we should see if the tenantId is passed in the header and if it is, we should add it to the body.

## Update

Update should return the id of the updated item.

Update example:

```typescript
  @Put(':id')
  @ApiOperation({ summary: 'Update a client' })
  async update(
    @Headers('X-Tenant-ID') tenantId: string,
    @Param('id') id: string,
    @Body(ValidationPipe) data: UpdateClientDto
  ) {
    this.validateTenantId(tenantId, data.tenantId);

    if (!data.tenantId) {
      data.tenantId = tenantId;
    }
    if (tenantId) {
      if (tenantId !== data.tenantId) {
        throw new BadRequestException(
          'Tenant ID in header must match tenant ID in body'
        );
      }
    }

    const client = await this.clientAccess.findOneClient(id);
    if (client.tenantId !== tenantId) {
      throw new NotFoundException('Client not found');
    }

    return this.clientAccess.upsertClient(data, id);
  }
```

# Data Access

Typical data access will should use similar methods, with similar naming. All data access should be in the access layer. The entity objects should NEVER be exposed, we should always return a DTO (common/dto) object.

## Upsert Example

Upsert should not return anything.

```typescript
async upsertClient(data: clientDto, id?: string): Promise<string> {
  if (id) {
    await this.findOneClient(id); // Verify exists
  }

  if (data.tenantId) {
    await this.tenantAccess.findOneTenant(data.tenantId); // Verify tenant exists
  }

  const client = id
    ? await this.clientRepository.preload({ id, ...data })
    : this.clientRepository.create(data);

  const savedClient = await this.clientRepository.save(client);

  return savedClient.id;
}
```

## Find One Example

```typescript
  async findOneUser(
    options: QueryOptionsDto
  ): Promise<QueryResultItem<User> | null> {
    const user = await this.userRepository.findOne({
      where: { id: options.id },
      relations: ['tenants'],
    });

    if (!user) return null;

    return {
      item: user,
      id: user.id,
    };
  }
```

## Query Example

```typescript
  async queryUsers(options: QueryOptionsDto): Promise<QueryResult<User>> {
    const [items, total] = await this.userRepository.findAndCount({
      take: options.take || 10,
      skip: options.skip || 0,
      where: options.where || {},
      order: options.order || { createdAt: 'DESC' },
      relations: ['tenants'],
    });

    return {
      items: items.map((item) => ({
        item,
        id: item.id,
      })),
      total,
      take: options.take || 10,
      skip: options.skip || 0,
    };
  }
```

# DTOs

DTOs are located in src/common/dto. They are used to transfer data between the controller and the access layer. They are also used to validate data passed in the body of a request.

## Ids

Ids should be strings, which are UUIDs.

DTO objects should not include the Id. Ids should be separate from the DTO. For example a client DTO should look like the following. All upsert calls should include an id parameter, and all upsert calls should return the id of the created or updated item.

```typescript
export class ClientDto {
  @ApiProperty({ description: 'The name of the client' })
  name: string;
}
```

The Id should be passed in as a parameter to the upsert method.

```typescript
async upsertClient(data: clientDto, id?: string) {
```

If we are returning a single item, we should return the DTO object. Example below would be returning a ClientDTO.

```typescript
return this.clientAccess.findOneClient(id);
```

If we are returning a list of items, we should return a list of DTO objects. Example below would be returning a list of ClientDTOs.

```typescript
return this.clientAccess.queryClients(queryOptions);
```

When returning a list of items we should wrap the DTO object in a QueryResult object.

```typescript
return {
  items: items.map((item) => ({
    item: item,
    id: item.id,
  })),
  total: items.length,
  take: queryOptions.take,
  skip: queryOptions.skip,
};
```

QueryResult is defined in src/common/dto/query.dto.ts.

```typescript
export interface QueryResultItem<T> {
  item: T;
  id: string;
}

export interface QueryResult<T> {
  items: QueryResultItem<T>[];
  total: number;
  take: number;
  skip: number;
}
```

---

<p align="center">
  Powered by <a href="#">Panic Blaster</a> 🚀
</p>
