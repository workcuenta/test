## Why

As boards grow, finding specific cards requires scrolling through every column. A text search and label system lets users quickly surface the cards they care about without manual scanning.

## What Changes

- Add a `labels` table: colored labels scoped to a board
- Add a `card_labels` junction table linking cards to labels (many-to-many)
- Add REST endpoints for label CRUD (`/api/boards/:boardId/labels`) and card-label assignment (`/api/cards/:id/labels`)
- Cards display their label chips in the board view
- Add a filter bar to the board header: free-text search and multi-label filter
- Text search hides cards whose title and description don't contain the query
- Label filter hides cards that don't have all selected labels

## Capabilities

### New Capabilities

- `card-labels`: Label entity (name + hex color, scoped to a board); many-to-many assignment to cards; full CRUD for labels; attach/detach labels on cards

### Modified Capabilities

- `rest-api`: New label endpoints (`GET/POST /api/boards/:boardId/labels`, `GET/PATCH/DELETE /api/labels/:id`, `GET/POST/DELETE /api/cards/:id/labels/:labelId`)
- `kanban-ui`: Filter bar in the board header (text search + label picker); cards show label chips; filtered-out cards are hidden; no filter shows all cards

## Impact

- `src/db/schema.ts` — two new tables: `labels`, `card_labels`
- New `src/db/label.ts` — label CRUD and card-label assignment data access
- New `src/routes/labels.ts` — label and card-label route handlers
- `index.ts` — register label routes
- `src/components/Card.tsx` — render label chips
- `src/components/Board.tsx` — filter bar; pass active filters down; filter card lists before rendering
- No breaking changes to existing data or API
