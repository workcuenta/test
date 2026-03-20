import { getDb } from "./index";
import { randomBytes } from "node:crypto";

export interface Session {
  id: string;
  user_id: number;
  expires_at: number;
}

const SEVEN_DAYS_SECS = 7 * 24 * 60 * 60;

export function createSession(userId: number): Session {
  const token = randomBytes(32).toString("hex");
  const expiresAt = Math.floor(Date.now() / 1000) + SEVEN_DAYS_SECS;
  return getDb()
    .query<Session, [string, number, number]>(
      "INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?) RETURNING *"
    )
    .get(token, userId, expiresAt)!;
}

export function getSession(token: string): Session | null {
  const now = Math.floor(Date.now() / 1000);
  return getDb()
    .query<Session, [string, number]>(
      "SELECT * FROM sessions WHERE id = ? AND expires_at > ?"
    )
    .get(token, now);
}

export function deleteSession(token: string): void {
  getDb().run("DELETE FROM sessions WHERE id = ?", [token]);
}

export function deleteExpiredSessions(): void {
  const now = Math.floor(Date.now() / 1000);
  getDb().run("DELETE FROM sessions WHERE expires_at <= ?", [now]);
}
