# RN Better Auth + Bun Experiment

A monorepo example project demonstrating authentication with [Better Auth](https://www.better-auth.com/), [Bun](https://bun.sh/), [Hono](https://hono.dev/), and [Expo](https://expo.dev/) (React Native).

## Project Structure

```
├── apps/
│   ├── server/          # Bun + Hono + Better Auth backend
│   │   ├── src/
│   │   │   ├── index.ts # HTTP server entry point
│   │   │   └── auth.ts  # Better Auth configuration
│   │   └── tests/       # Server tests (bun:test)
│   └── mobile/          # Expo + React Native app
│       ├── app/
│       │   ├── (auth)/  # Sign In & Sign Up screens
│       │   └── (app)/   # Profile screen (authorized)
│       ├── lib/         # Auth client configuration
│       └── __tests__/   # Mobile tests (jest)
└── packages/
    └── shared/          # Shared TypeScript types & constants
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

## Auth Endpoints

All auth endpoints are mounted at `/api/auth/*` via Better Auth:

| Endpoint | Method | Description |
|---|---|---|
| `/api/auth/sign-up/email` | POST | Register with email/password |
| `/api/auth/sign-in/email` | POST | Sign in with email/password |
| `/api/auth/sign-out` | POST | Sign out (invalidate session) |
| `/api/auth/get-session` | GET | Get current session |

Custom endpoints:

| Endpoint | Method | Description |
|---|---|---|
| `/health` | GET | Health check |
| `/api/me` | GET | Get authenticated user (protected) |

## Running Tests

```bash
# All tests
bun run test

# Server only
bun run test:server

# Mobile only
bun run test:mobile
```

## Tech Stack

- **Runtime**: Bun
- **Server**: Hono
- **Auth**: Better Auth (email/password, with Expo plugin)
- **Database**: SQLite (via bun:sqlite) — PostgreSQL migration planned
- **Mobile**: Expo + React Native + Expo Router
- **Testing**: bun:test (server), Jest + React Native Testing Library (mobile)

## License

MIT
