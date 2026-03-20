### Requirement: Label creation
The system SHALL allow creating a named, colored label scoped to a board. The color SHALL be a valid CSS hex string (e.g. `#ef4444`).

#### Scenario: Create a label with valid inputs
- **WHEN** a label is created with a non-empty name, a valid hex color, and a valid board id
- **THEN** the label is persisted and returned with a generated id

#### Scenario: Reject label with empty name
- **WHEN** a label is created with an empty or whitespace-only name
- **THEN** the system SHALL throw an error and not persist the label

#### Scenario: Reject label with invalid color
- **WHEN** a label is created with a color that is not a valid CSS hex string
- **THEN** the system SHALL throw an error and not persist the label

### Requirement: Label retrieval
The system SHALL support listing all labels for a given board.

#### Scenario: List labels for a board
- **WHEN** labels are requested for a valid board id
- **THEN** the system returns all labels belonging to that board ordered by creation time ascending

### Requirement: Label update
The system SHALL allow updating a label's name and/or color.

#### Scenario: Update label name
- **WHEN** an existing label id and a new non-empty name are provided
- **THEN** the label name is updated and the updated label is returned

#### Scenario: Update label color
- **WHEN** an existing label id and a valid new hex color are provided
- **THEN** the label color is updated and the updated label is returned

### Requirement: Label deletion
The system SHALL allow deleting a label. Deleting a label SHALL remove it from all cards that have it assigned.

#### Scenario: Delete a label
- **WHEN** an existing label id is deleted
- **THEN** the label is removed and all card-label associations for that label are removed

### Requirement: Card label assignment
The system SHALL allow attaching and detaching labels to/from cards. A card MAY have zero or more labels.

#### Scenario: Attach a label to a card
- **WHEN** a valid label id is attached to a valid card id
- **THEN** the association is persisted; the label appears in the card's label list

#### Scenario: Attach already-assigned label (idempotent)
- **WHEN** a label that is already attached to a card is attached again
- **THEN** the system succeeds without creating a duplicate association

#### Scenario: Detach a label from a card
- **WHEN** an existing card-label association is removed
- **THEN** the label no longer appears in the card's label list

#### Scenario: Card labels returned with card data
- **WHEN** cards are listed for a column
- **THEN** each card includes an array of its assigned labels (id, name, color)
