/** Shared user type matching Better Auth's user schema */
export interface User {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** Shared session type matching Better Auth's session schema */
export interface Session {
  id: string;
  userId: string;
  expiresAt: Date;
  token: string;
  createdAt: Date;
  updatedAt: Date;
}

/** Standard API error shape */
export interface ApiError {
  message: string;
  status: number;
}

/** Auth credentials for email/password */
export interface EmailPasswordCredentials {
  email: string;
  password: string;
}

/** Sign-up payload */
export interface SignUpPayload extends EmailPasswordCredentials {
  name: string;
}

/** Server configuration constants */
export const AUTH_API_PATH = "/api/auth";
export const DEFAULT_SERVER_PORT = 3000;
