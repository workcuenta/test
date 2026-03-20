import { describe, test, expect, beforeEach } from "bun:test";
import { initDb } from "./index";
import {
  createBoard,
  getBoardById,
  listBoards,
  updateBoard,
  deleteBoard,
  getBoardMetrics,
} from "./board";
import { createColumn } from "./column";
import { createCard } from "./card";
import { createUser } from "./user";

beforeEach(() => {
  initDb(":memory:");
});

describe("createBoard", () => {
  test("creates a board with a valid name", () => {
    const board = createBoard("My Board");
    expect(board.id).toBeNumber();
    expect(board.name).toBe("My Board");
    expect(board.created_at).toBeNumber();
  });

  test("trims whitespace from name", () => {
    const board = createBoard("  Trimmed  ");
    expect(board.name).toBe("Trimmed");
  });

  test("throws on empty name", () => {
    expect(() => createBoard("")).toThrow("Board name cannot be empty");
  });

  test("throws on whitespace-only name", () => {
    expect(() => createBoard("   ")).toThrow("Board name cannot be empty");
  });
});

describe("getBoardById", () => {
  test("returns the board for a valid id", () => {
    const created = createBoard("Test");
    const found = getBoardById(created.id);
    expect(found).toEqual(created);
  });

  test("returns null for unknown id", () => {
    expect(getBoardById(9999)).toBeNull();
  });
});

describe("listBoards", () => {
  test("returns empty array when no boards", () => {
    expect(listBoards()).toEqual([]);
  });

  test("returns all boards ordered by created_at ascending", () => {
    const a = createBoard("A");
    const b = createBoard("B");
    const c = createBoard("C");
    const boards = listBoards();
    expect(boards.map((b) => b.id)).toEqual([a.id, b.id, c.id]);
  });
});

describe("updateBoard", () => {
  test("renames a board", () => {
    const board = createBoard("Old");
    const updated = updateBoard(board.id, "New");
    expect(updated.id).toBe(board.id);
    expect(updated.name).toBe("New");
  });

  test("throws on empty name", () => {
    const board = createBoard("Board");
    expect(() => updateBoard(board.id, "")).toThrow(
      "Board name cannot be empty"
    );
  });

  test("throws for unknown board id", () => {
    expect(() => updateBoard(9999, "Name")).toThrow("Board 9999 not found");
  });
});

describe("deleteBoard", () => {
  test("deletes a board", () => {
    const board = createBoard("Bye");
    deleteBoard(board.id);
    expect(getBoardById(board.id)).toBeNull();
  });

  test("cascade-deletes columns and cards", () => {
    const board = createBoard("Board");
    const col = createColumn(board.id, "Col");
    createCard(col.id, "Card");

    deleteBoard(board.id);

    // board gone
    expect(getBoardById(board.id)).toBeNull();

    // Verify via direct column/card queries (cascade handled by SQLite FK)
    const { getDb } = require("./index");
    const db = getDb();
    const cols = db
      .query("SELECT * FROM columns WHERE board_id = ?")
      .all(board.id);
    const cards = db
      .query("SELECT * FROM cards WHERE column_id = ?")
      .all(col.id);
    expect(cols).toHaveLength(0);
    expect(cards).toHaveLength(0);
  });
});

describe("getBoardMetrics", () => {
  test("returns metrics for own board with columns and cards", () => {
    const user = createUser("metricsuser", "hash");
    const board = createBoard(user.id, "My Board");
    const col1 = createColumn(board.id, "To Do");
    const col2 = createColumn(board.id, "Done");
    createCard(col1.id, "Card A");
    createCard(col1.id, "Card B");
    createCard(col2.id, "Card C");

    const metrics = getBoardMetrics(board.id, user.id);
    expect(metrics).not.toBeNull();
    expect(metrics!.boardId).toBe(board.id);
    expect(metrics!.columnCount).toBe(2);
    expect(metrics!.totalCards).toBe(3);
    expect(metrics!.cardsByColumn).toHaveLength(2);
    const toDoEntry = metrics!.cardsByColumn.find((c) => c.columnName === "To Do");
    expect(toDoEntry?.cardCount).toBe(2);
    const doneEntry = metrics!.cardsByColumn.find((c) => c.columnName === "Done");
    expect(doneEntry?.cardCount).toBe(1);
  });

  test("returns metrics for board with no columns", () => {
    const user = createUser("metricsuser2", "hash");
    const board = createBoard(user.id, "Empty Board");

    const metrics = getBoardMetrics(board.id, user.id);
    expect(metrics).not.toBeNull();
    expect(metrics!.columnCount).toBe(0);
    expect(metrics!.totalCards).toBe(0);
    expect(metrics!.cardsByColumn).toEqual([]);
  });

  test("returns metrics for board with columns but no cards", () => {
    const user = createUser("metricsuser3", "hash");
    const board = createBoard(user.id, "Columns Only");
    createColumn(board.id, "Col A");
    createColumn(board.id, "Col B");

    const metrics = getBoardMetrics(board.id, user.id);
    expect(metrics).not.toBeNull();
    expect(metrics!.columnCount).toBe(2);
    expect(metrics!.totalCards).toBe(0);
    metrics!.cardsByColumn.forEach((entry) => expect(entry.cardCount).toBe(0));
  });

  test("returns null for board not owned by user", () => {
    const owner = createUser("metricsowner", "hash");
    const other = createUser("metricsother", "hash");
    const board = createBoard(owner.id, "Owner Board");

    expect(getBoardMetrics(board.id, other.id)).toBeNull();
  });
});
