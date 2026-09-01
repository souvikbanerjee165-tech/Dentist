export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  updatedAt: string;
}

export interface BusinessProfile {
  name: string;
  industry: string;
  phoneNumberId: string;
  ownerNotificationPhone: string;
  ownerNotificationEmail: string;
  aiAutopilotEnabled: boolean;
  confidenceThreshold: number;
  toneOfVoice: string;
  systemPrompt: string;
}
