import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

async function run() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: "Find the 5 most recent image URLs from the Instagram profile https://www.instagram.com/litcigarloungepgh/. Return a JSON array of objects with 'url', 'caption', and 'category'.",
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            url: { type: Type.STRING },
            caption: { type: Type.STRING },
            category: { type: Type.STRING }
          },
          required: ["url", "caption", "category"]
        }
      }
    },
  });
  console.log(response.text);
}

run().catch(console.error);
