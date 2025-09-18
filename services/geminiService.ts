
import { GoogleGenAI, Type } from "@google/genai";
import type { ClassSchedule, ClassData, AttendanceData } from "../types";

// Lazily initialize the AI instance to prevent app crash on load
let ai: GoogleGenAI | null = null;

function getAiInstance(): GoogleGenAI {
  if (ai) {
    return ai;
  }
  
  const API_KEY = 'AIzaSyAq_QgITLnhKtvKrFhOw-rvHc0G8FURgPM';
  if (!API_KEY) {
    // This error will now be thrown at runtime when processing is attempted, not on app load.
    throw new Error("API_KEY environment variable not set. AI processing is unavailable.");
  }
  
  ai = new GoogleGenAI({ apiKey: API_KEY });
  return ai;
}

// Enhanced retry logic for handling API errors
interface RetryOptions {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

const defaultRetryOptions: RetryOptions = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2
};

const delay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

const isRetryableError = (error: any): boolean => {
  if (error?.error?.code) {
    const code = error.error.code;
    // Retry on server errors, rate limits, and overload
    return code === 503 || code === 500 || code === 429 || code === 502 || code === 504;
  }
  return false;
};

const withRetry = async <T>(
  operation: () => Promise<T>,
  options: RetryOptions = defaultRetryOptions
): Promise<T> => {
  let lastError: any;
  
  for (let attempt = 0; attempt <= options.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Don't retry if this is the last attempt or if the error is not retryable
      if (attempt === options.maxRetries || !isRetryableError(error)) {
        break;
      }
      
      // Calculate delay with exponential backoff
      const delayMs = Math.min(
        options.baseDelay * Math.pow(options.backoffMultiplier, attempt),
        options.maxDelay
      );
      
      console.warn(`API request failed (attempt ${attempt + 1}/${options.maxRetries + 1}), retrying in ${delayMs}ms...`, error);
      await delay(delayMs);
    }
  }
  
  throw lastError;
};

const getUserFriendlyErrorMessage = (error: any): string => {
  if (error?.error?.code) {
    const code = error.error.code;
    switch (code) {
      case 503:
        return "The AI service is currently overloaded. Please try again in a few minutes.";
      case 429:
        return "Too many requests. Please wait a moment before trying again.";
      case 500:
      case 502:
      case 504:
        return "The AI service is temporarily unavailable. Please try again later.";
      case 400:
        return "Invalid request. Please check your data format.";
      case 401:
        return "Authentication failed. Please check your API configuration.";
      case 403:
        return "Access denied. Please check your API permissions.";
      default:
        return `AI service error (${code}): ${error.error.message || 'Unknown error'}`;
    }
  }
  
  if (error.message) {
    return error.message;
  }
  
  return "An unexpected error occurred with the AI service.";
};

// Enhanced AI services for schedule optimization and insights

export interface ScheduleInsights {
  summary: string;
  trends: string[];
  recommendations: string[];
  busyTimes: { day: string; time: string; reason: string }[];
  improvements: string[];
}

export interface AttendancePrediction {
  predictedAttendance: number;
  confidence: number;
  factors: string[];
  recommendations: string[];
}

export interface ScheduleOptimization {
  suggestions: {
    type: 'move' | 'add' | 'remove' | 'reschedule';
    description: string;
    impact: string;
    priority: 'high' | 'medium' | 'low';
  }[];
  utilization: {
    overutilized: string[];
    underutilized: string[];
  };
  trainerBalance: {
    overloaded: string[];
    underutilized: string[];
    recommendations: string[];
  };
}

const scheduleAnalysisPrompt = `
You are an expert fitness schedule analyst. Analyze the provided class schedule data and attendance information to generate comprehensive insights about schedule effectiveness, trends, and optimization opportunities.

Focus on:
1. Class popularity trends by time, day, and trainer
2. Attendance patterns and peak/low usage times
3. Resource utilization (trainers, locations, time slots)
4. Schedule gaps or conflicts
5. Opportunities for improvement

Provide actionable insights that can help optimize the schedule for better attendance and resource utilization.
`;

const optimizationPrompt = `
You are a schedule optimization expert. Analyze the provided schedule and attendance data to suggest specific improvements.

Consider:
1. Moving low-attendance classes to better time slots
2. Adding popular classes where there's demand
3. Balancing trainer workloads
4. Optimizing location usage
5. Identifying schedule gaps or oversaturated periods

Provide specific, actionable suggestions with clear impact assessments and priority levels.
`;

const predictionPrompt = `
You are an attendance prediction specialist. Based on historical attendance data and class characteristics, predict attendance for new or modified classes.

Consider factors like:
1. Day of week and time slot popularity
2. Trainer popularity and effectiveness
3. Class type and difficulty level
4. Location preferences
5. Historical patterns and trends

Provide attendance predictions with confidence levels and key influencing factors.
`;

// Existing CSV processing functionality
const csvProcessingPrompt = `
You are an expert data processor. Your task is to analyze the provided raw text from a CSV file, which represents a weekly class schedule, and convert it into a structured JSON format. The CSV has a complex, non-tabular layout with repeating weekly blocks horizontally.

Here are the rules you must follow:
1.  Identify each weekly block. A block is defined by a row of dates followed by a row of days of the week.
2.  For each day within a block, extract the full date (e.g., "25 Aug 2025") and the day of the week (e.g., "Monday").
3.  The columns for each day are typically: 'Location', 'Class', 'Trainer 1', 'Trainer 2', 'Cover'. The 'Time' column is the very first column for all days in that row.
4.  Iterate through each time slot row for each day.
5.  If a row for a specific day and time has class information (a class name or trainer), create a JSON object for it.
6.  Extract the following fields for each class:
    - "id": Generate a unique string ID for each entry, for example, combining date, time, and location.
    - "date": The full date for that column's block, formatted as YYYY-MM-DD.
    - "day": The day of the week.
    - "time": The time from the first column of the row.
    - "location": The value from the 'Location' column.
    - "className": The value from the 'Class' column.
    - "trainer1": The value from the 'Trainer 1' column.
    - "trainer2": The value from the 'Trainer 2' column.
    - "cover": The value from the 'Cover' column.
    - "status": If the 'Class' value is 'Class canceled', set this to 'Canceled'. Otherwise, set it to 'Scheduled'.
7.  Skip any rows that are entirely empty or contain metadata like "Guidelines" or non-schedule related notes.
8.  Handle empty or placeholder cells (like '#REF!') gracefully. If a trainer, location, or class is not specified, represent it as null in the JSON.
9.  Ignore the extra non-schedule columns at the end of the CSV data like 'Any class?', 'VM Road', 'C+C', etc. Also ignore the specific 'Trainer Off' columns.
10. Combine all extracted class schedules from all weeks into a single flat array.

Your output MUST be a JSON object with a single key "schedules" which is an array of schedule objects, conforming to the provided schema.
`;

const csvSchema = {
  type: Type.OBJECT,
  properties: {
    schedules: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: 'Unique ID for the entry' },
          date: { type: Type.STRING, description: 'Date of the class (YYYY-MM-DD)' },
          day: { type: Type.STRING, description: 'Day of the week' },
          time: { type: Type.STRING, description: 'Time of the class' },
          location: { type: Type.STRING, description: 'Location of the class' },
          className: { type: Type.STRING, description: 'Name of the class' },
          trainer1: { type: Type.STRING, description: 'Primary trainer' },
          trainer2: { type: Type.STRING, description: 'Secondary trainer' },
          cover: { type: Type.STRING, description: 'Covering trainer' },
          status: { type: Type.STRING, enum: ['Scheduled', 'Canceled'], description: 'Status of the class' },
        },
        required: ['id', 'date', 'day', 'time', 'status'],
      },
    },
  },
};

const insightsSchema = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING, description: 'Overall schedule summary' },
    trends: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: 'Key trends identified in the schedule and attendance data' 
    },
    recommendations: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: 'Specific recommendations for schedule improvement' 
    },
    busyTimes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          day: { type: Type.STRING },
          time: { type: Type.STRING },
          reason: { type: Type.STRING }
        }
      }
    },
    improvements: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: 'Areas for potential improvement' 
    }
  }
};

const optimizationSchema = {
  type: Type.OBJECT,
  properties: {
    suggestions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          type: { type: Type.STRING, enum: ['move', 'add', 'remove', 'reschedule'] },
          description: { type: Type.STRING },
          impact: { type: Type.STRING },
          priority: { type: Type.STRING, enum: ['high', 'medium', 'low'] }
        }
      }
    },
    utilization: {
      type: Type.OBJECT,
      properties: {
        overutilized: { type: Type.ARRAY, items: { type: Type.STRING } },
        underutilized: { type: Type.ARRAY, items: { type: Type.STRING } }
      }
    },
    trainerBalance: {
      type: Type.OBJECT,
      properties: {
        overloaded: { type: Type.ARRAY, items: { type: Type.STRING } },
        underutilized: { type: Type.ARRAY, items: { type: Type.STRING } },
        recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
      }
    }
  }
};

const predictionSchema = {
  type: Type.OBJECT,
  properties: {
    predictedAttendance: { type: Type.NUMBER },
    confidence: { type: Type.NUMBER },
    factors: { type: Type.ARRAY, items: { type: Type.STRING } },
    recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
  }
};

// Enhanced AI Services

export const processCsvData = async (csvText: string): Promise<ClassSchedule[]> => {
  try {
    const result = await withRetry(async () => {
      const aiInstance = getAiInstance();
      const fullPrompt = `${csvProcessingPrompt}\n\nHere is the CSV data:\n\n${csvText}`;
      
      const response = await aiInstance.models.generateContent({
        model: "gemini-2.5-flash",
        contents: fullPrompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: csvSchema,
        },
      });

      let jsonText = response.text.trim();

      // The model can sometimes wrap the JSON in ```json ... ```, so we strip it.
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.substring(7, jsonText.length - 3).trim();
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.substring(3, jsonText.length - 3).trim();
      }

      const parsed = JSON.parse(jsonText);
      
      if (parsed && parsed.schedules) {
        return parsed.schedules;
      } else {
        throw new Error("AI response did not contain a 'schedules' array.");
      }
    });
    
    return result;
  } catch (error) {
    console.error("Error processing CSV with Gemini:", error);
    const friendlyMessage = getUserFriendlyErrorMessage(error);
    throw new Error(friendlyMessage);
  }
};

export const generateScheduleInsights = async (
  scheduleData: ClassData[],
  attendanceData: Map<string, AttendanceData>
): Promise<ScheduleInsights> => {
  try {
    const result = await withRetry(async () => {
      const aiInstance = getAiInstance();
      
      // Prepare data for AI analysis
      const scheduleContext = scheduleData.map(cls => ({
        day: cls.day,
        time: cls.time,
        className: cls.className,
        trainer: cls.trainer1,
        location: cls.location,
        difficulty: cls.difficulty
      }));

      const attendanceContext = Array.from(attendanceData.entries()).map(([key, data]) => ({
        key,
        avgAttendance: data.avgAttendance,
        totalClasses: data.totalClasses,
        checkedInCount: data.checkedInCount
      }));

      const contextData = {
        schedule: scheduleContext,
        attendance: attendanceContext
      };

      const fullPrompt = `${scheduleAnalysisPrompt}\n\nSchedule and attendance data:\n${JSON.stringify(contextData, null, 2)}`;
      
      const response = await aiInstance.models.generateContent({
        model: "gemini-2.5-flash",
        contents: fullPrompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: insightsSchema,
        },
      });

      return JSON.parse(response.text.trim());
    });
    
    return result;
  } catch (error) {
    console.error("Error generating schedule insights:", error);
    const friendlyMessage = getUserFriendlyErrorMessage(error);
    throw new Error(friendlyMessage);
  }
};

export const generateScheduleOptimization = async (
  scheduleData: ClassData[],
  attendanceData: Map<string, AttendanceData>
): Promise<ScheduleOptimization> => {
  try {
    const result = await withRetry(async () => {
      const aiInstance = getAiInstance();
      
      const contextData = {
        schedule: scheduleData.map(cls => ({
          day: cls.day,
          time: cls.time,
          className: cls.className,
          trainer: cls.trainer1,
          location: cls.location,
          difficulty: cls.difficulty
        })),
        attendance: Array.from(attendanceData.entries()).map(([key, data]) => ({
          key,
          avgAttendance: data.avgAttendance,
          totalClasses: data.totalClasses,
          checkedInCount: data.checkedInCount
        }))
      };

      const fullPrompt = `${optimizationPrompt}\n\nData for optimization:\n${JSON.stringify(contextData, null, 2)}`;
      
      const response = await aiInstance.models.generateContent({
        model: "gemini-2.5-flash",
        contents: fullPrompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: optimizationSchema,
        },
      });

      return JSON.parse(response.text.trim());
    });
    
    return result;
  } catch (error) {
    console.error("Error generating optimization suggestions:", error);
    const friendlyMessage = getUserFriendlyErrorMessage(error);
    throw new Error(friendlyMessage);
  }
};

export const predictAttendance = async (
  classData: Partial<ClassData>,
  historicalData: Map<string, AttendanceData>
): Promise<AttendancePrediction> => {
  try {
    const result = await withRetry(async () => {
      const aiInstance = getAiInstance();
      
      const contextData = {
        targetClass: classData,
        historicalAttendance: Array.from(historicalData.entries()).map(([key, data]) => ({
          key,
          avgAttendance: data.avgAttendance,
          totalClasses: data.totalClasses,
          checkedInCount: data.checkedInCount
        }))
      };

      const fullPrompt = `${predictionPrompt}\n\nPredict attendance for:\n${JSON.stringify(contextData, null, 2)}`;
      
      const response = await aiInstance.models.generateContent({
        model: "gemini-2.5-flash",
        contents: fullPrompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: predictionSchema,
        },
      });

      return JSON.parse(response.text.trim());
    });
    
    return result;
  } catch (error) {
    console.error("Error predicting attendance:", error);
    const friendlyMessage = getUserFriendlyErrorMessage(error);
    throw new Error(friendlyMessage);
  }
};
