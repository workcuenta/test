## ADDED Requirements

### Requirement: Board metrics endpoint
The system SHALL expose a `GET /api/boards/:id/metrics` endpoint that returns aggregated metrics for the specified board. The endpoint SHALL be auth-protected and scoped to the requesting user.

#### Scenario: Metrics for own board
- **WHEN** an authenticated user requests metrics for a board they own
- **THEN** the system returns a JSON object with: `boardId`, `columnCount`, `totalCards`, and `cardsByColumn` (array of `{ columnId, columnName, cardCount }` ordered by column position)

#### Scenario: Metrics for board owned by another user
- **WHEN** an authenticated user requests metrics for a board they do not own
- **THEN** the system SHALL return a 404 response

#### Scenario: Metrics for non-existent board
- **WHEN** an authenticated user requests metrics for a board id that does not exist
- **THEN** the system SHALL return a 404 response

#### Scenario: Unauthenticated metrics request
- **WHEN** a request is made to the metrics endpoint without a valid session
- **THEN** the system SHALL return a 401 response

#### Scenario: Board with no columns
- **WHEN** a board exists but has no columns
- **THEN** the endpoint returns `columnCount: 0`, `totalCards: 0`, and `cardsByColumn: []`

#### Scenario: Board with columns and no cards
- **WHEN** a board has columns but no cards in any column
- **THEN** the endpoint returns the correct `columnCount`, `totalCards: 0`, and each entry in `cardsByColumn` has `cardCount: 0`
