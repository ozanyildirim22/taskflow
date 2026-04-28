'use client';

import React, { useState, useRef } from 'react';
import { useAuth, useBoard } from '../context';
import { Card } from '../types';
import { formatDueDate, isDueSoon } from '../utils';
import CardModal from './CardModal';

interface BoardViewProps {
  boardId: string;
  onBack: () => void;
}

export default function BoardView({ boardId, onBack }: BoardViewProps) {
  const { user } = useAuth();
  const {
    state, updateBoard, getBoardColumns, getColumnCards,
    createColumn, updateColumn, deleteColumn,
    createCard, moveCard, moveColumn,
  } = useBoard();

  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [editingCardColTitle, setEditingCardColTitle] = useState('');
  const [addingCardCol, setAddingCardCol] = useState<string | null>(null);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [addingColumn, setAddingColumn] = useState(false);
  const [newColTitle, setNewColTitle] = useState('');

  // ─── Native DnD state ─────────────────────────────────
  const [dragType, setDragType] = useState<'card' | 'column' | null>(null);
  const [dragCardId, setDragCardId] = useState<string | null>(null);
  const [dragSourceColId, setDragSourceColId] = useState<string | null>(null);
  const [dragSourceIdx, setDragSourceIdx] = useState<number>(0);
  const [dragColIdx, setDragColIdx] = useState<number>(0);
  const [dropTargetColId, setDropTargetColId] = useState<string | null>(null);
  const [dropTargetIdx, setDropTargetIdx] = useState<number | null>(null);
  const [dropColTargetIdx, setDropColTargetIdx] = useState<number | null>(null);
  const dropHandledRef = useRef(false);

  const board = state.boards[boardId];
  if (!board) return <div className="loading-page"><div className="spinner" /></div>;

  const columns = getBoardColumns(boardId);

  // ─── Card drag handlers ────────────────────────────────
  const onCardDragStart = (e: React.DragEvent, cardId: string, colId: string, idx: number) => {
    setDragType('card');
    setDragCardId(cardId);
    setDragSourceColId(colId);
    setDragSourceIdx(idx);
    dropHandledRef.current = false;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', cardId);
    // Add drag styling after a tick so the drag image captures the original look
    requestAnimationFrame(() => {
      const el = document.getElementById(`card-${cardId}`);
      if (el) el.classList.add('card-dragging-source');
    });
  };

  const onCardDragEnd = () => {
    // Clean up all drag state
    if (dragCardId) {
      const el = document.getElementById(`card-${dragCardId}`);
      if (el) el.classList.remove('card-dragging-source');
    }
    setDragType(null);
    setDragCardId(null);
    setDragSourceColId(null);
    setDropTargetColId(null);
    setDropTargetIdx(null);
  };

  const onColumnDragOver = (e: React.DragEvent, colId: string) => {
    if (dragType !== 'card') return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropTargetColId(colId);
  };

  const onCardDragOver = (e: React.DragEvent, colId: string, idx: number) => {
    if (dragType !== 'card') return;
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    setDropTargetColId(colId);
    setDropTargetIdx(idx);
  };

  const onColumnDrop = (e: React.DragEvent, colId: string) => {
    if (dragType !== 'card') return;
    e.preventDefault();
    if (dropHandledRef.current) return;
    if (!dragCardId || !dragSourceColId) return;

    dropHandledRef.current = true;
    const destCards = getColumnCards(colId);
    const destIdx = dropTargetIdx !== null ? dropTargetIdx : destCards.length;
    moveCard(dragCardId, dragSourceColId, colId, dragSourceIdx, destIdx);
    onCardDragEnd();
  };

  const onCardDrop = (e: React.DragEvent, colId: string, idx: number) => {
    if (dragType !== 'card') return;
    e.preventDefault();
    e.stopPropagation();
    if (dropHandledRef.current) return;
    if (!dragCardId || !dragSourceColId) return;

    dropHandledRef.current = true;
    moveCard(dragCardId, dragSourceColId, colId, dragSourceIdx, idx);
    onCardDragEnd();
  };

  // ─── Column drag handlers ─────────────────────────────
  const onColDragStart = (e: React.DragEvent, colIdx: number) => {
    setDragType('column');
    setDragColIdx(colIdx);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(colIdx));
  };

  const onColDragOver = (e: React.DragEvent, targetIdx: number) => {
    if (dragType !== 'column') return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropColTargetIdx(targetIdx);
  };

  const onColDrop = (e: React.DragEvent, targetIdx: number) => {
    if (dragType !== 'column') return;
    e.preventDefault();
    moveColumn(boardId, dragColIdx, targetIdx);
    setDragType(null);
    setDropColTargetIdx(null);
  };

  const onColDragEnd = () => {
    setDragType(null);
    setDropColTargetIdx(null);
  };

  // ─── Other handlers ────────────────────────────────────
  const handleAddCard = (columnId: string) => {
    if (!newCardTitle.trim()) return;
    createCard(columnId, boardId, newCardTitle.trim());
    setNewCardTitle('');
    setAddingCardCol(null);
  };

  const handleAddColumn = () => {
    if (!newColTitle.trim()) return;
    createColumn(boardId, newColTitle.trim());
    setNewColTitle('');
    setAddingColumn(false);
  };

  const openCardModal = (card: Card, colTitle: string) => {
    if (dragType) return; // don't open modal during drag
    setEditingCard(card);
    setEditingCardColTitle(colTitle);
  };

  return (
    <div className="board-page" style={{ background: `linear-gradient(180deg, ${board.backgroundColor}dd 0%, var(--bg-primary) 100%)` }}>
      <div className="board-topbar">
        <div className="board-topbar-left">
          <button className="btn-ghost" onClick={onBack}>← Boards</button>
          <input
            className="board-title-input"
            value={board.title}
            onChange={(e) => updateBoard(boardId, { title: e.target.value })}
          />
        </div>
        <div className="topbar-right">
          <div className="topbar-user">
            <div className="topbar-avatar">{user?.username?.charAt(0).toUpperCase()}</div>
            <span>{user?.username}</span>
          </div>
        </div>
      </div>

      <div className="board-content">
        {columns.map((col, colIdx) => {
          const cards = getColumnCards(col.id);
          const isDropTarget = dragType === 'card' && dropTargetColId === col.id;
          const isColDropTarget = dragType === 'column' && dropColTargetIdx === colIdx;

          return (
            <div
              key={col.id}
              className={`column ${isColDropTarget ? 'column-drop-target' : ''}`}
              draggable
              onDragStart={(e) => {
                // Only allow column drag from header
                const target = e.target as HTMLElement;
                if (target.closest('.column-cards') || target.closest('.inline-add') || target.closest('.column-add-card')) {
                  e.preventDefault();
                  return;
                }
                onColDragStart(e, colIdx);
              }}
              onDragOver={(e) => {
                if (dragType === 'column') onColDragOver(e, colIdx);
                if (dragType === 'card') onColumnDragOver(e, col.id);
              }}
              onDrop={(e) => {
                if (dragType === 'column') onColDrop(e, colIdx);
                if (dragType === 'card') onColumnDrop(e, col.id);
              }}
              onDragEnd={onColDragEnd}
            >
              <div className="column-header">
                <div style={{ display: 'flex', alignItems: 'center', flex: 1, cursor: 'grab' }}>
                  <input
                    className="column-title-input"
                    value={col.title}
                    onChange={(e) => updateColumn(col.id, { title: e.target.value })}
                    onClick={(e) => e.stopPropagation()}
                    draggable={false}
                  />
                  <span className="column-count">{cards.length}</span>
                </div>
                <div className="column-header-actions">
                  <button className="btn-icon" onClick={() => { if (confirm(`Delete column "${col.title}"?`)) deleteColumn(col.id); }}>🗑️</button>
                </div>
              </div>

              <div
                className={`column-cards ${isDropTarget ? 'column-cards-dragging-over' : ''}`}
                onDragOver={(e) => onColumnDragOver(e, col.id)}
                onDrop={(e) => onColumnDrop(e, col.id)}
                onDragLeave={() => { if (dropTargetColId === col.id) setDropTargetColId(null); }}
              >
                {cards.map((card, cardIdx) => {
                  const dueStatus = isDueSoon(card.dueDate);
                  const isBeingDragged = dragCardId === card.id;
                  const isCardDropTarget = dragType === 'card' && dropTargetColId === col.id && dropTargetIdx === cardIdx && dragCardId !== card.id;

                  return (
                      <div
                        key={card.id}
                        id={`card-${card.id}`}
                        className={`card ${isBeingDragged ? 'card-dragging-source' : ''} ${isCardDropTarget ? 'card-drop-target' : ''}`}
                        draggable
                        onDragStart={(e) => { e.stopPropagation(); onCardDragStart(e, card.id, col.id, cardIdx); }}
                        onDragEnd={onCardDragEnd}
                        onDragOver={(e) => onCardDragOver(e, col.id, cardIdx)}
                        onDrop={(e) => onCardDrop(e, col.id, cardIdx)}
                        onClick={() => openCardModal(card, col.title)}
                      >
                        {card.labels.length > 0 && (
                          <div className="card-labels">
                            {card.labels.map((l) => (
                              <span key={l.id} className="card-label" style={{ background: l.color }}>{l.text}</span>
                            ))}
                          </div>
                        )}
                        <div className="card-title">{card.title}</div>
                        <div className="card-meta">
                          {card.description && <span className="card-desc-indicator">📝</span>}
                          {card.dueDate && dueStatus && (
                            <span className={`card-due ${dueStatus}`}>🕐 {formatDueDate(card.dueDate)}</span>
                          )}
                          {card.assignee && <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>👤 {card.assignee}</span>}
                        </div>
                      </div>
                  );
                })}
              </div>

              {addingCardCol === col.id ? (
                <div className="inline-add">
                  <input
                    placeholder="Enter card title..."
                    value={newCardTitle}
                    onChange={(e) => setNewCardTitle(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleAddCard(col.id); if (e.key === 'Escape') setAddingCardCol(null); }}
                    autoFocus
                    draggable={false}
                  />
                  <div className="inline-add-actions">
                    <button className="btn-primary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => handleAddCard(col.id)}>Add</button>
                    <button className="btn-ghost" onClick={() => setAddingCardCol(null)}>✕</button>
                  </div>
                </div>
              ) : (
                <button className="column-add-card" onClick={() => { setAddingCardCol(col.id); setNewCardTitle(''); }}>+ Add a card</button>
              )}
            </div>
          );
        })}

        {addingColumn ? (
          <div className="column" style={{ minHeight: 'auto' }}>
            <div className="inline-add" style={{ padding: '14px' }}>
              <input
                placeholder="Column title..."
                value={newColTitle}
                onChange={(e) => setNewColTitle(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddColumn(); if (e.key === 'Escape') setAddingColumn(false); }}
                autoFocus
                draggable={false}
              />
              <div className="inline-add-actions">
                <button className="btn-primary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={handleAddColumn}>Add Column</button>
                <button className="btn-ghost" onClick={() => setAddingColumn(false)}>✕</button>
              </div>
            </div>
          </div>
        ) : (
          <button className="add-column-btn" onClick={() => { setAddingColumn(true); setNewColTitle(''); }}>+ Add Column</button>
        )}
      </div>

      {editingCard && (
        <CardModal
          card={state.cards[editingCard.id] || editingCard}
          columnTitle={editingCardColTitle}
          onClose={() => setEditingCard(null)}
        />
      )}
    </div>
  );
}
