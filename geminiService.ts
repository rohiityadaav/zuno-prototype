import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface ExtractedTransaction {
  item: string;
  qty: number;
  price: number;
  type: "Credit" | "Cash";
  customer?: string;
  isTransaction: boolean;
}

export async function parseHinglishIntent(text: string): Promise<ExtractedTransaction | null> {
  if (!process.env.GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEY is missing");
    return null;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are the Zuno Ambient Intelligence Agent. 
      Your task is to autonomously filter "Gossip" from "Business" in Hinglish shop floor conversations.
      
      CRITICAL RULES:
      1. IGNORE casual chatter (e.g., "Mausam kaisa hai?", "Aur batao", "Bache kaise hain?").
      2. EXTRACT structured financial data only when a transaction is detected.
      3. HANDLE Hinglish code-switching (Hindi + English) accurately.
      4. IDENTIFY "Credit" (Udhaar) vs "Cash" (Nagad) transactions.
      
      Examples:
      "Ramesh ko 2 kilo chini udhaar di 80 rupaye ki" -> {item: "Chini", qty: 2, price: 40, type: "Credit", customer: "Ramesh", isTransaction: true}
      "Ek bread ka packet becha 30 rupaye cash mein" -> {item: "Bread", qty: 1, price: 30, type: "Cash", isTransaction: true}
      "Bhai aaj garmi bahut hai" -> {isTransaction: false}

      Input: "${text}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            item: { type: Type.STRING },
            qty: { type: Type.NUMBER },
            price: { type: Type.NUMBER },
            type: { type: Type.STRING, enum: ["Credit", "Cash"] },
            customer: { type: Type.STRING },
            isTransaction: { type: Type.BOOLEAN }
          },
          required: ["isTransaction"]
        }
      }
    });

    const responseText = response.text?.trim() || "{}";
    
    try {
      const result = JSON.parse(responseText);
      return result.isTransaction ? result : null;
    } catch (parseError) {
      console.error("AI returned invalid JSON:", responseText, parseError);
      return null;
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return null;
  }
}
