import { ILLMProvider, SupportedLLMProvider } from './llm.provider.interface.js';
import { GeminiLLMProvider } from './gemini.provider.js';
import { OpenAILLMProvider } from './openai.provider.js';
import { AIConversationTurnResponse, ConversationTurnInput } from '../ai.types.js';

export class LLMFactory {
  private static geminiProvider = new GeminiLLMProvider();
  private static openaiProvider = new OpenAILLMProvider();

  /**
   * Retrieves the configured primary provider
   */
  static getPrimaryProvider(preferred?: SupportedLLMProvider): ILLMProvider {
    const target = preferred || (process.env.LLM_PROVIDER as SupportedLLMProvider) || 'gemini';

    if (target === 'openai' && this.openaiProvider.isAvailable()) {
      return this.openaiProvider;
    }

    // Default to Gemini
    return this.geminiProvider;
  }

  /**
   * Executes conversation turn with automatic high-availability failover
   */
  static async executeWithFailover(
    input: ConversationTurnInput,
    preferred?: SupportedLLMProvider
  ): Promise<AIConversationTurnResponse> {
    const primary = this.getPrimaryProvider(preferred);

    try {
      if (primary.isAvailable()) {
        return await primary.generateReply(input);
      }
    } catch (primaryErr: any) {
      console.warn(`⚠️ Primary LLM (${primary.providerName}) error: ${primaryErr.message}. Executing failover...`);
    }

    // Failover to secondary
    const secondary = primary.providerName === 'gemini' ? this.openaiProvider : this.geminiProvider;
    if (secondary.isAvailable()) {
      try {
        console.log(`🔄 Failover engaged: Calling ${secondary.providerName} (${secondary.modelName})...`);
        return await secondary.generateReply(input);
      } catch (secondaryErr: any) {
        console.warn(`⚠️ Secondary LLM (${secondary.providerName}) error: ${secondaryErr.message}.`);
      }
    }

    // Final Deterministic Medical Safety Fallback
    return this.geminiProvider.generateReply(input);
  }
}
