### Requirement: Board endpoints
The system SHALL expose REST endpoints for board operations under `/api/boards`. All board endpoints SHALL require an authenticated session.

#### Scenario: List all boards
- **WHEN** an authenticated GET request is sent to `/api/boards`
- **THEN** the system returns 200 with a JSON array of boards belonging to the authenticated user, ordered by creation time

#### Scenario: Create a board
- **WHEN** an authenticated POST request is sent to `/api/boards` with `{ "name": "<non-empty string>" }`
- **THEN** the system returns 201 with the created board object associated with the authenticated user

#### Scenario: Create board with empty name
- **WHEN** an authenticated POST request is sent to `/api/boards` with an empty or missing name
- **THEN** the system returns 400 with an error message

#### Scenario: Get a board by id
- **WHEN** an authenticated GET request is sent to `/api/boards/:id`
- **THEN** the system returns 200 with the matching board if it belongs to the authenticated user, or 404 if not found or not owned by the user

#### Scenario: Update a board
- **WHEN** an authenticated PATCH request is sent to `/api/boards/:id` with `{ "name": "<non-empty string>" }`
- **THEN** the system returns 200 with the updated board if owned by the authenticated user, or 404 otherwise

#### Scenario: Delete a board
- **WHEN** an authenticated DELETE request is sent to `/api/boards/:id`
- **THEN** the system returns 204 and removes the board (and its columns and cards) if owned by the authenticated user, or 404 otherwise

#### Scenario: Unauthenticated request to any board endpoint
- **WHEN** a request is sent to any `/api/boards/*` endpoint without a valid session cookie
- **THEN** the system returns 401

### Requirement: Column endpoints
The system SHALL expose REST endpoints for column operations. All column endpoints SHALL require an authenticated session.

#### Scenario: List columns for a board
- **WHEN** an authenticated GET request is sent to `/api/boards/:boardId/columns`
- **THEN** the system returns 200 with columns ordered by position ascending

#### Scenario: Create a column
- **WHEN** an authenticated POST request is sent to `/api/boards/:boardId/columns` with `{ "name": "<non-empty string>" }`
- **THEN** the system returns 201 with the created column appended at the last position

#### Scenario: Update a column
- **WHEN** an authenticated PATCH request is sent to `/api/columns/:id` with `{ "name": "<string>" }` and/or `{ "position": <number> }`
- **THEN** the system updates the name and/or reorders the column and returns 200 with the updated column

#### Scenario: Delete a column
- **WHEN** an authenticated DELETE request is sent to `/api/columns/:id`
- **THEN** the system returns 204 and the column along with its cards is removed

#### Scenario: Unauthenticated request to any column endpoint
- **WHEN** a request is sent to any `/api/columns/*` or `/api/boards/:id/columns` endpoint without a valid session cookie
- **THEN** the system returns 401

### Requirement: Card endpoints
The system SHALL expose REST endpoints for card operations. All card endpoints SHALL require an authenticated session. Card list responses SHALL include each card's assigned labels.

#### Scenario: List cards for a column
- **WHEN** an authenticated GET request is sent to `/api/columns/:columnId/cards`
- **THEN** the system returns 200 with cards ordered by position ascending; each card object includes a `labels` array containing `{ id, name, color }` for each assigned label

#### Scenario: Create a card
- **WHEN** an authenticated POST request is sent to `/api/columns/:columnId/cards` with `{ "title": "<non-empty string>", "description": "<optional string>" }`
- **THEN** the system returns 201 with the created card appended at the last position; the `labels` array is empty

#### Scenario: Update a card
- **WHEN** an authenticated PATCH request is sent to `/api/cards/:id` with any combination of `{ "title", "description" }`
- **THEN** the system returns 200 with the updated card including its current labels

#### Scenario: Move a card
- **WHEN** an authenticated POST request is sent to `/api/cards/:id/move` with `{ "columnId": <number>, "position": <optional number> }`
- **THEN** the system moves the card to the target column at the specified position (or last if omitted) and returns 200 with the updated card including its labels

#### Scenario: Reorder a card within its column
- **WHEN** an authenticated PATCH request is sent to `/api/cards/:id` with `{ "position": <number> }` and no `columnId` change
- **THEN** the system reorders the card within its current column and returns 200

#### Scenario: Delete a card
- **WHEN** an authenticated DELETE request is sent to `/api/cards/:id`
- **THEN** the system returns 204 and the card is removed

#### Scenario: Unauthenticated request to any card endpoint
- **WHEN** a request is sent to any `/api/cards/*` or `/api/columns/:id/cards` endpoint without a valid session cookie
- **THEN** the system returns 401

### Requirement: Label endpoints
The system SHALL expose REST endpoints for label CRUD scoped to a board.

#### Scenario: List labels for a board
- **WHEN** a GET request is sent to `/api/boards/:boardId/labels`
- **THEN** the system returns 200 with all labels for that board ordered by creation time

#### Scenario: Create a label
- **WHEN** a POST request is sent to `/api/boards/:boardId/labels` with `{ "name": "<non-empty string>", "color": "<hex string>" }`
- **THEN** the system returns 201 with the created label

#### Scenario: Create label with invalid inputs
- **WHEN** a POST request is sent to `/api/boards/:boardId/labels` with an empty name or invalid hex color
- **THEN** the system returns 400 with an error message

#### Scenario: Update a label
- **WHEN** a PATCH request is sent to `/api/labels/:id` with `{ "name"?: string, "color"?: string }`
- **THEN** the system returns 200 with the updated label

#### Scenario: Delete a label
- **WHEN** a DELETE request is sent to `/api/labels/:id`
- **THEN** the system returns 204 and the label is removed from all cards

### Requirement: Card label assignment endpoints
The system SHALL expose REST endpoints to attach and detach labels on cards.

#### Scenario: Get labels for a card
- **WHEN** a GET request is sent to `/api/cards/:id/labels`
- **THEN** the system returns 200 with the array of labels assigned to that card

#### Scenario: Attach a label to a card
- **WHEN** a POST request is sent to `/api/cards/:cardId/labels/:labelId`
- **THEN** the system returns 204 and the label is attached to the card (idempotent)

#### Scenario: Detach a label from a card
- **WHEN** a DELETE request is sent to `/api/cards/:cardId/labels/:labelId`
- **THEN** the system returns 204 and the label is removed from the card

### Requirement: Auth endpoints
The system SHALL expose `/api/auth/*` endpoints for registration, login, logout, and current user. These endpoints SHALL NOT require an existing session (except `/api/auth/logout` and `/api/auth/me`).

#### Scenario: Auth routes are accessible without session
- **WHEN** a POST request is sent to `/api/auth/register` or `/api/auth/login` without a session cookie
- **THEN** the system processes the request normally (does not return 401)
