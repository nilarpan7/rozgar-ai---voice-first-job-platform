
import { GoogleGenAI, Type } from "@google/genai";
import { GeminiParsedIntent } from "../types";

// Initialize Gemini
// Note: In a production app, API keys should be handled via backend proxy.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const parseVoiceInput = async (transcript: string, currentLang: string): Promise<GeminiParsedIntent> => {
  const model = "gemini-2.5-flash"; // Fast and efficient for simple NLU

  const prompt = `
    You are an AI assistant for a blue-collar job portal in India.
    User Input (${currentLang}): "${transcript}"
    
    Task: Extract the user's intent, desired job role, location, and salary expectations if mentioned.
    If the user wants to find a job, set intent to 'find_job'.
    If the user wants to hire someone, set intent to 'post_job'.
    
    Return a JSON object only.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            intent: { type: Type.STRING, enum: ['find_job', 'post_job', 'unknown'] },
            role: { type: Type.STRING, description: "Normalized job role (e.g., driver, maid, mason)" },
            location: { type: Type.STRING, description: "City or locality" },
            minWage: { type: Type.NUMBER, description: "Expected wage amount" },
            wageType: { type: Type.STRING, enum: ['daily', 'monthly'] }
          },
          required: ['intent']
        }
      }
    });

    const text = response.text;
    if (!text) return { intent: 'unknown' };
    
    return JSON.parse(text) as GeminiParsedIntent;

  } catch (error) {
    console.error("Gemini Parse Error:", error);
    // Fallback if API fails
    return { intent: 'find_job', role: transcript }; 
  }
};

export const generateJobDescription = async (role: string, wage: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Write a very short, simple 1-sentence job description for a ${role} paying ${wage}. Keep it simple for low-literacy users.`,
    });
    return response.text || "";
  } catch (e) {
    return `Looking for ${role}. Good pay.`;
  }
};

export const getChatResponse = async (
  history: {role: 'user' | 'model', parts: {text: string}[]}[], 
  newMessage: string,
  userLocation?: { latitude: number, longitude: number }
) => {
  try {
    const config: any = {
      systemInstruction: "You are 'Rozgar Sahayak', a helpful, friendly, and polite AI assistant for Rozgar AI, a job platform for blue-collar workers in India. Keep answers short, simple, and encouraging. Help users find jobs, understand how to use the app, or give advice on interviews. If asked about features, mention voice search and verified jobs. Use Hinglish (Hindi+English mix) if the user seems comfortable, otherwise English. You have access to Google Maps to help users with directions and locations. If a user asks about a location, provide accurate details.",
      tools: [{ googleMaps: {} }],
    };

    if (userLocation) {
        config.toolConfig = {
            retrievalConfig: {
                latLng: {
                    latitude: userLocation.latitude,
                    longitude: userLocation.longitude
                }
            }
        };
    }

    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      history: history,
      config: config
    });

    const response = await chat.sendMessage({ message: newMessage });
    
    return {
      text: response.text,
      groundingChunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks
    };
  } catch (error) {
    console.error("Chat Error:", error);
    return { text: "Maaf kijiye, main abhi baat nahi kar pa raha hoon. Kripya thodi der baad koshish karein." };
  }
};
