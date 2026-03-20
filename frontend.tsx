import React, { useEffect, useState, useCallback, useRef } from "react";
import { createRoot } from "react-dom/client";
import type { Board, Column, Card, Label } from "./src/types";
import { Board as BoardComponent } from "./src/components/Board";
import { LoginPage } from "./src/components/LoginPage";
import { FilterBar } from "./src/components/FilterBar";
import { BoardSwitcher } from "./src/components/BoardSwitcher";
import { Dashboard } from "./src/components/Dashboard";

interface AppState {
  boards: Board[];
  activeBoardId: number | null;
  columns: Column[];
  cards: Record<number, Card[]>;
  labels: Label[];
}

function BoardCreatePrompt({ onCreate }: { onCreate: (name: string) => void }) {
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
        <button className="board-create-btn" type="submit" disabled={loading || !name.trim()}>
          {loading ? "Creating…" : "Create board"}
        </button>
      </form>
    </div>
  );
}

function App() {
  const [username, setUsername] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [view, setView] = useState<"dashboard" | "board">("dashboard");
  const [state, setState] = useState<AppState>({
    boards: [],
    activeBoardId: null,
    columns: [],
    cards: {},
    labels: [],
  });
  const [filterText, setFilterText] = useState("");
  const [filterLabelIds, setFilterLabelIds] = useState<Set<number>>(new Set());

  const checkAuth = useCallback(async () => {
    const res = await fetch("/api/auth/me");
    if (res.ok) {
      const data = await res.json();
      setUsername(data.username);
    } else {
      setUsername(null);
    }
    setAuthChecked(true);
  }, []);

  const handleLogout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUsername(null);
    setView("dashboard");
    setState({ boards: [], activeBoardId: null, columns: [], cards: {}, labels: [] });
  }, []);

  const refresh = useCallback(async (boardId?: number) => {
    try {
      const boards: Board[] = await fetch("/api/boards").then((r) => r.json());
      if (!boards.length) {
        setState({ boards: [], activeBoardId: null, columns: [], cards: {}, labels: [] });
        return;
      }

      const activeId = boardId ?? boards[0].id;
      const board = boards.find((b) => b.id === activeId) ?? boards[0];

      const [columns, labels]: [Column[], Label[]] = await Promise.all([
        fetch(`/api/boards/${board.id}/columns`).then((r) => r.json()),
        fetch(`/api/boards/${board.id}/labels`).then((r) => r.json()),
      ]);

      const cardEntries = await Promise.all(
        columns.map(async (col) => {
          const cards: Card[] = await fetch(
            `/api/columns/${col.id}/cards`
          ).then((r) => r.json());
          return [col.id, cards] as const;
        })
      );
      const cards = Object.fromEntries(cardEntries);

      setState({ boards, activeBoardId: board.id, columns, cards, labels });
    } catch (err) {
      console.error("Failed to refresh board:", err);
    }
  }, []);

  useEffect(() => { checkAuth(); }, [checkAuth]);
  useEffect(() => { if (username) refresh(); }, [username, refresh]);

  const handleSelect = useCallback((boardId: number) => {
    setState((prev) => ({ ...prev, activeBoardId: boardId }));
    refresh(boardId);
    setView("board");
  }, [refresh]);

  const handleCreateBoard = useCallback(async (name: string) => {
    if (!name.trim()) return;
    const res = await fetch("/api/boards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() }),
    });
    if (!res.ok) return;
    const newBoard: Board = await res.json();
    setIsCreating(false);
    await refresh(newBoard.id);
    setView("board");
  }, [refresh]);

  const handleLabelToggle = useCallback((labelId: number) => {
    setFilterLabelIds((prev) => {
      const next = new Set(prev);
      if (next.has(labelId)) next.delete(labelId);
      else next.add(labelId);
      return next;
    });
  }, []);

  if (!authChecked) {
    return <div className="loading">Loading…</div>;
  }

  if (!username) {
    return <LoginPage onAuth={(u) => setUsername(u)} />;
  }

  const activeBoard = state.boards.find((b) => b.id === state.activeBoardId) ?? null;

  if (view === "dashboard") {
    return (
      <div className="app">
        <header className="app-header">
          <h1>Kanban</h1>
          <div className="app-header-user">
            <span>{username}</span>
            <button className="logout-btn" onClick={handleLogout} type="button">
              Log out
            </button>
          </div>
        </header>
        <main>
          <Dashboard
            boards={state.boards}
            onSelectBoard={handleSelect}
            onCreateBoard={handleCreateBoard}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <button className="home-btn" onClick={() => setView("dashboard")} type="button" title="Back to dashboard">
          ⌂
        </button>
        <h1>{activeBoard?.name ?? "Kanban"}</h1>
        <BoardSwitcher
          boards={state.boards}
          activeBoardId={state.activeBoardId}
          isCreating={isCreating}
          onSelect={handleSelect}
          onCreateClick={() => setIsCreating(true)}
          onCreateBoard={handleCreateBoard}
          onCreateCancel={() => setIsCreating(false)}
        />
        <div className="app-header-user">
          <span>{username}</span>
          <button className="logout-btn" onClick={handleLogout} type="button">
            Log out
          </button>
        </div>
      </header>
      {state.boards.length > 0 && (
        <FilterBar
          labels={state.labels}
          filterText={filterText}
          filterLabelIds={filterLabelIds}
          onTextChange={setFilterText}
          onLabelToggle={handleLabelToggle}
        />
      )}
      <main>
        {state.boards.length === 0 ? (
          <BoardCreatePrompt onCreate={handleCreateBoard} />
        ) : (
          <BoardComponent
            columns={state.columns}
            cards={state.cards}
            filterText={filterText}
            filterLabelIds={filterLabelIds}
            boardId={state.activeBoardId ?? undefined}
            onRefresh={refresh}
          />
        )}
      </main>
    </div>
  );
}

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
