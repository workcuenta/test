## Why

Currently, authenticated users land directly on a single board view with no high-level overview of their workspace. As users create multiple boards, there is no way to see activity, progress, or health across all boards at a glance — forcing them to switch tabs one by one.

## What Changes

- Add a **main dashboard** page accessible from the app header as the default landing view after login.
- The dashboard lists all boards owned by the user as cards/tiles.
- Each board tile displays key metrics: total cards, cards per column, and number of columns.
- Clicking a board tile navigates to that board's Kanban view.
- Add a `/api/boards/:boardId/metrics` REST endpoint that returns aggregated metrics for a board.

## Capabilities

### New Capabilities

- `main-dashboard`: The frontend dashboard view that shows all user boards as tiles with summary metrics, including navigation to individual boards.
- `board-metrics`: Backend API endpoint (`GET /api/boards/:boardId/metrics`) and data aggregation logic that computes card counts per column and totals for a given board.

### Modified Capabilities

<!-- No existing spec-level requirements are changing -->

## Impact

- **Frontend**: New `Dashboard.tsx` component; routing logic to switch between dashboard and board view.
- **Backend**: New route handler in `src/routes/boards.ts` for `/api/boards/:boardId/metrics`.
- **Database**: Read-only aggregation queries — no schema changes required.
- **APIs**: One new endpoint added; existing endpoints unchanged.
