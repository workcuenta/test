import React, { useState, useEffect, useRef } from "react";
import type { Board } from "../types";

interface Props {
  boards: Board[];
  activeBoardId: number | null;
  isCreating: boolean;
  onSelect: (boardId: number) => void;
  onCreateClick: () => void;
  onCreateBoard: (name: string) => Promise<void>;
  onCreateCancel: () => void;
}

export function BoardSwitcher({
  boards,
  activeBoardId,
  isCreating,
  onSelect,
  onCreateClick,
  onCreateBoard,
  onCreateCancel,
}: Props) {
  const [newName, setNewName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isCreating) {
      setNewName("");
      inputRef.current?.focus();
    }
  }, [isCreating]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onCreateCancel();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setSubmitting(true);
    await onCreateBoard(newName.trim());
    setSubmitting(false);
    setNewName("");
  };

  return (
    <div className="board-tabs">
      {boards.map((board) => (
        <button
          key={board.id}
          type="button"
          className={`board-tab${board.id === activeBoardId ? " active" : ""}`}
          onClick={() => onSelect(board.id)}
        >
          {board.name}
        </button>
      ))}

      {isCreating ? (
        <form className="board-create-inline" onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            className="board-create-input"
            type="text"
            placeholder="Board name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            className="board-create-btn"
            type="submit"
            disabled={submitting || !newName.trim()}
          >
            {submitting ? "…" : "Add"}
          </button>
          <button
            className="board-create-cancel"
            type="button"
            onClick={onCreateCancel}
          >
            Cancel
          </button>
        </form>
      ) : (
        <button
          type="button"
          className="board-tab-add"
          onClick={onCreateClick}
          title="New board"
        >
          +
        </button>
      )}
    </div>
  );
}
