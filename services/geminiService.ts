import { GoogleGenAI, Type } from "@google/genai";
import { Cart, CustomerRequest, MatchResult } from "../types";
import { calculateDistance } from "./geoService";

// Initialize Gemini Client
// Note: We use process.env.API_KEY as per guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const findBestMatchWithAI = async (
  request: CustomerRequest,
  carts: Cart[]
): Promise<MatchResult | null> => {
  if (!process.env.API_KEY) {
    console.warn("No API Key provided, returning simple mock match.");
    // Fallback simple distance match logic if no API key
    const nearest = carts.sort((a, b) => 
      calculateDistance(request.location, a.location) - calculateDistance(request.location, b.location)
    )[0];
    return {
      cartId: nearest.id,
      reasoning: "Matched based on nearest proximity (No AI Key detected).",
      estimatedArrivalMinutes: 5
    };
  }

  try {
    const cartsData = carts.map(c => ({
      id: c.id,
      name: c.name,
      description: c.description,
      distanceKm: calculateDistance(request.location, c.location).toFixed(2),
      status: c.status,
      inventory: c.inventory,
      rating: c.rating
    }));

    const prompt = `
      Act as an intelligent dispatch system for mobile food carts.
      
      Customer Request:
      - Preference: "${request.itemPreference}"
      - Location Context: Customer is waiting.
      
      Available Carts (with distance from customer):
      ${JSON.stringify(cartsData, null, 2)}
      
      Task:
      Select the single best cart to match this customer.
      Consider:
      1. Matching inventory to preference (highest priority).
      2. Distance (closer is better).
      3. Rating (higher is better).
      4. Status (must not be OFFLINE).
      
      Return a JSON object with the cartId, a brief reasoning for the choice, and estimated arrival minutes (assume 2 mins per km).
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            cartId: { type: Type.STRING },
            reasoning: { type: Type.STRING },
            estimatedArrivalMinutes: { type: Type.NUMBER }
          },
          required: ["cartId", "reasoning", "estimatedArrivalMinutes"]
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    return result as MatchResult;

  } catch (error) {
    console.error("Gemini Matching Error:", error);
    // Fallback in case of error
    return null;
  }
};