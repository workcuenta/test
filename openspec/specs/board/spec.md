### Requirement: Board creation
The system SHALL allow creating a named board. A board is the top-level workspace containing columns.

#### Scenario: Create a board with a valid name
- **WHEN** a board is created with a non-empty name
- **THEN** the board is persisted and returned with a generated id and the provided name

#### Scenario: Reject empty board name
- **WHEN** a board is created with an empty or whitespace-only name
- **THEN** the system SHALL throw an error and not persist the board

### Requirement: Board retrieval
The system SHALL support retrieving a single board by id and listing boards belonging to the authenticated user.

#### Scenario: Get board by id
- **WHEN** a valid board id is provided and the board belongs to the requesting user
- **THEN** the system returns the matching board

#### Scenario: Get unknown board
- **WHEN** a board id that does not exist is provided
- **THEN** the system SHALL return null (not throw)

#### Scenario: Get board owned by another user
- **WHEN** a valid board id is provided but the board belongs to a different user
- **THEN** the system SHALL return null (treat as not found)

#### Scenario: List all boards
- **WHEN** boards are requested for a given user id
- **THEN** the system returns an array of boards belonging to that user, ordered by creation time ascending

### Requirement: Board update
The system SHALL allow renaming a board.

#### Scenario: Rename a board
- **WHEN** an existing board id and a new non-empty name are provided
- **THEN** the board name is updated and the updated board is returned

### Requirement: Board deletion
The system SHALL allow deleting a board and SHALL cascade-delete all its columns and cards.

#### Scenario: Delete a board
- **WHEN** an existing board id is deleted
- **THEN** the board, all its columns, and all their cards are removed from the database

### Requirement: Board ownership
Every board SHALL be associated with the user who created it. The system SHALL enforce that board operations (read, update, delete) are scoped to the owning user.

#### Scenario: Create board with owner
- **WHEN** a board is created with a non-empty name and a valid user id
- **THEN** the board is persisted with the provided user id and returned

#### Scenario: Board isolation between users
- **WHEN** user A requests the list of boards
- **THEN** the system returns only boards owned by user A, not boards owned by user B
