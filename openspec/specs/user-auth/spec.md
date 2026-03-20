### Requirement: User registration
The system SHALL allow a new user to register with a unique username and a password. Passwords SHALL be stored as a bcrypt hash and never in plaintext.

#### Scenario: Successful registration
- **WHEN** a POST request is sent to `/api/auth/register` with a non-empty unique username and a non-empty password
- **THEN** the system creates the user, issues a session cookie, and returns 201 with `{ "id", "username" }`

#### Scenario: Duplicate username
- **WHEN** a POST request is sent to `/api/auth/register` with a username that already exists
- **THEN** the system returns 409 with an error message and does not create a user

#### Scenario: Empty username or password
- **WHEN** a POST request is sent to `/api/auth/register` with an empty username or empty password
- **THEN** the system returns 400 with an error message

### Requirement: User login
The system SHALL allow an existing user to log in with their username and password. On success, a session token SHALL be issued as an HttpOnly cookie named `session` with a 7-day expiry.

#### Scenario: Successful login
- **WHEN** a POST request is sent to `/api/auth/login` with a valid username and matching password
- **THEN** the system returns 200 with `{ "id", "username" }` and sets an HttpOnly `session` cookie

#### Scenario: Wrong password
- **WHEN** a POST request is sent to `/api/auth/login` with a valid username but incorrect password
- **THEN** the system returns 401 with an error message

#### Scenario: Unknown username
- **WHEN** a POST request is sent to `/api/auth/login` with a username that does not exist
- **THEN** the system returns 401 with an error message (same message as wrong password to avoid user enumeration)

### Requirement: User logout
The system SHALL allow an authenticated user to invalidate their current session.

#### Scenario: Successful logout
- **WHEN** a POST request is sent to `/api/auth/logout` with a valid session cookie
- **THEN** the system deletes the session from the database, clears the cookie, and returns 204

#### Scenario: Logout without session
- **WHEN** a POST request is sent to `/api/auth/logout` with no session cookie
- **THEN** the system returns 204 (idempotent)

### Requirement: Current user
The system SHALL expose an endpoint to retrieve the currently authenticated user.

#### Scenario: Authenticated request
- **WHEN** a GET request is sent to `/api/auth/me` with a valid session cookie
- **THEN** the system returns 200 with `{ "id", "username" }`

#### Scenario: Unauthenticated request
- **WHEN** a GET request is sent to `/api/auth/me` with no or invalid session cookie
- **THEN** the system returns 401

### Requirement: Session expiry
Sessions SHALL expire 7 days after creation. Expired sessions SHALL be rejected.

#### Scenario: Expired session rejected
- **WHEN** a request is made with a session token whose `expires_at` is in the past
- **THEN** the system treats the request as unauthenticated and returns 401

#### Scenario: Expired sessions cleaned up on startup
- **WHEN** the server starts
- **THEN** all sessions with `expires_at < current time` are deleted from the database
