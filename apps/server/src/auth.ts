import { betterAuth } from "better-auth";
import { expo } from "@better-auth/expo";
import { Database } from "bun:sqlite";
import { AUTH_API_PATH } from "@app/shared";

const dbPath = process.env.DATABASE_PATH || "sqlite.db";

export const auth = betterAuth({
  basePath: AUTH_API_PATH,
  database: new Database(dbPath),
  trustedOrigins: ["myapp://"],
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    autoSignIn: true,
  },
  plugins: [expo()],
});
