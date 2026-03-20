## Context

The app currently uses a single-page layout where the board view is the root view after login. The `frontend.tsx` App component holds the active board state, columns, cards, and labels. Navigation between boards happens via a `BoardSwitcher` tab strip inside the header.

There is no overview page — users must be "inside" a board to interact. Adding a main dashboard requires introducing a view-level routing concept (dashboard vs. board) in the frontend and a new aggregation endpoint on the backend.

## Goals / Non-Goals

**Goals:**
- Add a main dashboard view as the default landing page after login.
- Show all user boards as visual tiles with inline metrics (columns count, total cards, cards per column breakdown).
- Add `GET /api/boards/:id/metrics` endpoint returning aggregated metrics for a board.
- Clicking a board tile navigates into the full Kanban board view.
- Dashboard is accessible at any time (e.g., clicking a "Home" or logo button).

**Non-Goals:**
- Real-time metrics updates (polling/websocket). Metrics are fetched on dashboard load.
- Advanced analytics (burndown charts, velocity, due dates).
- Pagination of boards list.
- Changing the existing board view or its routes.

## Decisions

### 1. Frontend view routing via `view` state (no URL router)

The app has no client-side router (no React Router). Introducing one would require significant refactoring.

**Decision**: Add a `view: "dashboard" | "board"` field to App state. The App renders either `<Dashboard>` or the existing board view depending on this value.

**Alternative considered**: URL hash routing (`#/dashboard`, `#/board/:id`). Provides shareable URLs but adds complexity and changes the current URL model.

**Rationale**: Minimal-change approach consistent with the existing architecture. The app is a single-user local tool — shareability of URLs is low value right now.

### 2. New `GET /api/boards/:id/metrics` endpoint (no DB schema changes)

Metrics are aggregated at query time using `COUNT` SQL queries against existing `columns` and `cards` tables.

**Decision**: Add a `getBoardMetrics(boardId, userId)` function in `src/db/board.ts` and expose it via a new route in `boardRoutes`.

**Alternative considered**: Compute metrics client-side by fetching all columns and cards for each board. Wasteful for large boards — over-fetches data the dashboard doesn't need.

**Rationale**: A dedicated endpoint returns only the necessary summary data, avoids N+1 fetches, and keeps aggregation close to the DB layer.

### 3. Dashboard fetches all boards + metrics in parallel

On mount, `Dashboard` calls `GET /api/boards` (already exists) to get the board list, then fans out `GET /api/boards/:id/metrics` for each board concurrently using `Promise.all`.

**Rationale**: Boards list is already paginated at the user level. Parallel metrics fetches are bounded by the number of boards owned by the user.

## Risks / Trade-offs

- [Risk] N parallel metrics requests for users with many boards → Mitigation: Acceptable for current scale; can batch into a single `GET /api/boards/metrics` later if needed.
- [Risk] `view` state in App grows complex as more views are added → Mitigation: Document the pattern; this is acceptable for 2 views. Extract a router if a 3rd view is added.
- [Risk] Metrics endpoint is read-only but adds a new auth-protected route → Mitigation: Reuse `requireAuth` middleware already used on all board routes.
