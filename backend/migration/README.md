# Database Migration Service

This service manages all database schema migrations for the Transcendence project.

## Overview

- **Purpose**: Centralized migration management for shared PostgreSQL database
- **Entities**: Imports all entities from `@transcendence/db-entities`
- **Tables Managed**: `users`, `api_keys`, `games`, `game_players`
- **Execution**: Runs automatically on container startup before backend services start

## Prerequisites

Before running migrations, ensure db-entities are built and distributed:

```bash
# From repository root
make pack-deps
```

This builds `common/db-entities` and copies the dist to `backend/migration/db-entities-dist/`.

## Migration Workflow

### 1. Modify Entity

Edit entity in `common/db-entities/src/`:

```typescript
// common/db-entities/src/users/user.entity.ts
@Column({ nullable: true })
displayName: string;  // New field
```

### 2. Build and Pack Entities

```bash
# From repository root
make pack-deps
```

### 3. Generate Migration

```bash
cd backend/migration

# Install dependencies if needed
npm install

# Generate migration from entity changes
npm run migration:generate migrations/AddUserDisplayName
```

This creates: `migrations/1708000000000-AddUserDisplayName.ts`

### 4. Review Migration

```typescript
import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserDisplayName1708000000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "displayName" varchar`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "displayName"`);
    }
}
```
Apply Migration

**Automatic (Recommended):**
```bash
# From repository root
make restart

# Migrations run automatically when containers start
# Migration service runs first, then backend services start
```

**Manual (for testing):**
```bash
# From repository root (with Docker)
docker compose -f docker-compose.dev.yml run --rm migration npm run migration:run
Check migration container logs
docker compose logs migration-dev

# Should show: Migration XYZ has been executed successfully

# Show migration status (manual check)
docker compose -f docker-compose.dev.yml run --rm migration npm run migration:show

# Shows:
# [X] InitialSchema1771262275143
# [X] AddUserDisplayName1771268
```

### 6. Verify Migration

```bash
# Show migration status (usually automatic via Docker)
npm run migration:run

# Revert last migration
npm run migration:revert

# Show migration status
npm run migration:show
```

## Automatic Execution

The migration service is configured to run automatically in Docker Compose:

**Startup Sequence:**
1. `db` service starts and becomes healthy
2. `migration` service runs migrations and exits (service_completed_successfully)
3. Backend services (`core`, `auth`, `game`) start only after migrations complete
4. Application is ready with up-to-date schema

**Development Workflow:**
```bash
# After generating new migration, simply restart:
make restart

# Or rebuild everything:
make dev-build
```

No manual `make dev-migrate` command needed!
```bash
# Generate migration from entity changes
npm run migration:generate migrations/MigrationName

# Create empty migration template
npm run migration:create migrations/MigrationName

# Run pending migrations
npm run migration:run

# Revert last migration
npm run migration:revert

# Show migration status
npm run migration:show
```

## Migration Best Practices

### ✅ DO

- Always generate migrations after entity changes
- Review generated SQL before running
- Test migrations in both directions (up/down)
- Keep migrations small and focused
- Commit migrations with entity changes
- Run migrations before deploying

### ❌ DON'T

- Never edit existing migrations that have run in production
- Never use `synchronize: true` in production
- Don't skip migrations in version control
- Don't modify entities without creating migration
- Don't delete migration files

## Directory Structure

```
backend/migration/
├── data-source.ts          # TypeORM DataSource config
├── package.json            # Migration scripts
├── tsconfig.json           # TypeScript config
├── db-entities-dist/       # Distributed entities (from pack-deps)
├── migrations/             # Migration files
│   └── TIMESTAMP-Name.ts
└── init/                   # Initial SQL bootstrap (runs once)
    └── schema/
        └── 00-schema.sql
```

## Troubleshooting

### Migration Generation Produces Empty File

**Cause**: Entity changes not detected or entities not built

**Solution**:
```bash
make pack-deps  # Rebuild and distribute entities
cd backend/migration
rm -rf db-entities-dist node_modules
npm install
npm run migration:generate migrations/Name
```

### Migration Fails to Run

**Cause**: Database connection issue or migration already applied

**Solution**:
```bash
# Check database status
docker compose ps db

# Check migration table
docker compose exec db psql -U transcendence -d transcendence -c "SELECT * FROM migrations;"

# Check migration status
cd backend/migration
npm run migration:show
```

### TypeORM Can't Find Entities

**Cause**: Path mapping issue in tsconfig.json

**Solution**: Verify `db-entities-dist/` exists and contains entity files:
```bash
ls -la backend/migration/db-entities-dist/
# Should show: index.js, index.d.ts, auth/, game/, users/
```

## Integration with Services

All backend services connect to the same database but only **migration service** runs migrations:

- **backend/core**: Uses `User` entity, reads/writes data
- **backend/auth**: Uses `ApiKey` entity, reads/writes data
- **backend/game**: Uses `Game`, `GamePlayer` entities, reads/writes data
- **backend/migration**: Uses ALL entities, **manages schema only**

## CI/CD Integration

```yaml
# Example GitHub Actions workflow
- name: Install dependencies
  run: make dev-ci

- name: Run migrations
  run: make dev-migrate

- name: Run tests
  run: npm test
```

## Related Documentation

- [Copilot Instructions](../../.github/copilot-instructions.md) - Full project architecture
- [Database Schema](https://drawsql.app/teams/ilias-team-10/diagrams/transcendence-db) - Visual schema
- [TypeORM Migrations](https://typeorm.io/migrations) - Official docs
