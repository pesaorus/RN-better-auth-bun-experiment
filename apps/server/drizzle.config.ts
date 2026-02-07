export default {
	dialect: "sqlite",
	schema: "./src/db/schema.ts",
	out: "./drizzle",
	dbCredentials: {
		url: process.env.DATABASE_PATH || "sqlite.db",
	},
} satisfies import("drizzle-kit").Config
