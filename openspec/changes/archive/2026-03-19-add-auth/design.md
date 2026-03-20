## Context

The app is a single-user local Kanban tool with no access control. Boards, columns, and cards are global. This change introduces user accounts so multiple people can use the same deployment independently, each owning their own boards.

Current state: no `users` or `sessions` tables; `boards` has no `user_id`; all API routes are open.

## Goals / Non-Goals

**Goals:**
- Username + password accounts stored in SQLite
- Session cookie (HttpOnly) issued on login; validated on every API request
- Boards scoped to the owning user — users cannot see or modify each other's data
- Frontend login/register page with redirect when unauthenticated
- Use `Bun.password` (built-in bcrypt) — zero new runtime dependencies

**Non-Goals:**
- OAuth / SSO / third-party login
- Password reset or email verification
- Role-based permissions (all users have equal access to their own boards)
- Rate limiting or brute-force protection (acceptable for a small deployment)
- Admin panel or cross-user visibility

## Decisions

### Session tokens in SQLite (no external store)

**Decision**: Generate a random 32-byte hex token per login, store in a `sessions` table with `user_id` and `expires_at`. Send as an HttpOnly cookie named `session`.

**Rationale**: Zero dependencies. SQLite is already the persistence layer. Session expiry (7 days) is enforced at lookup time.

**Alternatives considered**:
- JWT (stateless): requires a signing secret, harder to invalidate; overkill here.
- In-memory store: lost on restart; not acceptable.

### `Bun.password` for bcrypt

**Decision**: Use `Bun.password.hash()` / `Bun.password.verify()` (bcrypt, built-in since Bun 1.0).

**Rationale**: No `argon2` or `bcrypt` npm package needed. Bun's implementation uses the same bcrypt parameters as the `bcrypt` npm package.

### Board ownership via `user_id` FK

**Decision**: Add `user_id INTEGER NOT NULL REFERENCES users(id)` to `boards`. All board queries receive `userId` as a parameter.

**Rationale**: Simplest ownership model. Columns and cards are owned transitively through their board — no need to add `user_id` to those tables.

**Migration**: Existing boards (from seed) have no owner. On migration, if a `user_id` column doesn't exist, add it. Existing un-owned boards will be deleted or re-attributed to the first user that registers (see Migration Plan).

### Auth middleware pattern

**Decision**: A `requireAuth(req)` helper extracts and validates the session cookie, returns `{ userId }` or throws a `401` response. All protected route handlers call it at the top.

**Rationale**: Simple and explicit — no framework middleware. Each handler opts in, making it easy to see which routes are protected.

### File layout

```
src/db/
  schema.ts       # add users and sessions tables; boards.user_id
  user.ts         # createUser, getUserByUsername
  session.ts      # createSession, getSession, deleteSession

src/routes/
  auth.ts         # POST /api/auth/register, /login, /logout, GET /api/auth/me

src/auth.ts       # requireAuth(req) helper

src/components/
  LoginPage.tsx   # login + register form
```

## Risks / Trade-offs

- **Breaking schema change** (`boards.user_id`) → Mitigation: drop `data/kanban.db` on first run after migration; the seed recreates the default board for the first registered user.
- **Sessions never cleaned up** → Mitigation: `DELETE FROM sessions WHERE expires_at < unixepoch()` on startup.
- **No CSRF protection** → Acceptable: the HttpOnly cookie + same-origin API calls provide adequate protection for a small deployment. Add CSRF tokens if the app becomes public-facing.
- **Plaintext username collision** → Mitigation: UNIQUE constraint on `users.username`; return 409 on duplicate registration.

## Migration Plan

1. Stop the server.
2. Delete `data/kanban.db` (existing seed data is incompatible with the new schema).
3. Start the server — schema is recreated with `users` and `sessions` tables and `boards.user_id`.
4. Register a new account; the default board seed runs for the first user.

Rollback: restore `data/kanban.db` from backup and revert the code.
