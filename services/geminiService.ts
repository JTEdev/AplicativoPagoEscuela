
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GEMINI_MODEL_TEXT, GEMINI_SYSTEM_INSTRUCTION } from '../constants';

const API_KEY = process.env.API_KEY;

let ai: GoogleGenAI | null = null;

if (API_KEY) {
  ai = new GoogleGenAI({ apiKey: API_KEY });
} else {
  console.warn(
    "API_KEY environment variable not set. Gemini API functionality will be disabled."
  );
}

export const isGeminiAvailable = (): boolean => {
  return !!ai;
};

export const askGemini = async (question: string): Promise<string> => {
  if (!ai) {
    return "Gemini API is not available. Please ensure the API key is configured.";
  }

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: GEMINI_MODEL_TEXT,
        contents: question,
        config: {
            systemInstruction: GEMINI_SYSTEM_INSTRUCTION,
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
        }
    });
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        return `Error: ${error.message}. Please try again later.`;
    }
    return "An unexpected error occurred while contacting the AI. Please try again later.";
  }
};
