import React, { useRef } from "react";
import type { Label } from "../types";

interface Props {
  labels: Label[];
  filterText: string;
  filterLabelIds: Set<number>;
  onTextChange: (text: string) => void;
  onLabelToggle: (labelId: number) => void;
}

export function FilterBar({
  labels,
  filterText,
  filterLabelIds,
  onTextChange,
  onLabelToggle,
}: Props) {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onTextChange(val), 150);
  };

  return (
    <div className="filter-bar">
      <input
        className="filter-search"
        type="search"
        placeholder="Search cards…"
        defaultValue={filterText}
        onChange={handleInput}
      />
      {labels.length > 0 && (
        <div className="filter-labels">
          {labels.map((label) => {
            const active = filterLabelIds.has(label.id);
            return (
              <button
                key={label.id}
                type="button"
                className={`filter-label-chip${active ? " active" : ""}`}
                style={
                  active
                    ? { backgroundColor: label.color, borderColor: label.color }
                    : { borderColor: label.color, color: label.color }
                }
                onClick={() => onLabelToggle(label.id)}
              >
                {label.name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
