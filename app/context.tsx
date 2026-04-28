'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Board, Column, Card, AppState, Activity, Label } from './types';
import * as storage from './storage';
import { generateId, hashPassword } from './utils';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (username: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

interface BoardContextType {
  state: AppState;
  // Board
  createBoard: (title: string, description: string, color: string) => Board;
  updateBoard: (boardId: string, updates: Partial<Board>) => void;
  deleteBoard: (boardId: string) => void;
  getUserBoards: () => Board[];
  // Column
  createColumn: (boardId: string, title: string) => Column;
  updateColumn: (columnId: string, updates: Partial<Column>) => void;
  deleteColumn: (columnId: string) => void;
  // Card
  createCard: (columnId: string, boardId: string, title: string) => Card;
  updateCard: (cardId: string, updates: Partial<Card>) => void;
  deleteCard: (cardId: string) => void;
  // DnD
  moveCard: (cardId: string, sourceColId: string, destColId: string, sourceIdx: number, destIdx: number) => void;
  moveColumn: (boardId: string, sourceIdx: number, destIdx: number) => void;
  // Helpers
  getColumnCards: (columnId: string) => Card[];
  getBoardColumns: (boardId: string) => Column[];
}

const AuthContext = createContext<AuthContextType | null>(null);
const BoardContext = createContext<BoardContextType | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function useBoard() {
  const ctx = useContext(BoardContext);
  if (!ctx) throw new Error('useBoard must be used within BoardProvider');
  return ctx;
}

// ─── Auth Provider ──────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = storage.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const users = storage.getUsers();
    const hash = await hashPassword(password);
    const found = users.find((u) => u.email === email && u.passwordHash === hash);
    if (found) {
      setUser(found);
      storage.setCurrentUser(found);
      return { success: true };
    }
    return { success: false, error: 'Invalid email or password' };
  }, []);

  const register = useCallback(async (username: string, email: string, password: string) => {
    const users = storage.getUsers();
    if (users.find((u) => u.email === email)) {
      return { success: false, error: 'Email already registered' };
    }
    const hash = await hashPassword(password);
    const newUser: User = {
      id: generateId(),
      username,
      email,
      passwordHash: hash,
      createdAt: new Date().toISOString(),
    };
    storage.saveUsers([...users, newUser]);
    setUser(newUser);
    storage.setCurrentUser(newUser);
    return { success: true };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    storage.setCurrentUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Board Provider ─────────────────────────────────────────────

export function BoardProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>({ boards: {}, columns: {}, cards: {} });
  const { user } = useAuth();

  useEffect(() => {
    setState(storage.getAppState());
  }, []);

  const createBoardFn = useCallback(
    (title: string, description: string, color: string): Board => {
      const board: Board = {
        id: generateId(),
        title,
        description,
        userId: user?.id || '',
        columnOrder: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        backgroundColor: color,
      };
      setState((prev) => {
        const next = storage.createBoard(prev, board);
        return next;
      });
      return board;
    },
    [user]
  );

  const updateBoardFn = useCallback((boardId: string, updates: Partial<Board>) => {
    setState((prev) => storage.updateBoard(prev, boardId, updates));
  }, []);

  const deleteBoardFn = useCallback((boardId: string) => {
    setState((prev) => storage.deleteBoard(prev, boardId));
  }, []);

  const getUserBoards = useCallback((): Board[] => {
    if (!user) return [];
    return Object.values(state.boards)
      .filter((b) => b.userId === user.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [state.boards, user]);

  const createColumnFn = useCallback(
    (boardId: string, title: string): Column => {
      const board = state.boards[boardId];
      const column: Column = {
        id: generateId(),
        title,
        order: board ? board.columnOrder.length : 0,
        cardIds: [],
        boardId,
      };
      setState((prev) => storage.createColumn(prev, column));
      return column;
    },
    [state.boards]
  );

  const updateColumnFn = useCallback((columnId: string, updates: Partial<Column>) => {
    setState((prev) => storage.updateColumn(prev, columnId, updates));
  }, []);

  const deleteColumnFn = useCallback((columnId: string) => {
    setState((prev) => storage.deleteColumn(prev, columnId));
  }, []);

  const createCardFn = useCallback(
    (columnId: string, boardId: string, title: string): Card => {
      const column = state.columns[columnId];
      const card: Card = {
        id: generateId(),
        title,
        description: '',
        labels: [],
        dueDate: null,
        assignee: null,
        order: column ? column.cardIds.length : 0,
        columnId,
        boardId,
        createdAt: new Date().toISOString(),
        activityLog: [
          {
            id: generateId(),
            action: 'created',
            cardTitle: title,
            timestamp: new Date().toISOString(),
            userId: user?.id || '',
          },
        ],
      };
      setState((prev) => storage.createCard(prev, card));
      return card;
    },
    [state.columns, user]
  );

  const updateCardFn = useCallback((cardId: string, updates: Partial<Card>) => {
    setState((prev) => storage.updateCard(prev, cardId, updates));
  }, []);

  const deleteCardFn = useCallback((cardId: string) => {
    setState((prev) => storage.deleteCard(prev, cardId));
  }, []);

  // ─── Drag and Drop ───────────────────────────────────────────

  const moveCard = useCallback(
    (cardId: string, sourceColId: string, destColId: string, sourceIdx: number, destIdx: number) => {
      setState((prev) => {
        const sourceCol = prev.columns[sourceColId];
        const destCol = prev.columns[destColId];
        if (!sourceCol || !destCol) return prev;

        const card = prev.cards[cardId];
        if (!card) return prev;

        let newState = { ...prev };

        if (sourceColId === destColId) {
          // Moving within the same column
          const newCardIds = Array.from(sourceCol.cardIds);
          newCardIds.splice(sourceIdx, 1);
          newCardIds.splice(destIdx, 0, cardId);

          newState = {
            ...newState,
            columns: {
              ...newState.columns,
              [sourceColId]: { ...sourceCol, cardIds: newCardIds },
            },
          };
        } else {
          // Moving between columns
          const sourceCardIds = Array.from(sourceCol.cardIds);
          sourceCardIds.splice(sourceIdx, 1);

          const destCardIds = Array.from(destCol.cardIds);
          destCardIds.splice(destIdx, 0, cardId);

          // Add activity log
          const activity: Activity = {
            id: generateId(),
            action: 'moved',
            cardTitle: card.title,
            fromColumn: sourceCol.title,
            toColumn: destCol.title,
            timestamp: new Date().toISOString(),
            userId: user?.id || '',
          };

          newState = {
            ...newState,
            columns: {
              ...newState.columns,
              [sourceColId]: { ...sourceCol, cardIds: sourceCardIds },
              [destColId]: { ...destCol, cardIds: destCardIds },
            },
            cards: {
              ...newState.cards,
              [cardId]: {
                ...card,
                columnId: destColId,
                activityLog: [...card.activityLog, activity],
              },
            },
          };
        }

        storage.saveAppState(newState);
        return newState;
      });
    },
    [user]
  );

  const moveColumn = useCallback((boardId: string, sourceIdx: number, destIdx: number) => {
    setState((prev) => {
      const board = prev.boards[boardId];
      if (!board) return prev;

      const newOrder = Array.from(board.columnOrder);
      const [removed] = newOrder.splice(sourceIdx, 1);
      newOrder.splice(destIdx, 0, removed);

      const newState = {
        ...prev,
        boards: {
          ...prev.boards,
          [boardId]: { ...board, columnOrder: newOrder, updatedAt: new Date().toISOString() },
        },
      };
      storage.saveAppState(newState);
      return newState;
    });
  }, []);

  const getColumnCards = useCallback(
    (columnId: string): Card[] => {
      const column = state.columns[columnId];
      if (!column) return [];
      return column.cardIds.map((id) => state.cards[id]).filter(Boolean);
    },
    [state.columns, state.cards]
  );

  const getBoardColumns = useCallback(
    (boardId: string): Column[] => {
      const board = state.boards[boardId];
      if (!board) return [];
      return board.columnOrder.map((id) => state.columns[id]).filter(Boolean);
    },
    [state.boards, state.columns]
  );

  return (
    <BoardContext.Provider
      value={{
        state,
        createBoard: createBoardFn,
        updateBoard: updateBoardFn,
        deleteBoard: deleteBoardFn,
        getUserBoards,
        createColumn: createColumnFn,
        updateColumn: updateColumnFn,
        deleteColumn: deleteColumnFn,
        createCard: createCardFn,
        updateCard: updateCardFn,
        deleteCard: deleteCardFn,
        moveCard,
        moveColumn,
        getColumnCards,
        getBoardColumns,
      }}
    >
      {children}
    </BoardContext.Provider>
  );
}
