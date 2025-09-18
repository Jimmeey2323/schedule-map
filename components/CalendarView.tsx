

import React, { useState, useMemo } from 'react';
import type { ClassSchedule, ClassData } from '../types';

interface CalendarViewProps {
  data: ClassSchedule[];
  onClassClick: (schedule: ClassSchedule) => void;
}

// Utility functions for time handling
const parseTimeString = (timeStr: string): number => {
  if (!timeStr) return 0;
  
  const time = timeStr.trim().toUpperCase();
  const match = time.match(/(\d{1,2}):?(\d{2})?\s*(AM|PM)?/i);
  
  if (!match) return 0;
  
  let hour = parseInt(match[1], 10);
  const minute = parseInt(match[2] || '0', 10);
  const ampm = match[3];
  
  if (ampm === 'PM' && hour !== 12) hour += 12;
  if (ampm === 'AM' && hour === 12) hour = 0;
  
  return hour + minute / 60;
};

const formatTimeForDisplay = (hour: number): string => {
  const wholeHour = Math.floor(hour);
  const minutes = Math.round((hour - wholeHour) * 60);
  const displayHour = wholeHour === 0 ? 12 : wholeHour > 12 ? wholeHour - 12 : wholeHour;
  const ampm = wholeHour < 12 ? 'AM' : 'PM';
  return `${displayHour}:${minutes.toString().padStart(2, '0')} ${ampm}`;
};

const generateTimeSlots = (): number[] => {
  const slots = [];
  for (let hour = 7; hour <= 21; hour += 0.5) { // 7am to 9pm in 30-minute intervals
    slots.push(hour);
  }
  return slots;
};

const TimelineHeader: React.FC<{
  currentWeekStart: Date;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onToday: () => void;
}> = ({ currentWeekStart, onPrevWeek, onNextWeek, onToday }) => {
  const weekEnd = new Date(currentWeekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  
  return (
    <div className="flex items-center justify-between mb-6 p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
      <div className="flex items-center space-x-3">
        <button 
          onClick={onToday} 
          className="px-4 py-2 text-sm font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-md hover:bg-indigo-100 transition-colors"
        >
          Today
        </button>
        <button 
          onClick={onPrevWeek} 
          aria-label="Previous week" 
          className="p-2 border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
        >
          <ChevronLeft />
        </button>
        <button 
          onClick={onNextWeek} 
          aria-label="Next week" 
          className="p-2 border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
        >
          <ChevronRight />
        </button>
      </div>
      <h2 className="text-xl font-bold text-slate-800">
        {currentWeekStart.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - {weekEnd.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
      </h2>
    </div>
  );
};

const ClassBlock: React.FC<{
  classData: ClassSchedule;
  onClassClick: (schedule: ClassSchedule) => void;
  style: React.CSSProperties;
}> = ({ classData, onClassClick, style }) => {
  const getDifficultyColor = (className: string) => {
    if (className.includes('Foundations') || className.includes('Recovery') || className.includes('SWEAT')) 
      return 'bg-green-100 border-green-400 text-green-800 hover:bg-green-200';
    if (className.includes('HIIT') || className.includes('Amped') || className.includes('Trainer\'s Choice')) 
      return 'bg-red-100 border-red-400 text-red-800 hover:bg-red-200';
    return 'bg-blue-100 border-blue-400 text-blue-800 hover:bg-blue-200';
  };

  const getLocationIcon = (location: string) => {
    if (location.includes('Kenkere') || location.includes('VM')) return '🏢';
    if (location.includes('Bandra') || location.includes('Supreme')) return '🏢';
    if (location.includes('Kemps') || location.includes('Kwality')) return '🏢';
    if (location.includes('Online')) return '💻';
    return '📍';
  };

  return (
    <button
      onClick={() => onClassClick(classData)}
      className={`absolute text-left p-2 rounded-lg border-l-4 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02] cursor-pointer ${getDifficultyColor(classData.className)}`}
      style={style}
      title={`${classData.className} with ${classData.trainer1} at ${classData.location}`}
    >
      <div className="font-semibold text-sm truncate mb-1">{classData.className}</div>
      <div className="text-xs opacity-80 truncate flex items-center gap-1">
        ⏰ {classData.time}
      </div>
      <div className="text-xs opacity-70 truncate flex items-center gap-1">
        👨‍🏫 {classData.trainer1}
      </div>
      <div className="text-xs opacity-60 truncate flex items-center gap-1">
        {getLocationIcon(classData.location)} {classData.location}
      </div>
    </button>
  );
};

const TimelineLegend: React.FC = () => (
  <div className="mb-4 p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
    <h3 className="text-sm font-semibold text-slate-700 mb-2">Class Difficulty Levels</h3>
    <div className="flex flex-wrap gap-4 text-xs">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-green-100 border-l-4 border-green-400 rounded"></div>
        <span className="text-slate-600">Beginner (Foundations, Recovery, SWEAT)</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-blue-100 border-l-4 border-blue-400 rounded"></div>
        <span className="text-slate-600">Intermediate (Barre, Cardio, FIT, Mat)</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-red-100 border-l-4 border-red-400 rounded"></div>
        <span className="text-slate-600">Advanced (HIIT, Amped Up, Trainer's Choice)</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-0.5 bg-red-500"></div>
        <span className="text-slate-600">Current Time</span>
      </div>
    </div>
  </div>
);

export const CalendarView: React.FC<CalendarViewProps> = ({ data, onClassClick }) => {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const day = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1)); // Get Monday of current week
    monday.setHours(0, 0, 0, 0);
    return monday;
  });

  const timeSlots = useMemo(() => generateTimeSlots(), []);
  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const weekDates = useMemo(() => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart);
      date.setDate(currentWeekStart.getDate() + i);
      dates.push(date);
    }
    return dates;
  }, [currentWeekStart]);

  const classesByDayAndTime = useMemo(() => {
    const map = new Map<string, ClassSchedule[]>();
    
    data.forEach(cls => {
      const classDate = new Date(cls.date);
      const dayIndex = weekDates.findIndex(date => 
        date.getFullYear() === classDate.getFullYear() &&
        date.getMonth() === classDate.getMonth() &&
        date.getDate() === classDate.getDate()
      );
      
      if (dayIndex !== -1) {
        const key = `${dayIndex}`;
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(cls);
      }
    });
    
    return map;
  }, [data, weekDates]);

  const getClassPosition = (timeStr: string, duration: number = 1): { top: string; height: string } => {
    const timeValue = parseTimeString(timeStr);
    const startHour = 7; // 7 AM
    const totalHours = 14; // 7 AM to 9 PM
    const hourHeight = 80; // Height per hour in pixels
    
    const topOffset = (timeValue - startHour) * hourHeight;
    const height = duration * hourHeight;
    
    return {
      top: `${Math.max(0, topOffset)}px`,
      height: `${height}px`
    };
  };

  const goToPrevWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeekStart(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeekStart(newDate);
  };

  const goToToday = () => {
    const today = new Date();
    const day = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1));
    monday.setHours(0, 0, 0, 0);
    setCurrentWeekStart(monday);
  };

  const getCurrentTimePosition = (): { show: boolean; top: string } => {
    const now = new Date();
    const currentHour = now.getHours() + now.getMinutes() / 60;
    
    // Only show if current time is within our timeline (7 AM - 9 PM)
    if (currentHour < 7 || currentHour > 21) {
      return { show: false, top: '0px' };
    }
    
    const startHour = 7;
    const hourHeight = 80;
    const topOffset = (currentHour - startHour) * hourHeight;
    
    return { show: true, top: `${topOffset}px` };
  };

  const currentTimePos = getCurrentTimePosition();
  const today = new Date();

  return (
    <div className="h-full bg-slate-50">
      <TimelineHeader
        currentWeekStart={currentWeekStart}
        onPrevWeek={goToPrevWeek}
        onNextWeek={goToNextWeek}
        onToday={goToToday}
      />
      
      <TimelineLegend />
      
      <div className="flex bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        {/* Time axis */}
        <div className="w-20 border-r border-slate-200 bg-slate-50">
          <div className="h-16 border-b border-slate-200 flex items-center justify-center text-xs font-semibold text-slate-600">
            Time
          </div>
          <div className="relative">
            {timeSlots.map((hour, index) => (
              <div
                key={hour}
                className="h-20 border-b border-slate-100 flex items-start justify-center pt-1"
                style={{ height: '80px' }}
              >
                <span className="text-xs text-slate-500 font-medium">
                  {formatTimeForDisplay(hour)}
                </span>
              </div>
            ))}
            
            {/* Current time indicator on time axis */}
            {currentTimePos.show && (
              <div
                className="absolute right-0 w-2 h-0.5 bg-red-500 z-20"
                style={{ top: currentTimePos.top }}
              />
            )}
          </div>
        </div>

        {/* Days grid */}
        <div className="flex-1 overflow-x-auto">
          <div className="grid grid-cols-7 min-w-full">
            {/* Day headers */}
            {weekDates.map((date, dayIndex) => {
              const isToday = date.toDateString() === today.toDateString();
              return (
                <div
                  key={dayIndex}
                  className={`h-16 border-r border-slate-200 flex flex-col items-center justify-center text-sm font-semibold ${
                    isToday ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700'
                  }`}
                >
                  <div>{weekDays[dayIndex]}</div>
                  <div className={`text-lg ${isToday ? 'text-indigo-600' : 'text-slate-900'}`}>
                    {date.getDate()}
                  </div>
                </div>
              );
            })}
            
            {/* Time slots grid */}
            {weekDates.map((date, dayIndex) => (
              <div key={dayIndex} className="relative border-r border-slate-200">
                {/* Background time slots */}
                {timeSlots.map((hour, timeIndex) => (
                  <div
                    key={`${dayIndex}-${timeIndex}`}
                    className="h-20 border-b border-slate-100"
                    style={{ height: '80px' }}
                  />
                ))}
                
                {/* Current time indicator */}
                {currentTimePos.show && (
                  <div
                    className="absolute left-0 right-0 border-t-2 border-red-500 z-20"
                    style={{ top: currentTimePos.top }}
                  >
                    <div className="absolute -left-2 -top-1 w-4 h-2 bg-red-500 rounded-full"></div>
                  </div>
                )}
                
                {/* Classes positioned absolutely */}
                {(classesByDayAndTime.get(`${dayIndex}`) || []).map((classData, classIndex) => {
                  const position = getClassPosition(classData.time);
                  return (
                    <ClassBlock
                      key={`${classData.id}-${classIndex}`}
                      classData={classData}
                      onClassClick={onClassClick}
                      style={{
                        ...position,
                        left: '4px',
                        right: '4px',
                        zIndex: 10
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const ChevronLeft = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>;
const ChevronRight = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>;
