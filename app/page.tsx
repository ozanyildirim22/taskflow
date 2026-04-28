'use client';

import React, { useState } from 'react';
import { useAuth, useBoard } from './context';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import BoardView from './components/BoardView';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentBoard, setCurrentBoard] = useState<string | null>(null);

  if (loading) {
    return <div className="loading-page"><div className="spinner" /></div>;
  }

  if (!user) {
    return <AuthPage />;
  }

  if (currentBoard) {
    return <BoardView boardId={currentBoard} onBack={() => setCurrentBoard(null)} />;
  }

  return <Dashboard onOpenBoard={(id) => setCurrentBoard(id)} />;
}

export default function Home() {
  return <AppContent />;
}
