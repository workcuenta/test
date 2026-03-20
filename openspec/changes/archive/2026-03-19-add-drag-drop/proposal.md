## Why

The data model exists but there is no user interface — users have no way to interact with boards, columns, or cards. Drag-and-drop is the defining interaction of a Kanban board; building the UI with it from the start avoids having to retrofit it later.

## What Changes

- Add a REST API layer exposing board, column, and card operations (CRUD + reorder + move)
- Add a frontend Kanban board view that renders boards, columns, and cards
- Implement drag-and-drop for cards (within a column and across columns)
- Implement drag-and-drop for columns (reordering within a board)
- Wire the frontend drag events to the REST API so changes persist

## Capabilities

### New Capabilities

- `rest-api`: HTTP endpoints for all board, column, and card operations; used by the frontend
- `kanban-ui`: Visual Kanban board — renders columns and cards, handles drag-and-drop interactions for cards and columns

### Modified Capabilities

(none — the data-layer requirements in `board`, `column`, and `card` specs are unchanged)

## Impact

- `index.ts` extended with `Bun.serve()` routes and an HTML entrypoint
- New `src/routes/` directory with route handlers for boards, columns, and cards
- New `frontend.tsx` and `index.html` for the React-based board UI
- Uses the HTML5 Drag and Drop API (no external DnD library)
- Adds `react` and `react-dom` as dependencies
