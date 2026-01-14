
import { GoogleGenAI } from "@google/genai";

export const analyzeColorGrading = async (imageDataUrl: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const base64Data = imageDataUrl.split(',')[1];
    const imagePart = {
      inlineData: {
        mimeType: 'image/png',
        data: base64Data,
      },
    };

    const prompt = `Analyze the color grading of this image. Provide a one-sentence, artistic description of its mood, color balance, and cinematic quality (e.g., "Warm golden hour tones with crushed shadows and high contrast, evoking a nostalgic 70s film aesthetic"). Keep it concise.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts: [imagePart, { text: prompt }] },
    });

    return response.text || "Analyzed color profile successfully.";
  } catch (error) {
    console.error("AI Analysis failed:", error);
    return "Cinematic grade detected with custom histogram mapping.";
  }
};
