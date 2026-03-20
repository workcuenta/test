## ADDED Requirements

### Requirement: Card label chips
Cards in the board view SHALL display their assigned labels as small colored pill chips above the card title.

#### Scenario: Card with labels shows chips
- **WHEN** a card has one or more labels assigned
- **THEN** each label is rendered as a colored pill chip (showing the label name) above the card title

#### Scenario: Card without labels shows no chips
- **WHEN** a card has no labels assigned
- **THEN** no label area is rendered on the card

### Requirement: Board filter bar
The board view SHALL include a filter bar in the board header containing a text search input and a label picker.

#### Scenario: Filter bar is visible when board is loaded
- **WHEN** the board view is rendered with at least one column
- **THEN** the filter bar is displayed with a text input and the board's labels available for selection

#### Scenario: No filters active shows all cards
- **WHEN** the text input is empty and no labels are selected
- **THEN** all cards in all columns are visible

### Requirement: Text search filter
The system SHALL filter cards client-side based on the text search input. Cards whose title and description do not contain the search text (case-insensitive) SHALL be hidden.

#### Scenario: Text matches card title
- **WHEN** the user types a search query that matches a card's title
- **THEN** that card remains visible and non-matching cards are hidden

#### Scenario: Text matches card description
- **WHEN** the user types a search query that matches a card's description
- **THEN** that card remains visible

#### Scenario: No cards match search
- **WHEN** the user types a search query that matches no cards in any column
- **THEN** all cards are hidden; columns remain visible (empty)

#### Scenario: Clearing search restores all cards
- **WHEN** the user clears the text input
- **THEN** all cards are shown again (subject to any active label filters)

### Requirement: Label filter
The system SHALL filter cards client-side based on selected labels. Only cards that have ALL selected labels SHALL be visible.

#### Scenario: Single label selected
- **WHEN** the user selects one label in the filter bar
- **THEN** only cards that have that label are visible

#### Scenario: Multiple labels selected (AND semantics)
- **WHEN** the user selects two or more labels
- **THEN** only cards that have all selected labels are visible

#### Scenario: Deselecting a label updates the filter
- **WHEN** the user deselects a previously selected label
- **THEN** the filter is updated and cards are re-evaluated

#### Scenario: Combined text and label filter
- **WHEN** both a text query and one or more labels are active
- **THEN** only cards matching both the text query AND all selected labels are visible
