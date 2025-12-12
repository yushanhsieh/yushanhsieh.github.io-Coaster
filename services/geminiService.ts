import { GoogleGenAI } from "@google/genai";
import { Session } from "../types";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API Key is missing. AI features will not work.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeInterruptions = async (sessions: Session[]): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "API Key missing. Cannot generate analysis.";

  if (sessions.length === 0) {
    return "No data to analyze yet. You are safe... for now.";
  }

  // Prepare data for the prompt
  const recentSessions = sessions.slice(0, 20); // Analyze last 20 sessions to save tokens
  const sessionSummary = recentSessions.map(s => 
    `- Date: ${s.date}, Duration: ${Math.round(s.duration / 60)} mins, Topic: ${s.note || "No topic recorded"}`
  ).join("\n");

  const prompt = `
    You are a witty, slightly sarcastic corporate productivity consultant. 
    Analyze the following log of interruptions by an "idle colleague" who keeps coming to my desk to chat.
    
    Data:
    ${sessionSummary}
    
    Please provide:
    1. A summary of the total time wasted recently.
    2. A sarcastic comment on the most frequent topics.
    3. A brief "productivity impact score" from 1 to 10 (10 being catastrophic).
    4. Advice on how to politely make them leave next time.

    Keep it concise and funny.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Could not generate analysis.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Failed to contact the AI consultant. Maybe they are also chatting with a colleague.";
  }
};