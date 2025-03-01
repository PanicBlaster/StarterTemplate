# Multi-Tenant Solution

This solution can be converted into a multi-tenant solution by adding a `tenant_id` column to the `users` table and adding a `tenant_id` column to the all other tables. Basically making all tables multi-tenant.

## Changes to enable multi-tenancy

1. Add a tenant entity. This entity will be used to manage the tenants.
2. Add a tenant_access service. This service will be used to manage the tenant access.
3. Add a `tenant_id` column to the `users` table.
4. Add a `tenant_id` column to the other tables
