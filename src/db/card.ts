import { getDb } from "./index";

export interface Card {
  id: number;
  column_id: number;
  title: string;
  description: string | null;
  position: number;
  created_at: number;
}

export function createCard(
  columnId: number,
  title: string,
  description?: string | null
): Card {
  const trimmedTitle = title.trim();
  if (!trimmedTitle) throw new Error("Card title cannot be empty");
  const db = getDb();

  const row = db
    .query<{ max_pos: number | null }, [number]>(
      "SELECT MAX(position) as max_pos FROM cards WHERE column_id = ?"
    )
    .get(columnId);
  const nextPos = (row?.max_pos ?? -1) + 1;

  return db
    .query<Card, [number, string, string | null, number]>(
      "INSERT INTO cards (column_id, title, description, position) VALUES (?, ?, ?, ?) RETURNING *"
    )
    .get(columnId, trimmedTitle, description ?? null, nextPos)!;
}

export function getCardById(id: number): Card | null {
  return getDb()
    .query<Card, [number]>("SELECT * FROM cards WHERE id = ?")
    .get(id);
}

export function listCards(columnId: number): Card[] {
  return getDb()
    .query<Card, [number]>(
      "SELECT * FROM cards WHERE column_id = ? ORDER BY position ASC"
    )
    .all(columnId);
}

export function updateCard(
  id: number,
  fields: { title?: string; description?: string | null }
): Card {
  const db = getDb();
  const card = db
    .query<Card, [number]>("SELECT * FROM cards WHERE id = ?")
    .get(id);
  if (!card) throw new Error(`Card ${id} not found`);

  const newTitle =
    fields.title !== undefined ? fields.title.trim() : card.title;
  if (fields.title !== undefined && !newTitle)
    throw new Error("Card title cannot be empty");
  const newDescription =
    fields.description !== undefined ? fields.description : card.description;

  return db
    .query<Card, [string, string | null, number]>(
      "UPDATE cards SET title = ?, description = ? WHERE id = ? RETURNING *"
    )
    .get(newTitle, newDescription, id)!;
}

export function reorderCard(id: number, newPosition: number): void {
  const db = getDb();
  const card = db
    .query<Card, [number]>("SELECT * FROM cards WHERE id = ?")
    .get(id);
  if (!card) throw new Error(`Card ${id} not found`);

  const { position: oldPos, column_id: columnId } = card;
  if (oldPos === newPosition) return;

  db.transaction(() => {
    if (oldPos < newPosition) {
      db.run(
        "UPDATE cards SET position = position - 1 WHERE column_id = ? AND position > ? AND position <= ?",
        [columnId, oldPos, newPosition]
      );
    } else {
      db.run(
        "UPDATE cards SET position = position + 1 WHERE column_id = ? AND position >= ? AND position < ?",
        [columnId, newPosition, oldPos]
      );
    }
    db.run("UPDATE cards SET position = ? WHERE id = ?", [newPosition, id]);
  })();
}

export function moveCard(
  id: number,
  targetColumnId: number,
  position?: number
): void {
  const db = getDb();
  const card = db
    .query<Card, [number]>("SELECT * FROM cards WHERE id = ?")
    .get(id);
  if (!card) throw new Error(`Card ${id} not found`);

  const { column_id: sourceColumnId, position: sourcePos } = card;

  db.transaction(() => {
    // Shift source column: close the gap left by the moved card
    db.run(
      "UPDATE cards SET position = position - 1 WHERE column_id = ? AND position > ?",
      [sourceColumnId, sourcePos]
    );

    // Determine target position
    let targetPos: number;
    if (position !== undefined) {
      targetPos = position;
      db.run(
        "UPDATE cards SET position = position + 1 WHERE column_id = ? AND position >= ?",
        [targetColumnId, targetPos]
      );
    } else {
      const row = db
        .query<{ max_pos: number | null }, [number]>(
          "SELECT MAX(position) as max_pos FROM cards WHERE column_id = ?"
        )
        .get(targetColumnId);
      targetPos = (row?.max_pos ?? -1) + 1;
    }

    db.run("UPDATE cards SET column_id = ?, position = ? WHERE id = ?", [
      targetColumnId,
      targetPos,
      id,
    ]);
  })();
}

export function deleteCard(id: number): void {
  const db = getDb();
  const card = db
    .query<Card, [number]>("SELECT * FROM cards WHERE id = ?")
    .get(id);
  if (!card) return;

  db.transaction(() => {
    db.run("DELETE FROM cards WHERE id = ?", [id]);
    db.run(
      "UPDATE cards SET position = position - 1 WHERE column_id = ? AND position > ?",
      [card.column_id, card.position]
    );
  })();
}
