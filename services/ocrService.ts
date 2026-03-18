
import { GoogleGenAI, Type } from "@google/genai";
import { OCRResult } from "../types";

export const performOCR = async (base64Image: string): Promise<OCRResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64Image,
          },
        },
        {
          text: "Extract the recipient name and the tracking number from this shipping label. If multiple names appear, choose the primary recipient. If you cannot find one, return 'Unknown'. For tracking ID, look for long alphanumeric strings often near barcodes. Return JSON format.",
        }
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Full name of the recipient" },
          trackingId: { type: Type.STRING, description: "The tracking number/ID found on the label" },
        },
        required: ["name", "trackingId"]
      }
    }
  });

  try {
    const data = JSON.parse(response.text);
    return {
      name: data.name || 'Unknown',
      trackingId: data.trackingId || 'N/A'
    };
  } catch (e) {
    console.error("Failed to parse OCR response", e);
    return { name: 'Unknown', trackingId: 'N/A' };
  }
};
