import React, { useEffect } from 'react';
import type { ClassData, AttendanceData } from '../types';

interface ClassDetailModalProps {
  classData: ClassData;
  attendanceDetails: AttendanceData | undefined;
  onClose: () => void;
}

const DetailItem: React.FC<{ label: string; value: string | number | undefined }> = ({ label, value }) => {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div className="py-2">
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="mt-1 text-md text-gray-900">{value}</dd>
    </div>
  );
};

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

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="class-detail-title"
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 sm:p-8">
            <div className="flex justify-between items-start">
                <div>
                    <h2 id="class-detail-title" className="text-2xl sm:text-3xl font-bold text-indigo-800">{classData.className}</h2>
                    <p className="text-md sm:text-lg text-gray-600 mt-1">{classData.day} at {classData.time}</p>
                </div>
                <button 
                    onClick={onClose} 
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Close modal"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>

        <div className="border-t border-gray-200 px-6 sm:px-8 py-4">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
              <DetailItem label="Trainer" value={classData.trainer1} />
              <DetailItem label="Location" value={classData.location} />
              <DetailItem label="Cover" value={classData.cover} />
              <DetailItem label="Difficulty" value={classData.difficulty} />
              {classData.notes && (
                  <div className="sm:col-span-2 py-2">
                     <dt className="text-sm font-medium text-gray-500">Notes</dt>
                     <dd className="mt-1 text-md text-gray-900 italic">"{classData.notes}"</dd>
                  </div>
              )}
            </dl>
        </div>

        {attendanceDetails && (
            <div className="border-t border-gray-200">
                <div className="px-6 sm:px-8 py-4">
                    <h3 className="text-xl font-semibold text-gray-800">Attendance Statistics</h3>
                </div>
                <div className="px-6 sm:px-8 pb-6">
                    <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-6">
                        <DetailItem label="Avg. Attendance" value={attendanceDetails.avgAttendance} />
                        <DetailItem label="Total Classes Tracked" value={attendanceDetails.totalClasses} />
                        <DetailItem label="Total Checked In" value={attendanceDetails.checkedInCount} />
                        <DetailItem label="Total Participants" value={attendanceDetails.participants} />
                        <DetailItem label="Late Cancellations" value={attendanceDetails.lateCancellations} />
                        <DetailItem label="Comps Checked In" value={attendanceDetails.compsCheckedIn} />
                    </dl>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};
