import { GoogleGenAI, Type } from "@google/genai";
import { Question } from "../types";

const apiKey = process.env.API_KEY || 'YOUR_API_KEY_HERE'; // In a real app, this is injected securely

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey });

export const generateQuizQuestions = async (topic: string, count: number = 3): Promise<Question[]> => {
  try {
    const model = "gemini-3-flash-preview";
    
    const prompt = `Tạo ${count} câu hỏi trắc nghiệm kiểm tra nhận thức về chủ đề: "${topic}" (liên quan đến Quân đội nhân dân Việt Nam, Sư đoàn 324 hoặc kiến thức quốc phòng chung). 
    Trả về định dạng JSON theo schema đã định nghĩa. Mỗi câu hỏi có 4 lựa chọn, 1 đáp án đúng.`;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              questionText: { type: Type.STRING },
              options: { 
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              correctAnswerIndex: { type: Type.INTEGER },
              explanation: { type: Type.STRING }
            },
            required: ["questionText", "options", "correctAnswerIndex"]
          }
        }
      }
    });

    const rawText = response.text;
    if (!rawText) return [];

    const questions: Omit<Question, 'id'>[] = JSON.parse(rawText);
    
    // Add IDs locally
    return questions.map((q, index) => ({
      ...q,
      id: `gen_${Date.now()}_${index}`
    }));

  } catch (error) {
    console.error("Lỗi khi gọi Gemini API:", error);
    return [];
  }
};