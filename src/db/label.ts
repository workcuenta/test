import { getDb } from "./index";

export interface Label {
  id: number;
  board_id: number;
  name: string;
  color: string;
  created_at: number;
}

export interface CardWithLabels {
  id: number;
  column_id: number;
  title: string;
  description: string | null;
  position: number;
  created_at: number;
  labels: Label[];
}

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

// Label CRUD

export function createLabel(boardId: number, name: string, color: string): Label {
  if (!name.trim()) throw new Error("Label name is required");
  if (!HEX_COLOR.test(color)) throw new Error("Color must be a valid hex color (e.g. #ef4444)");
  const db = getDb();
  return db
    .query<Label, [number, string, string]>(
      "INSERT INTO labels (board_id, name, color) VALUES (?, ?, ?) RETURNING *"
    )
    .get(boardId, name.trim(), color)!;
}

export function listLabels(boardId: number): Label[] {
  return getDb()
    .query<Label, [number]>(
      "SELECT * FROM labels WHERE board_id = ? ORDER BY created_at ASC"
    )
    .all(boardId);
}

export function getLabelById(id: number): Label | null {
  return (
    getDb()
      .query<Label, [number]>("SELECT * FROM labels WHERE id = ?")
      .get(id) ?? null
  );
}

export function updateLabel(
  id: number,
  fields: { name?: string; color?: string }
): Label {
  const db = getDb();
  const current = getLabelById(id);
  if (!current) throw new Error("Label not found");

  const name = fields.name !== undefined ? fields.name.trim() : current.name;
  const color = fields.color !== undefined ? fields.color : current.color;

  if (!name) throw new Error("Label name is required");
  if (!HEX_COLOR.test(color)) throw new Error("Color must be a valid hex color (e.g. #ef4444)");

  return db
    .query<Label, [string, string, number]>(
      "UPDATE labels SET name = ?, color = ? WHERE id = ? RETURNING *"
    )
    .get(name, color, id)!;
}

export function deleteLabel(id: number): void {
  getDb().run("DELETE FROM labels WHERE id = ?", [id]);
}

// Card-label operations

export function attachLabel(cardId: number, labelId: number): void {
  getDb().run(
    "INSERT OR IGNORE INTO card_labels (card_id, label_id) VALUES (?, ?)",
    [cardId, labelId]
  );
}

export function detachLabel(cardId: number, labelId: number): void {
  getDb().run(
    "DELETE FROM card_labels WHERE card_id = ? AND label_id = ?",
    [cardId, labelId]
  );
}

export function getLabelsForCard(cardId: number): Label[] {
  return getDb()
    .query<Label, [number]>(
      `SELECT l.* FROM labels l
       JOIN card_labels cl ON cl.label_id = l.id
       WHERE cl.card_id = ?`
    )
    .all(cardId);
}

export function listCardsWithLabels(columnId: number): CardWithLabels[] {
  const db = getDb();
  const cards = db
    .query<Omit<CardWithLabels, "labels">, [number]>(
      "SELECT * FROM cards WHERE column_id = ? ORDER BY position ASC"
    )
    .all(columnId);

  if (!cards.length) return [];

  const cardIds = cards.map((c) => c.id);
  const placeholders = cardIds.map(() => "?").join(", ");
  const rows = db
    .query<{ card_id: number } & Label, number[]>(
      `SELECT cl.card_id, l.* FROM card_labels cl
       JOIN labels l ON l.id = cl.label_id
       WHERE cl.card_id IN (${placeholders})`
    )
    .all(...cardIds);

  const labelsByCard = new Map<number, Label[]>();
  for (const row of rows) {
    const { card_id, ...label } = row;
    if (!labelsByCard.has(card_id)) labelsByCard.set(card_id, []);
    labelsByCard.get(card_id)!.push(label as Label);
  }

  return cards.map((c) => ({ ...c, labels: labelsByCard.get(c.id) ?? [] }));
}
