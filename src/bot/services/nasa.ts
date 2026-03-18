import axios from 'axios';
import { geminiService } from './gemini';

export class NasaService {
    private static API_URL = 'https://api.nasa.gov/planetary/apod';
    private static API_KEY = process.env.NASA_API_KEY || 'DEMO_KEY'; 

    /**
     * Vị cứu tinh gọi API của NASA và xin Gemini dịch sang Tiếng Việt
     */
    static async getDailyPicture(): Promise<{
        title: string;
        url: string;
        hdurl?: string;
        explanation: string;
        media_type: string;
        date: string;
    } | null> {
        try {
            const response = await axios.get(this.API_URL, {
                params: { api_key: this.API_KEY }
            });

            const data = response.data;
            if (!data) return null;

            // Dùng Gemini dịch phần giải thích sang Tiếng Việt cho sinh động
            const prompt = `Dưới đây là phần giải thích cho Bức ảnh Thiên văn học của ngày (APOD) từ NASA (tiêu đề: ${data.title}). Hãy dịch đoạn văn bản tiếng Anh sau sang tiếng Việt một cách tự nhiên, dễ hiểu, giọng điệu truyền cảm hứng về vũ trụ.\n\nRaw text: "${data.explanation}"`;
            
            let translatedExplanation = data.explanation;
            try {
                // Nhờ Gemini dịch
                // generateResponse(guildId: string, userId: string, username: string, messageContent: string, message?: any)
                const translationResult = await geminiService.generateResponse('global', 'system', 'NASA-BOT', prompt);
                if (translationResult) {
                    translatedExplanation = translationResult.trim();
                }
            } catch (err) {
                console.error("Lỗi khi dùng Gemini dịch NASA APOD:", err);
                // Fallback về lại tiếng Anh nếu lỗi
            }

            return {
                title: data.title,
                url: data.url,
                hdurl: data.hdurl,
                explanation: translatedExplanation,
                media_type: data.media_type,
                date: data.date
            };
        } catch (error) {
            console.error('NASA API Error:', error);
            return null;
        }
    }
}
