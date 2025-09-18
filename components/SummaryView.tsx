import React, { useMemo } from 'react';
import type { ScheduleData, ClassData } from '../types';

interface SummaryViewProps {
  scheduleData: ScheduleData;
}

const SummaryCard: React.FC<{ title: string; data: [string, number][] }> = ({ title, data }) => (
  <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
    <h3 className="text-md font-semibold text-slate-800 mb-3">{title}</h3>
    <ul className="space-y-2 text-sm max-h-48 overflow-y-auto">
      {data.map(([label, count]) => (
        <li key={label} className="flex justify-between items-center">
          <span className="text-slate-600 truncate pr-2" title={label}>{label}</span>
          <span className="font-semibold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-xs">
            {count}
          </span>
        </li>
      ))}
    </ul>
  </div>
);

export const SummaryView: React.FC<SummaryViewProps> = ({ scheduleData }) => {
  const stats = useMemo(() => {
    const allClasses = Object.values(scheduleData).flat();
    
    const countBy = (key: keyof ClassData): [string, number][] => {
        const counts: Record<string, number> = {};
        for (const item of allClasses) {
            const value = item[key];
            // Ensure value is a non-empty string before counting
            if (typeof value === 'string' && value.trim() !== '') {
                counts[value] = (counts[value] || 0) + 1;
            }
        }
        return Object.entries(counts).sort((a, b) => b[1] - a[1]);
    };
    
    const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    
    // Get the day counts, then sort them according to the correct day order
    const byDayCounts = countBy('day');
    const byDaySorted = byDayCounts.sort((a, b) => dayOrder.indexOf(a[0]) - dayOrder.indexOf(b[0]));
    
    return {
        byLocation: countBy('location'),
        byTrainer: countBy('trainer1'),
        byDay: byDaySorted,
        byClass: countBy('className'),
    };
  }, [scheduleData]);

  return (
    <div className="bg-slate-50/50 p-6 rounded-xl shadow-md border border-slate-200">
       <h2 className="text-xl font-bold text-slate-800 mb-4">Summary Counts</h2>
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <SummaryCard title="By Location" data={stats.byLocation} />
            <SummaryCard title="By Trainer" data={stats.byTrainer} />
            <SummaryCard title="By Day" data={stats.byDay} />
            <SummaryCard title="By Class Name" data={stats.byClass} />
       </div>
    </div>
  );
};