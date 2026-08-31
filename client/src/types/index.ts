export type NavigationTab = 
  | 'dashboard' 
  | 'patients' 
  | 'playground'
  | 'knowledge' 
  | 'performance' 
  | 'security'
  | 'settings';

export type LeadStatus = 'new' | 'qualified' | 'booked' | 'unresponsive' | 'lost';

export interface Lead {
  id: string;
  fullName: string;
  phoneNumber: string;
  email?: string;
  status: LeadStatus;
  customData: Record<string, string | number | boolean>;
  lastInteraction: string;
  source: string;
  notes?: string;
}

export type ConversationStatus = 'ai_active' | 'human_takeover' | 'closed';

export interface Message {
  id: string;
  conversationId: string;
  senderType: 'user' | 'ai' | 'human_agent' | 'system';
  content: string;
  timestamp: string;
  confidenceScore?: number;
  toolsUsed?: string[];
}

export interface Conversation {
  id: string;
  lead: Lead;
  status: ConversationStatus;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  lastConfidenceScore: number;
  messages: Message[];
}

export interface DocumentItem {
  id: string;
  name: string;
  type: 'faq' | 'pricing' | 'services' | 'policy';
  chunksCount: number;
  size: string;
  uploadedAt: string;
  status: 'indexed' | 'indexing' | 'error';
}

export interface KPIStats {
  todayMessages: number;
  todayMessagesDelta: number; // percentage change
  newLeads: number;
  newLeadsDelta: number;
  appointments: number;
  appointmentsDelta: number;
  revenueEstimate: number;
  revenueEstimateDelta: number;
  humanTakeovers: number;
  humanTakeoversDelta: number;
  conversationSuccessRate: number; // percentage (e.g. 94.2)
  conversationSuccessDelta: number;
}
