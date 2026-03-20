## ADDED Requirements

### Requirement: Board creation
The system SHALL allow creating a named board. A board is the top-level workspace containing columns.

#### Scenario: Create a board with a valid name
- **WHEN** a board is created with a non-empty name
- **THEN** the board is persisted and returned with a generated id and the provided name

#### Scenario: Reject empty board name
- **WHEN** a board is created with an empty or whitespace-only name
- **THEN** the system SHALL throw an error and not persist the board

### Requirement: Board retrieval
The system SHALL support retrieving a single board by id and listing all boards.

#### Scenario: Get board by id
- **WHEN** a valid board id is provided
- **THEN** the system returns the matching board

#### Scenario: Get unknown board
- **WHEN** a board id that does not exist is provided
- **THEN** the system SHALL return null (not throw)

#### Scenario: List all boards
- **WHEN** all boards are requested
- **THEN** the system returns an array of all persisted boards ordered by creation time ascending

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
