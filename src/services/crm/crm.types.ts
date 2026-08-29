export type AppointmentStatus = 'none' | 'scheduled' | 'completed' | 'cancelled';

export interface LeadRecord {
  id: string;
  businessId: string;
  name: string;
  phone: string;
  email: string | null;
  business: string | null;
  interest: string | null;
  budget: string | null;
  leadScore: number; // 0 to 100
  conversationSummary: string;
  appointmentStatus: AppointmentStatus;
  lastInteraction: string; // ISO string
  tags: string[];
  createdAt: string;
}

export interface UpsertLeadInput {
  businessId: string;
  phone: string;
  name?: string | null;
  email?: string | null;
  business?: string | null;
  interest?: string | null;
  budget?: string | null;
  conversationSummary?: string;
  appointmentStatus?: AppointmentStatus;
  tags?: string[];
}

export interface LeadFilterOptions {
  search?: string;
  appointmentStatus?: AppointmentStatus | 'all';
  minScore?: number;
  tags?: string[];
  limit?: number;
  offset?: number;
}
