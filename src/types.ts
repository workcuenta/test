export interface Label {
  id: number;
  board_id: number;
  name: string;
  color: string;
  created_at: number;
}

export interface Board {
  id: number;
  name: string;
  created_at: number;
}

export interface Column {
  id: number;
  board_id: number;
  name: string;
  position: number;
  created_at: number;
}

export interface Card {
  id: number;
  column_id: number;
  title: string;
  description: string | null;
  position: number;
  created_at: number;
  labels: Label[];
}
