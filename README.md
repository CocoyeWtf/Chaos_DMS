# Chaos DMS

Daily Management System - Collection Chaos Manager

## Prerequisites

- Node.js >= 22.0.0
- pnpm >= 10.0.0

## Getting Started

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run all linters
pnpm lint

# Type-check all packages
pnpm typecheck

# Format code
pnpm format
```

## Project Structure

| Path                  | Description                        |
| --------------------- | ---------------------------------- |
| `apps/api`            | NestJS backend API                 |
| `apps/web`            | Next.js web frontend               |
| `apps/mobile`         | Expo React Native mobile app       |
| `packages/database`   | Drizzle ORM schemas and migrations |
| `packages/types`      | Shared TypeScript types and DTOs   |
| `packages/validators` | Shared Zod validation schemas      |
| `packages/ui`         | Shared design system components    |
| `packages/api-client` | Typed API client with React Query  |
| `packages/utils`      | Shared utility functions           |
| `infrastructure/`     | Docker, K8s, Terraform configs     |

## Database

### Prerequisites

- Docker and Docker Compose

### Local Development

```bash
# Start PostgreSQL 16 + Redis 7
pnpm db:up

# Run all migrations (public + tenant schemas)
cd packages/database && pnpm db:migrate

# Seed demo data
cd packages/database && pnpm db:seed

# Open Drizzle Studio (schema browser)
cd packages/database && pnpm db:studio

# Stop containers
pnpm db:down

# Reset (destroy data + restart)
pnpm db:reset
```
