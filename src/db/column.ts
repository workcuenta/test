import { getDb } from "./index";

export interface Column {
  id: number;
  board_id: number;
  name: string;
  position: number;
  created_at: number;
}

export function createColumn(boardId: number, name: string): Column {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Column name cannot be empty");
  const db = getDb();

  const row = db
    .query<{ max_pos: number | null }, [number]>(
      "SELECT MAX(position) as max_pos FROM columns WHERE board_id = ?"
    )
    .get(boardId);
  const nextPos = (row?.max_pos ?? -1) + 1;

  return db
    .query<Column, [number, string, number]>(
      "INSERT INTO columns (board_id, name, position) VALUES (?, ?, ?) RETURNING *"
    )
    .get(boardId, trimmed, nextPos)!;
}

export function getColumnById(id: number): Column | null {
  return getDb()
    .query<Column, [number]>("SELECT * FROM columns WHERE id = ?")
    .get(id);
}

export function listColumns(boardId: number): Column[] {
  return getDb()
    .query<Column, [number]>(
      "SELECT * FROM columns WHERE board_id = ? ORDER BY position ASC"
    )
    .all(boardId);
}

export function updateColumn(id: number, name: string): Column {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Column name cannot be empty");
  const col = getDb()
    .query<Column, [string, number]>(
      "UPDATE columns SET name = ? WHERE id = ? RETURNING *"
    )
    .get(trimmed, id);
  if (!col) throw new Error(`Column ${id} not found`);
  return col;
}

export function reorderColumn(id: number, newPosition: number): void {
  const db = getDb();
  const col = db
    .query<Column, [number]>("SELECT * FROM columns WHERE id = ?")
    .get(id);
  if (!col) throw new Error(`Column ${id} not found`);

  const { position: oldPos, board_id: boardId } = col;
  if (oldPos === newPosition) return;

  db.transaction(() => {
    if (oldPos < newPosition) {
      db.run(
        "UPDATE columns SET position = position - 1 WHERE board_id = ? AND position > ? AND position <= ?",
        [boardId, oldPos, newPosition]
      );
    } else {
      db.run(
        "UPDATE columns SET position = position + 1 WHERE board_id = ? AND position >= ? AND position < ?",
        [boardId, newPosition, oldPos]
      );
    }
    db.run("UPDATE columns SET position = ? WHERE id = ?", [newPosition, id]);
  })();
}

export function deleteColumn(id: number): void {
  const db = getDb();
  const col = db
    .query<Column, [number]>("SELECT * FROM columns WHERE id = ?")
    .get(id);
  if (!col) return;

  db.transaction(() => {
    db.run("DELETE FROM columns WHERE id = ?", [id]);
    db.run(
      "UPDATE columns SET position = position - 1 WHERE board_id = ? AND position > ?",
      [col.board_id, col.position]
    );
  })();
}
