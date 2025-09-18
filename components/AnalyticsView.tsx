import React, { useMemo } from 'react';
// FIX: Import ClassSchedule type to resolve module export error.
import type { ClassSchedule } from '../types';

interface AnalyticsViewProps {
  data: ClassSchedule[];
}

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
  <div className="bg-gray-800 p-6 rounded-lg shadow-lg flex items-start space-x-4">
    <div className="bg-gray-700 p-3 rounded-lg">
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-gray-400">{title}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  </div>
);

const ListCard: React.FC<{ title: string; data: { label: string; value: number }[] }> = ({ title, data }) => (
  <div className="bg-gray-800 p-6 rounded-lg shadow-lg col-span-1 md:col-span-2 lg:col-span-1">
    <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
    <ul className="space-y-2 max-h-64 overflow-y-auto pr-2">
      {data.sort((a, b) => b.value - a.value).map(({ label, value }) => (
        <li key={label} className="flex justify-between items-center text-sm">
          <span className="text-gray-300 truncate pr-2" title={label}>{label}</span>
          <span className="font-semibold text-indigo-400 bg-indigo-900/50 px-2 py-0.5 rounded-full flex-shrink-0">{value}</span>
        </li>
      ))}
    </ul>
  </div>
);

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ data }) => {
  const stats = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        totalClasses: 0,
        canceledClasses: 0,
        scheduledClasses: 0,
        uniqueTrainers: 0,
        classesByTrainer: [],
        classesByLocation: [],
        classesByDay: [],
      };
    }

    const scheduled = data.filter(d => d.status === 'Scheduled');
    const canceled = data.filter(d => d.status === 'Canceled');
    
    // FIX: Improve type safety in reduce function to ensure correct return type.
    const countBy = (key: keyof ClassSchedule) => {
        return scheduled.reduce<Record<string, number>>((acc, item) => {
            const val = item[key];
            if (val) {
              const strVal = String(val);
              acc[strVal] = (acc[strVal] || 0) + 1;
            }
            return acc;
        }, {});
    };

    const trainers = countBy('trainer1');
    const locations = countBy('location');
    const days = countBy('day');

    const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    return {
      totalClasses: data.length,
      canceledClasses: canceled.length,
      scheduledClasses: scheduled.length,
      uniqueTrainers: Object.keys(trainers).length,
      classesByTrainer: Object.entries(trainers).map(([label, value]) => ({ label, value })),
      classesByLocation: Object.entries(locations).map(([label, value]) => ({ label, value })),
      classesByDay: Object.entries(days)
        .map(([label, value]) => ({ label, value }))
        .sort((a, b) => dayOrder.indexOf(a.label) - dayOrder.indexOf(b.label)),
    };
  }, [data]);

  const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
  const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400"><polyline points="20 6 9 17 4 12"></polyline></svg>;
  const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
  const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;

  return (
    <div className="p-4 sm:p-6">
      <h2 className="text-xl font-semibold text-white mb-6">Schedule Analytics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard title="Total Classes" value={stats.totalClasses} icon={<CalendarIcon />} />
        <StatCard title="Scheduled" value={stats.scheduledClasses} icon={<CheckIcon />} />
        <StatCard title="Canceled" value={stats.canceledClasses} icon={<XIcon />} />
        <StatCard title="Unique Trainers" value={stats.uniqueTrainers} icon={<UsersIcon />} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ListCard title="Classes by Trainer" data={stats.classesByTrainer} />
        <ListCard title="Classes by Location" data={stats.classesByLocation} />
        <ListCard title="Classes by Day" data={stats.classesByDay} />
      </div>
    </div>
  );
};
