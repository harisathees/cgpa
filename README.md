# CGPA

Full-stack monorepo:

| Part        | Stack                                                        |
| ----------- | ----------------------------------------------------------- |
| `frontend/` | Next.js 16 (App Router) · TypeScript · Tailwind CSS v4       |
| `backend/`  | NestJS 11 · Prisma 7 (MySQL) · JWT auth (Passport + bcrypt)  |

Authentication is self-contained (email/password → JWT). The database is MySQL,
accessed through Prisma using the MariaDB driver adapter.

## Prerequisites

- Node.js 20+
- A MySQL 8 database

## Backend (`backend/`)

```bash
cd backend
cp .env.example .env          # then edit DATABASE_URL and JWT_SECRET
npm install                   # runs `prisma generate` via postinstall
npm run prisma:deploy         # apply migrations to your database
npm run start:dev             # http://localhost:3001/api
```

### Environment (`backend/.env`)

| Var               | Description                                            |
| ----------------- | ------------------------------------------------------ |
| `DATABASE_URL`    | `mysql://USER:PASSWORD@HOST:3306/cgpa`                  |
| `JWT_SECRET`      | Secret used to sign JWTs (`openssl rand -hex 32`)       |
| `JWT_EXPIRES_IN`  | Token lifetime, e.g. `7d`                               |
| `PORT`            | API port (default `3001`)                               |
| `FRONTEND_URL`    | Allowed CORS origin (default `http://localhost:3000`)   |

### API

| Method | Route            | Auth   | Description                       |
| ------ | ---------------- | ------ | --------------------------------- |
| GET    | `/api/health`    | —      | Health check                      |
| POST   | `/api/auth/register` | —  | Create account → `{ accessToken, user }` |
| POST   | `/api/auth/login`    | —  | Log in → `{ accessToken, user }`  |
| GET    | `/api/auth/me`   | Bearer | Current user                      |
| GET    | `/api/semesters` | Bearer | Caller's semesters (+ courses)    |
| POST   | `/api/semesters` | Bearer | Create a semester                 |

### Prisma / migrations

The schema lives in `backend/prisma/schema.prisma`; migrations in
`backend/prisma/migrations/`. Prisma 7 config is in `backend/prisma.config.ts`.

```bash
npm run prisma:migrate    # create + apply a new migration in dev
npm run prisma:deploy     # apply existing migrations (CI / prod)
npm run prisma:generate   # regenerate the client (output: src/generated/prisma)
npm run prisma:studio     # browse data
```

The initial migration (`0_init`) creates the `users`, `semesters`, and
`courses` tables.

## Frontend (`frontend/`)

```bash
cd frontend
cp .env.local.example .env.local   # set NEXT_PUBLIC_API_URL
npm install
npm run dev                        # http://localhost:3000
```

`src/lib/api.ts` is a small fetch wrapper that calls the backend and attaches the
JWT as a Bearer token for protected routes.
