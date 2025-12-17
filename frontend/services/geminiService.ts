
import { GeminiParsedIntent } from "../types";

const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api/ai";

export const parseVoiceInput = async (
  transcript: string,
  currentLang: string
): Promise<GeminiParsedIntent> => {
  const response = await fetch(`${API_BASE}/parse-voice`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ transcript, currentLang }),
  });

  if (!response.ok) {
    console.error("parseVoiceInput error:", await response.text());
    return { intent: "find_job", role: transcript };
  }

  return (await response.json()) as GeminiParsedIntent;
};

export const generateJobDescription = async (
  role: string,
  wage: string
): Promise<string> => {
  const response = await fetch(`${API_BASE}/generate-job-description`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ role, wage }),
  });

  if (!response.ok) {
    console.error("generateJobDescription error:", await response.text());
    return `Looking for ${role}. Good pay.`;
  }

  const data = (await response.json()) as { description: string };
  return data.description;
};

export const getChatResponse = async (
  history: { role: "user" | "model"; parts: { text: string }[] }[],
  newMessage: string,
  userLocation?: { latitude: number; longitude: number }
) => {
  const response = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ history, newMessage, userLocation }),
  });

  if (!response.ok) {
    console.error("getChatResponse error:", await response.text());
    return {
      text: "Maaf kijiye, main abhi baat nahi kar pa raha hoon. Kripya thodi der baad koshish karein.",
    };
  }

  return (await response.json()) as {
    text: string;
    groundingChunks?: unknown;
  };
};
