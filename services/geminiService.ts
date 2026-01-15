
import { GoogleGenAI, Type } from "@google/genai";

// Fixed: Correctly initialize GoogleGenAI with a named parameter and direct process.env.API_KEY access
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getAutoPlanRecommendation = async (
  income: number, 
  goals: any[], 
  currentBuckets: any[]
) => {
  const prompt = `As a financial advisor for "LifeUnlock", analyze this profile:
  Monthly Income: $${income}
  Goals: ${JSON.stringify(goals)}
  Current Buckets: ${JSON.stringify(currentBuckets)}
  
  Please provide a recommended money allocation plan (bucket system).
  Respond in JSON format with an array of recommendations including bucket name, suggested percentage, and brief reasoning.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              bucketName: { type: Type.STRING },
              suggestedPercentage: { type: Type.NUMBER },
              reasoning: { type: Type.STRING }
            },
            required: ['bucketName', 'suggestedPercentage', 'reasoning']
          }
        }
      }
    });

    // Correctly using .text property
    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error("AI Recommendation Error:", error);
    return [];
  }
};
