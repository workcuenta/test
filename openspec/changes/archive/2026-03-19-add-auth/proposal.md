## Why

The app currently has no access control — anyone who can reach the server can view and modify all data. Adding multi-user accounts lets each user own their own boards and prevents unauthorized access to other users' data.

## What Changes

- Add a `users` table with username and hashed password
- Add a `sessions` table for cookie-based session management
- **BREAKING**: Add `user_id` FK to the `boards` table; boards are now user-scoped
- Add `/api/auth/*` endpoints for register, login, logout, and current-user
- All existing `/api/*` endpoints now require an authenticated session (return 401 otherwise)
- Board listing and creation are scoped to the authenticated user
- Frontend gains a login/register page; app redirects to it when unauthenticated

## Capabilities

### New Capabilities

- `user-auth`: User registration, login, logout, and session validation via HttpOnly cookie

### Modified Capabilities

- `rest-api`: All existing endpoints now require authentication (401 if no valid session); new `/api/auth/*` routes added
- `board`: Board listing returns only the authenticated user's boards; board creation associates the board with the authenticated user; board access enforces ownership
- `kanban-ui`: Login and registration page added; app redirects unauthenticated users to login

## Impact

- `src/db/schema.ts` — new `users` and `sessions` tables; `boards` gets `user_id` column (**BREAKING** migration required)
- New `src/db/user.ts` and `src/db/session.ts` data-access modules
- New `src/routes/auth.ts` with register/login/logout/me endpoints
- All existing route handlers updated to validate session cookie and pass `userId` context
- `src/db/board.ts` — all functions gain `userId` parameter for scoping
- `frontend.tsx` + new `src/components/LoginPage.tsx`
- Uses `Bun.password` for bcrypt hashing (built-in, no extra dependency)
