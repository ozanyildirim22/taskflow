// TaskFlow Type Definitions

export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

export interface Activity {
  id: string;
  action: string;
  cardTitle: string;
  fromColumn?: string;
  toColumn?: string;
  timestamp: string;
  userId: string;
}

export interface Card {
  id: string;
  title: string;
  description: string;
  labels: Label[];
  dueDate: string | null;
  assignee: string | null;
  order: number;
  columnId: string;
  boardId: string;
  createdAt: string;
  activityLog: Activity[];
}

export interface Label {
  id: string;
  text: string;
  color: string;
}

export interface Column {
  id: string;
  title: string;
  order: number;
  cardIds: string[];
  boardId: string;
}

export interface Board {
  id: string;
  title: string;
  description: string;
  userId: string;
  columnOrder: string[];
  createdAt: string;
  updatedAt: string;
  backgroundColor: string;
}

export interface AppState {
  boards: Record<string, Board>;
  columns: Record<string, Column>;
  cards: Record<string, Card>;
}

export const LABEL_COLORS = [
  { id: 'green', color: '#22c55e', name: 'Green' },
  { id: 'yellow', color: '#eab308', name: 'Yellow' },
  { id: 'orange', color: '#f97316', name: 'Orange' },
  { id: 'red', color: '#ef4444', name: 'Red' },
  { id: 'purple', color: '#a855f7', name: 'Purple' },
  { id: 'blue', color: '#3b82f6', name: 'Blue' },
  { id: 'cyan', color: '#06b6d4', name: 'Cyan' },
  { id: 'pink', color: '#ec4899', name: 'Pink' },
];

export const BOARD_COLORS = [
  '#0f172a',
  '#1e1b4b',
  '#172554',
  '#14532d',
  '#422006',
  '#450a0a',
  '#2e1065',
  '#083344',
];
