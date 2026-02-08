import { afterAll, beforeAll, describe, expect, it } from "bun:test"
import { unlinkSync } from "node:fs"
import { join } from "node:path"
import { AUTH_API_PATH } from "@app/shared"

const TEST_PORT = 3001
const BASE = `http://localhost:${TEST_PORT}`
const AUTH_BASE = `${BASE}${AUTH_API_PATH}`
const TEST_DB = join(import.meta.dir, "test.db")

let server: { stop: () => void }

beforeAll(async () => {
	// Clean up any leftover test DB
	try {
		unlinkSync(TEST_DB)
	} catch {}

	// Set env before any imports of the server/auth modules
	process.env.PORT = String(TEST_PORT)
	process.env.BETTER_AUTH_SECRET = "test-secret-that-is-at-least-32-characters-long"
	process.env.BETTER_AUTH_URL = BASE
	process.env.DATABASE_PATH = TEST_DB

	// Run Drizzle migrations programmatically
	const { runMigrations } = await import("../src/db/migrate")
	runMigrations(TEST_DB)

	// Start the server
	const app = await import("../src/index")
	server = Bun.serve({
		port: TEST_PORT,
		fetch: app.default.fetch,
	})
})

afterAll(() => {
	server?.stop()
	// Clean up test DB
	try {
		unlinkSync(TEST_DB)
	} catch {}
})

describe("Health check", () => {
	it("GET /health returns ok", async () => {
		const res = await fetch(`${BASE}/health`)
		expect(res.status).toBe(200)
		const body = await res.json()
		expect(body).toEqual({ status: "ok" })
	})
})

describe("Auth: Sign Up", () => {
	it("creates a new user with email/password", async () => {
		const res = await fetch(`${AUTH_BASE}/sign-up/email`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				name: "Test User",
				email: "test@example.com",
				password: "password1234",
			}),
		})
		expect(res.status).toBe(200)
		const body = await res.json()
		expect(body.user).toBeDefined()
		expect(body.user.email).toBe("test@example.com")
		expect(body.user.name).toBe("Test User")
	})

	it("rejects duplicate email signup", async () => {
		const res = await fetch(`${AUTH_BASE}/sign-up/email`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				name: "Test User 2",
				email: "test@example.com",
				password: "password5678",
			}),
		})
		expect(res.status).not.toBe(200)
	})

	it("rejects short password", async () => {
		const res = await fetch(`${AUTH_BASE}/sign-up/email`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				name: "Short Pass",
				email: "short@example.com",
				password: "123",
			}),
		})
		expect(res.status).not.toBe(200)
	})
})

describe("Auth: Sign In", () => {
	it("signs in with valid credentials", async () => {
		const res = await fetch(`${AUTH_BASE}/sign-in/email`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				email: "test@example.com",
				password: "password1234",
			}),
		})
		expect(res.status).toBe(200)
		const body = await res.json()
		expect(body.user).toBeDefined()
		expect(body.token).toBeDefined()
		expect(body.user.email).toBe("test@example.com")
	})

	it("rejects invalid password", async () => {
		const res = await fetch(`${AUTH_BASE}/sign-in/email`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				email: "test@example.com",
				password: "wrongpassword",
			}),
		})
		expect(res.status).not.toBe(200)
	})

	it("rejects non-existent user", async () => {
		const res = await fetch(`${AUTH_BASE}/sign-in/email`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				email: "nobody@example.com",
				password: "password1234",
			}),
		})
		expect(res.status).not.toBe(200)
	})
})

/** Helper: sign in and return session cookies */
async function signInAndGetCookies(
	email = "test@example.com",
	password = "password1234",
): Promise<string[]> {
	const res = await fetch(`${AUTH_BASE}/sign-in/email`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ email, password }),
		redirect: "manual",
	})
	return res.headers.getSetCookie()
}

describe("Auth: Sign Out", () => {
	it("invalidates session on sign-out", async () => {
		const cookies = await signInAndGetCookies()
		expect(cookies.length).toBeGreaterThan(0)

		// Sign out
		const signOutRes = await fetch(`${AUTH_BASE}/sign-out`, {
			method: "POST",
			headers: { Cookie: cookies.join("; ") },
		})
		expect(signOutRes.status).toBe(200)

		// Session should no longer work
		const meRes = await fetch(`${BASE}/api/me`, {
			headers: { Cookie: cookies.join("; ") },
		})
		expect(meRes.status).toBe(401)
	})
})

describe("Delete account: /api/delete-account", () => {
	it("returns 401 without session", async () => {
		const res = await fetch(`${BASE}/api/delete-account`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ password: "password1234" }),
		})
		expect(res.status).toBe(401)
	})

	it("returns 400 without password", async () => {
		const cookies = await signInAndGetCookies()

		const res = await fetch(`${BASE}/api/delete-account`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Cookie: cookies.join("; "),
			},
			body: JSON.stringify({}),
		})
		expect(res.status).toBe(400)
		const body = await res.json()
		expect(body.error).toBe("Password is required to delete account")
	})

	it("deletes account with valid session and password", async () => {
		// Create a disposable user
		await fetch(`${AUTH_BASE}/sign-up/email`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				name: "Delete Me",
				email: "deleteme@example.com",
				password: "password1234",
			}),
		})

		const cookies = await signInAndGetCookies("deleteme@example.com", "password1234")
		expect(cookies.length).toBeGreaterThan(0)

		// Delete the account
		const deleteRes = await fetch(`${BASE}/api/delete-account`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Cookie: cookies.join("; "),
			},
			body: JSON.stringify({ password: "password1234" }),
		})
		expect(deleteRes.status).toBe(200)
		const body = await deleteRes.json()
		expect(body.success).toBe(true)

		// Cannot sign in anymore
		const signInRes = await fetch(`${AUTH_BASE}/sign-in/email`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				email: "deleteme@example.com",
				password: "password1234",
			}),
		})
		expect(signInRes.status).not.toBe(200)
	})
})

describe("Protected route: /api/me", () => {
	it("returns 401 without session", async () => {
		const res = await fetch(`${BASE}/api/me`)
		expect(res.status).toBe(401)
		const body = await res.json()
		expect(body.error).toBe("Unauthorized")
	})

	it("returns user data with valid session", async () => {
		const cookies = await signInAndGetCookies()
		expect(cookies.length).toBeGreaterThan(0)

		const meRes = await fetch(`${BASE}/api/me`, {
			headers: { Cookie: cookies.join("; ") },
		})
		expect(meRes.status).toBe(200)
		const body = await meRes.json()
		expect(body.user).toBeDefined()
		expect(body.user.email).toBe("test@example.com")
		expect(body.session).toBeDefined()
	})
})
