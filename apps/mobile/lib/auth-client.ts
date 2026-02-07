import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";
import { DEFAULT_SERVER_PORT, AUTH_API_PATH } from "@app/shared";

const SERVER_URL =
  process.env.EXPO_PUBLIC_SERVER_URL ||
  `http://localhost:${DEFAULT_SERVER_PORT}`;

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
});

export const { useSession, signIn, signUp, signOut } = authClient;
