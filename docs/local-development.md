# Local Development Setup

## Prerequisites

### Required
- Node.js 18+
- npm
- PostgreSQL 14+ (for database)

### Optional
- Docker (for running PostgreSQL in a container)

## Database Setup

### Option 1: Docker PostgreSQL (Recommended)

```bash
# Run PostgreSQL in Docker
docker run --name screens-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=screens_dev \
  -p 5432:5432 \
  -d postgres:16-alpine

# Create test database
docker exec screens-postgres psql -U postgres -c "CREATE DATABASE screens_test;"
```

### Option 2: Local PostgreSQL Installation

1. Install PostgreSQL for your OS
2. Create development and test databases:

```bash
psql -U postgres -c "CREATE DATABASE screens_dev;"
psql -U postgres -c "CREATE DATABASE screens_test;"
```

## Environment Setup

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Update `.env` with your database URLs:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/screens_dev"
NODE_ENV="development"
```

3. For tests, optionally set:
```
DATABASE_URL_TEST="postgresql://postgres:postgres@localhost:5432/screens_test"
```

## Database Migrations

Run initial migration to create tables:

```bash
npx prisma migrate dev --name init
```

This will:
- Create the database schema
- Generate Prisma Client
- Apply migrations

## Running the Application

```bash
# Install dependencies
npm install

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

## Running Tests

```bash
# Unit tests
npm run test

# Integration tests (requires database)
npm run test -- tests/integration

# E2E tests
npm run test:e2e

# All tests with coverage
npm run test:coverage
```

## Useful Commands

```bash
# Open Prisma Studio (database GUI)
npx prisma studio

# Reset database
npx prisma migrate reset

# Generate Prisma Client after schema changes
npx prisma generate

# Format Prisma schema
npx prisma format
```

## Troubleshooting

### Database connection errors
- Ensure PostgreSQL is running: `docker ps` or `pg_isready`
- Check DATABASE_URL in `.env` is correct
- Verify database exists: `psql -U postgres -l`

### Migration errors
- Reset database: `npx prisma migrate reset`
- Delete `prisma/migrations` folder and re-run `npx prisma migrate dev`

### Port conflicts
- Next.js default port is 3000, but it will auto-select another if taken
- PostgreSQL default port is 5432
