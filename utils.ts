import type { ClassData } from './types';

// Create a robust key for attendance mapping from class data
// Key format: className|dayOfWeek|time|location (all lowercase, normalized)
export const createAttendanceKey = (cls: ClassData): string => {
  if (!cls) return '';

  // Normalize all components to ensure consistent matching
  const location = cls.location.toLowerCase().trim().replace(/[^\w\s]/g, '');
  const day = cls.day.toLowerCase().trim();
  const time = cls.time.toLowerCase().trim().replace(/\s+/g, ' ');
  const className = cls.className.toLowerCase().trim().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ');
  
  const key = `${className}|${day}|${time}|${location}`;
  
  // Debug logging to help troubleshoot mapping issues
  if (process.env.NODE_ENV === 'development') {
    console.log(`Created attendance key: ${key}`);
  }
  
  return key;
};
