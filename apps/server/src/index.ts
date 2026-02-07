import { Hono } from "hono";
import { cors } from "hono/cors";
import { auth } from "./auth";
import { DEFAULT_SERVER_PORT, AUTH_API_PATH } from "@app/shared";

const app = new Hono();

// CORS — must be registered before routes
app.use(
  "/*",
  cors({
    origin: ["http://localhost:8081", "myapp://"],
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// Health check
app.get("/health", (c) => c.json({ status: "ok" }));

// Mount Better Auth handler
app.on(["POST", "GET"], `${AUTH_API_PATH}/**`, (c) => {
  return auth.handler(c.req.raw);
});

// Protected example route — validates session
app.get("/api/me", async (c) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });
  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  return c.json({ user: session.user, session: session.session });
});

const port = Number(process.env.PORT) || DEFAULT_SERVER_PORT;

export default {
  port,
  fetch: app.fetch,
};

console.log(`Server running on http://localhost:${port}`);
