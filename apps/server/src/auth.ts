import { AUTH_API_PATH } from "@app/shared"
import { expo } from "@better-auth/expo"
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { db } from "./db"
import * as schema from "./db/schema"

export const auth = betterAuth({
  basePath: AUTH_API_PATH,
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema: {
      ...schema,
    },
  }),
  trustedOrigins: ["myapp://"],
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    autoSignIn: true,
  },
  user: {
    deleteUser: {
      enabled: true,
    },
  },
  plugins: [expo()],
})
