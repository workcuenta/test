### Requirement: Login and registration page
The system SHALL display a login/register form when the user is not authenticated. The form SHALL allow switching between login and register modes.

#### Scenario: Unauthenticated user sees login page
- **WHEN** the app loads and the user has no valid session
- **THEN** the login/register form is displayed instead of the board view

#### Scenario: Authenticated user sees board
- **WHEN** the app loads and the user has a valid session
- **THEN** the board view is displayed and the login form is not shown

#### Scenario: Register new account
- **WHEN** the user submits the registration form with a valid username and password
- **THEN** the account is created, a session is established, and the board view is shown

#### Scenario: Login with existing account
- **WHEN** the user submits the login form with valid credentials
- **THEN** the session is established and the board view is shown

#### Scenario: Login with wrong credentials
- **WHEN** the user submits the login form with an incorrect password or unknown username
- **THEN** an error message is displayed and the user remains on the login page

### Requirement: Board view rendering
The system SHALL display the authenticated user's board as a horizontal list of columns, each containing its cards, fetched from the REST API on load. The header SHALL show the current username and a logout button.

#### Scenario: Board loads with columns and cards
- **WHEN** an authenticated user opens the app
- **THEN** the board view fetches and renders all of the user's columns and their cards in position order

#### Scenario: Board is empty
- **WHEN** no columns exist on the board
- **THEN** the board view displays an empty state message

#### Scenario: Logout
- **WHEN** the authenticated user clicks the logout button
- **THEN** the session is invalidated, the board view is hidden, and the login page is shown

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

### Requirement: Card label chips
Cards in the board view SHALL display their assigned labels as small colored pill chips above the card title.

#### Scenario: Card with labels shows chips
- **WHEN** a card has one or more labels assigned
- **THEN** each label is rendered as a colored pill chip (showing the label name) above the card title

#### Scenario: Card without labels shows no chips
- **WHEN** a card has no labels assigned
- **THEN** no label area is rendered on the card

### Requirement: Board filter bar
The board view SHALL include a filter bar in the board header containing a text search input and a label picker.

#### Scenario: Filter bar is visible when board is loaded
- **WHEN** the board view is rendered with at least one column
- **THEN** the filter bar is displayed with a text input and the board's labels available for selection

#### Scenario: No filters active shows all cards
- **WHEN** the text input is empty and no labels are selected
- **THEN** all cards in all columns are visible

### Requirement: Text search filter
The system SHALL filter cards client-side based on the text search input. Cards whose title and description do not contain the search text (case-insensitive) SHALL be hidden.

#### Scenario: Text matches card title
- **WHEN** the user types a search query that matches a card's title
- **THEN** that card remains visible and non-matching cards are hidden

#### Scenario: Text matches card description
- **WHEN** the user types a search query that matches a card's description
- **THEN** that card remains visible

#### Scenario: No cards match search
- **WHEN** the user types a search query that matches no cards in any column
- **THEN** all cards are hidden; columns remain visible (empty)

#### Scenario: Clearing search restores all cards
- **WHEN** the user clears the text input
- **THEN** all cards are shown again (subject to any active label filters)

### Requirement: Label filter
The system SHALL filter cards client-side based on selected labels. Only cards that have ALL selected labels SHALL be visible.

#### Scenario: Single label selected
- **WHEN** the user selects one label in the filter bar
- **THEN** only cards that have that label are visible

#### Scenario: Multiple labels selected (AND semantics)
- **WHEN** the user selects two or more labels
- **THEN** only cards that have all selected labels are visible

#### Scenario: Deselecting a label updates the filter
- **WHEN** the user deselects a previously selected label
- **THEN** the filter is updated and cards are re-evaluated

#### Scenario: Combined text and label filter
- **WHEN** both a text query and one or more labels are active
- **THEN** only cards matching both the text query AND all selected labels are visible

### Requirement: Board switcher
The system SHALL display a tab strip in the app header showing all boards belonging to the authenticated user. Clicking a tab SHALL switch the active board.

#### Scenario: Multiple boards shown as tabs
- **WHEN** the authenticated user has two or more boards
- **THEN** each board name is rendered as a clickable tab in the header tab strip

#### Scenario: Active board tab is highlighted
- **WHEN** a board is selected
- **THEN** its tab is visually distinguished from inactive tabs

#### Scenario: Switching boards updates the view
- **WHEN** the user clicks a board tab that is not currently active
- **THEN** the board view refreshes to show the columns and cards of the selected board

### Requirement: Board creation form
The system SHALL provide an inline form in the header for creating a new board. The form SHALL be revealed by clicking a "+" button in the tab strip.

#### Scenario: Clicking "+" reveals the creation form
- **WHEN** the user clicks the "+" button in the board tab strip
- **THEN** an inline input field and confirm/cancel controls appear in the header

#### Scenario: Submitting a valid name creates the board
- **WHEN** the user enters a non-empty board name and confirms
- **THEN** a POST request is sent to `/api/boards`, the new board is created, and the view switches to it

#### Scenario: Submitting an empty name is prevented
- **WHEN** the user submits the creation form with an empty or whitespace-only name
- **THEN** no API call is made and the form remains open

#### Scenario: Cancelling the form discards input
- **WHEN** the user clicks cancel or presses Escape while the form is open
- **THEN** the form closes and no board is created

#### Scenario: Duplicate submit is prevented
- **WHEN** the user submits the form and the API call is in progress
- **THEN** the submit button is disabled until the request completes

### Requirement: Empty board state prompt
The system SHALL display a centered board creation prompt when the authenticated user has no boards.

#### Scenario: No boards shows creation prompt
- **WHEN** the authenticated user has no boards
- **THEN** the main content area displays a prompt (e.g., "Create your first board") with a name input and a submit button

#### Scenario: Creating a board from the empty state prompt
- **WHEN** the user submits the empty state creation form with a valid name
- **THEN** the board is created and the board view is shown

### Requirement: Add card inline form
Each column SHALL display an "Add card" button at the bottom. Clicking it SHALL reveal an inline form with a title input and an optional description textarea. Submitting a valid title SHALL create the card via the API and refresh the column.

#### Scenario: "Add card" button is visible
- **WHEN** a column is rendered (with or without cards)
- **THEN** an "Add card" button is visible at the bottom of the column body

#### Scenario: Clicking "Add card" reveals the inline form
- **WHEN** the user clicks the "Add card" button
- **THEN** the button is replaced by an inline form containing a title input (auto-focused), an optional description textarea, a confirm button, and a cancel button

#### Scenario: Submitting a valid title creates the card
- **WHEN** the user enters a non-empty title and submits the form
- **THEN** a POST request is sent to `/api/columns/:columnId/cards`, the card is created, the form closes, and the board refreshes

#### Scenario: Submitting an empty title is prevented
- **WHEN** the user submits the card form with an empty or whitespace-only title
- **THEN** no API call is made and the form remains open

#### Scenario: Cancelling the card form closes it
- **WHEN** the user clicks Cancel or presses Escape while the card form is open
- **THEN** the form closes and no card is created

#### Scenario: Submit is disabled while in-flight
- **WHEN** the card form POST request is in progress
- **THEN** the confirm button is disabled until the request completes

### Requirement: Add column inline form
The board SHALL display an "Add column" button after the last column. Clicking it SHALL reveal an inline name input. Submitting a valid name SHALL create the column via the API and refresh the board.

#### Scenario: "Add column" button is visible
- **WHEN** the board is rendered (with or without columns)
- **THEN** an "Add column" button is visible after the last column (or as the only element if there are no columns)

#### Scenario: Clicking "Add column" reveals the inline form
- **WHEN** the user clicks the "Add column" button
- **THEN** an inline form appears with a column name input (auto-focused), a confirm button, and a cancel button

#### Scenario: Submitting a valid name creates the column
- **WHEN** the user enters a non-empty column name and submits
- **THEN** a POST request is sent to `/api/boards/:boardId/columns`, the column is created, the form closes, and the board refreshes

#### Scenario: Submitting an empty name is prevented
- **WHEN** the user submits the column form with an empty or whitespace-only name
- **THEN** no API call is made and the form remains open

#### Scenario: Cancelling the column form closes it
- **WHEN** the user clicks Cancel or presses Escape while the column form is open
- **THEN** the form closes and no column is created

#### Scenario: Submit is disabled while in-flight
- **WHEN** the column form POST request is in progress
- **THEN** the confirm button is disabled until the request completes
