import { getDb } from "./index";

export interface Board {
  id: number;
  user_id: number;
  name: string;
  created_at: number;
}

export function createBoard(userId: number, name: string): Board {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Board name cannot be empty");
  return getDb()
    .query<Board, [number, string]>(
      "INSERT INTO boards (user_id, name) VALUES (?, ?) RETURNING *"
    )
    .get(userId, trimmed)!;
}

export function getBoardById(id: number, userId: number): Board | null {
  return getDb()
    .query<Board, [number, number]>(
      "SELECT * FROM boards WHERE id = ? AND user_id = ?"
    )
    .get(id, userId);
}

export function listBoards(userId: number): Board[] {
  return getDb()
    .query<Board, [number]>(
      "SELECT * FROM boards WHERE user_id = ? ORDER BY created_at ASC"
    )
    .all(userId);
}

export function updateBoard(id: number, name: string, userId: number): Board {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Board name cannot be empty");
  const board = getDb()
    .query<Board, [string, number, number]>(
      "UPDATE boards SET name = ? WHERE id = ? AND user_id = ? RETURNING *"
    )
    .get(trimmed, id, userId);
  if (!board) throw new Error(`Board ${id} not found`);
  return board;
}

export function deleteBoard(id: number, userId: number): void {
  getDb().run("DELETE FROM boards WHERE id = ? AND user_id = ?", [id, userId]);
}
