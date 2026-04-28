// localStorage storage layer for TaskFlow
import { User, Board, Column, Card, AppState } from './types';

const STORAGE_KEYS = {
  USERS: 'taskflow_users',
  CURRENT_USER: 'taskflow_current_user',
  APP_STATE: 'taskflow_state',
};

// ─── User Storage ───────────────────────────────────────────────

export function getUsers(): User[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.USERS);
  return data ? JSON.parse(data) : [];
}

export function saveUsers(users: User[]): void {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return data ? JSON.parse(data) : null;
}

export function setCurrentUser(user: User | null): void {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
}

// ─── App State Storage ──────────────────────────────────────────

export function getAppState(): AppState {
  if (typeof window === 'undefined') {
    return { boards: {}, columns: {}, cards: {} };
  }
  const data = localStorage.getItem(STORAGE_KEYS.APP_STATE);
  return data ? JSON.parse(data) : { boards: {}, columns: {}, cards: {} };
}

export function saveAppState(state: AppState): void {
  localStorage.setItem(STORAGE_KEYS.APP_STATE, JSON.stringify(state));
}

// ─── Board Operations ───────────────────────────────────────────

export function createBoard(state: AppState, board: Board): AppState {
  const newState = {
    ...state,
    boards: { ...state.boards, [board.id]: board },
  };
  saveAppState(newState);
  return newState;
}

export function updateBoard(state: AppState, boardId: string, updates: Partial<Board>): AppState {
  const board = state.boards[boardId];
  if (!board) return state;
  const newState = {
    ...state,
    boards: {
      ...state.boards,
      [boardId]: { ...board, ...updates, updatedAt: new Date().toISOString() },
    },
  };
  saveAppState(newState);
  return newState;
}

export function deleteBoard(state: AppState, boardId: string): AppState {
  const board = state.boards[boardId];
  if (!board) return state;

  const newBoards = { ...state.boards };
  delete newBoards[boardId];

  const newColumns = { ...state.columns };
  const newCards = { ...state.cards };

  // Delete all columns and cards belonging to this board
  board.columnOrder.forEach((colId) => {
    const col = newColumns[colId];
    if (col) {
      col.cardIds.forEach((cardId) => {
        delete newCards[cardId];
      });
      delete newColumns[colId];
    }
  });

  const newState = { boards: newBoards, columns: newColumns, cards: newCards };
  saveAppState(newState);
  return newState;
}

// ─── Column Operations ─────────────────────────────────────────

export function createColumn(state: AppState, column: Column): AppState {
  const board = state.boards[column.boardId];
  if (!board) return state;

  const newState = {
    ...state,
    columns: { ...state.columns, [column.id]: column },
    boards: {
      ...state.boards,
      [column.boardId]: {
        ...board,
        columnOrder: [...board.columnOrder, column.id],
        updatedAt: new Date().toISOString(),
      },
    },
  };
  saveAppState(newState);
  return newState;
}

export function updateColumn(state: AppState, columnId: string, updates: Partial<Column>): AppState {
  const column = state.columns[columnId];
  if (!column) return state;
  const newState = {
    ...state,
    columns: { ...state.columns, [columnId]: { ...column, ...updates } },
  };
  saveAppState(newState);
  return newState;
}

export function deleteColumn(state: AppState, columnId: string): AppState {
  const column = state.columns[columnId];
  if (!column) return state;

  const board = state.boards[column.boardId];
  if (!board) return state;

  const newColumns = { ...state.columns };
  const newCards = { ...state.cards };

  // Delete all cards in this column
  column.cardIds.forEach((cardId) => {
    delete newCards[cardId];
  });
  delete newColumns[columnId];

  const newState = {
    ...state,
    columns: newColumns,
    cards: newCards,
    boards: {
      ...state.boards,
      [column.boardId]: {
        ...board,
        columnOrder: board.columnOrder.filter((id) => id !== columnId),
        updatedAt: new Date().toISOString(),
      },
    },
  };
  saveAppState(newState);
  return newState;
}

// ─── Card Operations ────────────────────────────────────────────

export function createCard(state: AppState, card: Card): AppState {
  const column = state.columns[card.columnId];
  if (!column) return state;

  const newState = {
    ...state,
    cards: { ...state.cards, [card.id]: card },
    columns: {
      ...state.columns,
      [card.columnId]: {
        ...column,
        cardIds: [...column.cardIds, card.id],
      },
    },
  };
  saveAppState(newState);
  return newState;
}

export function updateCard(state: AppState, cardId: string, updates: Partial<Card>): AppState {
  const card = state.cards[cardId];
  if (!card) return state;
  const newState = {
    ...state,
    cards: { ...state.cards, [cardId]: { ...card, ...updates } },
  };
  saveAppState(newState);
  return newState;
}

export function deleteCard(state: AppState, cardId: string): AppState {
  const card = state.cards[cardId];
  if (!card) return state;

  const column = state.columns[card.columnId];
  if (!column) return state;

  const newCards = { ...state.cards };
  delete newCards[cardId];

  const newState = {
    ...state,
    cards: newCards,
    columns: {
      ...state.columns,
      [card.columnId]: {
        ...column,
        cardIds: column.cardIds.filter((id) => id !== cardId),
      },
    },
  };
  saveAppState(newState);
  return newState;
}
