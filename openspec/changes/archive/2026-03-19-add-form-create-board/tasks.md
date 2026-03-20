## 1. State & Data Model

- [x] 1.1 Add `boards: Board[]` and `activeBoardId: number | null` to `AppState` in `frontend.tsx`
- [x] 1.2 Update `refresh(boardId?)` to accept an optional board id; use it to fetch columns and cards for the selected board instead of always using `boards[0]`

## 2. Board Switcher — Tab Strip

- [x] 2.1 Create `src/components/BoardSwitcher.tsx` with a tab strip that renders one tab per board, highlights the active one, and calls `onSelect(board.id)` on click
- [x] 2.2 Add a "+" tab button to `BoardSwitcher` that calls `onCreateClick()` to open the creation form
- [x] 2.3 Render `<BoardSwitcher>` in the `<header>` of `App` (between the title and the user controls) when the user is authenticated
- [x] 2.4 Wire `onSelect` to update `activeBoardId` and call `refresh(boardId)` in `App`

## 3. Inline Board Creation Form

- [x] 3.1 Add `isCreating: boolean` state to `App`; show the inline form inside `BoardSwitcher` (or alongside it) when `isCreating` is true
- [x] 3.2 Implement the inline form: controlled input, Confirm button (calls `handleCreateBoard`), Cancel button (sets `isCreating = false`), Escape key closes the form
- [x] 3.3 Implement `handleCreateBoard(name)` in `App`: validate non-empty name, POST to `/api/boards`, set `activeBoardId` to the new board id, call `refresh()`, close the form; disable submit while in-flight
- [x] 3.4 Prevent submission if name is empty or whitespace-only (keep form open, no API call)

## 4. Empty State Prompt

- [x] 4.1 When `boards.length === 0` (and not loading), render a centered `<BoardCreatePrompt>` component (or inline JSX) in `<main>` instead of `<BoardComponent>`
- [x] 4.2 `BoardCreatePrompt` has a heading ("Create your first board"), a text input, and a submit button; on submit it calls `handleCreateBoard(name)` in `App`

## 5. Styles

- [x] 5.1 Add `.board-tabs` styles to `index.css`: flex row, gap, overflow-x auto
- [x] 5.2 Add `.board-tab` and `.board-tab.active` styles: pill shape, active highlighted with solid background
- [x] 5.3 Add `.board-tab-add` style for the "+" button: muted, bordered
- [x] 5.4 Add `.board-create-inline` styles for the inline form: flex row with input and two small buttons
- [x] 5.5 Add `.board-create-prompt` styles for the empty state: centered flex column, large heading, max-width input

## 6. Smoke Test

- [x] 6.1 Open the app as a logged-in user with no boards — confirm the empty state prompt appears
- [x] 6.2 Create a board from the prompt — confirm it appears as the active tab and its (empty) board view is shown
- [x] 6.3 Click "+" and create a second board — confirm both tabs appear and the new board is active
- [x] 6.4 Click the first board tab — confirm the view switches to the first board's content
- [x] 6.5 Click "+" and press Escape (or Cancel) — confirm no board is created and the form closes
