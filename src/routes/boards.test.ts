import { describe, test, expect, beforeEach } from "bun:test";
import { initDb } from "../db/index";
import { createBoard } from "../db/board";
import { createColumn } from "../db/column";
import { createCard } from "../db/card";
import { createUser } from "../db/user";
import { createSession } from "../db/session";
import { boardRoutes } from "./boards";

type Req = Request & { params: Record<string, string> };

function makeAuthedRequest(token: string, params: Record<string, string>): Req {
  const req = new Request("http://localhost/api/boards/1/metrics", {
    headers: { cookie: `session=${token}` },
  }) as Req;
  req.params = params;
  return req;
}

function makeUnauthRequest(params: Record<string, string>): Req {
  const req = new Request("http://localhost/api/boards/1/metrics") as Req;
  req.params = params;
  return req;
}

beforeEach(() => {
  initDb(":memory:");
});

describe("GET /api/boards/:id/metrics", () => {
  test("returns metrics JSON for own board", async () => {
    const user = createUser("routeuser1", "hash");
    const board = createBoard(user.id, "Route Board");
    const col = createColumn(board.id, "Todo");
    createCard(col.id, "Card A");
    createCard(col.id, "Card B");
    const session = createSession(user.id);

    const req = makeAuthedRequest(session.id, { id: String(board.id) });
    const res = await boardRoutes["/api/boards/:id/metrics"].GET(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.boardId).toBe(board.id);
    expect(body.columnCount).toBe(1);
    expect(body.totalCards).toBe(2);
    expect(body.cardsByColumn).toHaveLength(1);
    expect(body.cardsByColumn[0].columnName).toBe("Todo");
    expect(body.cardsByColumn[0].cardCount).toBe(2);
  });

  test("returns 404 for board not owned by the authenticated user", async () => {
    const owner = createUser("routeowner", "hash");
    const other = createUser("routeother", "hash");
    const board = createBoard(owner.id, "Owner's Board");
    const session = createSession(other.id);

    const req = makeAuthedRequest(session.id, { id: String(board.id) });
    const res = await boardRoutes["/api/boards/:id/metrics"].GET(req);

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe("Not found");
  });

  test("returns 404 for non-existent board id", async () => {
    const user = createUser("routeuser2", "hash");
    const session = createSession(user.id);

    const req = makeAuthedRequest(session.id, { id: "99999" });
    const res = await boardRoutes["/api/boards/:id/metrics"].GET(req);

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe("Not found");
  });

  test("returns 401 when no session cookie is present", async () => {
    const req = makeUnauthRequest({ id: "1" });
    const res = await boardRoutes["/api/boards/:id/metrics"].GET(req);

    expect(res.status).toBe(401);
  });

  test("returns 401 when session token is invalid", async () => {
    const req = makeAuthedRequest("invalid-token-xyz", { id: "1" });
    const res = await boardRoutes["/api/boards/:id/metrics"].GET(req);

    expect(res.status).toBe(401);
  });

  test("returns metrics for board with no columns", async () => {
    const user = createUser("routeuser3", "hash");
    const board = createBoard(user.id, "Empty Board");
    const session = createSession(user.id);

    const req = makeAuthedRequest(session.id, { id: String(board.id) });
    const res = await boardRoutes["/api/boards/:id/metrics"].GET(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.columnCount).toBe(0);
    expect(body.totalCards).toBe(0);
    expect(body.cardsByColumn).toEqual([]);
  });

  test("returns metrics for board with columns but no cards", async () => {
    const user = createUser("routeuser4", "hash");
    const board = createBoard(user.id, "Columns Only Board");
    createColumn(board.id, "Backlog");
    createColumn(board.id, "In Progress");
    const session = createSession(user.id);

    const req = makeAuthedRequest(session.id, { id: String(board.id) });
    const res = await boardRoutes["/api/boards/:id/metrics"].GET(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.columnCount).toBe(2);
    expect(body.totalCards).toBe(0);
    expect(body.cardsByColumn).toHaveLength(2);
    body.cardsByColumn.forEach((entry: { cardCount: number }) => {
      expect(entry.cardCount).toBe(0);
    });
  });

  test("response Content-Type is application/json", async () => {
    const user = createUser("routeuser5", "hash");
    const board = createBoard(user.id, "JSON Board");
    const session = createSession(user.id);

    const req = makeAuthedRequest(session.id, { id: String(board.id) });
    const res = await boardRoutes["/api/boards/:id/metrics"].GET(req);

    expect(res.headers.get("content-type")).toContain("application/json");
  });

  test("user can only see own boards — two users with separate boards", async () => {
    const userA = createUser("routeuserA", "hash");
    const userB = createUser("routeuserB", "hash");
    const boardA = createBoard(userA.id, "Board A");
    const boardB = createBoard(userB.id, "Board B");
    createColumn(boardA.id, "Col");
    const sessionB = createSession(userB.id);

    // userB cannot access userA's board
    const req = makeAuthedRequest(sessionB.id, { id: String(boardA.id) });
    const res = await boardRoutes["/api/boards/:id/metrics"].GET(req);
    expect(res.status).toBe(404);

    // userB can access their own board
    const sessionB2 = createSession(userB.id);
    const reqOwn = makeAuthedRequest(sessionB2.id, { id: String(boardB.id) });
    const resOwn = await boardRoutes["/api/boards/:id/metrics"].GET(reqOwn);
    expect(resOwn.status).toBe(200);
    const body = await resOwn.json();
    expect(body.boardId).toBe(boardB.id);
  });
});