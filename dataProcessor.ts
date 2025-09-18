
import type { ClassData, ScheduleData, AttendanceData } from './types';
import { createAttendanceKey } from './utils';

declare const Papa: any;
declare const JSZip: any;

// Add an interface for JSZipObject to provide types for zip file entries.
interface JSZipObject {
  name: string;
  dir: boolean;
  async(type: 'string'): Promise<string>;
}

// Days order for sorting and tabs
const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// NEW: Comprehensive trainer name mappings
const trainerNameMappings: { [key: string]: string } = {
  // Mumbai
  "anisha": "Anisha Shah",
  "atulan": "Atulan Purohit",
  "cauveri": "Cauveri Vikrant",
  "karan": "Karan Bhatia",
  "karanvir": "Karanvir Bhatia",
  "mriga": "Mrigakshi Jaiswal",
  "nishanth": "Nishanth Raj",
  "nishant": "Nishanth Raj",
  "pranjali": "Pranjali Jain",
  "reshma": "Reshma Sharma",
  "richard": "Richard D'Costa",
  "rohan": "Rohan Dahima",

  // Bengaluru & Common
  "kajol": "Kajol Kanchan",
  "kanchan": "Kajol Kanchan",
  "pushyank": "Pushyank Nahar",
  "nahar": "Pushyank Nahar",
  "shruti k": "Shruti Kulkarni",
  "shruti kulkarni": "Shruti Kulkarni",
  "kulkarni": "Shruti Kulkarni",
  "vivaran": "Vivaran Dhasmana",
  "dhasmana": "Vivaran Dhasmana",
  "saniya": "Saniya Jaiswal",
  "jaiswal": "Saniya Jaiswal",
  "shruti s": "Shruti Suresh",
  "shruti suresh": "Shruti Suresh",
  "suresh": "Shruti Suresh",
  "poojitha": "Poojitha Bhaskar",
  "bhaskar": "Poojitha Bhaskar",
  "siddhartha": "Siddhartha Kusuma",
  "kusuma": "Siddhartha Kusuma",
  "veena": "Veena Narasimhan",
  "narasimhan": "Veena Narasimhan",
  "chaitanya": "Chaitanya",
};

// Standardized class name mappings
const classNameMappings: { [key: string]: string } = {
    "amped up": "Studio Amped Up!",
    "bbb": "Studio Back Body Blaze",
    "bbb exp": "Studio Back Body Blaze Express",
    "barre57": "Studio Barre 57",
    "barre 57": "Studio Barre 57",
    "barre57 exp": "Studio Barre 57 Express",
    "barre 57 exp": "Studio Barre 57 Express",
    "cardio b": "Studio Cardio Barre",
    "cardio barre": "Studio Cardio Barre",
    "cardio b exp": "Studio Cardio Barre Express",
    "cardio barre exp": "Studio Cardio Barre Express",
    "cardio b+": "Studio Cardio Barre Plus",
    "cardio barre+": "Studio Cardio Barre Plus",
    "studio fit": "Studio FIT",
    "fit": "Studio FIT",
    "studio foundations": "Studio Foundations",
    "foundations": "Studio Foundations",
    "studio hiit": "Studio HIIT",
    "hiit": "Studio HIIT",
    "hosted": "Studio Hosted Class",
    "studio mat 57": "Studio Mat 57",
    "mat57": "Studio Mat 57",
    "mat 57": "Studio Mat 57",
    "mat57 exp": "Studio Mat 57 Express",
    "mat 57 exp": "Studio Mat 57 Express",
    "cycle": "Studio powerCycle",
    "cycle exp": "Studio powerCycle Express",
    "prenatal": "Studio Pre/Post Natal",
    "studio recovery": "Studio Recovery",
    "recovery": "Studio Recovery",
    "sweat": "Studio SWEAT In 30",
    "studio trainer's choice": "Studio Trainer's Choice",
    "trainer's choice": "Studio Trainer's Choice"
};

const difficultyMap: { [key: string]: string } = {
    "Studio Barre 57": "beginner",
    "Studio Barre 57 Express": "beginner",
    "Studio Foundations": "beginner",
    "Studio SWEAT In 30": "beginner",
    "Studio Recovery": "beginner",
    "Studio HIIT": "advanced",
    "Studio Amped Up!": "advanced",
    "Studio Back Body Blaze": "intermediate",
    "Studio Back Body Blaze Express": "intermediate",
    "Studio Cardio Barre": "intermediate",
    "Studio Cardio Barre Express": "intermediate",
    "Studio Cardio Barre Plus": "intermediate",
    "Studio FIT": "intermediate",
    "Studio Mat 57": "intermediate",
    "Studio Mat 57 Express": "intermediate",
    "Studio powerCycle": "beginner",
    "Studio powerCycle Express": "beginner",
    "Studio Pre/Post Natal": "beginner",
    "Studio Trainer's Choice": "advanced",
    "Studio Hosted Class": "beginner",
};

const normalizeLocation = (locationRaw: string): string => {
    if (!locationRaw) return '';
    const lowerLoc = locationRaw.toLowerCase().trim();
    
    // Mumbai locations
    if (lowerLoc.includes('kemps') || lowerLoc.includes('kwality')) return 'Kwality House, Kemps Corner';
    if (lowerLoc.includes('bandra') || lowerLoc.includes('supreme')) return 'Supreme HQ, Bandra';
    
    // Bengaluru locations  
    if (lowerLoc.includes('c+c') || lowerLoc.includes('cumberland')) return 'C+C';
    if (lowerLoc.includes('vm road') || lowerLoc.includes('vm') || lowerLoc.includes('kenkere')) return 'Kenkere House';
    if (lowerLoc.includes('koramangala')) return 'Koramangala';
    if (lowerLoc.includes('whitefield')) return 'Whitefield';
    if (lowerLoc.includes('indiranagar')) return 'Indiranagar';
    
    // Online/Virtual
    if (lowerLoc.includes('online') || lowerLoc.includes('virtual') || lowerLoc.includes('zoom')) return 'Online';
    
    return locationRaw.trim();
};

export function normalizeClassName(raw: string, trainerRaw?: string): string {
  if (!raw) return '';
  const val = raw.trim().toLowerCase();

  if (classNameMappings[val]) {
    return classNameMappings[val];
  }
  for (const [key, value] of Object.entries(classNameMappings)) {
    if (val.includes(key)) {
      return value;
    }
  }
  
  // NEW: Handle 'Private Class' if no other match is found
  const clientName = (trainerRaw || raw).trim();
  if (clientName && clientName.toLowerCase() !== 'class canceled') {
      return `Private Class - (${clientName})`;
  }

  return raw.trim(); // Fallback for "Class canceled" etc.
}


export function normalizeTrainerName(raw: string): string {
  if (!raw) return '';
  const val = raw.trim().toLowerCase();
  if (trainerNameMappings[val]) {
    return trainerNameMappings[val];
  }
  // Fallback for keys that might be part of the string (e.g., 'Shruti K' in CSV)
  for (const key of Object.keys(trainerNameMappings)) {
    if (val.includes(key)) {
      return trainerNameMappings[key];
    }
  }
  return raw.trim();
}

export function parseTimeToDate(timeStr: string): Date | null {
  if (!timeStr) return null;
  const today = new Date();
  let time = timeStr.trim().toUpperCase().replace(/\./g, ':');
  const ampmMatch = time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (ampmMatch) {
    let hour = parseInt(ampmMatch[1], 10);
    const minute = parseInt(ampmMatch[2], 10);
    const ampm = ampmMatch[3].toUpperCase();
    if (ampm === 'PM' && hour !== 12) hour += 12;
    if (ampm === 'AM' && hour === 12) hour = 0;
    return new Date(today.getFullYear(), today.getMonth(), today.getDate(), hour, minute);
  }
  const hmMatch = time.match(/^(\d{1,2}):(\d{2})$/);
  if (hmMatch) {
    return new Date(today.getFullYear(), today.getMonth(), today.getDate(), parseInt(hmMatch[1], 10), parseInt(hmMatch[2], 10));
  }
  return null;
}

export function formatTime(date: Date | null): string {
  if (!date) return '';
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

export async function extractScheduleData(csvText: string): Promise<ScheduleData> {
  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      skipEmptyLines: true,
      complete: (results: any) => {
        try {
          const rows = results.data as string[][];
          console.log(`CSV parsing complete. Total rows: ${rows.length}`);
          
          if (rows.length < 4) throw new Error('CSV does not have enough rows to process.');

          const headerRowIndex = rows.findIndex(row =>
            row.some(cell => cell?.trim().toLowerCase() === 'time') &&
            row.some(cell => cell?.trim().toLowerCase() === 'location')
          );
          
          console.log(`Header row found at index: ${headerRowIndex}`);
          if (headerRowIndex === -1) throw new Error('Could not find a valid header row with "Time" and "Location".');
          
          let dayRowIndex = -1;
          for (let i = headerRowIndex - 1; i >= 0; i--) {
            if (rows[i].some(cell => daysOrder.some(day => cell?.trim().toLowerCase() === day.toLowerCase()))) {
              dayRowIndex = i;
              break;
            }
          }
          
          console.log(`Day row found at index: ${dayRowIndex}`);
          if (dayRowIndex === -1) throw new Error('Could not find a valid Day row (e.g., "Monday", "Tuesday") above the header row.');

          const dateRowIndex = dayRowIndex > 0 ? dayRowIndex - 1 : -1;
          
          const headerRow = rows[headerRowIndex];
          const dayRow = rows[dayRowIndex];
          const dateRow = dateRowIndex !== -1 ? rows[dateRowIndex] : [];
          const dataRows = rows.slice(headerRowIndex + 1);

          console.log(`Data rows to process: ${dataRows.length}`);
          console.log(`Header row: `, headerRow.slice(0, 10)); // Log first 10 columns
          console.log(`Day row: `, dayRow.slice(0, 10)); // Log first 10 columns

          const timeColIndex = headerRow.findIndex(h => h?.trim().toLowerCase() === 'time');
          if (timeColIndex === -1) throw new Error('"Time" column not found in header.');

          const locationIndices = headerRow.map((h, i) => h?.trim().toLowerCase() === 'location' ? i : -1).filter(i => i !== -1);
          console.log(`Found ${locationIndices.length} location columns at indices:`, locationIndices);

          const classes: ClassData[] = [];
          let processedRows = 0;
          
          for (const row of dataRows) {
            const timeRaw = row[timeColIndex]?.trim();
            if (!timeRaw || row.every(cell => !cell)) continue; 
            
            processedRows++;

            for (const locCol of locationIndices) {
              const locationRaw = row[locCol]?.trim();
              if (!locationRaw) continue; 
              const location = normalizeLocation(locationRaw);

              let day = '';
              for (let i = locCol; i >= 0; i--) {
                if (dayRow[i]?.trim()) { day = dayRow[i].trim(); break; }
              }
              let date = '';
              for (let i = locCol; i >= 0; i--) {
                if (dateRow[i]?.trim()) { date = dateRow[i].trim(); break; }
              }

              const dayNormalized = daysOrder.find(d => d.toLowerCase() === day.toLowerCase()) || day;
              const classNameRaw = row[locCol + 1]?.trim();
              const trainer1Raw = row[locCol + 2]?.trim();
              const coverRaw = row[locCol + 4]?.trim(); 

              // FIX: Pass trainer raw value to handle private class naming
              const className = normalizeClassName(classNameRaw, trainer1Raw);
              if (!className || className.toLowerCase() === 'class canceled') continue;

              let trainer1 = normalizeTrainerName(trainer1Raw);
              let notes = '';

              if (coverRaw) {
                const coverNorm = normalizeTrainerName(coverRaw);
                notes = trainer1 ? `Cover (${coverNorm}) replaces Trainer 1 (${trainer1})` : `Cover: ${coverNorm}`;
                trainer1 = coverNorm;
              }

              const timeDate = parseTimeToDate(timeRaw);
              const time = timeDate ? formatTime(timeDate) : timeRaw;
              const uniqueKey = (dayNormalized + time + className + trainer1 + location + date).toLowerCase().replace(/\s+/g, '');

              classes.push({
                day: dayNormalized, timeRaw, timeDate, time, location, className, trainer1,
                cover: coverRaw, notes, uniqueKey, difficulty: difficultyMap[className] || 'intermediate'
              });
            }
          }

          console.log(`Processed ${processedRows} time slot rows and extracted ${classes.length} classes`);
          
          // Log sample of locations found for debugging
          const uniqueLocations = [...new Set(classes.map(c => c.location))];
          console.log(`Unique locations found:`, uniqueLocations);

          const classesByDay: ScheduleData = {};
          for (const cls of classes) {
            if (!classesByDay[cls.day]) classesByDay[cls.day] = [];
            classesByDay[cls.day].push(cls);
          }

          const sortedClassesByDay: ScheduleData = {};
          daysOrder.forEach(day => {
            if (classesByDay[day]) {
              sortedClassesByDay[day] = classesByDay[day].sort((a, b) => (a.timeDate?.getTime() || 0) - (b.timeDate?.getTime() || 0));
            }
          });
          
          console.log('Final schedule data by day:', Object.keys(sortedClassesByDay).map(day => `${day}: ${sortedClassesByDay[day].length} classes`));
          resolve(sortedClassesByDay);
        } catch (err) { reject(err); }
      },
      error: (err: any) => reject(new Error('Error parsing CSV file: ' + err.message)),
    });
  });
}

export const processAttendanceData = async (file: File): Promise<Map<string, AttendanceData>> => {
  const zip = await JSZip.loadAsync(file);
  const files = zip.files as { [key: string]: JSZipObject };
  const targetFileEntry = Object.values(files).find(
    (f) => f.name.toLowerCase().includes('momence-teachers-payroll-report-aggregate-combined') && !f.dir
  );

  if (!targetFileEntry) {
    throw new Error('Could not find the required attendance report file in the ZIP.');
  }

  const csvText = await targetFileEntry.async('string');
  
  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (results: any) => {
        try {
          const attendanceMap = new Map<string, any>();
          const debugInfo: Array<{className: string, day: string, time: string, location: string, key: string}> = [];
          
          for(const row of results.data) {
            const className = normalizeClassName(row['Class name'] || '');
            const classDateStr = row['Class date'] || '';
            const locationRaw = row['Location'] || '';
            if (!className || !classDateStr || !locationRaw) continue;

            const dateParts = classDateStr.split(',');
            if (dateParts.length < 2) continue;
            
            const dateObj = new Date(dateParts[0].trim());
            const dayOfWeek = daysOrder[dateObj.getDay() === 0 ? 6 : dateObj.getDay() - 1];
            
            // IMPROVED: Better time parsing and normalization
            const timeRaw = dateParts[1].trim();
            const timeDate = parseTimeToDate(timeRaw);
            const time = timeDate ? formatTime(timeDate) : '';
            
            // Skip if we can't parse the time properly
            if (!time) {
              console.warn(`Skipping attendance record with unparseable time: ${timeRaw}`);
              continue;
            }

            const location = normalizeLocation(locationRaw);

            const tempClassData = { 
              className, 
              day: dayOfWeek, 
              time, 
              location,
              timeRaw: '',
              timeDate: null,
              trainer1: '',
              cover: '',
              notes: '',
              uniqueKey: '',
              difficulty: ''
            } as ClassData;
            const key = createAttendanceKey(tempClassData);
            
            // Store debug info for troubleshooting
            debugInfo.push({className, day: dayOfWeek, time, location, key});
            
            if (!attendanceMap.has(key)) {
              attendanceMap.set(key, { totalCheckedIn: 0, totalClasses: 0, participants: 0, lateCancellations: 0, nonPaidCustomers: 0, compsCheckedIn: 0 });
            }
            const agg = attendanceMap.get(key);
            agg.totalCheckedIn += parseInt(row['Checked in'] || '0', 10);
            agg.participants += parseInt(row['Participants'] || '0', 10);
            agg.lateCancellations += parseInt(row['Late cancellations'] || '0', 10);
            agg.nonPaidCustomers += parseInt(row['Non Paid Customers'] || '0', 10);
            agg.compsCheckedIn += parseInt(row['Comps Checked In'] || '0', 10);
            agg.totalClasses++;
          }

          // Log debug information in development
          if (process.env.NODE_ENV === 'development') {
            console.log('Attendance data processing debug info:', debugInfo.slice(0, 10));
            console.log(`Total attendance records processed: ${attendanceMap.size}`);
          }

          const finalMap = new Map<string, AttendanceData>();
          attendanceMap.forEach((agg, key) => {
            finalMap.set(key, {
              avgAttendance: (agg.totalCheckedIn / agg.totalClasses).toFixed(2),
              totalClasses: agg.totalClasses,
              checkedInCount: agg.totalCheckedIn,
              participants: agg.participants,
              lateCancellations: agg.lateCancellations,
              nonPaidCustomers: agg.nonPaidCustomers,
              compsCheckedIn: agg.compsCheckedIn,
              notes: '',
            });
          });

          resolve(finalMap);
        } catch (err) { reject(err); }
      },
      error: (err: any) => reject(new Error('Error parsing attendance CSV: ' + err.message)),
    });
  });
};
