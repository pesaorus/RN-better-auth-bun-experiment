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

## Fastlane (App Store & Google Play)

Fastlane is set up in `apps/mobile/fastlane/` for releasing to both stores. All secrets are loaded from the root `.env` file.

### Prerequisites

- Ruby >= 2.7
- Bundler (`gem install bundler`)
- Xcode (for iOS builds)
- Android SDK + JDK (for Android builds)

### Setup

```bash
cd apps/mobile
bundle install      # Install Fastlane + dotenv
```

Fill in the Fastlane variables in your `.env` (see `.env.example` for the full list).

### iOS

```bash
bun run release:ios:beta    # Build + upload to TestFlight
bun run release:ios         # Build + upload to App Store
```

### Android

```bash
bun run release:android:beta  # Build AAB + upload to internal track
bun run release:android       # Build AAB + upload to production
```

### Version Bumping

```bash
bun run release:bump -- version:1.1.0 build:2
```

This updates `app.json` so `expo prebuild` picks up the new version.

### Release Workflow

```bash
# 1. Bump version (every upload needs a unique build number)
bun run release:bump -- version:1.1.0 build:5

# 2. Commit the version change
git add apps/mobile/app.json && git commit -m "Bump to 1.1.0 (build 5)"

# 3. Build & upload to beta testing
bun run release:ios:beta
bun run release:android:beta

# 4. Test on real devices via TestFlight / Google Play internal track
# ...

# 5. Promote to production
bun run release:ios
bun run release:android
```

**When to bump:**
- Bump the **build number** before every upload (both stores reject duplicate build numbers)
- Bump the **version** (`1.0.0` → `1.1.0`) when you want users to see a new version in the store
- Bump only the **build** when re-uploading a fix for the same version

> You can also run lanes directly from `apps/mobile/` via `bundle exec fastlane <lane>`.

## Tech Stack

- **Runtime**: Bun
- **Server**: Hono
- **Auth**: Better Auth (email/password, with Expo plugin)
- **Database**: SQLite (via bun:sqlite) — PostgreSQL migration planned
- **Mobile**: Expo + React Native + Expo Router
- **CD**: Fastlane (App Store + Google Play)
- **Testing**: bun:test (server), Jest + React Native Testing Library (mobile)

## License

MIT
