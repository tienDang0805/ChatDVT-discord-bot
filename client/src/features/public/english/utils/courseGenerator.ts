import { GoogleGenerativeAI, Schema, Type } from '@google/generative-ai';
import { PRELOADED_UNITS } from '../data/preloadedUnits';

// ============================================================================
// 1. DATA STRUCTURES & INTERFACES (CHUẨN SÁCH GIÁO KHOA)
// ============================================================================

export interface CourseUnitSkeleton {
  id: string;
  level: string;
  title: string;
  topic: string;
  targetVocab: string[];
  grammarFocus: string;
}

export interface GeneratedCourseUnit {
  vocabulary: {
    words: {
      word: string;
      ipa: string;
      type: string; // noun, verb, adj...
      meaning: string;
      example: string;
    }[];
    exercises: { // Điền từ vào chỗ trống
      sentence: string; // Có chứa "___"
      answer: string;
      options: string[];
    }[];
  };
  reading: {
    title: string;
    passage: string; // Khoảng 150 - 200 từ
    translation: string;
    trueFalse: {
      statement: string;
      isTrue: boolean;
      explanation: string;
    }[];
    multipleChoice: {
      question: string;
      options: string[];
      answer: string;
      explanation: string;
    }[];
  };
  grammar: {
    theory: {
      title: string;
      explanation: string; // Giải thích ngắn gọn bằng Tiếng Việt
      examples: { en: string; vi: string }[];
    };
    exercises: {
      question: string; // Chọn đáp án đúng để hoàn thành câu
      options: string[];
      answer: string;
    }[];
  };
  conversation: {
    context: string;
    dialogue: {
      speaker: string;
      en: string;
      vi: string;
    }[];
    roleplaySentences: { // Các câu cốt lõi bắt buộc người dùng phải đọc
      en: string;
      vi: string;
      ipa: string;
    }[];
  };
}

// ============================================================================
// 2. STATIC CURRICULUM - 10 UNITS (CHUẨN B1 - B2 INTERMEDIATE)
// ============================================================================

export const COURSE_SKELETON: CourseUnitSkeleton[] = [
  {
    id: 'unit_1',
    level: 'B1-B2',
    title: 'The Digital Age & AI',
    topic: 'Công nghệ, Trí tuệ nhân tạo, Mạng xã hội',
    targetVocab: ['artificial intelligence', 'algorithm', 'addicted', 'virtual', 'cutting-edge', 'viral', 'cybersecurity', 'innovative', 'scroll', 'glitch'],
    grammarFocus: 'Câu Bị Động (Passive Voice) ở hiện tại và quá khứ'
  },
  {
    id: 'unit_2',
    level: 'B1-B2',
    title: 'Global Challenges',
    topic: 'Biến đổi khí hậu, Môi trường, Ô nhiễm',
    targetVocab: ['sustainable', 'carbon footprint', 'ecosystem', 'fossil fuels', 'renewable', 'devastating', 'conservation', 'awareness', 'extinction', 'climate'],
    grammarFocus: 'Câu Điều Kiện Loại 1 và Loại 2 (Conditionals Type 1 & 2)'
  },
  {
    id: 'unit_3',
    level: 'B1-B2',
    title: 'Career & Ambitions',
    topic: 'Chốn công sở, Phỏng vấn, Áp lực công việc',
    targetVocab: ['resume', 'internship', 'promotion', 'negotiate', 'deadline', 'burnout', 'colleague', 'resignation', 'leadership', 'toxic'],
    grammarFocus: 'Câu Tường Thuật (Reported Speech)'
  },
  {
    id: 'unit_4',
    level: 'B1-B2',
    title: 'Mind & Mental Health',
    topic: 'Tâm lý học, Căng thẳng, Chữa lành',
    targetVocab: ['anxiety', 'meditation', 'overcome', 'perspective', 'resilient', 'therapy', 'depression', 'trigger', 'mindfulness', 'trauma'],
    grammarFocus: 'Động từ khuyết thiếu suy luận (Modals of Deduction: must be, might have)'
  },
  {
    id: 'unit_5',
    level: 'B1-B2',
    title: 'The Art of Persuasion',
    topic: 'Marketing, Thao túng tâm lý, Lừa đảo (Scams)',
    targetVocab: ['manipulate', 'authentic', 'gimmick', 'strategy', 'persuasive', 'target audience', 'scam', 'brainwash', 'influencer', 'boycott'],
    grammarFocus: 'Mệnh Đề Quan Hệ (Relative Clauses - Defining & Non-defining)'
  },
  {
    id: 'unit_6',
    level: 'B1-B2',
    title: 'Crime & Scandals',
    topic: 'Luật pháp, Bê bối, Tội phạm mạn',
    targetVocab: ['suspect', 'investigate', 'evidence', 'guilty', 'court', 'blackmail', 'smuggle', 'hacker', 'corruption', 'testify'],
    grammarFocus: 'Thì Quá Khứ Hoàn Thành & Quá Khứ Hoàn Thành Tiếp Diễn'
  },
  {
    id: 'unit_7',
    level: 'B1-B2',
    title: 'Culture Shock & Society',
    topic: 'Định kiến, Văn hóa, Hội nhập toàn cầu',
    targetVocab: ['diversity', 'heritage', 'stereotype', 'integration', 'mainstream', 'controversial', 'taboo', 'etiquette', 'immigrant', 'prejudice'],
    grammarFocus: 'Danh Động Từ và Động Từ Nguyên Mẫu (Gerunds vs. Infinitives)'
  },
  {
    id: 'unit_8',
    level: 'B1-B2',
    title: 'Travel & Extreme Adventure',
    topic: 'Phượt, Thể thao mạo hiểm, Nơi hoang dã',
    targetVocab: ['itinerary', 'spontaneous', 'breathtaking', 'remote', 'adrenaline', 'wilderness', 'expedition', 'survival', 'landscape', 'wanderlust'],
    grammarFocus: 'Câu Điều Kiện Hỗn Hợp (Mixed Conditionals)'
  },
  {
    id: 'unit_9',
    level: 'B1-B2',
    title: 'Money & Hustle Culture',
    topic: 'Đầu tư, Tiền điện tử, Lạm phát',
    targetVocab: ['inflation', 'bankruptcy', 'cryptocurrency', 'investment', 'budget', 'loan', 'hustle', 'passive income', 'portfolio', 'stock market'],
    grammarFocus: 'Cấu trúc Điều Ước (Wish / If Only)'
  },
  {
    id: 'unit_10',
    level: 'B1-B2',
    title: 'Future Horizons',
    topic: 'Khám phá vũ trụ, Viễn tưởng, Công nghệ lõi',
    targetVocab: ['colonize', 'extraterrestrial', 'dystopia', 'innovative', 'breakthrough', 'cyborg', 'simulation', 'apocalypse', 'teleport', 'galaxy'],
    grammarFocus: 'Thì Tương Lai Hoàn Thành & Tương Lai Tiếp Diễn'
  }
];

// ============================================================================
// 3. AI PROMPT GENERATOR - TẠO SÁCH GIÁO KHOA CHUẨN
// ============================================================================

export const generateDynamicUnitContent = async (
  unitId: string, 
  apiKey: string,
  userInterests?: string
): Promise<GeneratedCourseUnit | null> => {
  try {
    // 1. BƯỚC 1: Kiểm tra xem Unit này đã có dữ liệu cứng (Preloaded) chưa. Nếu có thì lấy luôn, khỏi gọi AI.
    if (PRELOADED_UNITS[unitId]) {
      console.log(`[CourseGenerator] Đang tải ${unitId} từ dữ liệu tĩnh (Preloaded)...`);
      // Giả lập delay nhỏ 800ms để UX loading trông mượt mà tự nhiên
      await new Promise(resolve => setTimeout(resolve, 800));
      return PRELOADED_UNITS[unitId];
    }

    // 2. BƯỚC 2: Nếu chưa có dữ liệu cứng, Fallback gọi API Gemini để sinh tự động.
    const unit = COURSE_SKELETON.find(u => u.id === unitId);
    if (!unit) throw new Error("Unit not found");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3-flash-preview",
      generationConfig: {
        temperature: 0.7,
        topK: 1,
        topP: 1,
        responseMimeType: "application/json"
      }
    });

    const systemPrompt = `
      You are an expert, highly creative, and slightly sarcastic English teacher designing a gamified ESL lesson for Vietnamese learners.
      Forget boring textbook examples! Make the content DRAMATIC, FUNNY, RELATABLE, or ABSURD (like a meme or a crazy Gen Z situation) to keep the user hooked, while still strictly teaching the target vocabulary and grammar.
      
      Unit Level: ${unit.level}
      Unit Title: "${unit.title}"
      Topic: ${unit.topic}
      Mandatory Target Vocabulary: ${unit.targetVocab.join(", ")}
      Grammar Focus: ${unit.grammarFocus}
      Context Flavor: Make the reading and dialogue highly entertaining (e.g., arguing with a stubborn robot, a dramatic breakup over food, or surviving a zombie apocalypse). ${userInterests ? `Incorporate themes of "${userInterests}".` : ''}
      
      PERSONALIZATION RULES:
      - The main male character MUST always be named "Tien" (Tiến).
      - The main female character MUST always be named "Huyen" (Huyền).
      - The main male character MUST always be named "Tien".
      - The main female character MUST always be named "Huyen".
      - Use these names naturally in the reading passages, grammar exercises, and especially the conversation dialogues to make the learner feel personally involved.

      CRITICAL RULES:
      1. Output MUST be ONLY a valid, minified JSON object. No markdown formatting (no \`\`\`json tags). No conversational text. 
      2. The English MUST be strictly at the ${unit.level} level. Use advanced idioms, phrasal verbs, and complex sentence structures naturally.
      3. Explanations and translations MUST be in natural, modern Vietnamese.
      4. AVOID using unescaped quotes inside JSON strings. Ensure the JSON is 100% strictly valid.
      5. DO NOT put single quotes, double quotes, or bold around vocabulary words in the passage. Write the text completely normally and naturally.

      REQUIRED JSON STRUCTURE:
      {
        "vocabulary": {
          "words": [
            { "word": "english word", "ipa": "/phonetic/", "type": "noun/verb/adj", "meaning": "tiếng việt", "example": "Advanced English example." }
          ],
          "exercises": [
            { "sentence": "A complex sentence with ___ blank.", "answer": "correct word", "options": ["wrong", "correct", "wrong"] }
          ]
        },
        "reading": {
          "title": "Title of passage",
          "passage": "A coherent, highly engaging, drama-filled passage of 250-300 words using the target vocab and grammar focus.",
          "translation": "Bản dịch tiếng Việt hoàn chỉnh của đoạn văn.",
          "trueFalse": [
            { "statement": "Statement in English", "isTrue": true, "explanation": "Giải thích tiếng việt." }
          ],
          "multipleChoice": [
            { "question": "Question?", "options": ["A", "B", "C", "D"], "answer": "A", "explanation": "Giải thích." }
          ]
        },
        "grammar": {
          "theory": {
            "title": "Grammar topic",
            "explanation": "Clear explanation in Vietnamese",
            "examples": [
              { "en": "Example", "vi": "Nghĩa" }
            ]
          },
          "exercises": [
            { "question": "Question with ___ blank", "options": ["A", "B", "C", "D"], "answer": "A" }
          ]
        },
        "conversation": {
          "context": "Ngữ cảnh hội thoại bằng tiếng Việt.",
          "dialogue": [
            { "speaker": "Name", "en": "English dialogue", "vi": "Tiếng Việt" }
          ],
          "roleplaySentences": [
            { "en": "Key sentence to speak", "vi": "Nghĩa", "ipa": "Phiên âm" }
          ]
        }
      }
    `;

    const result = await model.generateContent(systemPrompt);
    let cleanJsonStr = result.response.text().trim();
    
    // Tìm dấu ngoặc nhọn đầu tiên và cuối cùng để trích xuất lõi JSON
    const startIndex = cleanJsonStr.indexOf('{');
    const endIndex = cleanJsonStr.lastIndexOf('}');
    
    if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
      cleanJsonStr = cleanJsonStr.substring(startIndex, endIndex + 1);
    }
    
    return JSON.parse(cleanJsonStr) as GeneratedCourseUnit;

  } catch (error) {
    console.error("Failed to generate course unit:", error);
    return null;
  }
};
