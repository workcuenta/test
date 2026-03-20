import { describe, test, expect, beforeEach } from "bun:test";
import { initDb } from "./index";
import {
  createBoard,
  getBoardById,
  listBoards,
  updateBoard,
  deleteBoard,
} from "./board";
import { createColumn } from "./column";
import { createCard } from "./card";

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
