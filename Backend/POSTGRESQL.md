# PostgreSql

## Database Creation

```bash
createdb myapp
```

```bash
createuser -P myapp
```
```

```bash
createdb -O myapp myapp
```

## Connect to the database from terminal

```bash
psql -U username -d database -h hostname -p port
```

As an example:

```bash
psql -U myapp -d myapp -h localhost -p 5432
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
CREATE DATABASE myapp;
CREATE USER myapp WITH PASSWORD 'APassword';
GRANT ALL PRIVILEGES ON DATABASE myapp TO myapp;
```

## Common commands

Select all tables

```sql
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
```
