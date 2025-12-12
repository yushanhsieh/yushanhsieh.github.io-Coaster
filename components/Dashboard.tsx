import React, { useMemo, useState } from 'react';
import { Session, DailyStat } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { analyzeInterruptions } from '../services/geminiService';
import { Brain, TrendingUp, Clock, Calendar, RefreshCcw } from 'lucide-react';

interface DashboardProps {
  sessions: Session[];
}

export const Dashboard: React.FC<DashboardProps> = ({ sessions }) => {
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  const stats = useMemo(() => {
    const dailyMap = new Map<string, number>();
    let totalSeconds = 0;

    sessions.forEach(session => {
      const date = session.date;
      const current = dailyMap.get(date) || 0;
      dailyMap.set(date, current + session.duration);
      totalSeconds += session.duration;
    });

    // Convert map to array and sort by date (last 7 days ideally, but we show all for now)
    const data: DailyStat[] = Array.from(dailyMap.entries())
      .map(([date, seconds]) => ({
        date: date.substring(5), // Remove year for cleaner chart MM-DD
        fullDate: date,
        totalSeconds,
        count: sessions.filter(s => s.date === date).length,
        minutes: parseFloat((seconds / 60).toFixed(1))
      }))
      .sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime())
      .slice(-7); // Last 7 recorded days

    const averageDuration = sessions.length > 0 ? totalSeconds / sessions.length : 0;

    return {
      dailyData: data,
      totalCount: sessions.length,
      totalTimeMinutes: Math.floor(totalSeconds / 60),
      averageTimeMinutes: Math.floor(averageDuration / 60),
      lastSession: sessions[0] // Assuming sessions are sorted desc in parent, if not we fix later
    };
  }, [sessions]);

  const handleAiAnalysis = async () => {
    setIsAnalyzing(true);
    const result = await analyzeInterruptions(sessions);
    setAiAnalysis(result);
    setIsAnalyzing(false);
  };

  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-gray-400">
        <TrendingUp size={48} className="mb-4 opacity-50" />
        <p className="text-lg">No data recorded yet.</p>
        <p className="text-sm">Start tracking when your colleague arrives.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 pb-24">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Statistics</h2>
        <p className="text-gray-500">How much time has been sacrificed?</p>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Wasted</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalTimeMinutes} <span className="text-sm font-normal text-gray-400">min</span></p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Avg. Interruption</p>
            <p className="text-2xl font-bold text-gray-900">{stats.averageTimeMinutes} <span className="text-sm font-normal text-gray-400">min</span></p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Visits</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalCount}</p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">Daily Trend (Last 7 Days)</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.dailyData}>
              <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} unit="m" />
              <Tooltip 
                cursor={{ fill: '#F3F4F6' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="minutes" fill="#4F46E5" radius={[4, 4, 0, 0]}>
                {stats.dailyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.minutes > 30 ? '#EF4444' : '#4F46E5'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Section */}
      <div className="bg-gradient-to-br from-indigo-900 to-indigo-700 rounded-2xl p-6 text-white shadow-lg overflow-hidden relative">
        <div className="flex justify-between items-start mb-4 relative z-10">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Brain size={24} className="text-indigo-300" />
              AI Consultant Analysis
            </h3>
            <p className="text-indigo-200 text-sm mt-1">
              Ask Gemini to analyze productivity loss.
            </p>
          </div>
          <button
            onClick={handleAiAnalysis}
            disabled={isAnalyzing}
            className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 backdrop-blur-sm"
          >
            {isAnalyzing ? <RefreshCcw className="animate-spin" size={16}/> : <Brain size={16} />}
            {isAnalyzing ? "Consulting..." : "Analyze Now"}
          </button>
        </div>

        {aiAnalysis && (
           <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 text-indigo-50 text-sm leading-relaxed whitespace-pre-line relative z-10 animate-fade-in">
             {aiAnalysis}
           </div>
        )}
        
        {/* Decor */}
        <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
        <div className="absolute -top-10 -left-10 w-48 h-48 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
      </div>
    </div>
  );
};