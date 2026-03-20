## 1. Backend — Board Metrics

- [x] 1.1 Add `getBoardMetrics(boardId: number, userId: number)` function in `src/db/board.ts` that queries column count, total card count, and card count per column (ordered by column position)
- [x] 1.2 Add `GET /api/boards/:id/metrics` route in `src/routes/boards.ts` using `requireAuth` and returning the metrics JSON (404 if board not found or not owned by user)
- [x] 1.3 Write unit tests in `src/db/board.test.ts` covering: own board with data, board with no columns, board with columns but no cards, board not owned by user (returns null)

## 2. Frontend — View Routing

- [x] 2.1 Add `view: "dashboard" | "board"` to App state in `frontend.tsx`, defaulting to `"dashboard"` after successful auth check
- [x] 2.2 Render `<Dashboard>` when `view === "dashboard"` and the existing board layout when `view === "board"` in the App return
- [x] 2.3 Add a home/logo button to the app header that sets `view` back to `"dashboard"` from within the board view

## 3. Frontend — Dashboard Component

- [x] 3.1 Create `src/components/Dashboard.tsx` that accepts `boards: Board[]` and a `onSelectBoard(boardId: number): void` callback
- [x] 3.2 Inside `Dashboard`, fetch metrics for each board via `GET /api/boards/:id/metrics` using `Promise.all` on mount; store per-board metrics in local state
- [x] 3.3 Render a board tile for each board showing: board name, column count, total card count, and a breakdown list of `columnName: cardCount` per column
- [x] 3.4 Show a loading indicator on each tile while its metrics fetch is in progress
- [x] 3.5 Clicking a board tile calls `onSelectBoard(boardId)` and the App sets `view` to `"board"` with that board as active
- [x] 3.6 Show the empty-state creation prompt (reuse or adapt `BoardCreatePrompt`) when the boards list is empty

## 4. Wiring & Cleanup

- [x] 4.1 Pass `boards` and `onSelectBoard` from App into `<Dashboard>` and ensure the App switches to board view on selection
- [x] 4.2 Update App logic so that after creating a new board (from dashboard empty state or BoardSwitcher), the view transitions to `"board"` for the newly created board
- [x] 4.3 Verify existing board view behavior is unchanged: board switcher, filters, drag-and-drop, add card/column all still work after the view routing change
