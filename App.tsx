import React, { useState, useEffect } from 'react';
import { Session, ViewState } from './types';
import { Tracker } from './components/Tracker';
import { Dashboard } from './components/Dashboard';
import { NavBar } from './components/NavBar';
import { HistoryList } from './components/HistoryList';

const App: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.TRACKER);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('chatSessions');
      if (stored) {
        setSessions(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load sessions", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to local storage whenever sessions change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('chatSessions', JSON.stringify(sessions));
    }
  }, [sessions, isLoaded]);

  const handleSaveSession = (newSession: Session) => {
    setSessions(prev => [newSession, ...prev]);
    // Optional: Switch to dashboard or history after saving? 
    // Let's stay on tracker so they can track the next one easily, 
    // but maybe show a toast (omitted for simplicity).
  };

  const handleDeleteSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
  };

  if (!isLoaded) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-400">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 py-4 px-6 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            外星小偷
          </h1>
          <div className="text-xs font-medium text-gray-400 border border-gray-200 px-2 py-1 rounded-full">
            v1.2
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow relative overflow-y-auto">
        <div className="max-w-4xl mx-auto w-full h-full">
          {currentView === ViewState.TRACKER && (
            <Tracker onSaveSession={handleSaveSession} />
          )}
          {currentView === ViewState.DASHBOARD && (
            <Dashboard sessions={sessions} />
          )}
          {currentView === ViewState.HISTORY && (
             <HistoryList sessions={sessions} onDeleteSession={handleDeleteSession} />
          )}
        </div>
      </main>

      {/* Navigation */}
      <NavBar currentView={currentView} setView={setCurrentView} />
    </div>
  );
};

export default App;