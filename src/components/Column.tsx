import React, { useRef, useState } from "react";
import type { Column as ColumnType, Card as CardType } from "../types";
import { Card } from "./Card";

interface Props {
  column: ColumnType;
  cards: CardType[];
  onRefresh: () => void;
}

function getDropCardIndex(
  e: React.DragEvent,
  bodyEl: HTMLDivElement
): number {
  const cardEls = Array.from(bodyEl.querySelectorAll("[data-card-id]"));
  for (let i = 0; i < cardEls.length; i++) {
    const rect = cardEls[i].getBoundingClientRect();
    if (e.clientY < rect.top + rect.height / 2) return i;
  }
  return cardEls.length;
}

export function Column({ column, cards, onRefresh }: Props) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [cardTitle, setCardTitle] = useState("");
  const [cardDesc, setCardDesc] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // ── Card drop handling ──────────────────────────────────────────────
  const handleCardDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (e.dataTransfer.types.includes("kanban/card")) {
      e.preventDefault();
      setDragOver(true);
    }
  };

  const handleCardDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    if (!bodyRef.current?.contains(e.relatedTarget as Node)) {
      setDragOver(false);
    }
  };

  const handleCardDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const raw = e.dataTransfer.getData("kanban/card");
    if (!raw) return;
    const { cardId, columnId: sourceColumnId } = JSON.parse(raw) as {
      cardId: number;
      columnId: number;
    };
    const targetIndex = bodyRef.current
      ? getDropCardIndex(e, bodyRef.current)
      : cards.length;

    try {
      if (sourceColumnId === column.id) {
        await fetch(`/api/cards/${cardId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ position: targetIndex }),
        });
      } else {
        await fetch(`/api/cards/${cardId}/move`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ columnId: column.id, position: targetIndex }),
        });
      }
    } catch (err) {
      console.error("Card drop failed:", err);
    } finally {
      onRefresh();
    }
  };

  // ── Column drag (header is the handle) ─────────────────────────────
  const handleColumnDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData(
      "kanban/column",
      JSON.stringify({ columnId: column.id })
    );
    e.dataTransfer.effectAllowed = "move";
  };

  // ── Add card ────────────────────────────────────────────────────────
  const openAddCard = () => {
    setCardTitle("");
    setCardDesc("");
    setIsAddingCard(true);
  };

  const closeAddCard = () => {
    setIsAddingCard(false);
    setCardTitle("");
    setCardDesc("");
  };

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardTitle.trim()) return;
    setSubmitting(true);
    try {
      await fetch(`/api/columns/${column.id}/cards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: cardTitle.trim(),
          description: cardDesc.trim() || undefined,
        }),
      });
      closeAddCard();
      onRefresh();
    } catch (err) {
      console.error("Add card failed:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") closeAddCard();
  };

  return (
    <div className="column" data-column-id={column.id}>
      <div
        className="column-header"
        draggable
        onDragStart={handleColumnDragStart}
      >
        {column.name}
      </div>
      <div
        ref={bodyRef}
        className={`column-body${dragOver ? " drag-over" : ""}`}
        onDragOver={handleCardDragOver}
        onDragLeave={handleCardDragLeave}
        onDrop={handleCardDrop}
      >
        {cards.map((card) => (
          <Card key={card.id} card={card} />
        ))}
      </div>

      {isAddingCard ? (
        <form className="add-card-form" onSubmit={handleAddCard}>
          <input
            className="add-card-input"
            type="text"
            placeholder="Card title"
            value={cardTitle}
            onChange={(e) => setCardTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
          <textarea
            className="add-card-textarea"
            placeholder="Description (optional)"
            value={cardDesc}
            onChange={(e) => setCardDesc(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
          />
          <div className="add-card-actions">
            <button
              className="add-card-confirm"
              type="submit"
              disabled={submitting || !cardTitle.trim()}
            >
              {submitting ? "Adding…" : "Add card"}
            </button>
            <button
              className="add-card-cancel"
              type="button"
              onClick={closeAddCard}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button className="add-card-btn" type="button" onClick={openAddCard}>
          + Add card
        </button>
      )}
    </div>
  );
}
