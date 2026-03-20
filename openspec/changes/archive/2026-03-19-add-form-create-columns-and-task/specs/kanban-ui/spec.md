## ADDED Requirements

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
