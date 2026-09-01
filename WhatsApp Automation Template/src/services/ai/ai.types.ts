export interface LeadCollectedData {
  name: string | null;
  phone_number: string | null;
  email: string | null;
  business_type: string | null;
  budget: string | null;
  preferred_appointment_date: string | null;
}

export type ConversationIntent = 
  | 'greeting'
  | 'faq_inquiry'
  | 'lead_qualification'
  | 'appointment_booking'
  | 'human_handover'
  | 'unknown';

export interface AIConversationTurnResponse {
  reply: string;
  intent: ConversationIntent;
  confidence: number;
  collected_data: LeadCollectedData;
  missing_fields: (keyof LeadCollectedData)[];
  handover_required: boolean;
  handover_reason: string | null;
  knowledge_sources_used: string[];
}

export interface ChatMessageContext {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ConversationTurnInput {
  businessName: string;
  businessIndustry: string;
  userMessage: string;
  conversationHistory: ChatMessageContext[];
  existingLeadData?: Partial<LeadCollectedData>;
  knowledgeContext?: string[];
}
