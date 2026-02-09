# RN Better Auth + Bun Experiment

A monorepo example project demonstrating authentication with [Better Auth](https://www.better-auth.com/), [Bun](https://bun.sh/), [Hono](https://hono.dev/), [Drizzle ORM](https://orm.drizzle.team/), and [Expo](https://expo.dev/) (React Native).

## Project Structure

```
├── apps/
│   ├── server/              # Bun + Hono + Better Auth backend
│   │   ├── src/
│   │   │   ├── index.ts     # HTTP server entry point
│   │   │   ├── auth.ts      # Better Auth configuration
│   │   │   └── db/
│   │   │       ├── index.ts  # Drizzle database connection
│   │   │       ├── schema.ts # Drizzle table definitions
│   │   │       └── migrate.ts# Programmatic migration runner
│   │   ├── drizzle/          # SQL migration files
│   │   ├── drizzle.config.ts # Drizzle Kit configuration
│   │   └── tests/            # Server tests (bun:test)
│   └── mobile/              # Expo + React Native app
│       ├── app/
│       │   ├── _layout.tsx  # Root layout with auth guard
│       │   ├── (auth)/      # Sign In & Sign Up screens
│       │   └── (app)/       # Profile screen (authorized)
│       ├── lib/             # Auth client configuration
│       └── __tests__/       # Mobile tests (jest)
└── packages/
    └── shared/              # Shared TypeScript types & constants
```

## Prerequisites

- [Bun](https://bun.sh/) >= 1.0
- Node.js >= 18 (for Expo CLI)
- iOS Simulator / Android Emulator / Expo Go

## Getting Started

### 1. Install dependencies

```bash
bun install
```

### 2. Set up environment

```bash
cp .env.example .env
# Edit .env and set BETTER_AUTH_SECRET (use: openssl rand -base64 32)
```

### 3. Run database migrations

```bash
bun run db:migrate
```

This creates the SQLite database and runs all Drizzle migrations (user, session, account, verification tables).

### 4. Start the server

```bash
bun run dev:server
```

Server runs on `http://localhost:3000` by default.

### 5. Start the mobile app

In a separate terminal:

```bash
bun run dev:mobile
```

## API Endpoints

### Better Auth (mounted at `/api/auth/*`)

| Endpoint | Method | Description |
|---|---|---|
| `/api/auth/sign-up/email` | POST | Register with email/password |
| `/api/auth/sign-in/email` | POST | Sign in with email/password |
| `/api/auth/sign-out` | POST | Sign out (invalidate session) |
| `/api/auth/get-session` | GET | Get current session |

### Custom Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/health` | GET | Health check |
| `/api/me` | GET | Get authenticated user + session (protected) |
| `/api/delete-account` | POST | Delete user account with password confirmation (protected) |

## Database

Uses **SQLite** (via `bun:sqlite`) with **Drizzle ORM** as the query layer and schema manager. PostgreSQL migration is planned.

### Tables

| Table | Description |
|---|---|
| `user` | User profiles (id, name, email, image, timestamps) |
| `session` | Active sessions (token, expiry, userId FK) |
| `account` | Auth providers & password hashes (userId FK, providerId, accountId) |
| `verification` | Email verification tokens |

### Indexes

- `session_user_id_idx` on `session.userId`
- `account_user_id_idx` on `account.userId`
- `account_provider_idx` (unique) on `account.providerId + account.accountId`

### Database Commands

```bash
bun run db:migrate              # Run migrations
bun run --filter @app/server db:generate  # Generate new migration from schema changes
bun run --filter @app/server db:studio    # Open Drizzle Studio
```

## Running Tests

```bash
# All tests (server + mobile)
bun run test

# Server only (13 tests: health, sign-up, sign-in, sign-out, delete account, protected routes)
bun run test:server

# Mobile only (6 tests: profile screen rendering, sign-out, delete account flow)
bun run test:mobile
```

## Available Scripts

| Script | Description |
|---|---|
| `bun run dev:server` | Start server with hot reload |
| `bun run dev:mobile` | Start Expo dev server |
| `bun run test` | Run all tests |
| `bun run test:server` | Run server tests (bun:test) |
| `bun run test:mobile` | Run mobile tests (jest) |
| `bun run db:migrate` | Run Drizzle migrations |
| `bun run lint` | Check code with Biome |
| `bun run lint:fix` | Fix lint issues with Biome |
| `bun run format` | Format code with Biome |

## Tech Stack

- **Runtime**: [Bun](https://bun.sh/)
- **Server**: [Hono](https://hono.dev/)
- **Auth**: [Better Auth](https://www.better-auth.com/) (email/password, Expo plugin, delete user)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/) with `bun:sqlite`
- **Database**: SQLite (PostgreSQL migration planned)
- **Mobile**: [Expo](https://expo.dev/) + React Native + [Expo Router](https://docs.expo.dev/router/introduction/)
- **Linting/Formatting**: [Biome](https://biomejs.dev/) (no semicolons, tabs, double quotes)
- **Testing**: bun:test (server), Jest + React Native Testing Library (mobile)

## License

MIT
