import React, { useRef, useState } from "react";
import type { Column as ColumnType, Card as CardType } from "../types";
import { Column } from "./Column";

interface Props {
  columns: ColumnType[];
  cards: Record<number, CardType[]>;
  filterText: string;
  filterLabelIds: Set<number>;
  boardId?: number;
  onRefresh: () => void;
}

function getDropColumnIndex(
  e: React.DragEvent,
  boardEl: HTMLDivElement
): number {
  const colEls = Array.from(boardEl.querySelectorAll("[data-column-id]"));
  for (let i = 0; i < colEls.length; i++) {
    const rect = colEls[i].getBoundingClientRect();
    if (e.clientX < rect.left + rect.width / 2) return i;
  }
  return colEls.length;
}

function matchesFilter(
  card: CardType,
  text: string,
  labelIds: Set<number>
): boolean {
  if (text) {
    const q = text.toLowerCase();
    const inTitle = card.title.toLowerCase().includes(q);
    const inDesc = card.description?.toLowerCase().includes(q) ?? false;
    if (!inTitle && !inDesc) return false;
  }
  if (labelIds.size > 0) {
    const cardLabelIds = new Set(card.labels.map((l) => l.id));
    for (const id of labelIds) {
      if (!cardLabelIds.has(id)) return false;
    }
  }
  return true;
}

export function Board({ columns, cards, filterText, filterLabelIds, boardId, onRefresh }: Props) {
  const boardRef = useRef<HTMLDivElement>(null);
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [columnName, setColumnName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (e.dataTransfer.types.includes("kanban/column")) {
      e.preventDefault();
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    const raw = e.dataTransfer.getData("kanban/column");
    if (!raw) return;
    e.preventDefault();
    const { columnId } = JSON.parse(raw) as { columnId: number };
    const targetIndex = boardRef.current
      ? getDropColumnIndex(e, boardRef.current)
      : columns.length;

    try {
      await fetch(`/api/columns/${columnId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ position: targetIndex }),
      });
    } catch (err) {
      console.error("Column drop failed:", err);
    } finally {
      onRefresh();
    }
  };

  const openAddColumn = () => {
    setColumnName("");
    setIsAddingColumn(true);
  };

  const closeAddColumn = () => {
    setIsAddingColumn(false);
    setColumnName("");
  };

  const handleAddColumn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!columnName.trim() || !boardId) return;
    setSubmitting(true);
    try {
      await fetch(`/api/boards/${boardId}/columns`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: columnName.trim() }),
      });
      closeAddColumn();
      onRefresh();
    } catch (err) {
      console.error("Add column failed:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") closeAddColumn();
  };

  const addColumnControl = isAddingColumn ? (
    <form className="add-column-form" onSubmit={handleAddColumn}>
      <input
        className="add-card-input"
        type="text"
        placeholder="Column name"
        value={columnName}
        onChange={(e) => setColumnName(e.target.value)}
        onKeyDown={handleKeyDown}
        autoFocus
      />
      <div className="add-card-actions">
        <button
          className="add-card-confirm"
          type="submit"
          disabled={submitting || !columnName.trim()}
        >
          {submitting ? "Adding…" : "Add column"}
        </button>
        <button className="add-card-cancel" type="button" onClick={closeAddColumn}>
          Cancel
        </button>
      </div>
    </form>
  ) : (
    <button className="add-column-btn" type="button" onClick={openAddColumn}>
      + Add column
    </button>
  );

  if (!columns.length) {
    return (
      <div className="board board--empty">
        {addColumnControl}
      </div>
    );
  }

  return (
    <div
      ref={boardRef}
      className="board"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {columns.map((col) => {
        const filtered = (cards[col.id] ?? []).filter((c) =>
          matchesFilter(c, filterText, filterLabelIds)
        );
        return (
          <Column
            key={col.id}
            column={col}
            cards={filtered}
            onRefresh={onRefresh}
          />
        );
      })}
      {addColumnControl}
    </div>
  );
}
