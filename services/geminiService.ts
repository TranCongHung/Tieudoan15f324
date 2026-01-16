import { Question } from "../types";

// Dịch vụ AI đã được gỡ bỏ khỏi phiên bản này.
// File này được giữ lại để tránh lỗi import nếu có tham chiếu cũ.

export const generateQuizQuestions = async (topic: string, count: number = 3): Promise<Question[]> => {
    console.warn("AI Generation feature has been disabled.");
    return [];
};
