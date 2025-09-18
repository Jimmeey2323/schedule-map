
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
    className={`flex items-center space-x-2 px-3 py-2 sm:px-4 text-sm font-semibold rounded-lg transition-all duration-200 ${
      currentView === view
        ? 'bg-indigo-600 text-white shadow-md'
        : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-800'
    }`}
    aria-current={currentView === view ? 'page' : undefined}
  >
    {icon}
    <span className="hidden sm:inline">{label}</span>
  </button>
);


export const MainNavigation: React.FC<MainNavigationProps> = ({ currentView, setCurrentView }) => {
    return (
        <div className="bg-white/70 backdrop-blur-sm p-3 rounded-xl shadow-md border border-slate-200 mb-8">
            <div className="flex items-center justify-center flex-wrap gap-2 sm:gap-3">
                <NavButton view="schedule" currentView={currentView} onClick={setCurrentView} label="Schedule Board" icon={<CalendarDaysIcon />} />
                <NavButton view="calendar" currentView={currentView} onClick={setCurrentView} label="Monthly Calendar" icon={<CalendarIcon />} />
                <NavButton view="datatable" currentView={currentView} onClick={setCurrentView} label="Data Table" icon={<TableIcon />} />
                <NavButton view="analytics" currentView={currentView} onClick={setCurrentView} label="Analytics" icon={<ChartIcon />} />
            </div>
        </div>
    );
};

// Icons for the buttons
const CalendarDaysIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10"/></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg>;
const TableIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.37 3.63a2.12 2.12 0 1 1 3 3L12 16l-4 1 1-4Z"/></svg>;
const ChartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>;
