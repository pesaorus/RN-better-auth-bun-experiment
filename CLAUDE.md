# CLAUDE.md

This file provides context for AI assistants working on this codebase.

## Project Overview

Bun workspaces monorepo with a Hono + Better Auth server and an Expo (React Native) mobile app. Authentication uses email/password with SQLite storage via Drizzle ORM.

## Repository Structure

```
apps/server/     - Bun + Hono + Better Auth backend
apps/mobile/     - Expo + React Native + Expo Router mobile app
packages/shared/ - Shared TypeScript types and constants
```

## Tech Stack

- **Runtime**: Bun
- **Server framework**: Hono
- **Auth**: Better Auth (email/password, Expo plugin, delete user)
- **ORM**: Drizzle ORM with bun:sqlite
- **Database**: SQLite (PostgreSQL migration planned)
- **Mobile**: Expo SDK 52, React Native 0.76, Expo Router v4
- **Linter/Formatter**: Biome (no semicolons, 2-space indent, double quotes)
- **Testing**: bun:test (server), Jest + React Native Testing Library (mobile)

## Common Commands

```bash
bun install                # Install all workspace dependencies
bun run dev:server         # Start server with hot reload (port 3000)
bun run dev:mobile         # Start Expo dev server
bun run test:server        # Run server tests (13 tests, bun:test)
bun run test:mobile        # Run mobile tests (jest)
bun run test               # Run all tests
bun run db:migrate         # Run Drizzle migrations
bun run lint               # Check code with Biome
bun run lint:fix           # Auto-fix lint issues
bun run format             # Format code with Biome
```

Server-specific (run from `apps/server/`):
```bash
bunx drizzle-kit generate  # Generate migration from schema changes
bunx drizzle-kit studio    # Open Drizzle Studio GUI
```

## Code Style

Enforced by Biome (`biome.json`):
- **No semicolons** (`"semicolons": "asNeeded"`)
- **2-space indentation** (spaces, not tabs)
- **Double quotes** for strings
- **100 character** line width
- **Recommended lint rules** enabled

Run `bun run lint:fix` before committing.

## Architecture Notes

### Server (`apps/server/`)

- **Entry point**: `src/index.ts` — Hono app with CORS, health check, auth routes, protected endpoints
- **Auth config**: `src/auth.ts` — Better Auth with Drizzle adapter, email/password, Expo plugin
- **Database**: `src/db/index.ts` — Drizzle + bun:sqlite connection. Path configurable via `DATABASE_PATH` env var (defaults to `sqlite.db`)
- **Schema**: `src/db/schema.ts` — 4 tables: `user`, `session`, `account`, `verification`
- **Migrations**: `src/db/migrate.ts` — Programmatic runner, also used in tests. SQL files in `drizzle/`
- **Tests**: `tests/auth.test.ts` — Uses temporary SQLite DB, runs migrations in `beforeAll`

### Auth endpoints

Better Auth handles `/api/auth/**` automatically. Custom endpoints:
- `GET /health` — health check
- `GET /api/me` — returns authenticated user + session (protected)
- `POST /api/delete-account` — deletes account with password confirmation (protected)

### Mobile (`apps/mobile/`)

- Uses Expo Router with file-based routing
- `(auth)/` group: sign-in, sign-up screens (unauthenticated)
- `(app)/` group: profile screen (authenticated, with sign-out + delete account)
- Auth guard in `_layout.tsx` redirects based on session state
- `lib/auth-client.ts` — Better Auth client with `expoClient` plugin and `expo-secure-store`
- `babel.config.js` has module resolver aliases for better-auth imports
- `metro.config.js` enables `unstable_enablePackageExports` for monorepo support

### Shared (`packages/shared/`)

- TypeScript interfaces: `User`, `Session`, `ApiError`, `EmailPasswordCredentials`, `SignUpPayload`
- Constants: `AUTH_API_PATH` (`/api/auth`), `DEFAULT_SERVER_PORT` (`3000`)

## Dependencies

All dependencies are pinned to exact versions (no `^` or `~`). The `bunfig.toml` enforces `exact = true` so `bun add` always pins.

## Database

- SQLite via `bun:sqlite`, Drizzle ORM as query layer
- Tables: `user`, `session`, `account` (stores password hashes), `verification`
- Foreign keys cascade on delete from `user`
- Indexes: `session_user_id_idx`, `account_user_id_idx`, `account_provider_idx` (unique)
- Run `bun run db:migrate` after cloning or pulling migration changes
- To modify schema: edit `src/db/schema.ts`, then run `bunx drizzle-kit generate` from `apps/server/`

## Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable | Required | Default | Description |
|---|---|---|---|
| `BETTER_AUTH_SECRET` | Yes | — | Auth secret (min 32 chars). Generate with `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | Yes | — | Server URL (e.g. `http://localhost:3000`) |
| `PORT` | No | `3000` | Server port |
| `DATABASE_PATH` | No | `sqlite.db` | Path to SQLite database file |
| `EXPO_PUBLIC_SERVER_URL` | No | `http://localhost:3000` | Server URL for the mobile app |

## Known Limitations

- Better Auth CLI (`@better-auth/cli`) cannot resolve `bun:sqlite` (uses jiti/Node internally). Schema was written manually for Drizzle.
- Mobile tests run via `jest` (not `bun:test`) because of React Native/Expo toolchain requirements.
- Drizzle migration SQL files require `--> statement-breakpoint` between each statement for SQLite.
