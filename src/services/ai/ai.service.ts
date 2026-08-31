import OpenAI from 'openai';
import { config } from '../../config/env.js';
import { 
  AIConversationTurnResponse, 
  ConversationTurnInput, 
  LeadCollectedData 
} from './ai.types.js';
import { buildSystemPrompt } from './prompt.builder.js';
import { ragService } from '../rag/rag.service.js';
import { geminiConversationService } from './gemini.service.js';

export class AIConversationService {
  private openai: OpenAI | null = null;

  constructor() {
    if (config.openai.apiKey && !config.openai.apiKey.startsWith('sk-your_')) {
      this.openai = new OpenAI({
        apiKey: config.openai.apiKey,
      });
    }
  }

  /**
   * Processes a single turn of conversation and returns structured JSON
   */
  async processTurn(input: ConversationTurnInput): Promise<AIConversationTurnResponse> {
    // 1. Automatically retrieve relevant RAG knowledge chunks if none were explicitly provided
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

    // 2. Primary Brain: Google Gemini Flash Engine
    if (config.gemini.apiKey && !config.gemini.apiKey.startsWith('your_gemini')) {
      try {
        const geminiTurn = await geminiConversationService.processTurn(enhancedInput);
        if (knowledgeSources.length > 0) {
          geminiTurn.knowledge_sources_used = knowledgeSources;
        }
        return geminiTurn;
      } catch (geminiError: any) {
        console.warn('⚠️ Gemini Engine notice, failing over to secondary handler:', geminiError.message);
      }
    }

    // 3. Secondary Brain: OpenAI or Local Simulation
    if (!this.openai) {
      const simulated = this.simulateTurn(enhancedInput);
      if (knowledgeSources.length > 0) {
        simulated.knowledge_sources_used = knowledgeSources;
      }
      return simulated;
    }

    try {
      const systemPrompt = buildSystemPrompt(enhancedInput);

      // Build message array with system instructions and chat memory
      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        { role: 'system', content: systemPrompt },
        ...input.conversationHistory.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        { role: 'user', content: input.userMessage },
      ];

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages,
        response_format: { type: 'json_object' },
        temperature: 0.2, // Low temperature for high factual accuracy
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('Empty response received from OpenAI');
      }

      const parsed: AIConversationTurnResponse = JSON.parse(content);
      return this.sanitizeResponse(parsed, input);
    } catch (error) {
      console.error('Error in AI processTurn:', error);
      // Safe fallback on unexpected error
      return {
        reply: "I'll connect you with a human.",
        intent: 'human_handover',
        confidence: 0.0,
        collected_data: {
          name: input.existingLeadData?.name || null,
          phone_number: input.existingLeadData?.phone_number || null,
          email: input.existingLeadData?.email || null,
          business_type: input.existingLeadData?.business_type || null,
          budget: input.existingLeadData?.budget || null,
          preferred_appointment_date: input.existingLeadData?.preferred_appointment_date || null,
        },
        missing_fields: this.calculateMissingFields(input.existingLeadData || {}),
        handover_required: true,
        handover_reason: 'Processing error or API failure',
        knowledge_sources_used: [],
      };
    }
  }

  /**
   * Helper to ensure merged collected data and missing fields are calculated accurately
   */
  private sanitizeResponse(
    raw: Partial<AIConversationTurnResponse>,
    input: ConversationTurnInput
  ): AIConversationTurnResponse {
    const existing: Partial<LeadCollectedData> = input.existingLeadData || {};
    const newlyCollected: Partial<LeadCollectedData> = raw.collected_data || {};

    const mergedData: LeadCollectedData = {
      name: newlyCollected.name || existing.name || null,
      phone_number: newlyCollected.phone_number || existing.phone_number || null,
      email: newlyCollected.email || existing.email || null,
      business_type: newlyCollected.business_type || existing.business_type || null,
      budget: newlyCollected.budget || existing.budget || null,
      preferred_appointment_date:
        newlyCollected.preferred_appointment_date ||
        existing.preferred_appointment_date ||
        null,
    };

    const missingFields = this.calculateMissingFields(mergedData);
    let reply = raw.reply || "I'll connect you with a human.";
    let handoverRequired = raw.handover_required ?? false;

    // Strict rule: If answer is unknown, ensure fallback phrase is present
    if (handoverRequired && !reply.toLowerCase().includes('connect you with a human')) {
      reply = `I want to ensure you get the exact details. I'll connect you with a human right away.`;
    }

    return {
      reply,
      intent: raw.intent || 'unknown',
      confidence: typeof raw.confidence === 'number' ? raw.confidence : 0.85,
      collected_data: mergedData,
      missing_fields: missingFields,
      handover_required: handoverRequired,
      handover_reason: raw.handover_reason || null,
      knowledge_sources_used: raw.knowledge_sources_used || [],
    };
  }

  private calculateMissingFields(data: Partial<LeadCollectedData>): (keyof LeadCollectedData)[] {
    const allFields: (keyof LeadCollectedData)[] = [
      'name',
      'phone_number',
      'email',
      'business_type',
      'budget',
      'preferred_appointment_date',
    ];
    return allFields.filter((f) => !data[f]);
  }

  /**
   * Intelligent offline rule simulator for instant local testing without an API key
   */
  private simulateTurn(input: ConversationTurnInput): AIConversationTurnResponse {
    const text = input.userMessage.toLowerCase();
    const existing = input.existingLeadData || {};
    const merged: LeadCollectedData = {
      name: existing.name || null,
      phone_number: existing.phone_number || null,
      email: existing.email || null,
      business_type: existing.business_type || null,
      budget: existing.budget || null,
      preferred_appointment_date: existing.preferred_appointment_date || null,
    };

    // 1. Extraction heuristics
    const emailMatch = input.userMessage.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
    if (emailMatch) merged.email = emailMatch[1];

    const phoneMatch = input.userMessage.match(/(\+?[0-9]{1,3}?[-. ]?\(?[0-9]{3}\)?[-. ]?[0-9]{3}[-. ]?[0-9]{4})/);
    if (phoneMatch) merged.phone_number = phoneMatch[1];

    const nameMatch = input.userMessage.match(/(?:my name is|i'm|i am|this is)\s+([a-zA-Z]+(?:\s+[a-zA-Z]+)?)/i);
    if (nameMatch) merged.name = nameMatch[1].trim();

    if (text.includes('$') || text.includes('budget') || text.includes('dollar') || text.includes('/mo')) {
      const budgetMatch = input.userMessage.match(/\$[0-9,]+(?:\s*(?:\/|per)?\s*(?:mo|month|year)?)?/i);
      if (budgetMatch) merged.budget = budgetMatch[0].replace(/,$/, '').trim();
      else if (text.includes('10k') || text.includes('5k')) merged.budget = '$5,000 - $10,000';
    }

    if (text.includes('friday') || text.includes('monday') || text.includes('tomorrow') || text.includes('pm') || text.includes('am')) {
      const dateMatch = input.userMessage.match(/(?:this|next)?\s*(?:friday|monday|tuesday|wednesday|thursday|saturday|sunday)(?:\s+at\s+\d{1,2}(?::\d{2})?\s*(?:am|pm)?)?/i);
      if (dateMatch) merged.preferred_appointment_date = dateMatch[0].trim();
    }

    if (text.includes('dental') || text.includes('real estate') || text.includes('gym') || text.includes('agency') || text.includes('clinic') || text.includes('saas') || text.includes('coach')) {
      if (text.includes('dental') || text.includes('clinic')) merged.business_type = 'Dental / Medical Clinic';
      else if (text.includes('real estate')) merged.business_type = 'Real Estate Agency';
      else if (text.includes('gym')) merged.business_type = 'Fitness Gym';
      else if (text.includes('saas') || text.includes('agency')) merged.business_type = 'B2B SaaS / Agency';
    }

    // 2. Out of Scope / Unknown check -> Handover trigger
    if (
      text.includes('lawsuit') ||
      text.includes('chemical formula') ||
      text.includes('emergency bleeding') ||
      text.includes('refund policy for 2019')
    ) {
      return {
        reply: "I'll connect you with a human.",
        intent: 'human_handover',
        confidence: 0.45,
        collected_data: merged,
        missing_fields: this.calculateMissingFields(merged),
        handover_required: true,
        handover_reason: 'Inquiry is outside knowledge base boundaries',
        knowledge_sources_used: [],
      };
    }

    // 3. Conversational State Machine
    const missing = this.calculateMissingFields(merged);

    if (/\b(hi|hello|hey|greetings)\b/i.test(input.userMessage) && !text.includes('how much') && !text.includes('price')) {
      return {
        reply: `Hello! 👋 Welcome to ${input.businessName}. How can I assist you today? Are you looking for service information or would you like to schedule a consultation?`,
        intent: 'greeting',
        confidence: 0.98,
        collected_data: merged,
        missing_fields: missing,
        handover_required: false,
        handover_reason: null,
        knowledge_sources_used: [],
      };
    }

    if (text.includes('cost') || text.includes('price') || text.includes('whitening') || text.includes('pricing') || text.includes('rates')) {
      let reply = `Our standard package is $350, which includes a comprehensive consultation and full treatment session.`;
      if (!merged.name) {
        reply += ` To see if this package fits your needs, may I ask your name?`;
      } else if (!merged.preferred_appointment_date) {
        reply += ` What day and time works best for your appointment?`;
      }

      return {
        reply,
        intent: 'faq_inquiry',
        confidence: 0.95,
        collected_data: merged,
        missing_fields: missing,
        handover_required: false,
        handover_reason: null,
        knowledge_sources_used: ['2026_Treatment_Pricing_and_Services.pdf'],
      };
    }

    // Follow-up questioning based on missing fields
    let nextQuestion = '';
    if (!merged.name) nextQuestion = 'May I ask your full name?';
    else if (!merged.email) nextQuestion = `Thanks ${merged.name}! What is the best email to send your booking details to?`;
    else if (!merged.business_type) nextQuestion = 'What type of business or service are you looking to support?';
    else if (!merged.budget) nextQuestion = 'Do you have an approximate budget in mind for this project/service?';
    else if (!merged.preferred_appointment_date) nextQuestion = 'What preferred date and time works best for our team to schedule your consultation?';
    else nextQuestion = `Everything is set! We have all your details (${merged.name}, ${merged.email}, ${merged.preferred_appointment_date}). Our team is confirming your reservation.`;

    return {
      reply: nextQuestion,
      intent: missing.length <= 1 ? 'appointment_booking' : 'lead_qualification',
      confidence: 0.94,
      collected_data: merged,
      missing_fields: missing,
      handover_required: false,
      handover_reason: null,
      knowledge_sources_used: [],
    };
  }
}

export const aiConversationService = new AIConversationService();
