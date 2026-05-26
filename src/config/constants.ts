import dotenv from 'dotenv';
dotenv.config();

export const DISCORD_TOKEN = process.env.DISCORD_TOKEN || '';
export const CLIENT_ID = process.env.CLIENT_ID || '';
export const GUILD_ID = process.env.GUILD_ID || '';
export const MONGODB_URI = process.env.MONGODB_URI || '';
export const ADMIN_ID = process.env.ADMIN_ID || '';

// Default System Prompt (Backup)
export const DEFAULT_SYSTEM_PROMPT = process.env.SYSTEM_PROMPT || '';

export const GEMINI_CHAT_CONFIG = {
  model: "gemini-3.1-flash-lite",
  modelName: "gemini-3.1-flash-lite",
  generationConfig: {
    temperature: 2.0,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
  }
};

export const GEMINI_LOGIC_CONFIG = {
  modelName: "gemini-3.1-flash-lite",
  generationConfig: {
    temperature: 0.9,
    topK: 1,
    topP: 1,
  }
};

export const IMAGEN_MODEL = "imagen-4.0-generate-001"; // User code had "imagen-4.0-generate-001", preserving.
