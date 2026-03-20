import React from "react";
import type { Card as CardType } from "../types";

interface Props {
  card: CardType;
}

export function Card({ card }: Props) {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData(
      "kanban/card",
      JSON.stringify({ cardId: card.id, columnId: card.column_id })
    );
    e.dataTransfer.effectAllowed = "move";
    e.stopPropagation();
  };

  return (
    <div
      className="card"
      draggable
      onDragStart={handleDragStart}
      data-card-id={card.id}
    >
      {card.labels.length > 0 && (
        <div className="card-labels">
          {card.labels.map((label) => (
            <span
              key={label.id}
              className="label-chip"
              style={{ backgroundColor: label.color }}
            >
              {label.name}
            </span>
          ))}
        </div>
      )}
      <div className="card-title">{card.title}</div>
      {card.description && (
        <div className="card-desc">{card.description}</div>
      )}
    </div>
  );
}
