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

  test("returns null for non-existent board id", () => {
    const user = createUser("metricsuser4", "hash");
    expect(getBoardMetrics(99999, user.id)).toBeNull();
  });

  test("cardsByColumn entries include correct columnId values", () => {
    const user = createUser("metricsuser5", "hash");
    const board = createBoard(user.id, "ID Check Board");
    const col = createColumn(board.id, "Only Col");
    createCard(col.id, "Card 1");

    const metrics = getBoardMetrics(board.id, user.id);
    expect(metrics).not.toBeNull();
    expect(metrics!.cardsByColumn[0].columnId).toBe(col.id);
    expect(metrics!.cardsByColumn[0].columnName).toBe("Only Col");
    expect(metrics!.cardsByColumn[0].cardCount).toBe(1);
  });

  test("cardsByColumn is ordered by column position", () => {
    const user = createUser("metricsuser6", "hash");
    const board = createBoard(user.id, "Order Board");
    const col1 = createColumn(board.id, "First");
    const col2 = createColumn(board.id, "Second");
    const col3 = createColumn(board.id, "Third");
    createCard(col3.id, "Card in Third");

    const metrics = getBoardMetrics(board.id, user.id);
    expect(metrics).not.toBeNull();
    expect(metrics!.cardsByColumn.map((c) => c.columnName)).toEqual([
      "First",
      "Second",
      "Third",
    ]);
  });

  test("totalCards sums cards across all columns correctly", () => {
    const user = createUser("metricsuser7", "hash");
    const board = createBoard(user.id, "Sum Board");
    const col1 = createColumn(board.id, "Col 1");
    const col2 = createColumn(board.id, "Col 2");
    const col3 = createColumn(board.id, "Col 3");
    createCard(col1.id, "A");
    createCard(col2.id, "B");
    createCard(col2.id, "C");
    createCard(col3.id, "D");
    createCard(col3.id, "E");
    createCard(col3.id, "F");

    const metrics = getBoardMetrics(board.id, user.id);
    expect(metrics).not.toBeNull();
    expect(metrics!.totalCards).toBe(6);
    expect(metrics!.columnCount).toBe(3);
    const col2Entry = metrics!.cardsByColumn.find((c) => c.columnName === "Col 2");
    expect(col2Entry?.cardCount).toBe(2);
    const col3Entry = metrics!.cardsByColumn.find((c) => c.columnName === "Col 3");
    expect(col3Entry?.cardCount).toBe(3);
  });

  test("boardId in returned metrics matches the requested board", () => {
    const user = createUser("metricsuser8", "hash");
    const board1 = createBoard(user.id, "Board Alpha");
    const board2 = createBoard(user.id, "Board Beta");
    createColumn(board2.id, "Col");

    const metrics1 = getBoardMetrics(board1.id, user.id);
    const metrics2 = getBoardMetrics(board2.id, user.id);

    expect(metrics1!.boardId).toBe(board1.id);
    expect(metrics2!.boardId).toBe(board2.id);
    expect(metrics1!.boardId).not.toBe(metrics2!.boardId);
  });
});