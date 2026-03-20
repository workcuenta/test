## Context

The project is a greenfield Kanban application built with Bun. There is currently no persistence layer. This design establishes the SQLite data model and data-access layer that all future features will build on.

## Goals / Non-Goals

**Goals:**
- Define a normalized SQLite schema for Board, Column, and Card entities
- Initialize the database at startup and run schema migrations idempotently
- Provide typed CRUD functions for each entity using `bun:sqlite`
- Keep the data layer simple and co-located (no ORM)

**Non-Goals:**
- Multi-user support or authentication
- Real-time sync / WebSocket subscriptions (future concern)
- Full migration versioning system (a single `CREATE TABLE IF NOT EXISTS` is sufficient for now)

## Decisions

### Use `bun:sqlite` directly (no ORM)

**Decision**: Raw SQL via `bun:sqlite` with typed wrapper functions.

**Rationale**: The schema is small and stable. An ORM adds complexity with no benefit at this scale. `bun:sqlite` is synchronous, fast, and built-in — zero dependencies.

**Alternatives considered**:
- `Drizzle ORM`: Good type safety but adds a build step and abstraction we don't need yet.
- `Prisma`: Too heavy; generates client code from schema files, overkill for a small local app.

### Single database file (`data/kanban.db`)

**Decision**: One SQLite file at `data/kanban.db`, created on startup.

**Rationale**: Simple, portable, no config needed. The `data/` directory is gitignored.

### Ordering via integer `position` column

**Decision**: Columns and Cards each have an integer `position` field within their parent scope.

**Rationale**: Enables drag-and-drop reordering without linked lists or fractional indexing. Reorder operations update positions of affected siblings in a transaction.

**Alternatives considered**:
- Fractional indexing (e.g., Jira's LexoRank): More efficient for large lists but unnecessary complexity for a local app.

### File layout

```
src/
  db/
    index.ts       # opens DB, runs migrations, exports `db`
    schema.ts      # CREATE TABLE statements
    board.ts       # board CRUD
    column.ts      # column CRUD + reorder
    card.ts        # card CRUD + move + reorder
```

## Risks / Trade-offs

- **Position gaps after deletes** → Mitigation: normalize positions in a transaction on delete/reorder; gaps are harmless but we clean them up.
- **No migration versioning** → Mitigation: acceptable for an early-stage local app; add versioning (e.g., `pragma user_version`) before any schema-breaking change.
- **SQLite write contention** → Not a concern for a single-user local app; document this assumption.
