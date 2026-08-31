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

    return this.geminiProvider;
  }

  /**
   * Executes conversation turn following the robust Failover Ladder:
   * 1. Try Gemini
   * 2. Retry Gemini once on error
   * 3. Failover to OpenAI (GPT-4o-mini)
   * 4. Deterministic Medical Safety Fallback
   */
  static async executeWithFailover(
    input: ConversationTurnInput,
    preferred?: SupportedLLMProvider
  ): Promise<AIConversationTurnResponse> {
    const primary = this.getPrimaryProvider(preferred);

    // --- STEP 1: Attempt Primary Provider (Gemini) ---
    if (primary.isAvailable()) {
      try {
        const result = await primary.generateReply(input);
        if (this.validateResponse(result)) {
          return result;
        }
      } catch (err1: any) {
        console.warn(`⚠️ [LLM Attempt 1 Failed]: ${primary.providerName} (${err1.message}). Retrying once...`);
        
        // --- STEP 2: Retry Primary Provider Once ---
        try {
          await new Promise((r) => setTimeout(r, 250)); // Short backoff
          const retryResult = await primary.generateReply(input);
          if (this.validateResponse(retryResult)) {
            return retryResult;
          }
        } catch (err2: any) {
          console.warn(`⚠️ [LLM Attempt 2 Failed]: ${primary.providerName} retry failed. Escalating to OpenAI fallback...`);
        }
      }
    }

    // --- STEP 3: Failover to Secondary Provider (OpenAI) ---
    const secondary = primary.providerName === 'gemini' ? this.openaiProvider : this.geminiProvider;
    if (secondary.isAvailable()) {
      try {
        console.log(`🔄 [LLM Failover]: Engaging ${secondary.providerName} (${secondary.modelName})...`);
        const secondaryResult = await secondary.generateReply(input);
        if (this.validateResponse(secondaryResult)) {
          return secondaryResult;
        }
      } catch (secErr: any) {
        console.warn(`⚠️ [LLM Secondary Failed]: ${secondary.providerName} error (${secErr.message}).`);
      }
    }

    // --- STEP 4: Deterministic Clinical Fallback ---
    console.log('🛡️ [LLM Safety Fallback]: Returning deterministic clinical response.');
    return this.geminiProvider.generateReply(input);
  }

  private static validateResponse(res: AIConversationTurnResponse): boolean {
    return Boolean(res && typeof res.reply === 'string' && res.reply.length > 0);
  }
}
