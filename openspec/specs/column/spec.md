### Requirement: Column creation
The system SHALL allow creating a named column within a board. Each column has an integer position that determines its display order within the board.

#### Scenario: Create a column in a board
- **WHEN** a column is created with a valid board id and a non-empty name
- **THEN** the column is persisted with a position one greater than the current maximum position in that board (appended last)

#### Scenario: Reject column with empty name
- **WHEN** a column is created with an empty or whitespace-only name
- **THEN** the system SHALL throw an error and not persist the column

#### Scenario: Reject column for unknown board
- **WHEN** a column is created referencing a board id that does not exist
- **THEN** the system SHALL throw an error

### Requirement: Column retrieval
The system SHALL support retrieving all columns for a given board, ordered by position ascending.

#### Scenario: List columns for a board
- **WHEN** columns are requested for a valid board id
- **THEN** the system returns all columns belonging to that board ordered by position ascending

### Requirement: Column update
The system SHALL allow renaming a column.

#### Scenario: Rename a column
- **WHEN** an existing column id and a new non-empty name are provided
- **THEN** the column name is updated and the updated column is returned

### Requirement: Column reorder
The system SHALL allow changing the position of a column within its board. Affected siblings SHALL have their positions updated atomically.

#### Scenario: Move column to a new position
- **WHEN** a column is moved to a new integer position within its board
- **THEN** the column's position is updated and sibling columns are shifted so positions remain contiguous and unique within the board

### Requirement: Column deletion
The system SHALL allow deleting a column and SHALL cascade-delete all its cards.

#### Scenario: Delete a column
- **WHEN** an existing column id is deleted
- **THEN** the column and all its cards are removed; remaining sibling columns have their positions normalized to remain contiguous
