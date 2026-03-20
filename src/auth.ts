import { getSession } from "./db/session";

const UNAUTHORIZED = new Response(
  JSON.stringify({ error: "Unauthorized" }),
  { status: 401, headers: { "Content-Type": "application/json" } }
);

export async function requireAuth(req: Request): Promise<{ userId: number }> {
  const cookie = req.headers.get("cookie") ?? "";
  const match = cookie.match(/(?:^|;\s*)session=([^;]+)/);
  const token = match?.[1];

  if (!token) throw UNAUTHORIZED;

  const session = getSession(token);
  if (!session) throw UNAUTHORIZED;

  return { userId: session.user_id };
}

export function sessionCookie(token: string): string {
  return `session=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`;
}

export function clearSessionCookie(): string {
  return `session=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`;
}
