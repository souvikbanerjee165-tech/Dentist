import OpenAI from 'openai';
import { config } from '../../../config/env.js';
import { AIConversationTurnResponse, ConversationTurnInput } from '../ai.types.js';
import { ILLMProvider, SupportedLLMProvider } from './llm.provider.interface.js';
import { buildSystemPrompt } from '../prompt.builder.js';

export class OpenAILLMProvider implements ILLMProvider {
  readonly providerName: SupportedLLMProvider = 'openai';
  readonly modelName: string;
  private openai: OpenAI | null = null;

  constructor() {
    this.modelName = config.openai.model || 'gpt-4o-mini';
    if (this.isAvailable()) {
      this.openai = new OpenAI({
        apiKey: config.openai.apiKey,
      });
    }
  }

  isAvailable(): boolean {
    return Boolean(config.openai.apiKey && !config.openai.apiKey.startsWith('sk-your_'));
  }

  async generateReply(input: ConversationTurnInput): Promise<AIConversationTurnResponse> {
    if (!this.openai) {
      throw new Error('OpenAI client is not configured or missing API key.');
    }

    const systemPrompt = buildSystemPrompt(input);
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...input.conversationHistory.map((h) => ({
        role: h.role as 'user' | 'assistant' | 'system',
        content: h.content,
      })),
      { role: 'user', content: input.userMessage },
    ];

    const completion = await this.openai.chat.completions.create({
      model: this.modelName,
      messages,
      temperature: 0.2,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('OpenAI returned empty response payload.');
    }

    return JSON.parse(content) as AIConversationTurnResponse;
  }
}
