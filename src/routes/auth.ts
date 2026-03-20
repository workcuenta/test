import { createUser, getUserByUsername } from "../db/user";
import { createSession, deleteSession } from "../db/session";
import { requireAuth, sessionCookie, clearSessionCookie } from "../auth";

const json = (data: unknown, status = 200, headers?: Record<string, string>) =>
  Response.json(data, { status, headers });

export const authRoutes = {
  "/api/auth/register": {
    POST: async (req: Request) => {
      try {
        const body = (await req.json()) as {
          username?: string;
          password?: string;
        };
        const username = (body.username ?? "").trim();
        const password = body.password ?? "";

        if (!username) return json({ error: "Username is required" }, 400);
        if (!password) return json({ error: "Password is required" }, 400);

        const passwordHash = await Bun.password.hash(password);
        const user = createUser(username, passwordHash);
        const session = createSession(user.id);

        return json(
          { id: user.id, username: user.username },
          201,
          { "Set-Cookie": sessionCookie(session.id) }
        );
      } catch (e: any) {
        const status = e.message?.includes("already taken") ? 409 : 400;
        return json({ error: e.message }, status);
      }
    },
  },

  "/api/auth/login": {
    POST: async (req: Request) => {
      try {
        const body = (await req.json()) as {
          username?: string;
          password?: string;
        };
        const username = (body.username ?? "").trim();
        const password = body.password ?? "";

        const INVALID = json({ error: "Invalid username or password" }, 401);

        if (!username || !password) return INVALID;

        const user = getUserByUsername(username);
        if (!user) return INVALID;

        const valid = await Bun.password.verify(password, user.password_hash);
        if (!valid) return INVALID;

        const session = createSession(user.id);
        return json(
          { id: user.id, username: user.username },
          200,
          { "Set-Cookie": sessionCookie(session.id) }
        );
      } catch (e: any) {
        return json({ error: e.message }, 400);
      }
    },
  },

  "/api/auth/logout": {
    POST: async (req: Request) => {
      const cookie = req.headers.get("cookie") ?? "";
      const match = cookie.match(/(?:^|;\s*)session=([^;]+)/);
      const token = match?.[1];
      if (token) deleteSession(token);
      return new Response(null, {
        status: 204,
        headers: { "Set-Cookie": clearSessionCookie() },
      });
    },
  },

  "/api/auth/me": {
    GET: async (req: Request) => {
      try {
        const { userId } = await requireAuth(req);
        const db = (await import("../db/index")).getDb();
        const user = db
          .query<{ id: number; username: string }, [number]>(
            "SELECT id, username FROM users WHERE id = ?"
          )
          .get(userId);
        return user ? json(user) : json({ error: "User not found" }, 404);
      } catch (e) {
        if (e instanceof Response) return e;
        return json({ error: "Unauthorized" }, 401);
      }
    },
  },
};
