import { GoogleGenAI } from '@google/genai';
import { config } from '../../../config/env.js';
import { AIConversationTurnResponse, ConversationTurnInput } from '../ai.types.js';
import { ILLMProvider, SupportedLLMProvider } from './llm.provider.interface.js';
import { geminiConversationService } from '../gemini.service.js';

export class GeminiLLMProvider implements ILLMProvider {
  readonly providerName: SupportedLLMProvider = 'gemini';
  readonly modelName: string;

  constructor() {
    this.modelName = config.gemini.model || 'gemini-2.5-flash';
  }

  isAvailable(): boolean {
    return Boolean(config.gemini.apiKey && !config.gemini.apiKey.startsWith('your_gemini'));
  }

  async generateReply(input: ConversationTurnInput): Promise<AIConversationTurnResponse> {
    return geminiConversationService.processTurn(input);
  }
}
