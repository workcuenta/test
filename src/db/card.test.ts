import { describe, test, expect, beforeEach } from "bun:test";
import { initDb } from "./index";
import { createBoard } from "./board";
import { createColumn } from "./column";
import {
  createCard,
  listCards,
  updateCard,
  reorderCard,
  moveCard,
  deleteCard,
} from "./card";

beforeEach(() => {
  initDb(":memory:");
});

describe("createCard", () => {
  test("creates a card appended at last position", () => {
    const board = createBoard("Board");
    const col = createColumn(board.id, "Col");
    const c1 = createCard(col.id, "Card 1");
    const c2 = createCard(col.id, "Card 2");
    expect(c1.position).toBe(0);
    expect(c2.position).toBe(1);
  });

  test("stores optional description", () => {
    const board = createBoard("Board");
    const col = createColumn(board.id, "Col");
    const card = createCard(col.id, "Title", "Some desc");
    expect(card.description).toBe("Some desc");
  });

  test("stores null description when omitted", () => {
    const board = createBoard("Board");
    const col = createColumn(board.id, "Col");
    const card = createCard(col.id, "Title");
    expect(card.description).toBeNull();
  });

  test("throws on empty title", () => {
    const board = createBoard("Board");
    const col = createColumn(board.id, "Col");
    expect(() => createCard(col.id, "")).toThrow("Card title cannot be empty");
  });
});

describe("listCards", () => {
  test("returns cards ordered by position ascending", () => {
    const board = createBoard("Board");
    const col = createColumn(board.id, "Col");
    createCard(col.id, "A");
    createCard(col.id, "B");
    createCard(col.id, "C");
    const cards = listCards(col.id);
    expect(cards.map((c) => c.title)).toEqual(["A", "B", "C"]);
  });
});

describe("updateCard", () => {
  test("updates the title", () => {
    const board = createBoard("Board");
    const col = createColumn(board.id, "Col");
    const card = createCard(col.id, "Old");
    const updated = updateCard(card.id, { title: "New" });
    expect(updated.title).toBe("New");
  });

  test("clears description when set to null", () => {
    const board = createBoard("Board");
    const col = createColumn(board.id, "Col");
    const card = createCard(col.id, "Title", "desc");
    const updated = updateCard(card.id, { description: null });
    expect(updated.description).toBeNull();
  });

  test("throws on empty title", () => {
    const board = createBoard("Board");
    const col = createColumn(board.id, "Col");
    const card = createCard(col.id, "Title");
    expect(() => updateCard(card.id, { title: "" })).toThrow(
      "Card title cannot be empty"
    );
  });

  test("throws for unknown card id", () => {
    expect(() => updateCard(9999, { title: "X" })).toThrow(
      "Card 9999 not found"
    );
  });
});

describe("reorderCard", () => {
  test("moves card forward within column", () => {
    const board = createBoard("Board");
    const col = createColumn(board.id, "Col");
    const a = createCard(col.id, "A"); // pos 0
    const b = createCard(col.id, "B"); // pos 1
    const c = createCard(col.id, "C"); // pos 2

    reorderCard(a.id, 2);

    const cards = listCards(col.id);
    expect(cards.map((c) => c.title)).toEqual(["B", "C", "A"]);
  });

  test("moves card backward within column", () => {
    const board = createBoard("Board");
    const col = createColumn(board.id, "Col");
    const a = createCard(col.id, "A"); // pos 0
    const b = createCard(col.id, "B"); // pos 1
    const c = createCard(col.id, "C"); // pos 2

    reorderCard(c.id, 0);

    const cards = listCards(col.id);
    expect(cards.map((c) => c.title)).toEqual(["C", "A", "B"]);
  });
});

describe("moveCard", () => {
  test("moves card to another column, appended last", () => {
    const board = createBoard("Board");
    const col1 = createColumn(board.id, "Todo");
    const col2 = createColumn(board.id, "Done");
    const card = createCard(col1.id, "Task");

    moveCard(card.id, col2.id);

    expect(listCards(col1.id)).toHaveLength(0);
    const dest = listCards(col2.id);
    expect(dest).toHaveLength(1);
    expect(dest[0].title).toBe("Task");
    expect(dest[0].column_id).toBe(col2.id);
  });

  test("moves card to specific position in target column", () => {
    const board = createBoard("Board");
    const col1 = createColumn(board.id, "A");
    const col2 = createColumn(board.id, "B");
    createCard(col2.id, "X"); // pos 0
    createCard(col2.id, "Y"); // pos 1
    const card = createCard(col1.id, "Task");

    moveCard(card.id, col2.id, 1); // insert at pos 1

    const dest = listCards(col2.id);
    expect(dest.map((c) => c.title)).toEqual(["X", "Task", "Y"]);
  });

  test("normalizes source column positions after move", () => {
    const board = createBoard("Board");
    const col1 = createColumn(board.id, "A");
    const col2 = createColumn(board.id, "B");
    createCard(col1.id, "P"); // pos 0
    const q = createCard(col1.id, "Q"); // pos 1
    createCard(col1.id, "R"); // pos 2

    moveCard(q.id, col2.id);

    const src = listCards(col1.id);
    expect(src.map((c) => c.title)).toEqual(["P", "R"]);
    expect(src.map((c) => c.position)).toEqual([0, 1]);
  });
});

describe("deleteCard", () => {
  test("deletes a card", () => {
    const board = createBoard("Board");
    const col = createColumn(board.id, "Col");
    const card = createCard(col.id, "Card");
    deleteCard(card.id);
    expect(listCards(col.id)).toHaveLength(0);
  });

  test("normalizes sibling positions after delete", () => {
    const board = createBoard("Board");
    const col = createColumn(board.id, "Col");
    createCard(col.id, "A"); // pos 0
    const b = createCard(col.id, "B"); // pos 1
    createCard(col.id, "C"); // pos 2

    deleteCard(b.id);

    const cards = listCards(col.id);
    expect(cards.map((c) => c.title)).toEqual(["A", "C"]);
    expect(cards.map((c) => c.position)).toEqual([0, 1]);
  });
});
