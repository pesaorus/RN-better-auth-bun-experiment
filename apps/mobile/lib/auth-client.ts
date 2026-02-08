import { AUTH_API_PATH, DEFAULT_SERVER_PORT } from "@app/shared"
import { expoClient } from "@better-auth/expo/client"
import { createAuthClient } from "better-auth/react"
import * as SecureStore from "expo-secure-store"

const SERVER_URL = process.env.EXPO_PUBLIC_SERVER_URL || `http://localhost:${DEFAULT_SERVER_PORT}`

export const authClient = createAuthClient({
  baseURL: SERVER_URL,
  basePath: AUTH_API_PATH,
  plugins: [
    expoClient({
      scheme: "myapp",
      storagePrefix: "myapp",
      storage: SecureStore,
    }),
  ],
})

export const { useSession, signIn, signUp, signOut, deleteUser } = authClient
