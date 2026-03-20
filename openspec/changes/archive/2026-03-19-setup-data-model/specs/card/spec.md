## ADDED Requirements

### Requirement: Card creation
The system SHALL allow creating a card within a column. Each card has a title, an optional description, and an integer position within its column.

#### Scenario: Create a card in a column
- **WHEN** a card is created with a valid column id and a non-empty title
- **THEN** the card is persisted at the last position in that column and returned with a generated id

#### Scenario: Reject card with empty title
- **WHEN** a card is created with an empty or whitespace-only title
- **THEN** the system SHALL throw an error and not persist the card

#### Scenario: Create card with optional description
- **WHEN** a card is created with a non-empty description
- **THEN** the description is persisted alongside the title

#### Scenario: Create card without description
- **WHEN** a card is created without a description
- **THEN** the description field is stored as null

### Requirement: Card retrieval
The system SHALL support retrieving all cards for a given column, ordered by position ascending.

#### Scenario: List cards for a column
- **WHEN** cards are requested for a valid column id
- **THEN** the system returns all cards belonging to that column ordered by position ascending

### Requirement: Card update
The system SHALL allow updating a card's title and/or description.

#### Scenario: Update card title
- **WHEN** an existing card id and a new non-empty title are provided
- **THEN** the card title is updated and the updated card is returned

#### Scenario: Update card description
- **WHEN** an existing card id and a new description (including null to clear) are provided
- **THEN** the card description is updated accordingly

### Requirement: Card reorder within column
The system SHALL allow changing the position of a card within its column.

#### Scenario: Move card to a new position in the same column
- **WHEN** a card is moved to a new position within its current column
- **THEN** the card's position is updated and sibling cards are shifted so positions remain contiguous and unique within the column

### Requirement: Card move between columns
The system SHALL allow moving a card to a different column, optionally at a specified position.

#### Scenario: Move card to another column
- **WHEN** a card is moved to a different column id
- **THEN** the card's column_id is updated, it is placed at the specified position (or appended last if no position given), and both source and destination columns have their positions normalized

### Requirement: Card deletion
The system SHALL allow deleting a card.

#### Scenario: Delete a card
- **WHEN** an existing card id is deleted
- **THEN** the card is removed and remaining cards in the same column have their positions normalized to remain contiguous
