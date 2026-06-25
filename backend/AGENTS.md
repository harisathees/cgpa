# AGENTS.md

This file provides guidance to AI agents when working with code in this backend repository.

## Project Overview

**Backend** is the server API for the CGPA platform. It is a NestJS 11 application (TypeScript strict mode) that exposes endpoints for the frontend. It uses Prisma as its ORM and connects to a MariaDB relational database. This repo (`backend`) is the standalone backend project.

## Commands

```bash
npm install                          # Install dependencies
npm run start:dev                    # Dev server with watch mode
npm run start:debug                  # Dev server with debugger
npm run build                        # Production build
npm run lint                         # ESLint on source code
npm test                             # Jest unit tests
npm run test:e2e                     # Jest E2E tests
npm run prisma:generate              # Generate Prisma client
npm run prisma:migrate               # Apply migrations to development DB
npm run prisma:studio                # Open Prisma Studio to view DB
```

Run a single unit test:
```bash
npx jest src/my-module/my-file.spec.ts
```

## Architecture

### Tech Stack

- **NestJS 11** (Node.js framework), **TypeScript 5**
- **Database ORM**: Prisma 7.8
- **Database**: MariaDB
- **Authentication**: Passport.js & JWT, bcrypt for hashing
- **Validation**: class-validator & class-transformer

### API Layer & Module Structure

The backend follows the standard NestJS modular architecture:
- **Controllers** (`*.controller.ts`): Handle incoming HTTP requests and route them to services.
- **Services** (`*.service.ts`): Contain the core business logic.
- **Modules** (`*.module.ts`): Bundle controllers and services together.
- **DTOs** (`*.dto.ts`): Define the shape of incoming requests using `class-validator`.

### Prisma Database Integration

- The database schema is defined in `prisma/schema.prisma`.
- Whenever the schema is updated, you must run `npm run prisma:migrate` to create a migration and `npm run prisma:generate` to update the typed Prisma client.
- Database access should be handled through a dedicated PrismaService injected into feature services.

## Testing

### Unit Tests (Jest)

- Config is inside `package.json` under the `"jest"` key.
- Tests follow the `*.spec.ts` naming convention and reside alongside the source files.

### E2E Tests

- Config: `test/jest-e2e.json`
- Tests live in the `test/` directory and spin up the NestJS application context with Supertest.

## Environment Variables

See `.env.example` for the required keys. Important variables:
```env
DATABASE_URL="mysql://user:password@localhost:3306/db_name"   # Prisma connection string
```

## Post-Change Verification Workflow

After every meaningful code change, follow this workflow before completing your task:

1. **Update Tests** — Check if new or modified logic requires new unit or E2E tests.
2. **Run lint** — `npm run lint` to verify no linting errors or warnings. Fix all issues before proceeding.
3. **Run tests** — `npm test` to verify all unit tests pass.
4. **Run build** — `npm run build` to verify there are no compilation errors.
5. **Update Prisma Schema** — If you made database schema changes, make sure migrations are tracked and the client is regenerated.

## Gotchas

- **Dependency Injection**: Always remember to provide and export new services/repositories in the corresponding module.
- **DTO Validation**: Ensure `ValidationPipe` is enabled globally or locally when adding new DTOs with `class-validator` decorators.
