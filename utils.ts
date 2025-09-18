import type { ClassData } from './types';

// Create a key for attendance mapping from class data
// Key format: className|dayOfWeek|time|location (all lowercase)
export const createAttendanceKey = (cls: ClassData): string => {
  if (!cls) return '';

  const location = cls.location.toLowerCase().trim();
  const day = cls.day.toLowerCase();
  const time = cls.time.toLowerCase();
  const className = cls.className.toLowerCase();
  
  return `${className}|${day}|${time}|${location}`;
};
