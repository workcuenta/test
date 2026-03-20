import { Database } from "bun:sqlite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { applySchema } from "./schema";

let _db: Database | null = null;

export function initDb(path = "data/kanban.db"): Database {
  if (path !== ":memory:") {
    mkdirSync(dirname(path), { recursive: true });
  }
  _db = new Database(path);
  _db.run("PRAGMA foreign_keys = ON");
  applySchema(_db);
  return _db;
}

export function getDb(): Database {
  if (!_db) throw new Error("DB not initialized. Call initDb() first.");
  return _db;
}
