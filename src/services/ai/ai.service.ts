import { 
  AIConversationTurnResponse, 
  ConversationTurnInput 
} from './ai.types.js';
import { ragService } from '../rag/rag.service.js';
import { LLMFactory } from './providers/llm.factory.js';
import { SupportedLLMProvider } from './providers/llm.provider.interface.js';

export class AIConversationService {
  /**
   * Processes a single turn of conversation using the active swappable LLM engine
   */
  async processTurn(
    input: ConversationTurnInput,
    preferredProvider?: SupportedLLMProvider
  ): Promise<AIConversationTurnResponse> {
    // 1. Retrieve relevant RAG knowledge chunks if none were explicitly provided
    let effectiveKnowledge = input.knowledgeContext || [];
    let knowledgeSources: string[] = [];

    if (effectiveKnowledge.length === 0) {
      const retrieved = await ragService.searchRelevantChunks(
        input.userMessage,
        'default-business-id',
        0.45,
        3
      );
      if (retrieved.length > 0) {
        effectiveKnowledge = retrieved.map((r) => r.content);
        knowledgeSources = retrieved.map((r) => r.documentName);
      }
    }

    const enhancedInput: ConversationTurnInput = {
      ...input,
      knowledgeContext: effectiveKnowledge,
    };

    // 2. Execute via Swappable Provider Factory (Gemini ➔ OpenAI ➔ Safety Fallback)
    const turnResult = await LLMFactory.executeWithFailover(enhancedInput, preferredProvider);

    if (knowledgeSources.length > 0) {
      turnResult.knowledge_sources_used = knowledgeSources;
    }

    return turnResult;
  }
}

export const aiConversationService = new AIConversationService();
