import { AIConversationTurnResponse, ConversationTurnInput } from '../ai.types.js';

export type SupportedLLMProvider = 'gemini' | 'openai' | 'claude' | 'grok' | 'fallback';

export interface ILLMProvider {
  readonly providerName: SupportedLLMProvider;
  readonly modelName: string;
  isAvailable(): boolean;
  generateReply(input: ConversationTurnInput): Promise<AIConversationTurnResponse>;
  embed?(text: string): Promise<number[]>;
  summarize?(text: string): Promise<string>;
  classify?(text: string, categories: string[]): Promise<string>;
}
