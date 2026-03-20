## ADDED Requirements

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
