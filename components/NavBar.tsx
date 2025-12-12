import React from 'react';
import { ViewState } from '../types';
import { LayoutDashboard, Timer, History } from 'lucide-react';

interface NavBarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
}

export const NavBar: React.FC<NavBarProps> = ({ currentView, setView }) => {
  const navItems = [
    { id: ViewState.TRACKER, label: 'Tracker', icon: Timer },
    { id: ViewState.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { id: ViewState.HISTORY, label: 'History', icon: History },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 md:relative md:border-t-0 md:border-b md:px-8 md:py-4 shadow-sm z-50">
      <div className="max-w-4xl mx-auto flex justify-around md:justify-start md:space-x-8">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`flex flex-col md:flex-row items-center space-y-1 md:space-y-0 md:space-x-2 p-2 rounded-lg transition-colors ${
                isActive 
                  ? 'text-indigo-600 bg-indigo-50' 
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Icon size={20} />
              <span className="text-xs md:text-sm font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};