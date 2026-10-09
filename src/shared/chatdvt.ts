import { CHATDVT_ENTITY_ID } from './siteIdentity';

// Keep the product page and its history consistent in SSR and browser metadata.
export const CHATDVT_META = {
  vi: {
    title: 'ChatDVT — AI chatbot trên Discord và web',
    description: 'ChatDVT là AI chatbot trên Discord và web do Đặng Văn Tiến phát triển, bắt nguồn từ trò đùa trong nhóm 8D trên Telegram. Chat AI, phân tích ảnh/video và mini game.',
  },
  en: {
    title: 'ChatDVT — AI chatbot for Discord and the web',
    description: 'ChatDVT is an AI chatbot for Discord and the web, developed by Đặng Văn Tiến after a joke in the 8D group on Telegram. AI chat, media analysis and mini games.',
  },
};

export const CHATDVT_HISTORY_PATH = '/blog/chatdvt-phan-1';
export const CHATDVT_HISTORY_DESCRIPTION = 'Lịch sử ChatDVT, AI chatbot do Đặng Văn Tiến phát triển: từ trò đùa trong nhóm 8D trên Telegram, qua Google Apps Script và Gemini, đến Discord.js và triển khai trên cloud.';
export const CHATDVT_ARTICLE_SUBJECT = {
  '@type': 'SoftwareApplication',
  '@id': CHATDVT_ENTITY_ID,
  name: 'ChatDVT',
  url: 'https://devtiendang.blog/discord',
};
