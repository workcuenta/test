## 1. Schema Migration

- [x] 1.1 Delete `data/kanban.db` to clear the incompatible schema (existing boards have no `user_id`)
- [x] 1.2 Add `users` table to `src/db/schema.ts`: `id`, `username` (UNIQUE NOT NULL), `password_hash` (NOT NULL), `created_at`
- [x] 1.3 Add `sessions` table to `src/db/schema.ts`: `id` (TEXT token), `user_id` (FK → users), `expires_at` (INTEGER unixepoch)
- [x] 1.4 Add `user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE` to the `boards` table in `src/db/schema.ts`

## 2. User Data Access

- [x] 2.1 Create `src/db/user.ts` with `createUser(username, passwordHash): User` — enforces UNIQUE, throws on duplicate
- [x] 2.2 Add `getUserByUsername(username): User | null` to `src/db/user.ts`

## 3. Session Data Access

- [x] 3.1 Create `src/db/session.ts` with `createSession(userId): Session` — generates 32-byte hex token, sets `expires_at = now + 7 days`
- [x] 3.2 Add `getSession(token): Session | null` — returns null if not found or expired
- [x] 3.3 Add `deleteSession(token): void`
- [x] 3.4 Add `deleteExpiredSessions(): void` — bulk delete where `expires_at < unixepoch()`

## 4. Board Data Access — User Scoping

- [x] 4.1 Update `createBoard(userId, name)` in `src/db/board.ts` to accept and store `user_id`
- [x] 4.2 Update `listBoards(userId)` to filter by `user_id`
- [x] 4.3 Update `getBoardById(id, userId)` to return null if `user_id` doesn't match
- [x] 4.4 Update `updateBoard(id, name, userId)` to scope the UPDATE to the owning user
- [x] 4.5 Update `deleteBoard(id, userId)` to scope the DELETE to the owning user

## 5. Auth Helper & Routes

- [x] 5.1 Create `src/auth.ts` with `requireAuth(req): { userId: number }` — reads `session` cookie, validates via `getSession`, throws `Response` with status 401 if invalid
- [x] 5.2 Create `src/routes/auth.ts` with `POST /api/auth/register`: validate input, hash password with `Bun.password.hash()`, call `createUser`, call `createSession`, set cookie, return 201
- [x] 5.3 Add `POST /api/auth/login`: find user, verify password with `Bun.password.verify()`, create session, set cookie, return 200
- [x] 5.4 Add `POST /api/auth/logout`: delete session, clear cookie, return 204
- [x] 5.5 Add `GET /api/auth/me`: call `requireAuth`, return `{ id, username }` or 401

## 6. Protect Existing Routes

- [x] 6.1 Update `src/routes/boards.ts`: call `requireAuth(req)` at the top of every handler; pass `userId` to all board data-access calls
- [x] 6.2 Update `src/routes/columns.ts`: call `requireAuth(req)` at the top of every handler
- [x] 6.3 Update `src/routes/cards.ts`: call `requireAuth(req)` at the top of every handler

## 7. Server Wiring & Seed Update

- [x] 7.1 Register `authRoutes` in `index.ts` alongside the existing route groups
- [x] 7.2 Call `deleteExpiredSessions()` in `index.ts` after `initDb()`
- [x] 7.3 Update the default board seed in `index.ts`: seed only runs if no users AND no boards exist; the seed now needs a `userId` — skip seeding (let the first registered user create their own board)

## 8. Frontend — Login Page

- [x] 8.1 Create `src/components/LoginPage.tsx` with a form that toggles between login and register modes; shows an error message on failure
- [x] 8.2 Update `frontend.tsx`: on load, call `GET /api/auth/me`; if 401, show `<LoginPage />`; if 200, show the board and pass the username to the header
- [x] 8.3 Update `src/components/Board.tsx` or the app header to show the current username and a Logout button that calls `POST /api/auth/logout` then reloads the auth check

## 9. Smoke Test

- [x] 9.1 Run `bun --hot index.ts`, open the browser — confirm the login page appears
- [x] 9.2 Register a new account — confirm the board view appears with the default empty board
- [x] 9.3 Log out — confirm the login page reappears
- [x] 9.4 Log in again — confirm boards are restored
- [x] 9.5 Register a second account — confirm it sees no boards from the first account
