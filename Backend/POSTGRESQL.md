# PostgreSql

## Database Creation

```bash
createdb panicblaster_qa
```

```bash
createuser -P panicblaster_qa
```

```bash
createdb -O panicblaster_qa panicblaster_qa
```

## Connect to the database from terminal

```bash
psql -U username -d database -h hostname -p port
```

As an example:

```bash
psql -U panicblaster_qa -d panicblaster_qa -h localhost -p 5432
```

Root level access

```bash
psql -U postgres -d postgres -h localhost -p 5432
```

## Postgresql basic commands

list all databases

```sql
SELECT datname FROM pg_database;
```

list all users

```sql
SELECT usename FROM pg_user;
```

## Postgresql Create database and user with password

```sql
CREATE DATABASE panicblaster_qa;
CREATE USER panicblaster_qa WITH PASSWORD 'Hello42';
GRANT ALL PRIVILEGES ON DATABASE panicblaster_qa TO panicblaster_qa;
```

## Common commands

Select all tables

```sql
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
```
