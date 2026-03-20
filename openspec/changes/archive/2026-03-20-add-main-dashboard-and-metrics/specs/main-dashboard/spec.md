## ADDED Requirements

### Requirement: Dashboard as default landing view
The system SHALL display the main dashboard as the default view after a successful login, replacing the direct board view as the entry point.

#### Scenario: Authenticated user lands on dashboard
- **WHEN** the app loads and the user has a valid session
- **THEN** the main dashboard view is displayed showing all boards owned by the user

#### Scenario: Unauthenticated user does not see dashboard
- **WHEN** the app loads and the user has no valid session
- **THEN** the login/register form is displayed, not the dashboard

### Requirement: Board tiles listing
The dashboard SHALL display all boards belonging to the authenticated user as individual tiles. Each tile SHALL show the board name and its summary metrics.

#### Scenario: User with multiple boards sees all tiles
- **WHEN** the authenticated user has two or more boards
- **THEN** all boards are rendered as tiles in the dashboard

#### Scenario: User with no boards sees empty state
- **WHEN** the authenticated user has no boards
- **THEN** the dashboard displays a prompt to create the first board

#### Scenario: Each tile shows board name and metrics
- **WHEN** a board tile is rendered
- **THEN** it displays the board name, total number of columns, total number of cards, and the card count per column

### Requirement: Navigate from dashboard to board
Clicking a board tile in the dashboard SHALL navigate the user to the full Kanban board view for that board.

#### Scenario: Clicking a board tile opens the board
- **WHEN** the user clicks on a board tile in the dashboard
- **THEN** the view transitions to the Kanban board view showing that board's columns and cards

### Requirement: Navigate back to dashboard from board
The system SHALL provide a way for the user to return to the main dashboard from within a board view.

#### Scenario: Home/logo button returns to dashboard
- **WHEN** the user clicks the home or logo button in the app header while viewing a board
- **THEN** the view transitions back to the main dashboard

### Requirement: Dashboard metrics loading state
The dashboard SHALL indicate a loading state while board metrics are being fetched and SHALL render each tile once its data is available.

#### Scenario: Tiles show loading indicator before metrics arrive
- **WHEN** the dashboard is fetching metrics for a board
- **THEN** the board tile displays a loading indicator in place of metric values

#### Scenario: Tiles render metrics once loaded
- **WHEN** the metrics fetch for a board completes successfully
- **THEN** the board tile updates to show the fetched metric values
