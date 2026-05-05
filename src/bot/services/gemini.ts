// DEPRECATED: This file is kept for backward compatibility only.
// New code should import from:
//   - '../../shared/services/gemini-core' for SDK infrastructure
//   - './gemini-bot' for bot-specific AI methods
//
// This file re-exports everything from gemini-bot.ts which itself
// includes geminiCore methods via the combined geminiService export.

export { geminiService, geminiBotService } from './gemini-bot';
export { geminiCore } from '../../shared/services/gemini-core';
