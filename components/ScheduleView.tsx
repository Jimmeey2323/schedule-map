
import React, { useMemo } from 'react';
// FIX: Use correct types that are passed from App.tsx
import type { ScheduleData, ClassData, AttendanceData } from '../types';
import { createAttendanceKey } from '../utils';

// FIX: Export ViewType to be used in App.tsx and FilterControls.tsx
export type ViewType = 'timeSlots' | 'className';

// FIX: Update props to match what is passed from App.tsx
interface ScheduleViewProps {
    scheduleData: ScheduleData;
    attendanceData: Map<string, AttendanceData>;
    filters: {
        day: string;
        location: string;
        trainer: string;
        className: string;
        timeOfDay: string;
        difficulty: string;
    };
    view: ViewType;
    onClassClick: (classData: ClassData) => void;
}

const ClassCard: React.FC<{ classData: ClassData, attendance?: AttendanceData, onClick: () => void }> = ({ classData, attendance, onClick }) => {
    return (
        <div onClick={onClick} className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md cursor-pointer transition-shadow">
            <h4 className="font-bold text-indigo-700 truncate">{classData.className}</h4>
            <p className="text-sm text-slate-600">{classData.time} - {classData.trainer1}</p>
            <p className="text-xs text-slate-500 mt-1 truncate">{classData.location}</p>
            {attendance && (
                <div className="mt-2 pt-2 border-t border-slate-200">
                    <p className="text-xs text-slate-500">Avg Attendance: <span className="font-semibold text-slate-700">{attendance.avgAttendance}</span></p>
                </div>
            )}
        </div>
    )
};

export const ScheduleView: React.FC<ScheduleViewProps> = ({ scheduleData, attendanceData, filters, view, onClassClick }) => {
  const filteredClasses = useMemo(() => {
    if (!scheduleData) return [];
    
    let allClasses = Object.values(scheduleData).flat();

    return allClasses.filter(cls => {
        if (filters.day && filters.day !== cls.day) return false;
        if (filters.location && filters.location !== cls.location) return false;
        if (filters.trainer && filters.trainer !== cls.trainer1) return false;
        if (filters.className && filters.className !== cls.className) return false;
        if (filters.difficulty && filters.difficulty !== cls.difficulty) return false;
        
        if (filters.timeOfDay) {
            const hour = cls.timeDate?.getHours();
            if (hour === undefined) return true; // Don't filter if time is invalid
            if (filters.timeOfDay === 'morning' && hour >= 12) return false;
            if (filters.timeOfDay === 'afternoon' && (hour < 12 || hour >= 17)) return false;
            if (filters.timeOfDay === 'evening' && hour < 17) return false;
        }

        return true;
    });
  }, [scheduleData, filters]);

  const scheduleByDay = useMemo(() => {
    const grouped: { [key: string]: ClassData[] } = {};
    filteredClasses.forEach(cls => {
        if (!grouped[cls.day]) grouped[cls.day] = [];
        grouped[cls.day].push(cls);
    });
    return grouped;
  }, [filteredClasses]);

  const scheduleByClassName = useMemo(() => {
    const grouped: { [key: string]: ClassData[] } = {};
    filteredClasses.forEach(cls => {
        if (!grouped[cls.className]) grouped[cls.className] = [];
        grouped[cls.className].push(cls);
    });
    return grouped;
  }, [filteredClasses]);

  const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const renderByTimeSlots = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {daysOrder.map(day => {
        const classesForDay = scheduleByDay[day] || [];
        if (classesForDay.length === 0) return null;
        
        return (
          <div key={day} className="bg-slate-50/70 rounded-lg shadow-inner">
            <h3 className="bg-slate-200/80 px-4 py-3 text-lg font-semibold text-slate-800 rounded-t-lg sticky top-[7rem] backdrop-blur-sm">{day}</h3>
            <div className="p-4 space-y-3">
                {classesForDay.map(cls => (
                    <ClassCard 
                        key={cls.uniqueKey} 
                        classData={cls}
                        attendance={attendanceData.get(createAttendanceKey(cls))}
                        onClick={() => onClassClick(cls)}
                    />
                ))}
            </div>
          </div>
        )
      })}
    </div>
  );
  
  const renderByClassName = () => (
     <div className="space-y-6">
        {Object.keys(scheduleByClassName).sort().map(className => {
            const classes = scheduleByClassName[className];
            return (
                <div key={className}>
                    <h3 className="text-xl font-semibold text-slate-800 mb-3">{className}</h3>
                     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {classes.map(cls => (
                             <ClassCard 
                                key={cls.uniqueKey} 
                                classData={cls}
                                attendance={attendanceData.get(createAttendanceKey(cls))}
                                onClick={() => onClassClick(cls)}
                            />
                        ))}
                    </div>
                </div>
            )
        })}
     </div>
  );

  if (filteredClasses.length === 0) {
      return (
          <div className="text-center py-16 px-6 bg-white rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-slate-800">No Classes Found</h3>
              <p className="mt-2 text-slate-500">Try adjusting your filters to find more results.</p>
          </div>
      )
  }

  return (
    <div>
        {view === 'timeSlots' ? renderByTimeSlots() : renderByClassName()}
    </div>
  );
};
