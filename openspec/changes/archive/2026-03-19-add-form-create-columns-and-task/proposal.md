## Why

Users can see and move cards but have no way to create columns or cards from the UI. The only path today is via the REST API directly. This blocks normal Kanban usage — boards are effectively read-only once seeded.

## What Changes

- Add an **"Add card"** button at the bottom of each column that reveals an inline form (title textarea + optional description + confirm/cancel)
- Add an **"Add column"** button at the right end of the board that reveals an inline name input + confirm/cancel
- Both forms submit to the existing REST API and trigger a board refresh on success

## Capabilities

### New Capabilities
- None

### Modified Capabilities
- `kanban-ui`: Add column creation form (end of board) and card creation form (bottom of each column)

## Impact

- `src/components/Column.tsx`: add "Add card" button and inline card creation form
- `src/components/Board.tsx`: add "Add column" button and inline column creation form
- `index.css`: styles for both inline forms
- No backend changes — `POST /api/boards/:boardId/columns` and `POST /api/columns/:columnId/cards` already exist
