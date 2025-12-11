import { GoogleGenAI } from "@google/genai";
import { GeminiResponse, GroundingChunk } from "../types";

// Helper to initialize the client safely
const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment variables");
  }
  return new GoogleGenAI({ apiKey });
};

// Generic function to perform a grounded search
async function fetchGroundedContent(prompt: string): Promise<GeminiResponse> {
  const ai = getClient();

  // Debug Log
  console.log("Gemini Service: Initializing request with model gemini-flash-lite-latest");
  console.log("Gemini Service: API Key present?", !!process.env.API_KEY);

  // Retry logic
  const maxRetries = 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-flash-lite-latest",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          // Note: responseMimeType and responseSchema are NOT allowed with googleSearch
        },
      });

      const text = response.text || "No information available.";

      // Extract grounding chunks safely
      const groundingChunks = (response.candidates?.[0]?.groundingMetadata?.groundingChunks || []) as GroundingChunk[];

      return {
        text,
        groundingChunks
      };
    } catch (error: any) {
      attempt++;
      console.error(`Gemini API Error (Attempt ${attempt}/${maxRetries}):`, error);

      // Check if it's a 503 or 429 (Overloaded/RateLimit)
      const isRetryable = error?.status === 503 || error?.code === 503 || error?.status === 429 || error?.code === 429;

      if (attempt < maxRetries && isRetryable) {
        // Wait before retrying (exponential backoff: 2s, 4s, 8s)
        const delay = Math.pow(2, attempt - 1) * 2000;
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      // If last attempt or not retryable, return error
      if (attempt === maxRetries) {
        return {
          text: "Failed to fetch data. The AI service is currently overloaded. Please try again later.",
          groundingChunks: []
        };
      }
    }
  }

  return {
    text: "Failed to fetch data.",
    groundingChunks: []
  };
}

export const fetchStats = async (): Promise<GeminiResponse> => {
  return fetchGroundedContent(
    "Search for Shohei Ohtani's 2025 SEASON stats. " +
    "Focus on: Batting Average (AVG), Home Runs (HR), RBIs, OPS, Stolen Bases (SB). " +
    "Also check Pitching stats if applicable for this season: ERA, Strikeouts (SO), Wins/Losses. " +
    "Provide a concise summary in bullet points suitable for a dashboard card. Do not write an intro. " +
    "IMPORTANT: Reply in Traditional Chinese (Taiwan)."
  );
};

export const fetchNews = async (): Promise<GeminiResponse> => {
  return fetchGroundedContent(
    "Find the top 15 most recent news headlines about Shohei Ohtani from reliable sports sources within the last 48 hours. " +
    "Return a JSON array of objects. Do not include any markdown formatting or code blocks, just the raw JSON string. " +
    "Each object must have: 'title' (string, translated to Traditional Chinese if needed), 'url' (string), 'date' (string, YYYY-MM-DD), 'time' (string, HH:MM), 'lang' (string, 'en' or 'cn'). " +
    "Ensure 8 English and 7 Chinese items if possible. " +
    "IMPORTANT: Output ONLY the JSON string."
  );
};

export const fetchHighlights = async (): Promise<GeminiResponse> => {
  return fetchGroundedContent(
    "Search for recent YouTube video highlights of Shohei Ohtani's best plays from the current or last season. " +
    "Prioritize official MLB or major sports channel YouTube links (English sources). " +
    "Return a JSON array of objects. Do not include any markdown formatting or code blocks, just the raw JSON string. " +
    "Each object must have: 'title' (string, accurate title from the video source), 'url' (string, YouTube link), 'date' (string, YYYY-MM-DD), 'time' (string, HH:MM). " +
    "IMPORTANT: Output ONLY the JSON string."
  );
};