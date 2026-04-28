'use client';

import React, { useState } from 'react';
import { useAuth, useBoard } from '../context';
import { BOARD_COLORS } from '../types';

interface DashboardProps {
  onOpenBoard: (boardId: string) => void;
}

export default function Dashboard({ onOpenBoard }: DashboardProps) {
  const { user, logout } = useAuth();
  const { getUserBoards, createBoard, deleteBoard } = useBoard();
  const [showNewBoard, setShowNewBoard] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newColor, setNewColor] = useState(BOARD_COLORS[0]);

  const boards = getUserBoards();

  const handleCreate = () => {
    if (!newTitle.trim()) return;
    const board = createBoard(newTitle.trim(), newDesc.trim(), newColor);
    setNewTitle('');
    setNewDesc('');
    setShowNewBoard(false);
    onOpenBoard(board.id);
  };

  return (
    <div className="dashboard">
      <header className="topbar">
        <div className="topbar-logo">⚡ TaskFlow</div>
        <div className="topbar-right">
          <div className="topbar-user">
            <div className="topbar-avatar">{user?.username?.charAt(0).toUpperCase()}</div>
            <span>{user?.username}</span>
          </div>
          <button className="btn-ghost" onClick={logout}>Sign Out</button>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="dashboard-header">
          <h2>Your Boards</h2>
          <p>Manage your projects and tasks</p>
        </div>

        <div className="boards-grid">
          <div className="board-card board-card-new" onClick={() => setShowNewBoard(true)}>
            <span className="plus">+</span>
            <span>Create New Board</span>
          </div>

          {boards.map((board) => (
            <div key={board.id} className="board-card" onClick={() => onOpenBoard(board.id)} style={{ borderTop: `3px solid ${board.backgroundColor || '#6c5ce7'}` }}>
              <h3>{board.title}</h3>
              <p>{board.description || 'No description'}</p>
              <div className="board-card-meta">
                <span>{new Date(board.createdAt).toLocaleDateString()}</span>
                <button className="btn-icon" onClick={(e) => { e.stopPropagation(); if (confirm('Delete this board?')) deleteBoard(board.id); }} title="Delete board">🗑️</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showNewBoard && (
        <div className="modal-overlay" onClick={() => setShowNewBoard(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New Board</h3>
              <button className="btn-icon" onClick={() => setShowNewBoard(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Board Title</label>
                <input className="form-input" placeholder="e.g. Sprint Board" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} autoFocus onKeyDown={(e) => e.key === 'Enter' && handleCreate()} />
              </div>
              <div className="form-group">
                <label>Description (optional)</label>
                <input className="form-input" placeholder="Brief description" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Color</label>
                <div className="color-picker">
                  {BOARD_COLORS.map((c) => (
                    <div key={c} className={`color-swatch ${newColor === c ? 'active' : ''}`} style={{ background: c }} onClick={() => setNewColor(c)} />
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowNewBoard(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleCreate} disabled={!newTitle.trim()}>Create Board</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
