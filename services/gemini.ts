
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getMarketInsight() {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Generate a short, professional 2-sentence market update for a crypto/robot investment app. Be encouraging but formal.",
      config: {
        temperature: 0.7,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Market stability remains high. AI trading nodes are performing within expected parameters for maximum yield.";
  }
}
