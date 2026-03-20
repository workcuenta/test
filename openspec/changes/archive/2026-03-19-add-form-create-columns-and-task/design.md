## Context

The board currently renders columns and cards fetched from the API but provides no creation UI. The REST API already exposes `POST /api/boards/:boardId/columns` and `POST /api/columns/:columnId/cards`. This change adds inline creation forms to `Column.tsx` and `Board.tsx` — no backend work needed.

## Goals / Non-Goals

**Goals:**
- "Add card" inline form at the bottom of every column (title required, description optional)
- "Add column" inline form appended after the last column in the board
- Both forms: non-empty validation, in-flight disable, cancel/Escape closes, auto-focus on open
- Board refreshes after successful creation

**Non-Goals:**
- Card or column editing/deletion UI (separate change)
- Rich text or markdown in card descriptions
- Keyboard navigation between columns/cards

## Decisions

### Inline forms, not modals

**Decision**: Reveal a small form in-place (bottom of column / end of board) rather than opening a modal.

**Rationale**: Consistent with Trello conventions; requires no focus-trap logic; feels lightweight for a single-field (column) or two-field (card) form.

**Alternatives considered**: Modal dialog — heavier, disproportionate to the input complexity.

### Local `isAdding` state per column / board component

**Decision**: Each `Column` owns `isAddingCard: boolean`. `Board` owns `isAddingColumn: boolean`. State is not lifted to `App`.

**Rationale**: Forms are independent per-column. Lifting to `App` would add unnecessary prop drilling and coupling. Closing one form doesn't affect others.

### `onRefresh` prop triggers full board reload

**Decision**: After successful POST, call the existing `onRefresh()` prop rather than performing local optimistic updates.

**Rationale**: The app already follows a server-authoritative pattern (refresh after every drag). Keeping this consistent avoids divergence between local and server state.

### Card description is optional (textarea, not input)

**Decision**: Use a `<textarea>` for description, pre-collapsed and optional. Title uses a single-line `<input>`.

**Rationale**: Descriptions can be multi-line. Making it optional avoids forcing users to fill it for quick task capture.

## Risks / Trade-offs

- **Column width constraint**: The inline card form must fit within the 272 px column width — use full-width inputs.
- **No optimistic update**: After creation, the user sees a brief re-fetch. Acceptable given the app's existing pattern.
- **Escape key conflict with drag**: No conflict — forms are not open during drag operations.
