import dotenv from "dotenv";
dotenv.config();

import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;

if (!apiKey) {
  // eslint-disable-next-line no-console
  console.warn(
    "[AI] GEMINI_API_KEY (or API_KEY) is not set. AI endpoints will return fallback responses."
  );
}

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const parseVoiceController = async (req, res) => {
  const { transcript, currentLang } = req.body || {};

  if (!transcript) {
    return res.status(400).json({ error: "transcript is required" });
  }

  if (!ai) {
    return res.json({
      intent: "find_job",
      role: transcript,
    });
  }

  const model = "gemini-2.5-flash";

  const prompt = `
    You are an AI assistant for a blue-collar job portal in India.
    User Input (${currentLang || "unknown"}): "${transcript}"
    
    Task: Extract the user's intent, desired job role, location, and salary expectations if mentioned.
    If the user wants to find a job, set intent to 'find_job'.
    If the user wants to hire someone, set intent to 'post_job'.
    
    Return a JSON object only.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            intent: {
              type: Type.STRING,
              enum: ["find_job", "post_job", "unknown"],
            },
            role: {
              type: Type.STRING,
              description: "Normalized job role (e.g., driver, maid, mason)",
            },
            location: { type: Type.STRING, description: "City or locality" },
            minWage: {
              type: Type.NUMBER,
              description: "Expected wage amount",
            },
            wageType: {
              type: Type.STRING,
              enum: ["daily", "monthly"],
            },
          },
          required: ["intent"],
        },
      },
    });

    const text = response.text;
    if (!text) {
      return res.json({ intent: "unknown" });
    }

    const parsed = JSON.parse(text);
    return res.json(parsed);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Gemini Parse Error:", error);
    return res.json({ intent: "find_job", role: transcript });
  }
};

export const generateJobDescriptionController = async (req, res) => {
  const { role, wage } = req.body || {};

  if (!role || !wage) {
    return res.status(400).json({ error: "role and wage are required" });
  }

  if (!ai) {
    return res.json({
      description: `Looking for ${role} paying ${wage}. Good pay.`,
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Write a very short, simple 1-sentence job description for a ${role} paying ${wage}. Keep it simple for low-literacy users.`,
    });
    return res.json({ description: response.text || "" });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Gemini Job Description Error:", error);
    return res.json({
      description: `Looking for ${role} paying ${wage}. Good pay.`,
    });
  }
};

export const chatController = async (req, res) => {
  const { history, newMessage, userLocation } = req.body || {};

  if (!newMessage) {
    return res.status(400).json({ error: "newMessage is required" });
  }

  if (!ai) {
    return res.json({
      text: "Maaf kijiye, AI service abhi available nahi hai. Thodi der baad try kariye.",
    });
  }

  try {
    const config = {
      systemInstruction:
        "You are 'Rozgar Sahayak', a helpful, friendly, and polite AI assistant for Rozgar AI, a job platform for blue-collar workers in India. Keep answers short, simple, and encouraging. Help users find jobs, understand how to use the app, or give advice on interviews. If asked about features, mention voice search and verified jobs. Use Hinglish (Hindi+English mix) if the user seems comfortable, otherwise English. You have access to Google Maps to help users with directions and locations. If a user asks about a location, provide accurate details.",
      tools: [{ googleMaps: {} }],
    };

    if (userLocation?.latitude && userLocation?.longitude) {
      config.toolConfig = {
        retrievalConfig: {
          latLng: {
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
          },
        },
      };
    }

    const chat = ai.chats.create({
      model: "gemini-2.5-flash",
      history: history || [],
      config,
    });

    const response = await chat.sendMessage({ message: newMessage });

    return res.json({
      text: response.text,
      groundingChunks:
        response.candidates?.[0]?.groundingMetadata?.groundingChunks,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Chat Error:", error);
    return res.json({
      text: "Maaf kijiye, main abhi baat nahi kar pa raha hoon. Kripya thodi der baad koshish karein.",
    });
  }
};