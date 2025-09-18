import React, { useEffect } from 'react';
import type { ClassData, AttendanceData } from '../types';

interface ClassDetailModalProps {
  classData: ClassData;
  attendanceDetails: AttendanceData | undefined;
  onClose: () => void;
}

const DetailItem: React.FC<{ label: string; value: string | number | undefined; icon?: React.ReactNode }> = ({ label, value, icon }) => {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div className="py-3 px-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <dt className="text-sm font-medium text-gray-600 flex items-center gap-2">
        {icon}
        {label}
      </dt>
      <dd className="mt-1 text-lg font-semibold text-gray-900">{value}</dd>
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: string | number; icon: React.ReactNode; color?: string }> = ({ 
  label, 
  value, 
  icon, 
  color = 'indigo' 
}) => (
  <div className={`bg-gradient-to-br from-${color}-50 to-${color}-100 p-4 rounded-xl border border-${color}-200`}>
    <div className="flex items-center gap-3">
      <div className={`p-2 bg-${color}-500 text-white rounded-lg`}>
        {icon}
      </div>
      <div>
        <dt className="text-sm font-medium text-gray-600">{label}</dt>
        <dd className={`text-2xl font-bold text-${color}-700`}>{value}</dd>
      </div>
    </div>
  </div>
);

export const ClassDetailModal: React.FC<ClassDetailModalProps> = ({ classData, attendanceDetails, onClose }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  const getDifficultyBadge = (difficulty: string) => {
    const colors = {
      beginner: 'bg-green-100 text-green-800 border-green-200',
      intermediate: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      advanced: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[difficulty as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Icons
  const PersonIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
  const LocationIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
  const UserIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V6a2 2 0 012-2h4a2 2 0 012 2v1m-6 0h6m-6 0l-1 1m7-1l1 1M5 21V9a2 2 0 012-2h10a2 2 0 012 2v12H5z" /></svg>;
  const TrendingIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>;
  const UsersIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
  const CalendarIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="class-detail-title"
    >
      <div 
        className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto transform transition-all animate-in fade-in duration-300"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Section */}
        <div className="relative p-6 sm:p-8 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-3xl">
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <h2 id="class-detail-title" className="text-3xl sm:text-4xl font-bold mb-2">{classData.className}</h2>
                    <p className="text-lg sm:text-xl text-indigo-100 mb-3">{classData.day} at {classData.time}</p>
                    {classData.difficulty && (
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getDifficultyBadge(classData.difficulty)}`}>
                        {classData.difficulty.charAt(0).toUpperCase() + classData.difficulty.slice(1)}
                      </span>
                    )}
                </div>
                <button 
                    onClick={onClose} 
                    className="text-white hover:text-indigo-200 transition-colors p-2 rounded-full hover:bg-white/10"
                    aria-label="Close modal"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>

        {/* Class Details Section */}
        <div className="p-6 sm:p-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Class Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DetailItem label="Trainer" value={classData.trainer1} icon={<PersonIcon />} />
              <DetailItem label="Location" value={classData.location} icon={<LocationIcon />} />
              <DetailItem label="Cover" value={classData.cover} icon={<UserIcon />} />
              {classData.notes && (
                  <div className="sm:col-span-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
                     <dt className="text-sm font-medium text-blue-800 flex items-center gap-2 mb-2">
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                       </svg>
                       Notes
                     </dt>
                     <dd className="text-lg text-blue-900 font-medium italic">"{classData.notes}"</dd>
                  </div>
              )}
            </div>
        </div>

        {/* Attendance Statistics Section */}
        {attendanceDetails && (
            <div className="border-t border-gray-200 p-6 sm:p-8 bg-gray-50 rounded-b-3xl">
                <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Attendance Analytics
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <StatCard 
                      label="Avg. Attendance" 
                      value={attendanceDetails.avgAttendance} 
                      icon={<TrendingIcon />}
                      color="indigo"
                    />
                    <StatCard 
                      label="Total Classes" 
                      value={attendanceDetails.totalClasses} 
                      icon={<CalendarIcon />}
                      color="green"
                    />
                    <StatCard 
                      label="Total Checked In" 
                      value={attendanceDetails.checkedInCount} 
                      icon={<UsersIcon />}
                      color="blue"
                    />
                    <DetailItem label="Total Participants" value={attendanceDetails.participants} />
                    <DetailItem label="Late Cancellations" value={attendanceDetails.lateCancellations} />
                    <DetailItem label="Comps Checked In" value={attendanceDetails.compsCheckedIn} />
                </div>
            </div>
        )}

      </div>
    </div>
  );
};
