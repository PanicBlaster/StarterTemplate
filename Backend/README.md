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

```
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
├── access/                 # Data access layer
│   ├── entities/          # Database entities
│   │   ├── tenant.entity.ts
│   │   ├── project.entity.ts
│   │   ├── environment.entity.ts
│   │   ├── user.entity.ts
│   │   ├── pull-request.entity.ts
│   │   └── system-settings.entity.ts
│   └── services/          # Data access services
│       ├── tenant-access.service.ts
│       ├── project-access.service.ts
│       ├── user-access.service.ts
│       └── system-settings-access.service.ts
├── manager/               # API Controllers layer
│   ├── account.controller.ts
│   ├── tenant.controller.ts
│   ├── project.controller.ts
│   └── system-settings.controller.ts
├── common/               # Shared code
│   └── dto/             # Data Transfer Objects
│       └── pagination.dto.ts
└── config/              # Configuration
    └── database.config.ts
```

### Architecture Overview

The project follows a layered architecture:

1. **Access Layer** (`src/access/`)

   - Handles data persistence and business logic
   - Contains database entities and their relationships
   - Provides services for CRUD operations
   - Implements business rules and validations

2. **Manager Layer** (`src/manager/`)

   - Implemented as controller. AccountManager is created as AccountController in src/manager/account.controller.ts
   - Handles HTTP requests and responses
   - Implements REST API endpoints
   - Provides Swagger documentation
   - Handles input validation and error responses

3. **Common Layer** (`src/common/`)
   - Contains shared code and utilities
   - Defines common DTOs and interfaces
   - Implements cross-cutting concerns

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

## Tenant and headers

Tenant Id can be passed in the header or in the body. If it is passed in the body, it must match the tenant id in the header.

If we are in a findAll type call, we should see if the tenantId is passed in the header and if it is, we should add it to the query.

FindAll example:

```
  @Get()
  @ApiOperation({ summary: 'Get all clients' })
  async findAll(
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

    return this.clientAccess.findAll({
      ...query,
      where: {
        ...(query.where || {}),
        ...(tenantId && { tenantId }),
      },
    });
  }
```

If we are implementing a findOne type call, we should see if the tenantId is passed in the header and if it is, we should add it to the query.

FindOne example:

```
  @Get(':id')
  @ApiOperation({ summary: 'Get a client by id' })
  async findOne(
    @Headers('X-Tenant-ID') tenantId: string,
    @Param('id') id: string
  ) {
    this.validateTenantId(tenantId);

    const client = await this.clientAccess.find(id);
    if (client.tenantId !== tenantId) {
      throw new NotFoundException('Client not found');
    }
    return client;
  }
```

If we are implementing a create type call, we should see if the tenantId is passed in the header and if it is, we should add it to the body.

Create example:

```
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
  return this.clientAccess.upsert(data);
}
```

If we are implementing an update type call, we should see if the tenantId is passed in the header and if it is, we should add it to the body.

Update example:

```
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

    const client = await this.clientAccess.find(id);
    if (client.tenantId !== tenantId) {
      throw new NotFoundException('Client not found');
    }

    return this.clientAccess.upsert(data, id);
  }
```

## Data Access example

Upsert example:

```
  async upsert(data: CreateClientDto | UpdateClientDto, id?: string) {
    if (id) {
      await this.find(id); // Verify exists
    }

    if (data.tenantId) {
      await this.tenantAccess.find(data.tenantId); // Verify tenant exists
    }

    const client = id
      ? await this.clientRepository.preload({ id, ...data })
      : this.clientRepository.create(data);

    return this.clientRepository.save(client);
  }
```

## Backend Hosting as Service (LiteNode)

Backend is run as a service on the VM. Backend node confiruration will be handled by the hosting-node-access service.

Template for the service is in VM_SETUP.md, also provided here. These files are located at /etc/systemd/system/. Example below would be for the host_cattle_qa service. /etc/systemd/system/host_cattle_qa.service

```
[Unit]
Description=host cattle qa
After=network.target

[Service]
# The user and group under which the service will run
User=cattle_qa
Group=cattle_qa

# Specify the working directory where your NestJS app resides
WorkingDirectory=/home/cattle_qa/Backend

# Command to run the NestJS app with nodemon
ExecStart=nodemon main.js
EnvironmentFile=/etc/systemd/system/cattle_qa.env

# Restart the service if it crashes
Restart=always

# Allow the process to write to the log file
StandardOutput=append:/home/cattle_qa/logs/host_cattle_qa.log
StandardError=append:/home/cattle_qa/logs/host_cattle_qa_error.log

# Optional: Increase the timeout if your app needs more time to start
TimeoutSec=300

[Install]
WantedBy=multi-user.target
```

Each service will have an environment file. The environment file will be located at /etc/systemd/system/project_environment.env. Sample contents of that file are below.

```
NODE_ENV=production
PORT=3015
DB_USERNAME=cattle_qa
DB_PASSWORD=ABCD1234
DB_NAME=cattle_qa
```

## Backend Hosting as Docker (DockerNode)

---

<p align="center">
  Powered by <a href="#">Panic Blaster</a> 🚀
</p>
