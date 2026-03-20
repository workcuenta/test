## ADDED Requirements

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

## MODIFIED Requirements

### Requirement: Card endpoints
The system SHALL expose REST endpoints for card operations. Card list responses SHALL include each card's assigned labels.

#### Scenario: List cards for a column
- **WHEN** a GET request is sent to `/api/columns/:columnId/cards`
- **THEN** the system returns 200 with cards ordered by position ascending; each card object includes a `labels` array containing `{ id, name, color }` for each assigned label

#### Scenario: Create a card
- **WHEN** a POST request is sent to `/api/columns/:columnId/cards` with `{ "title": "<non-empty string>", "description": "<optional string>" }`
- **THEN** the system returns 201 with the created card appended at the last position; the `labels` array is empty

#### Scenario: Update a card
- **WHEN** a PATCH request is sent to `/api/cards/:id` with any combination of `{ "title", "description" }`
- **THEN** the system returns 200 with the updated card including its current labels

#### Scenario: Move a card
- **WHEN** a POST request is sent to `/api/cards/:id/move` with `{ "columnId": <number>, "position": <optional number> }`
- **THEN** the system moves the card to the target column at the specified position (or last if omitted) and returns 200 with the updated card including its labels

#### Scenario: Reorder a card within its column
- **WHEN** a PATCH request is sent to `/api/cards/:id` with `{ "position": <number> }` and no `columnId` change
- **THEN** the system reorders the card within its current column and returns 200

#### Scenario: Delete a card
- **WHEN** a DELETE request is sent to `/api/cards/:id`
- **THEN** the system returns 204 and the card is removed
