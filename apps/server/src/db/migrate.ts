import { Database } from "bun:sqlite"
import { join } from "node:path"
import { drizzle } from "drizzle-orm/bun-sqlite"
import { migrate } from "drizzle-orm/bun-sqlite/migrator"

const dbPath = process.env.DATABASE_PATH || "sqlite.db"
const migrationsFolder = join(import.meta.dir, "../../drizzle")

export function runMigrations(databasePath?: string) {
  const sqlite = new Database(databasePath || dbPath)
  const db = drizzle({ client: sqlite })
  migrate(db, { migrationsFolder })
  sqlite.close()
}

// Run directly: bun run src/db/migrate.ts
if (import.meta.main) {
  console.log(`Running migrations on ${dbPath}...`)
  runMigrations()
  console.log("Migrations complete.")
}
