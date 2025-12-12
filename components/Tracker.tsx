import React, { useState, useEffect } from 'react';
import { Session } from '../types';
import { Save, CalendarDays, Clock, ArrowRight, Shuffle } from 'lucide-react';

interface TrackerProps {
  onSaveSession: (session: Session) => void;
}

const SARCASTIC_TOPICS = [
  "抱怨老闆智商",
  "炫耀貓咪新照片",
  "討論午餐吃什麼 (講了20分鐘)",
  "講隔壁部門壞話",
  "團購飲料湊運費",
  "無意義的嘆氣",
  "假裝在討論公事",
  "分享股票賠多少",
  "抱怨又要加班",
  "問我有沒有空 (其實沒事)",
  "講小孩的瑣事",
  "批評公司的咖啡",
  "討論週末去哪浪",
  "八卦誰跟誰在一起",
  "推銷不必要的保險",
];

export const Tracker: React.FC<TrackerProps> = ({ onSaveSession }) => {
  // --- Helpers ---
  const getRandomTopic = () => {
    const randomIndex = Math.floor(Math.random() * SARCASTIC_TOPICS.length);
    return SARCASTIC_TOPICS[randomIndex];
  };

  const generateId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    // Fallback for non-secure contexts
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  };

  // --- Manual State ---
  const [manualStart, setManualStart] = useState<string>('');
  const [manualEnd, setManualEnd] = useState<string>('');
  const [manualNote, setManualNote] = useState<string>(getRandomTopic());
  const [showSuccess, setShowSuccess] = useState<boolean>(false);

  // Helper to get local ISO string for datetime-local input (YYYY-MM-DDTHH:MM)
  const getLocalISOString = (date: Date = new Date()) => {
    const offset = date.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(date.getTime() - offset)).toISOString().slice(0, 16);
    return localISOTime;
  };

  // Set default times on mount
  useEffect(() => {
    if (!manualStart) {
      const now = new Date();
      // Default: Start 15 mins ago, End Now
      const startDist = new Date(now.getTime() - 15 * 60 * 1000); 
      setManualEnd(getLocalISOString(now));
      setManualStart(getLocalISOString(startDist));
    }
  }, []);

  const formatDurationDisplay = (seconds: number) => {
    if (seconds < 0) return "Invalid Time Range";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  // --- Handlers ---

  const handleSetStartNow = () => {
    setManualStart(getLocalISOString(new Date()));
  };

  const handleSetEndNow = () => {
    setManualEnd(getLocalISOString(new Date()));
  };

  const handleRandomizeTopic = () => {
    setManualNote(getRandomTopic());
  };

  const handleSaveManual = () => {
    const start = new Date(manualStart).getTime();
    const end = new Date(manualEnd).getTime();

    if (isNaN(start) || isNaN(end)) {
      alert("Please enter valid dates");
      return;
    }

    if (end <= start) {
      alert("End time must be after start time");
      return;
    }

    const duration = Math.floor((end - start) / 1000);
    
    const newSession: Session = {
      id: generateId(),
      startTime: start,
      endTime: end,
      duration,
      note: manualNote.trim() || "Chatting",
      date: new Date(start).toISOString().split('T')[0],
    };

    onSaveSession(newSession);

    // Give feedback
    setShowSuccess(true);
    
    // Reset End time to Now, keep start time relative or reset? 
    // Usually user wants to log another or is done. Let's just update end time to keep it fresh.
    setManualEnd(getLocalISOString(new Date()));
    
    // Randomize topic for next time
    setManualNote(getRandomTopic());
    
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const getDurationSeconds = () => {
    const start = new Date(manualStart).getTime();
    const end = new Date(manualEnd).getTime();
    if (isNaN(start) || isNaN(end)) return 0;
    return Math.floor((end - start) / 1000);
  };

  const durationSec = getDurationSeconds();

  return (
    <div className="flex flex-col items-center justify-start min-h-[60vh] p-4 w-full max-w-lg mx-auto">
      
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 w-full animate-fade-in">
           <header className="mb-6">
             <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
               <CalendarDays size={24} className="text-indigo-600" />
               Log Interaction
             </h3>
             <p className="text-gray-500 text-sm mt-1">
               Record the start and end time of the chat.
             </p>
           </header>

           {showSuccess && (
             <div className="bg-green-100 text-green-700 p-3 rounded-lg text-center text-sm font-medium mb-6 animate-pulse border border-green-200">
               Entry saved successfully!
             </div>
           )}

           <div className="space-y-6">
             
             {/* Start Time Input */}
             <div>
               <div className="flex justify-between items-center mb-2">
                 <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Start Time</label>
                 <button 
                   onClick={handleSetStartNow}
                   className="text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-2 py-1 rounded transition-colors flex items-center gap-1"
                 >
                   <Clock size={12} /> Set to Now
                 </button>
               </div>
               <input 
                 type="datetime-local" 
                 value={manualStart}
                 onChange={(e) => setManualStart(e.target.value)}
                 className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-colors font-mono"
               />
             </div>

             {/* Duration Indicator Arrow */}
             <div className="flex items-center justify-center -my-2 opacity-30">
                <ArrowRight className="transform rotate-90" />
             </div>

             {/* End Time Input */}
             <div>
               <div className="flex justify-between items-center mb-2">
                 <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">End Time</label>
                 <button 
                   onClick={handleSetEndNow}
                   className="text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-2 py-1 rounded transition-colors flex items-center gap-1"
                 >
                   <Clock size={12} /> Set to Now
                 </button>
               </div>
               <input 
                 type="datetime-local" 
                 value={manualEnd}
                 onChange={(e) => setManualEnd(e.target.value)}
                 className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-colors font-mono"
               />
             </div>

             {/* Calculated Duration */}
             <div className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${
               durationSec > 1800 ? 'bg-red-50 border-red-100' : 'bg-indigo-50 border-indigo-100'
             }`}>
               <span className={`font-medium text-sm ${
                 durationSec > 1800 ? 'text-red-700' : 'text-indigo-700'
               }`}>Total Duration</span>
               <span className={`text-2xl font-mono font-bold ${
                 durationSec > 1800 ? 'text-red-900' : 'text-indigo-900'
               }`}>
                 {formatDurationDisplay(durationSec)}
               </span>
             </div>

             {/* Note Input */}
             <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Topic</label>
                  <button 
                   onClick={handleRandomizeTopic}
                   className="text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 px-2 py-1 rounded transition-colors flex items-center gap-1"
                   title="Random sarcastic topic"
                 >
                   <Shuffle size={12} /> Randomize
                 </button>
                </div>
                <input
                  type="text"
                  value={manualNote}
                  onChange={(e) => setManualNote(e.target.value)}
                  placeholder="e.g. Weekend plans, Office gossip..."
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                />
             </div>

             <button
                onClick={handleSaveManual}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-indigo-500/30 flex items-center justify-center gap-2"
              >
                <Save size={20} />
                Save Entry
              </button>
           </div>
        </div>
    </div>
  );
};