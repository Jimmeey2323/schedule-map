// FIX: Add missing ClassSchedule interface
export interface ClassSchedule {
  id: string;
  date: string;
  day: string;
  time: string;
  location: string | null;
  className: string | null;
  trainer1: string | null;
  trainer2: string | null;
  cover: string | null;
  status: 'Scheduled' | 'Canceled';
}

export interface ClassData {
  day: string;
  timeRaw: string;
  timeDate: Date | null;
  time: string;
  location: string;
  className: string;
  trainer1: string;
  cover: string;
  notes: string;
  uniqueKey: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | string;
}

export interface ScheduleData {
  [day: string]: ClassData[];
}

export interface AttendanceData {
  avgAttendance: string;
  totalClasses: number;
  checkedInCount: number;
  participants: number;
  lateCancellations: number;
  nonPaidCustomers: number;
  compsCheckedIn: number;
  notes: string;
}

export type MainView = 'schedule' | 'calendar' | 'datatable' | 'analytics';
