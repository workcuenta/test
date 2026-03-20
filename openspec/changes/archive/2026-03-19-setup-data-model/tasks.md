## 1. Database Setup

- [x] 1.1 Create `data/` directory and add it to `.gitignore` (keep `data/kanban.db` out of source control)
- [x] 1.2 Create `src/db/schema.ts` with `CREATE TABLE IF NOT EXISTS` statements for `boards`, `columns`, and `cards`
- [x] 1.3 Create `src/db/index.ts` that opens `data/kanban.db`, runs schema migrations, and exports the `db` instance
- [x] 1.4 Wire `src/db/index.ts` into `index.ts` so the database initializes on startup

## 2. Board Data Access

- [x] 2.1 Create `src/db/board.ts` with `createBoard(name)` — validates non-empty name, inserts, returns board
- [x] 2.2 Add `getBoardById(id)` — returns board or null
- [x] 2.3 Add `listBoards()` — returns all boards ordered by `created_at` ascending
- [x] 2.4 Add `updateBoard(id, name)` — validates non-empty name, updates, returns updated board
- [x] 2.5 Add `deleteBoard(id)` — deletes board and cascades to columns and cards

## 3. Column Data Access

- [x] 3.1 Create `src/db/column.ts` with `createColumn(boardId, name)` — validates inputs, appends at last position
- [x] 3.2 Add `listColumns(boardId)` — returns columns ordered by `position` ascending
- [x] 3.3 Add `updateColumn(id, name)` — validates non-empty name, updates, returns updated column
- [x] 3.4 Add `reorderColumn(id, newPosition)` — shifts siblings atomically in a transaction
- [x] 3.5 Add `deleteColumn(id)` — deletes column and its cards; normalizes sibling positions

## 4. Card Data Access

- [x] 4.1 Create `src/db/card.ts` with `createCard(columnId, title, description?)` — validates inputs, appends at last position
- [x] 4.2 Add `listCards(columnId)` — returns cards ordered by `position` ascending
- [x] 4.3 Add `updateCard(id, fields)` — allows updating title and/or description (null clears description)
- [x] 4.4 Add `reorderCard(id, newPosition)` — shifts siblings in the same column atomically
- [x] 4.5 Add `moveCard(id, targetColumnId, position?)` — updates `column_id`, places at position or last; normalizes source and destination
- [x] 4.6 Add `deleteCard(id)` — removes card and normalizes sibling positions

## 5. Tests

- [x] 5.1 Create `src/db/board.test.ts` covering create, get, list, update, delete (including cascade)
- [x] 5.2 Create `src/db/column.test.ts` covering create, list, update, reorder, delete (including cascade and position normalization)
- [x] 5.3 Create `src/db/card.test.ts` covering create, list, update, reorder, move between columns, delete
- [x] 5.4 Run `bun test` and confirm all tests pass
