import { describe, test, expect, beforeEach } from "bun:test";
import { initDb } from "./index";
import { createBoard } from "./board";
import {
  createColumn,
  listColumns,
  updateColumn,
  reorderColumn,
  deleteColumn,
} from "./column";
import { createCard, listCards } from "./card";

beforeEach(() => {
  initDb(":memory:");
});

describe("createColumn", () => {
  test("creates a column appended at last position", () => {
    const board = createBoard("Board");
    const col1 = createColumn(board.id, "Todo");
    const col2 = createColumn(board.id, "Done");
    expect(col1.position).toBe(0);
    expect(col2.position).toBe(1);
  });

  test("throws on empty name", () => {
    const board = createBoard("Board");
    expect(() => createColumn(board.id, "")).toThrow(
      "Column name cannot be empty"
    );
  });
});

describe("listColumns", () => {
  test("returns columns ordered by position ascending", () => {
    const board = createBoard("Board");
    createColumn(board.id, "A");
    createColumn(board.id, "B");
    createColumn(board.id, "C");
    const cols = listColumns(board.id);
    expect(cols.map((c) => c.name)).toEqual(["A", "B", "C"]);
    expect(cols.map((c) => c.position)).toEqual([0, 1, 2]);
  });

  test("returns empty array for board with no columns", () => {
    const board = createBoard("Board");
    expect(listColumns(board.id)).toEqual([]);
  });
});

describe("updateColumn", () => {
  test("renames a column", () => {
    const board = createBoard("Board");
    const col = createColumn(board.id, "Old");
    const updated = updateColumn(col.id, "New");
    expect(updated.name).toBe("New");
  });

  test("throws on empty name", () => {
    const board = createBoard("Board");
    const col = createColumn(board.id, "Col");
    expect(() => updateColumn(col.id, "")).toThrow(
      "Column name cannot be empty"
    );
  });
});

describe("reorderColumn", () => {
  test("moves column forward and shifts siblings", () => {
    const board = createBoard("Board");
    const a = createColumn(board.id, "A"); // pos 0
    const b = createColumn(board.id, "B"); // pos 1
    const c = createColumn(board.id, "C"); // pos 2

    reorderColumn(a.id, 2); // A moves from 0 → 2

    const cols = listColumns(board.id);
    expect(cols.map((c) => c.name)).toEqual(["B", "C", "A"]);
  });

  test("moves column backward and shifts siblings", () => {
    const board = createBoard("Board");
    const a = createColumn(board.id, "A"); // pos 0
    const b = createColumn(board.id, "B"); // pos 1
    const c = createColumn(board.id, "C"); // pos 2

    reorderColumn(c.id, 0); // C moves from 2 → 0

    const cols = listColumns(board.id);
    expect(cols.map((c) => c.name)).toEqual(["C", "A", "B"]);
  });

  test("no-op when position unchanged", () => {
    const board = createBoard("Board");
    const col = createColumn(board.id, "A");
    reorderColumn(col.id, 0); // same position
    const cols = listColumns(board.id);
    expect(cols[0].name).toBe("A");
  });
});

describe("deleteColumn", () => {
  test("deletes a column and cascade-deletes its cards", () => {
    const board = createBoard("Board");
    const col = createColumn(board.id, "Col");
    createCard(col.id, "Card");

    deleteColumn(col.id);

    const cols = listColumns(board.id);
    expect(cols).toHaveLength(0);

    const cards = listCards(col.id);
    expect(cards).toHaveLength(0);
  });

  test("normalizes sibling positions after delete", () => {
    const board = createBoard("Board");
    const a = createColumn(board.id, "A"); // pos 0
    const b = createColumn(board.id, "B"); // pos 1
    const c = createColumn(board.id, "C"); // pos 2

    deleteColumn(b.id);

    const cols = listColumns(board.id);
    expect(cols.map((c) => c.name)).toEqual(["A", "C"]);
    expect(cols.map((c) => c.position)).toEqual([0, 1]);
  });
});
