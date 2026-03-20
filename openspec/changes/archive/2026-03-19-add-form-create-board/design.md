## Context

The app currently fetches `GET /api/boards` on load and displays only the first board. There is no UI to create additional boards or switch between existing ones. The backend already supports full board CRUD (`POST /api/boards`, `GET /api/boards`, etc.) — this is a pure frontend change.

## Goals / Non-Goals

**Goals:**
- Board switcher in the header: dropdown or tab strip showing all user boards, clickable to switch
- "New Board" button that reveals an inline name input and a submit button
- After creation, automatically switch to the new board
- Empty state prompt — when the user has no boards, show a centered creation form instead of blank space

**Non-Goals:**
- Board rename or delete from the UI (existing API supports it, but out of scope here)
- Persistent last-selected board across page reloads
- Multi-board views or side-by-side comparison

## Decisions

### Board switcher as a header tab strip (not a sidebar or dropdown)

**Decision**: Render board names as clickable tabs in the header, between the title and the user controls. A "+" tab opens the creation form inline.

**Rationale**: The app has a single-level navigation hierarchy (board → columns → cards). A tab strip is immediately discoverable, requires no extra click to open, and fits naturally in the existing header layout. A sidebar would consume too much horizontal space given the column-heavy board view.

**Alternatives considered**: Dropdown select — less discoverable, requires an extra click, and doesn't preview all available boards at a glance.

### Inline creation form (not a modal)

**Decision**: Clicking "+" replaces the tab strip area with a small inline input + confirm/cancel buttons, all within the header.

**Rationale**: A modal adds complexity (focus trapping, backdrop, keyboard handling) for a single text field. The inline approach is simpler and consistent with how column/card creation works in similar Kanban tools.

**Alternatives considered**: Modal dialog — more isolated UX but heavier implementation; not warranted for a single field.

### Active board stored in React state (not URL)

**Decision**: Track the selected board via `useState` in `App`. No routing library or URL sync.

**Rationale**: The app has no router today. Adding URL-based board selection would require introducing React Router or manual `history.pushState` — too large a scope for this change. State-based selection resets on reload, which is acceptable per Non-Goals.

**Alternatives considered**: URL param `?boardId=X` — desirable long-term but out of scope here.

### `refresh()` fetches columns/cards for the active board only

**Decision**: Extend `refresh()` to accept an optional `boardId` parameter. When a board is switched or created, call `refresh(newBoardId)`.

**Rationale**: Fetching all boards' data would be wasteful. The existing pattern of fetching one board's columns and cards at a time is correct.

## Risks / Trade-offs

- **Tab strip overflows on many boards** → Acceptable for now; tabs wrap or scroll via CSS `overflow-x: auto`. A dropdown could be added later.
- **No optimistic update on board creation** → The form submits, waits for `POST /api/boards`, then calls `refresh()`. A brief loading state is shown on the "+" button to prevent double-submits.
- **State reset on reload** → User must remember or re-select the active board each session. Documented as a Non-Goal.
