
import React from 'react';
import type { MainView } from '../types';

interface MainNavigationProps {
  currentView: MainView;
  setCurrentView: (view: MainView) => void;
}

const NavButton: React.FC<{
  view: MainView;
  currentView: MainView;
  onClick: (view: MainView) => void;
  label: string;
  icon: React.ReactNode;
}> = ({ view, currentView, onClick, label, icon }) => (
  <button
    onClick={() => onClick(view)}
    className={`group relative flex items-center space-x-3 px-4 py-3 sm:px-6 text-sm font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 ${
      currentView === view
        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25'
        : 'bg-white/80 text-slate-600 hover:bg-white hover:text-slate-800 hover:shadow-md border border-slate-200'
    }`}
    aria-current={currentView === view ? 'page' : undefined}
  >
    <div className={`transition-transform duration-300 ${currentView === view ? 'scale-110' : 'group-hover:scale-110'}`}>
      {icon}
    </div>
    <span className="hidden sm:inline font-medium">{label}</span>
    {currentView === view && (
      <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full shadow-sm animate-pulse" />
    )}
  </button>
);

export const MainNavigation: React.FC<MainNavigationProps> = ({ currentView, setCurrentView }) => {
    return (
        <div className="bg-white/80 backdrop-blur-lg p-4 rounded-2xl shadow-xl border border-white/20 mb-8 relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="w-full h-full" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%234f46e5' fill-opacity='0.1'%3E%3Cpath d='M20 20c0-11.046-8.954-20-20-20v20h20z'/%3E%3C/g%3E%3C/svg%3E")`,
                }} />
            </div>
            
            <div className="relative flex items-center justify-center flex-wrap gap-3 sm:gap-4">
                <NavButton 
                    view="schedule" 
                    currentView={currentView} 
                    onClick={setCurrentView} 
                    label="Schedule Board" 
                    icon={<CalendarDaysIcon />} 
                />
                <NavButton 
                    view="calendar" 
                    currentView={currentView} 
                    onClick={setCurrentView} 
                    label="Monthly Calendar" 
                    icon={<CalendarIcon />} 
                />
                <NavButton 
                    view="datatable" 
                    currentView={currentView} 
                    onClick={setCurrentView} 
                    label="Data Table" 
                    icon={<TableIcon />} 
                />
                <NavButton 
                    view="analytics" 
                    currentView={currentView} 
                    onClick={setCurrentView} 
                    label="Analytics" 
                    icon={<ChartIcon />} 
                />
                <NavButton 
                    view="ai-insights" 
                    currentView={currentView} 
                    onClick={setCurrentView} 
                    label="AI Insights" 
                    icon={<AIIcon />} 
                />
            </div>
        </div>
    );
};

// Enhanced icons with better styling
const CalendarDaysIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11h.01M12 11h.01M8 11h.01M16 15h.01M12 15h.01M8 15h.01" />
    </svg>
);

const CalendarIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

const TableIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0V4a1 1 0 011-1h16a1 1 0 011 1v16a1 1 0 01-1 1H4a1 1 0 01-1-1z" />
    </svg>
);

const ChartIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
);

const AIIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
);
