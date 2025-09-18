
import React, { useMemo } from 'react';
// FIX: Use correct types from types.ts and other components.
import type { ClassData } from '../types';
import type { ViewType } from './ScheduleView';

// FIX: Define a type for the filters that matches the state in App.tsx.
export interface Filters {
  day: string;
  location: string;
  trainer: string;
  className: string;
  timeOfDay: string;
  difficulty: string;
}

// FIX: Update props to match what is passed from App.tsx.
interface FilterControlsProps {
  allClasses: ClassData[];
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  currentView: ViewType;
  setCurrentView: React.Dispatch<React.SetStateAction<ViewType>>;
}

const FilterSelect: React.FC<{
  name: keyof Filters,
  label: string,
  value: string,
  options: string[],
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
}> = ({ name, label, value, options, onChange }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-slate-700">{label}</label>
    <select
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
    >
      <option value="">All</option>
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);

export const FilterControls: React.FC<FilterControlsProps> = ({
  allClasses,
  filters,
  setFilters,
  currentView,
  setCurrentView,
}) => {
  const options = useMemo(() => {
    const days = [...new Set(allClasses.map(c => c.day))].sort();
    const locations = [...new Set(allClasses.map(c => c.location))].sort();
    const trainers = [...new Set(allClasses.map(c => c.trainer1))].sort();
    const classNames = [...new Set(allClasses.map(c => c.className))].sort();
    const difficulties = [...new Set(allClasses.map(c => c.difficulty).filter(Boolean) as string[])].sort();
    return { days, locations, trainers, classNames, difficulties };
  }, [allClasses]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const timeOfDayOptions = [
      { value: 'morning', label: 'Morning (before 12pm)'},
      { value: 'afternoon', label: 'Afternoon (12pm - 5pm)'},
      { value: 'evening', label: 'Evening (after 5pm)'}
  ];

  const ViewButton: React.FC<{ view: ViewType, label: string }> = ({ view, label }) => (
      <button
        onClick={() => setCurrentView(view)}
        className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
            currentView === view
            ? 'bg-indigo-600 text-white shadow'
            : 'bg-white text-slate-700 hover:bg-slate-100'
        }`}
      >
        {label}
      </button>
  );

  return (
    <div className="bg-white p-6 rounded-xl shadow-md space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <FilterSelect name="day" label="Day" value={filters.day} options={options.days} onChange={handleFilterChange} />
            <FilterSelect name="location" label="Location" value={filters.location} options={options.locations} onChange={handleFilterChange} />
            <FilterSelect name="trainer" label="Trainer" value={filters.trainer} options={options.trainers} onChange={handleFilterChange} />
            <FilterSelect name="className" label="Class Name" value={filters.className} options={options.classNames} onChange={handleFilterChange} />
            <FilterSelect name="difficulty" label="Difficulty" value={filters.difficulty} options={options.difficulties} onChange={handleFilterChange} />
            <div>
                <label htmlFor="timeOfDay" className="block text-sm font-medium text-slate-700">Time of Day</label>
                <select
                    id="timeOfDay"
                    name="timeOfDay"
                    value={filters.timeOfDay}
                    onChange={handleFilterChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                    <option value="">All</option>
                    {timeOfDayOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
            </div>
        </div>
        <div className="flex items-center justify-center space-x-2 pt-4 border-t border-slate-200">
            <span className="text-sm font-medium text-slate-600">View by:</span>
            <ViewButton view="timeSlots" label="Time Slots" />
            <ViewButton view="className" label="Class Name" />
        </div>
    </div>
  );
};
