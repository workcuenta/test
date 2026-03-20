## ADDED Requirements

### Requirement: Login and registration page
The system SHALL display a login/register form when the user is not authenticated. The form SHALL allow switching between login and register modes.

#### Scenario: Unauthenticated user sees login page
- **WHEN** the app loads and the user has no valid session
- **THEN** the login/register form is displayed instead of the board view

#### Scenario: Authenticated user sees board
- **WHEN** the app loads and the user has a valid session
- **THEN** the board view is displayed and the login form is not shown

#### Scenario: Register new account
- **WHEN** the user submits the registration form with a valid username and password
- **THEN** the account is created, a session is established, and the board view is shown

#### Scenario: Login with existing account
- **WHEN** the user submits the login form with valid credentials
- **THEN** the session is established and the board view is shown

#### Scenario: Login with wrong credentials
- **WHEN** the user submits the login form with an incorrect password or unknown username
- **THEN** an error message is displayed and the user remains on the login page

## MODIFIED Requirements

### Requirement: Board view rendering
The system SHALL display the authenticated user's board as a horizontal list of columns, each containing its cards, fetched from the REST API on load. The header SHALL show the current username and a logout button.

#### Scenario: Board loads with columns and cards
- **WHEN** an authenticated user opens the app
- **THEN** the board view fetches and renders all of the user's columns and their cards in position order

#### Scenario: Board is empty
- **WHEN** no columns exist on the board
- **THEN** the board view displays an empty state message

#### Scenario: Logout
- **WHEN** the authenticated user clicks the logout button
- **THEN** the session is invalidated, the board view is hidden, and the login page is shown
