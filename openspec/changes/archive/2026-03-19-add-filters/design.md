## Context

Cards currently have only a title, description, and position. The board renders all cards unconditionally. As boards grow, users need a way to find relevant cards quickly. This change adds colored labels (scoped to a board) and a filter bar combining free-text search with multi-label filtering — both are client-side, with label data fetched alongside cards.

## Goals / Non-Goals

**Goals:**
- `labels` table: name + hex color, scoped to a board; full CRUD
- `card_labels` junction table: many-to-many between cards and labels; attach/detach
- REST endpoints for label and card-label management
- Cards render label chips in the board view
- Filter bar in the board header: text input (search) + label chips (toggle)
- Filtering is purely client-side — no server-side query params needed
- No breaking changes to existing schema or API

**Non-Goals:**
- Filtering persisted across page reloads (filters are ephemeral UI state)
- Label re-use across boards (labels are board-scoped)
- Card assignees or due-date filters
- Full-text search via SQLite FTS

## Decisions

### Client-side filtering (no server query params)

**Decision**: Filter cards in React state after fetching. No changes to `GET /api/columns/:id/cards`.

**Rationale**: The board is already fetched in full on load and after each drag. For typical board sizes (<200 cards), client-side filtering is instantaneous with no extra complexity. Adding server-side filter params would require changing the API contract.

**Alternatives considered**: Server-side `?search=` and `?labelId=` query params — more correct at scale, adds round-trips and API complexity for marginal benefit here.

### Labels scoped to board, not global

**Decision**: Each label belongs to one board (`board_id` FK). Labels from board A are not visible on board B.

**Rationale**: Labels are typically meaningful within the context of a project (board). Cross-board label sharing requires a more complex taxonomy system.

### Label chips inline on cards, not a sidebar

**Decision**: Labels render as small colored pill chips at the top of each card.

**Rationale**: Consistent with Trello-style Kanban conventions; immediately visible without expanding cards.

### Hex color stored as TEXT

**Decision**: `color TEXT NOT NULL` stores a CSS hex string (e.g. `#ef4444`).

**Rationale**: Simple, directly usable in CSS without conversion. Validation (must be a valid hex color) is enforced in the data-access layer.

### Schema additions (non-breaking)

```sql
CREATE TABLE IF NOT EXISTS labels (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  board_id INTEGER NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS card_labels (
  card_id INTEGER NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  label_id INTEGER NOT NULL REFERENCES labels(id) ON DELETE CASCADE,
  PRIMARY KEY (card_id, label_id)
);
```

### Filter bar state

```tsx
type FilterState = {
  text: string;           // free-text search query
  labelIds: Set<number>;  // active label filters (AND semantics)
};
```

A card is visible when:
1. `text` is empty OR card title/description contains `text` (case-insensitive)
2. `labelIds` is empty OR card has ALL selected labels

## Risks / Trade-offs

- **Client-side filter latency on large boards** → Acceptable; debounce the text input at 150 ms.
- **Card label data requires an extra fetch per card** → Mitigation: fetch all labels for the board once and attach them to cards in a single join query via `listCardsWithLabels(columnId)`, avoiding N+1 fetches.
- **Cascade deletes**: deleting a label removes all `card_labels` rows for it (handled by FK cascade) — this is intentional.
