## Why

The kanban application has no data layer. Without a defined data model, there is no foundation for persisting boards, columns, or cards — making it impossible to build any meaningful features on top.

## What Changes

- Define core domain entities: Board, Column, and Card
- Introduce a SQLite database layer using `bun:sqlite`
- Create database schema with migrations
- Expose typed data-access functions (CRUD) for each entity

## Capabilities

### New Capabilities

- `board`: A named workspace containing ordered columns; supports create, read, update, delete
- `column`: An ordered lane within a board (e.g., "To Do", "In Progress", "Done"); supports create, reorder, delete
- `card`: A task item belonging to a column with a title and optional description; supports create, move between columns, reorder, delete

### Modified Capabilities

(none — no existing specs)

## Impact

- Adds `bun:sqlite` database initialization at startup (`db.ts`)
- New `src/db/` directory with schema, migrations, and per-entity data-access modules
- All future feature work (API routes, UI) depends on this data model
