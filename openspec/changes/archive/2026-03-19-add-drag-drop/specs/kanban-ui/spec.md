## ADDED Requirements

### Requirement: Board view rendering
The system SHALL display the active board as a horizontal list of columns, each containing its cards, fetched from the REST API on load.

#### Scenario: Board loads with columns and cards
- **WHEN** the user opens the app
- **THEN** the board view fetches and renders all columns and their cards in position order

#### Scenario: Board is empty
- **WHEN** no columns exist on the board
- **THEN** the board view displays an empty state message

### Requirement: Default board seed
The system SHALL create a default board with columns "To Do", "In Progress", and "Done" if no boards exist at startup.

#### Scenario: First startup with no boards
- **WHEN** the application starts and the boards table is empty
- **THEN** a default board named "Kanban Board" is created with three columns in order: "To Do", "In Progress", "Done"

#### Scenario: Subsequent startups
- **WHEN** the application starts and at least one board already exists
- **THEN** no seed data is created

### Requirement: Card drag-and-drop within a column
The system SHALL allow users to drag a card to a new position within the same column.

#### Scenario: Card dropped at a new position in the same column
- **WHEN** the user drags a card and drops it at a different position within the same column
- **THEN** the card moves to that position, sibling cards shift accordingly, and the change persists via API

#### Scenario: Card dropped on its original position
- **WHEN** the user drags a card and drops it at its current position
- **THEN** no API call is made and the board remains unchanged

### Requirement: Card drag-and-drop across columns
The system SHALL allow users to drag a card from one column and drop it into a different column.

#### Scenario: Card dropped into another column
- **WHEN** the user drags a card and drops it onto a different column
- **THEN** the card moves to that column at the drop position, and the change persists via API

#### Scenario: Card dropped at end of another column
- **WHEN** the user drops a card onto a column below its last card
- **THEN** the card is appended at the last position in the target column

### Requirement: Column drag-and-drop
The system SHALL allow users to drag a column to a new position within the board.

#### Scenario: Column dropped at a new position
- **WHEN** the user drags a column header and drops it at a different position
- **THEN** the column moves to that position, sibling columns shift accordingly, and the change persists via API

#### Scenario: Column dropped on its original position
- **WHEN** the user drags a column and drops it at its current position
- **THEN** no API call is made and the board remains unchanged

### Requirement: Board refresh after drag
The system SHALL refresh the board state from the API after every successful drag-and-drop operation.

#### Scenario: Successful drag-and-drop persisted
- **WHEN** a drag-and-drop operation completes and the API call succeeds
- **THEN** the board re-fetches and re-renders to reflect the persisted state

#### Scenario: API call fails during drag
- **WHEN** a drag-and-drop operation triggers an API call that returns an error
- **THEN** the error is logged to the console and the board re-fetches to show the actual server state
