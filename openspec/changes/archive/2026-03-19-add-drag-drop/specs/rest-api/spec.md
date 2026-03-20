## ADDED Requirements

### Requirement: Board endpoints
The system SHALL expose REST endpoints for board operations under `/api/boards`.

#### Scenario: List all boards
- **WHEN** a GET request is sent to `/api/boards`
- **THEN** the system returns 200 with a JSON array of all boards ordered by creation time

#### Scenario: Create a board
- **WHEN** a POST request is sent to `/api/boards` with `{ "name": "<non-empty string>" }`
- **THEN** the system returns 201 with the created board object

#### Scenario: Create board with empty name
- **WHEN** a POST request is sent to `/api/boards` with an empty or missing name
- **THEN** the system returns 400 with an error message

#### Scenario: Get a board by id
- **WHEN** a GET request is sent to `/api/boards/:id`
- **THEN** the system returns 200 with the matching board, or 404 if not found

#### Scenario: Update a board
- **WHEN** a PATCH request is sent to `/api/boards/:id` with `{ "name": "<non-empty string>" }`
- **THEN** the system returns 200 with the updated board

#### Scenario: Delete a board
- **WHEN** a DELETE request is sent to `/api/boards/:id`
- **THEN** the system returns 204 and the board (along with its columns and cards) is removed

### Requirement: Column endpoints
The system SHALL expose REST endpoints for column operations.

#### Scenario: List columns for a board
- **WHEN** a GET request is sent to `/api/boards/:boardId/columns`
- **THEN** the system returns 200 with columns ordered by position ascending

#### Scenario: Create a column
- **WHEN** a POST request is sent to `/api/boards/:boardId/columns` with `{ "name": "<non-empty string>" }`
- **THEN** the system returns 201 with the created column appended at the last position

#### Scenario: Update a column
- **WHEN** a PATCH request is sent to `/api/columns/:id` with `{ "name": "<string>" }` and/or `{ "position": <number> }`
- **THEN** the system updates the name and/or reorders the column and returns 200 with the updated column

#### Scenario: Delete a column
- **WHEN** a DELETE request is sent to `/api/columns/:id`
- **THEN** the system returns 204 and the column along with its cards is removed

### Requirement: Card endpoints
The system SHALL expose REST endpoints for card operations.

#### Scenario: List cards for a column
- **WHEN** a GET request is sent to `/api/columns/:columnId/cards`
- **THEN** the system returns 200 with cards ordered by position ascending

#### Scenario: Create a card
- **WHEN** a POST request is sent to `/api/columns/:columnId/cards` with `{ "title": "<non-empty string>", "description": "<optional string>" }`
- **THEN** the system returns 201 with the created card appended at the last position

#### Scenario: Update a card
- **WHEN** a PATCH request is sent to `/api/cards/:id` with any combination of `{ "title", "description" }`
- **THEN** the system returns 200 with the updated card

#### Scenario: Move a card
- **WHEN** a POST request is sent to `/api/cards/:id/move` with `{ "columnId": <number>, "position": <optional number> }`
- **THEN** the system moves the card to the target column at the specified position (or last if omitted) and returns 200 with the updated card

#### Scenario: Reorder a card within its column
- **WHEN** a PATCH request is sent to `/api/cards/:id` with `{ "position": <number> }` and no `columnId` change
- **THEN** the system reorders the card within its current column and returns 200

#### Scenario: Delete a card
- **WHEN** a DELETE request is sent to `/api/cards/:id`
- **THEN** the system returns 204 and the card is removed
