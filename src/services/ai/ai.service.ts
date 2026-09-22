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

    // 3. Clinical Safety Boundary Verification & Sanitization
    return this.sanitizeClinicalBoundaries(turnResult);
  }

  /**
   * Enforces strict regulatory and clinical boundaries on AI generated outputs.
   * Intercepts unauthorized drug prescribing/dosages and appends mandatory clinical disclaimer.
   */
  private sanitizeClinicalBoundaries(turnResult: AIConversationTurnResponse): AIConversationTurnResponse {
    const rxPrescriptionRegex = /\b(take|prescribe|administer|dose|dosage)\s+(\d+\s*(?:mg|ml|mcg|tablets?|capsules?))\s+(?:of\s+)?(amoxicillin|metronidazole|erythromycin|azithromycin|codeine|tramadol|oxycodone|hydrocodone|clindamycin)\b/gi;
    const definitiveDiagRegex = /\b(you definitely have|my diagnosis is|diagnosed with)\s+(irreversible pulpitis|periodontitis|abscess|cellulitis|periapical lesion|osteomyelitis)\b/gi;

    let reply = turnResult.reply;

    if (rxPrescriptionRegex.test(reply) || definitiveDiagRegex.test(reply)) {
      reply = reply.replace(rxPrescriptionRegex, 'consult Dr. Jensen for an in-clinic evaluation and appropriate prescription');
      reply = reply.replace(definitiveDiagRegex, 'you may be exhibiting symptoms suggestive of $2, which requires clinical evaluation');
      if (!reply.includes('clinical disclaimer') && !reply.includes('cannot diagnose')) {
        reply += '\n\n*(Clinical Note: As an automated AI assistant, I cannot diagnose medical conditions or prescribe pharmaceuticals. A formal diagnosis and prescription require examination by a licensed dentist.)*';
      }
    }

    return {
      ...turnResult,
      reply,
    };
  }
}

export const aiConversationService = new AIConversationService();
