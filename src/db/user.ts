import { getDb } from "./index";

export interface User {
  id: number;
  username: string;
  password_hash: string;
  created_at: number;
}

export function createUser(username: string, passwordHash: string): User {
  try {
    return getDb()
      .query<User, [string, string]>(
        "INSERT INTO users (username, password_hash) VALUES (?, ?) RETURNING *"
      )
      .get(username, passwordHash)!;
  } catch (e: any) {
    if (e.message?.includes("UNIQUE constraint failed")) {
      throw new Error(`Username '${username}' is already taken`);
    }
    throw e;
  }
}

export function getUserByUsername(username: string): User | null {
  return getDb()
    .query<User, [string]>("SELECT * FROM users WHERE username = ?")
    .get(username);
}
