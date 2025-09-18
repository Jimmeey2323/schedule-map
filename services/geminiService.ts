
import { GoogleGenAI, Type } from "@google/genai";
import type { ClassSchedule } from "../types";

// Lazily initialize the AI instance to prevent app crash on load
let ai: GoogleGenAI | null = null;

function getAiInstance(): GoogleGenAI {
  if (ai) {
    return ai;
  }
  
  const API_KEY = process.env.API_KEY;
  if (!API_KEY) {
    // This error will now be thrown at runtime when processing is attempted, not on app load.
    throw new Error("API_KEY environment variable not set. AI processing is unavailable.");
  }
  
  ai = new GoogleGenAI({ apiKey: API_KEY });
  return ai;
}

const prompt = `
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

const schema = {
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


export const processCsvData = async (csvText: string): Promise<ClassSchedule[]> => {
  try {
    const aiInstance = getAiInstance();
    const fullPrompt = `${prompt}\n\nHere is the CSV data:\n\n${csvText}`;
    const response = await aiInstance.models.generateContent({
      model: "gemini-2.5-flash",
      contents: fullPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    let jsonText = response.text.trim();

    // The model can sometimes wrap the JSON in ```json ... ```, so we strip it.
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.substring(7, jsonText.length - 3).trim();
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.substring(3, jsonText.length - 3).trim();
    }

    const result = JSON.parse(jsonText);
    
    if (result && result.schedules) {
        return result.schedules;
    } else {
        throw new Error("AI response did not contain a 'schedules' array.");
    }
  } catch (error) {
    console.error("Error processing CSV with Gemini:", error);
    if (error instanceof Error) {
       throw new Error(`Failed to process data with AI: ${error.message}`);
    }
    throw new Error("Failed to parse data from AI due to an unknown error.");
  }
};
