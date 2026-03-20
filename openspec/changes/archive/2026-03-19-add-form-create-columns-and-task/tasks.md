## 1. Add Card Form — Column Component

- [x] 1.1 Add `isAddingCard: boolean` state to `src/components/Column.tsx`
- [x] 1.2 Render an "Add card" button at the bottom of `.column-body` when `isAddingCard` is false
- [x] 1.3 When `isAddingCard` is true, render an inline form with: auto-focused title `<input>`, optional description `<textarea>`, "Add card" confirm button (disabled when title empty or submitting), and "Cancel" button
- [x] 1.4 Handle Escape key on the form inputs to close the form (set `isAddingCard = false`)
- [x] 1.5 Implement `handleAddCard`: validate non-empty title, POST to `/api/columns/:columnId/cards` with `{ title, description }`, call `onRefresh()`, close form; disable submit while in-flight

## 2. Add Column Form — Board Component

- [x] 2.1 Add `isAddingColumn: boolean` and `boardId: number | undefined` props awareness to `src/components/Board.tsx` — accept `boardId` as a new prop from `frontend.tsx`
- [x] 2.2 Render an "Add column" button after the last column (always visible, even when columns is empty — replace or supplement the existing empty state message)
- [x] 2.3 When `isAddingColumn` is true, replace the "Add column" button with an inline form: auto-focused name `<input>`, confirm button (disabled when name empty or submitting), and "Cancel" button
- [x] 2.4 Handle Escape key on the column name input to close the form
- [x] 2.5 Implement `handleAddColumn`: validate non-empty name, POST to `/api/boards/:boardId/columns` with `{ name }`, call `onRefresh()`, close form; disable submit while in-flight
- [x] 2.6 Update `frontend.tsx` to pass `boardId={state.activeBoardId ?? undefined}` to `<BoardComponent>`

## 3. Styles

- [x] 3.1 Add `.add-card-btn` style to `index.css`: full-width, muted text, light hover background, no border
- [x] 3.2 Add `.add-card-form` style: padding inside column body, flex column, gap
- [x] 3.3 Add `.add-card-input` and `.add-card-textarea` styles: full-width, border, border-radius, padding, font-size matching card text
- [x] 3.4 Add `.add-card-actions` styles: flex row, gap, confirm and cancel buttons
- [x] 3.5 Add `.add-column-btn` style: fixed-width card-like container, dashed border, muted text, cursor pointer
- [x] 3.6 Add `.add-column-form` style: same fixed-width container as a column, flex column, gap, padding

## 4. Smoke Test

- [x] 4.1 Click "Add card" in a column, type a title, confirm — card appears in the column
- [x] 4.2 Click "Add card", leave title empty, confirm — no card created, form stays open
- [x] 4.3 Click "Add card", then press Escape — form closes, no card created
- [x] 4.4 Click "Add column", type a name, confirm — new column appears at the right of the board
- [x] 4.5 Click "Add column", press Escape — form closes, no column created
