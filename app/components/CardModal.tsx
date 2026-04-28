'use client';

import React, { useState } from 'react';
import { Card, LABEL_COLORS } from '../types';
import { useBoard } from '../context';
import { formatDate, formatDueDate, isDueSoon } from '../utils';

interface CardModalProps {
  card: Card;
  columnTitle: string;
  onClose: () => void;
}

export default function CardModal({ card, columnTitle, onClose }: CardModalProps) {
  const { updateCard, deleteCard } = useBoard();
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description);
  const [dueDate, setDueDate] = useState(card.dueDate || '');
  const [assignee, setAssignee] = useState(card.assignee || '');
  const [labels, setLabels] = useState(card.labels);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const handleSave = () => {
    updateCard(card.id, {
      title: title.trim() || card.title,
      description: description.trim(),
      dueDate: dueDate || null,
      assignee: assignee.trim() || null,
      labels,
    });
    onClose();
  };

  const handleDelete = () => {
    deleteCard(card.id);
    onClose();
  };

  const toggleLabel = (labelColor: typeof LABEL_COLORS[0]) => {
    const exists = labels.find((l) => l.id === labelColor.id);
    if (exists) {
      setLabels(labels.filter((l) => l.id !== labelColor.id));
    } else {
      setLabels([...labels, { id: labelColor.id, text: labelColor.name, color: labelColor.color }]);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Edit Card</h3>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>in column <strong style={{ color: 'var(--text-secondary)' }}>{columnTitle}</strong></div>

          <div className="form-group">
            <label>Title</label>
            <input className="form-input" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Add a more detailed description..." />
          </div>

          <div className="form-group">
            <label>Labels</label>
            <div className="labels-section">
              {LABEL_COLORS.map((lc) => (
                <span key={lc.id} className={`label-chip ${labels.find((l) => l.id === lc.id) ? 'active' : ''}`} style={{ background: lc.color }} onClick={() => toggleLabel(lc)}>
                  {lc.name}
                </span>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Due Date</label>
              <input className="form-input" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Assignee</label>
              <input className="form-input" placeholder="Name" value={assignee} onChange={(e) => setAssignee(e.target.value)} />
            </div>
          </div>

          {card.activityLog.length > 0 && (
            <div className="form-group">
              <label>Activity</label>
              <div className="activity-log">
                {card.activityLog.slice().reverse().slice(0, 10).map((a) => (
                  <div key={a.id} className="activity-item">
                    <span className="activity-dot" />
                    <div>
                      <div>
                        {a.action === 'created' && `Card created`}
                        {a.action === 'moved' && `Moved from ${a.fromColumn} → ${a.toColumn}`}
                      </div>
                      <div className="activity-time">{formatDate(a.timestamp)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <div>
            {!showConfirmDelete ? (
              <button className="btn-danger" onClick={() => setShowConfirmDelete(true)}>Delete</button>
            ) : (
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Sure?</span>
                <button className="btn-danger" onClick={handleDelete}>Yes, Delete</button>
                <button className="btn-ghost" onClick={() => setShowConfirmDelete(false)}>No</button>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn-primary" onClick={handleSave}>Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}
