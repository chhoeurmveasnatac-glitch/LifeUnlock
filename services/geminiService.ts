
import { GoogleGenAI, Type } from "@google/genai";

// Lazy initialization function
const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey === "undefined") {
    console.warn("Gemini API Key is missing. AI features will not work.");
    return null;
  }
  
  try {
    return new GoogleGenAI({ apiKey });
  } catch (error) {
    console.error("Failed to initialize Gemini Client:", error);
    return null;
  }
};

export const getAutoPlanRecommendation = async (
  income: number, 
  goals: any[], 
  currentBuckets: any[]
) => {
  const ai = getAiClient();
  
  if (!ai) {
    return [{
      bucketName: "Error",
      suggestedPercentage: 0,
      reasoning: "API Key is missing or invalid. Please check your configuration."
    }];
  }

  const prompt = `As a financial advisor for "LifeUnlock", analyze this profile:
  Monthly Income: $${income}
  Goals: ${JSON.stringify(goals)}
  Current Buckets: ${JSON.stringify(currentBuckets)}
  
  Please provide a recommended money allocation plan (bucket system).
  Respond in JSON format with an array of recommendations including bucket name, suggested percentage, and brief reasoning.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
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

    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error("AI Recommendation Error:", error);
    return [];
  }
};
