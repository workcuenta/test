## Context

The data layer (`src/db/`) is complete with full CRUD, reorder, and move operations for boards, columns, and cards. The app has no frontend or API layer — `index.ts` only initializes the database. This change adds both the REST API and the interactive frontend in one pass.

## Goals / Non-Goals

**Goals:**
- Serve a React frontend via `Bun.serve()` using HTML imports (no Vite, no separate build step)
- Expose REST API routes for all board/column/card operations
- Render the active board's columns and cards
- Support drag-and-drop for cards (within-column reorder and cross-column move)
- Support drag-and-drop for columns (reorder within the board)
- Persist all drag results immediately via API calls

**Non-Goals:**
- Multi-board navigation / board switcher (use the first board for now)
- Optimistic UI updates or rollback on error
- Animations or polished visual design
- Touch drag support (HTML5 DnD is desktop-only)
- Authentication or multi-user support

## Decisions

### Bun.serve() with HTML imports (no Vite)

**Decision**: Serve `index.html` directly from `Bun.serve()` routes; import `frontend.tsx` as a `<script type="module">` tag.

**Rationale**: CLAUDE.md explicitly requires this pattern. Bun's bundler handles TSX transpilation and hot reload automatically with `development: { hmr: true }`.

**Alternatives considered**: Vite — prohibited by CLAUDE.md.

### HTML5 Drag and Drop API (no DnD library)

**Decision**: Use native `draggable`, `ondragstart`, `ondragover`, `ondrop` events.

**Rationale**: No external dependency needed for a straightforward kanban board. The data model already has all the reorder/move primitives. A library like `dnd-kit` adds ~30 kB and complexity for a feature the browser supports natively.

**Alternatives considered**: `dnd-kit` — good API but unnecessary here; `react-beautiful-dnd` — unmaintained.

### REST API file layout

```
src/routes/
  boards.ts    # GET /api/boards, POST /api/boards, GET/PATCH/DELETE /api/boards/:id
  columns.ts   # GET /api/boards/:id/columns, POST, PATCH/DELETE/PATCH(reorder) /api/columns/:id
  cards.ts     # GET /api/columns/:id/cards, POST, PATCH/DELETE /api/cards/:id, POST /api/cards/:id/move
```

Routes are registered directly in `index.ts` via `Bun.serve({ routes: { ... } })`.

### Frontend component structure

```
frontend.tsx        # entry point, renders <App />
components/
  Board.tsx         # renders column list, handles column DnD
  Column.tsx        # renders card list, handles card DnD within column
  Card.tsx          # draggable card item
```

State is local React state (no external store). Each drag-end event fires a `fetch()` to the API and then refreshes data.

### Initial board auto-seed

**Decision**: On startup, if no boards exist, create a default board with three columns ("To Do", "In Progress", "Done").

**Rationale**: Provides an immediately usable state without requiring the user to set up data manually.

## Risks / Trade-offs

- **HTML5 DnD has poor mobile support** → Acceptable: this is a local desktop tool.
- **Full data refresh after every drop** → Simple and correct; latency is negligible for a local SQLite app.
- **Single-board view** → Acceptable for the current scope; board selection can be added later.
- **No error handling for failed API calls** → Log to console and refresh; sufficient for a local app.
