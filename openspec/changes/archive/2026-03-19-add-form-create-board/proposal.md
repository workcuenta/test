## Why

Users have no way to create boards from the UI — the app always shows only the first board returned by the API. As users accumulate boards (e.g., one per project), they need a way to create new ones and switch between them without using curl or the API directly.

## What Changes

- Add a "New Board" button in the app header
- Add an inline form (or modal) to enter a board name and submit it
- After creation, switch the view to the newly created board
- Add a board switcher so users can navigate between their boards

## Capabilities

### New Capabilities
- None

### Modified Capabilities
- `kanban-ui`: Add board creation form and board switcher to the board view

## Impact

- `frontend.tsx`: manage a list of boards in state; add board switcher and creation UI
- `src/components/Board.tsx`: no changes needed (board data still passed in)
- `index.css`: styles for the board switcher and creation form
- No backend changes — `POST /api/boards` and `GET /api/boards` already exist
