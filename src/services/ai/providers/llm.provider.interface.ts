import { AIConversationTurnResponse, ConversationTurnInput } from '../ai.types.js';

export type SupportedLLMProvider = 'gemini' | 'openai' | 'claude' | 'fallback';

export interface ILLMProvider {
  readonly providerName: SupportedLLMProvider;
  readonly modelName: string;
  isAvailable(): boolean;
  generateReply(input: ConversationTurnInput): Promise<AIConversationTurnResponse>;
}
