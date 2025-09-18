

import React, { useState, useMemo } from 'react';
import type { ClassSchedule, ClassData } from '../types';

interface CalendarViewProps {
  data: ClassSchedule[];
  // FIX: Change onClassClick to accept ClassSchedule to align with the component's data and fix type errors.
  onClassClick: (schedule: ClassSchedule) => void;
}

const CalendarHeader: React.FC<{
    currentDate: Date;
    onPrevMonth: () => void;
    onNextMonth: () => void;
    onToday: () => void;
}> = ({ currentDate, onPrevMonth, onNextMonth, onToday }) => (
    <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
            <button onClick={onToday} className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50">Today</button>
            <button onClick={onPrevMonth} aria-label="Previous month" className="p-2 border border-slate-300 rounded-md hover:bg-slate-50"><ChevronLeft /></button>
            <button onClick={onNextMonth} aria-label="Next month" className="p-2 border border-slate-300 rounded-md hover:bg-slate-50"><ChevronRight /></button>
        </div>
        <h2 className="text-xl font-bold text-slate-800">
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h2>
    </div>
);

const CalendarDay: React.FC<{ day: Date, isToday: boolean, isCurrentMonth: boolean, classes: ClassSchedule[], onClassClick: (cs: ClassSchedule) => void }> = ({ day, isToday, isCurrentMonth, classes, onClassClick }) => (
    <div className={`border border-slate-200 relative min-h-[120px] ${isCurrentMonth ? 'bg-white' : 'bg-slate-50'}`}>
        <time dateTime={day.toISOString().split('T')[0]} className={`absolute top-1.5 right-1.5 h-7 w-7 flex items-center justify-center rounded-full text-sm font-semibold ${isToday ? 'bg-indigo-600 text-white' : isCurrentMonth ? 'text-slate-700' : 'text-slate-400'}`}>
            {day.getDate()}
        </time>
        {classes.length > 0 && (
            <div className="p-1 mt-8 space-y-1 overflow-y-auto max-h-[100px]">
                {classes.map(cls => (
                    <button key={cls.id} onClick={() => onClassClick(cls)} className="w-full text-left text-xs p-1.5 rounded-md bg-indigo-50 hover:bg-indigo-100 transition-colors">
                        <p className="font-semibold text-indigo-800 truncate">{cls.className}</p>
                        <p className="text-indigo-600">{cls.time}</p>
                    </button>
                ))}
            </div>
        )}
    </div>
);


export const CalendarView: React.FC<CalendarViewProps> = ({ data, onClassClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const { calendarGrid, firstDayOfMonth } = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    const startDay = firstDayOfMonth.getDay() === 0 ? 6 : firstDayOfMonth.getDay() - 1; // Monday is 0
    const totalDays = lastDayOfMonth.getDate();
    
    const calendarGrid: Date[] = [];
    // Days from previous month
    for (let i = startDay; i > 0; i--) {
        calendarGrid.push(new Date(year, month, 1 - i));
    }
    // Days of current month
    for (let i = 1; i <= totalDays; i++) {
        calendarGrid.push(new Date(year, month, i));
    }
    // Days from next month to fill grid
    const remaining = 42 - calendarGrid.length; // 6 weeks grid
    for (let i = 1; i <= remaining; i++) {
        calendarGrid.push(new Date(year, month, totalDays + i));
    }

    return { calendarGrid, firstDayOfMonth };
  }, [currentDate]);
  
  const classesByDate = useMemo(() => {
      const map = new Map<string, ClassSchedule[]>();
      data.forEach(cls => {
          const date = cls.date; // YYYY-MM-DD
          if (!map.has(date)) map.set(date, []);
          map.get(date)!.push(cls);
      });
      return map;
  }, [data]);

  // FIX: This unused function created a type error after changing the onClassClick prop.
  // It is now a simple passthrough to avoid the error. The conversion logic
  // is correctly handled in App.tsx's onRawClassClick.
  const handleClassClick = (schedule: ClassSchedule) => {
    onClassClick(schedule);
  };

  const today = new Date();
  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div>
      <CalendarHeader
        currentDate={currentDate}
        onPrevMonth={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
        onNextMonth={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
        onToday={() => setCurrentDate(new Date())}
      />
      <div className="grid grid-cols-7 gap-px border-l border-t border-slate-200 bg-slate-200">
        {weekDays.map(day => (
            <div key={day} className="py-2 text-center text-sm font-semibold text-slate-600 bg-slate-100">{day}</div>
        ))}
        {calendarGrid.map((day, i) => {
            const dateKey = day.toISOString().split('T')[0];
            return (
                <CalendarDay 
                    key={i}
                    day={day}
                    isToday={day.toDateString() === today.toDateString()}
                    isCurrentMonth={day.getMonth() === firstDayOfMonth.getMonth()}
                    classes={classesByDate.get(dateKey) || []}
                    onClassClick={onClassClick}
                />
            )
        })}
      </div>
    </div>
  );
};

const ChevronLeft = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>;
const ChevronRight = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>;
