import React, { useEffect, useState } from "react";
import type { Board } from "../types";

interface ColumnMetric {
  columnId: number;
  columnName: string;
  cardCount: number;
}

interface BoardMetrics {
  boardId: number;
  columnCount: number;
  totalCards: number;
  cardsByColumn: ColumnMetric[];
}

interface DashboardProps {
  boards: Board[];
  onSelectBoard: (boardId: number) => void;
  onCreateBoard: (name: string) => void;
}

function BoardTile({
  board,
  onSelect,
}: {
  board: Board;
  onSelect: () => void;
}) {
  const [metrics, setMetrics] = useState<BoardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/boards/${board.id}/metrics`)
      .then((r) => r.json())
      .then((data: BoardMetrics) => {
        setMetrics(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [board.id]);

  return (
    <button
      className="dashboard-tile"
      onClick={onSelect}
      type="button"
    >
      <h3 className="dashboard-tile-name">{board.name}</h3>
      {loading ? (
        <p className="dashboard-tile-loading">Loading metrics…</p>
      ) : metrics ? (
        <div className="dashboard-tile-metrics">
          <div className="dashboard-tile-summary">
            <span>{metrics.columnCount} column{metrics.columnCount !== 1 ? "s" : ""}</span>
            <span>{metrics.totalCards} card{metrics.totalCards !== 1 ? "s" : ""}</span>
          </div>
          {metrics.cardsByColumn.length > 0 && (
            <ul className="dashboard-tile-breakdown">
              {metrics.cardsByColumn.map((col) => (
                <li key={col.columnId}>
                  <span className="dashboard-tile-col-name">{col.columnName}</span>
                  <span className="dashboard-tile-col-count">{col.cardCount}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </button>
  );
}

function CreateBoardPrompt({ onCreate }: { onCreate: (name: string) => void }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    await onCreate(name.trim());
    setLoading(false);
  };

  return (
    <div className="board-create-prompt">
      <h2>Create your first board</h2>
      <form onSubmit={handleSubmit} className="board-create-prompt-form">
        <input
          className="board-create-input"
          type="text"
          placeholder="Board name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
        <button
          className="board-create-btn"
          type="submit"
          disabled={loading || !name.trim()}
        >
          {loading ? "Creating…" : "Create board"}
        </button>
      </form>
    </div>
  );
}

export function Dashboard({ boards, onSelectBoard, onCreateBoard }: DashboardProps) {
  if (boards.length === 0) {
    return <CreateBoardPrompt onCreate={onCreateBoard} />;
  }

  return (
    <div className="dashboard">
      <h2 className="dashboard-title">Your Boards</h2>
      <div className="dashboard-grid">
        {boards.map((board) => (
          <BoardTile
            key={board.id}
            board={board}
            onSelect={() => onSelectBoard(board.id)}
          />
        ))}
      </div>
    </div>
  );
}
