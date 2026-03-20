## 1. Setup

- [x] 1.1 Install `react` and `react-dom` dependencies (`bun add react react-dom` and `bun add -d @types/react @types/react-dom`)
- [x] 1.2 Create `index.html` with a `<div id="root">` and `<script type="module" src="./frontend.tsx">`

## 2. REST API — Boards

- [x] 2.1 Create `src/routes/boards.ts` with `GET /api/boards` (list all) and `POST /api/boards` (create)
- [x] 2.2 Add `GET /api/boards/:id`, `PATCH /api/boards/:id`, `DELETE /api/boards/:id` to `src/routes/boards.ts`

## 3. REST API — Columns

- [x] 3.1 Create `src/routes/columns.ts` with `GET /api/boards/:boardId/columns` and `POST /api/boards/:boardId/columns`
- [x] 3.2 Add `PATCH /api/columns/:id` (name and/or position) and `DELETE /api/columns/:id`

## 4. REST API — Cards

- [x] 4.1 Create `src/routes/cards.ts` with `GET /api/columns/:columnId/cards` and `POST /api/columns/:columnId/cards`
- [x] 4.2 Add `PATCH /api/cards/:id` (title, description, and/or position within same column)
- [x] 4.3 Add `POST /api/cards/:id/move` (move card to a different column with optional position)
- [x] 4.4 Add `DELETE /api/cards/:id`

## 5. Server Wiring & Seed

- [x] 5.1 Update `index.ts` to use `Bun.serve()` with `routes` from all three route files plus the HTML entrypoint at `/`
- [x] 5.2 Add default board seed in `index.ts`: if no boards exist after `initDb()`, create "Kanban Board" with columns "To Do", "In Progress", "Done"
- [x] 5.3 Enable HMR with `development: { hmr: true, console: true }`

## 6. Frontend — Board View

- [x] 6.1 Create `frontend.tsx` entry point that mounts `<App />` on `#root` and fetches initial board data
- [x] 6.2 Create `src/components/Board.tsx` that renders a horizontal list of `<Column>` components
- [x] 6.3 Create `src/components/Column.tsx` that renders column name and a list of `<Card>` components
- [x] 6.4 Create `src/components/Card.tsx` that renders card title and description

## 7. Drag-and-Drop — Cards

- [x] 7.1 Make `<Card>` draggable (`draggable` attribute); set dragstart data to card id and source column id
- [x] 7.2 Make `<Column>` a drop target; handle dragover (prevent default) and `drop` to determine target position
- [x] 7.3 On drop within the same column, call `PATCH /api/cards/:id` with new position, then refresh board
- [x] 7.4 On drop to a different column, call `POST /api/cards/:id/move` with target column id and position, then refresh board

## 8. Drag-and-Drop — Columns

- [x] 8.1 Make `<Column>` header draggable; set dragstart data to column id
- [x] 8.2 Handle dragover and `drop` on `<Board>` to determine the target column position
- [x] 8.3 On drop, call `PATCH /api/columns/:id` with new position, then refresh board

## 9. Styling

- [x] 9.1 Add a minimal `index.css` with flex layout for the board, columns, and cards; include a visual drag-over highlight state

## 10. Smoke Test

- [x] 10.1 Run `bun --hot index.ts` and verify the board loads in the browser with the three default columns
- [x] 10.2 Drag a card between columns and verify it persists after page reload
- [x] 10.3 Drag a column to a new position and verify it persists after page reload
