import { AUTH_API_PATH, DEFAULT_SERVER_PORT } from "@app/shared"
import { Hono } from "hono"
import { cors } from "hono/cors"
import { auth } from "./auth"

const app = new Hono()

// CORS — must be registered before routes
app.use(
	"/*",
	cors({
		origin: ["http://localhost:8081", "myapp://"],
		allowHeaders: ["Content-Type", "Authorization"],
		allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		credentials: true,
	}),
)

// Health check
app.get("/health", (c) => c.json({ status: "ok" }))

// Mount Better Auth handler
app.on(["POST", "GET"], `${AUTH_API_PATH}/**`, (c) => {
	return auth.handler(c.req.raw)
})

// Delete account — requires valid session, password confirmation
app.post("/api/delete-account", async (c) => {
	const session = await auth.api.getSession({
		headers: c.req.raw.headers,
	})
	if (!session) {
		return c.json({ error: "Unauthorized" }, 401)
	}

	const body = await c.req.json<{ password?: string }>()
	if (!body.password) {
		return c.json({ error: "Password is required to delete account" }, 400)
	}

	try {
		await auth.api.deleteUser({
			headers: c.req.raw.headers,
			body: { password: body.password },
		})
		return c.json({ success: true })
	} catch (error) {
		const message = error instanceof Error ? error.message : "Failed to delete account"
		return c.json({ error: message }, 400)
	}
})

// Protected example route — validates session
app.get("/api/me", async (c) => {
	const session = await auth.api.getSession({
		headers: c.req.raw.headers,
	})
	if (!session) {
		return c.json({ error: "Unauthorized" }, 401)
	}
	return c.json({ user: session.user, session: session.session })
})

const port = Number(process.env.PORT) || DEFAULT_SERVER_PORT

export default {
	port,
	fetch: app.fetch,
}

console.log(`Server running on http://localhost:${port}`)
