import React from 'react';
import { Session } from '../types';
import { Trash2, MessageCircle } from 'lucide-react';

interface HistoryListProps {
  sessions: Session[];
  onDeleteSession: (id: string) => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({ sessions, onDeleteSession }) => {
  const sortedSessions = [...sessions].sort((a, b) => b.startTime - a.startTime);

  if (sessions.length === 0) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-400">
        No history available.
      </div>
    );
  }

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', weekday: 'short' });
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto pb-24">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">History Log</h2>
      <div className="space-y-4">
        {sortedSessions.map((session) => (
          <div key={session.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:shadow-md">
            
            <div className="flex items-start gap-4">
              <div className="min-w-[80px] text-center">
                 <div className="text-xs font-bold text-gray-500 uppercase tracking-wide">{formatDate(session.startTime)}</div>
                 <div className="text-xl font-bold text-gray-800">{formatTime(session.startTime)}</div>
              </div>
              
              <div className="h-10 w-[1px] bg-gray-200 hidden md:block"></div>

              <div>
                <div className="flex items-center gap-2 text-indigo-600 font-semibold">
                  <MessageCircle size={16} />
                  <span>{session.note}</span>
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  End: {formatTime(session.endTime)}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-gray-100">
               <div className="bg-gray-50 px-3 py-1 rounded-lg text-gray-700 font-mono font-medium">
                 {formatDuration(session.duration)}
               </div>
               
               <button 
                 onClick={(e) => {
                   e.stopPropagation();
                   onDeleteSession(session.id);
                 }}
                 className="text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-full cursor-pointer z-10"
                 title="Delete entry"
                 type="button"
               >
                 <Trash2 size={18} />
               </button>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};