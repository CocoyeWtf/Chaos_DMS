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

| Path                  | Description                       |
| --------------------- | --------------------------------- |
| `apps/api`            | NestJS backend API                |
| `apps/web`            | Next.js web frontend              |
| `apps/mobile`         | Expo React Native mobile app      |
| `packages/types`      | Shared TypeScript types and DTOs  |
| `packages/validators` | Shared Zod validation schemas     |
| `packages/ui`         | Shared design system components   |
| `packages/api-client` | Typed API client with React Query |
| `packages/utils`      | Shared utility functions          |
| `infrastructure/`     | Docker, K8s, Terraform configs    |
