import { supabase } from '../../config/supabase.js';
import { config } from '../../config/env.js';
import { 
  AppointmentStatus, 
  LeadFilterOptions, 
  LeadRecord, 
  UpsertLeadInput 
} from './crm.types.js';

export class CRMService {
  // In-memory leads storage for instant local dev & offline testing
  private localLeads: LeadRecord[] = [];

  constructor() {
    this.seedInitialLeads();
  }

  /**
   * Automatically upserts a lead from a WhatsApp conversation turn
   */
  async upsertLead(input: UpsertLeadInput): Promise<LeadRecord> {
    const {
      businessId,
      phone,
      name,
      email,
      business,
      interest,
      budget,
      conversationSummary,
      appointmentStatus,
      tags = [],
    } = input;

    // Find existing lead by phone number and businessId
    let lead = this.localLeads.find(
      (l) => l.businessId === businessId && l.phone === phone
    );

    const now = new Date().toISOString();

    if (!lead) {
      const id = `lead_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      lead = {
        id,
        businessId,
        name: name || 'WhatsApp Prospect',
        phone,
        email: email || null,
        business: business || null,
        interest: interest || null,
        budget: budget || null,
        leadScore: 0,
        conversationSummary: conversationSummary || 'New inbound WhatsApp inquiry',
        appointmentStatus: appointmentStatus || 'none',
        lastInteraction: now,
        tags: [...new Set(tags)],
        createdAt: now,
      };
      this.localLeads.unshift(lead);
    } else {
      // Merge new fields
      if (name) lead.name = name;
      if (email) lead.email = email;
      if (business) lead.business = business;
      if (interest) lead.interest = interest;
      if (budget) lead.budget = budget;
      if (conversationSummary) lead.conversationSummary = conversationSummary;
      if (appointmentStatus) lead.appointmentStatus = appointmentStatus;
      lead.lastInteraction = now;

      // Merge tags
      if (tags.length > 0) {
        lead.tags = [...new Set([...lead.tags, ...tags])];
      }
    }

    // Auto-calculate Lead Score (0 - 100)
    lead.leadScore = this.calculateLeadScore(lead);

    // Auto-assign smart tags based on score & behavior
    this.applySmartTags(lead);

    // Persist to Supabase if configured
    if (
      config.supabase.url &&
      !config.supabase.url.includes('your-project-ref') &&
      config.supabase.serviceRoleKey &&
      !config.supabase.serviceRoleKey.includes('your_supabase')
    ) {
      try {
        await supabase.from('leads').upsert(
          {
            id: lead.id,
            business_id: lead.businessId,
            phone_number: lead.phone,
            full_name: lead.name,
            email: lead.email,
            status: lead.appointmentStatus === 'scheduled' ? 'booked' : 'qualified',
            custom_data: {
              business: lead.business,
              interest: lead.interest,
              budget: lead.budget,
              lead_score: lead.leadScore,
              summary: lead.conversationSummary,
              tags: lead.tags,
            },
            last_interaction: lead.lastInteraction,
          },
          { onConflict: 'business_id,phone_number' }
        );
      } catch (err) {
        // Fallback to local store
      }
    }

    return lead;
  }

  /**
   * Search and filter leads with multi-criteria support
   */
  async searchAndFilter(
    businessId: string,
    options: LeadFilterOptions = {}
  ): Promise<{ total: number; leads: LeadRecord[] }> {
    const {
      search = '',
      appointmentStatus = 'all',
      minScore = 0,
      tags = [],
      limit = 50,
      offset = 0,
    } = options;

    let results = this.localLeads.filter(
      (l) => l.businessId === businessId || businessId === 'test-business'
    );

    // 1. Text Search (Name, Phone, Email, Business, Interest, Summary)
    if (search.trim()) {
      const q = search.toLowerCase();
      results = results.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.phone.includes(q) ||
          (l.email && l.email.toLowerCase().includes(q)) ||
          (l.business && l.business.toLowerCase().includes(q)) ||
          (l.interest && l.interest.toLowerCase().includes(q)) ||
          l.conversationSummary.toLowerCase().includes(q)
      );
    }

    // 2. Filter by Appointment Status
    if (appointmentStatus !== 'all') {
      results = results.filter((l) => l.appointmentStatus === appointmentStatus);
    }

    // 3. Filter by Minimum Lead Score
    if (minScore > 0) {
      results = results.filter((l) => l.leadScore >= minScore);
    }

    // 4. Filter by Tags (must contain all specified tags)
    if (tags.length > 0) {
      results = results.filter((l) =>
        tags.every((tag) => l.tags.includes(tag))
      );
    }

    // Sort by most recent interaction first
    results.sort(
      (a, b) =>
        new Date(b.lastInteraction).getTime() - new Date(a.lastInteraction).getTime()
    );

    const total = results.length;
    const paginated = results.slice(offset, offset + limit);

    return { total, leads: paginated };
  }

  /**
   * Add a custom tag to a lead
   */
  async addTag(leadId: string, tag: string): Promise<LeadRecord | null> {
    const lead = this.localLeads.find((l) => l.id === leadId);
    if (!lead) return null;

    if (!lead.tags.includes(tag)) {
      lead.tags.push(tag);
    }
    return lead;
  }

  /**
   * Remove a tag from a lead
   */
  async removeTag(leadId: string, tag: string): Promise<LeadRecord | null> {
    const lead = this.localLeads.find((l) => l.id === leadId);
    if (!lead) return null;

    lead.tags = lead.tags.filter((t) => t !== tag);
    return lead;
  }

  /**
   * Exports filtered leads as an RFC 4180 compliant CSV string
   */
  async exportToCsv(
    businessId: string,
    options: LeadFilterOptions = {}
  ): Promise<string> {
    const { leads } = await this.searchAndFilter(businessId, { ...options, limit: 10000 });

    const headers = [
      'Lead ID',
      'Name',
      'Phone',
      'Email',
      'Business / Company',
      'Service Interest',
      'Budget',
      'Lead Score (0-100)',
      'Appointment Status',
      'Tags',
      'Conversation Summary',
      'Last Interaction',
      'Created At',
    ];

    const escapeCsv = (str: string | number | null | undefined): string => {
      if (str === null || str === undefined) return '""';
      const val = String(str).replace(/"/g, '""');
      return `"${val}"`;
    };

    const rows = leads.map((l) => [
      escapeCsv(l.id),
      escapeCsv(l.name),
      escapeCsv(l.phone),
      escapeCsv(l.email),
      escapeCsv(l.business),
      escapeCsv(l.interest),
      escapeCsv(l.budget),
      escapeCsv(l.leadScore),
      escapeCsv(l.appointmentStatus),
      escapeCsv(l.tags.join(', ')),
      escapeCsv(l.conversationSummary),
      escapeCsv(l.lastInteraction),
      escapeCsv(l.createdAt),
    ]);

    return [headers.map((h) => `"${h}"`).join(','), ...rows.map((r) => r.join(','))].join('\n');
  }

  /**
   * Computes a 0 - 100 qualification score
   */
  private calculateLeadScore(lead: LeadRecord): number {
    let score = 10; // Base presence score

    if (lead.name && lead.name !== 'WhatsApp Prospect') score += 15;
    if (lead.email) score += 20;
    if (lead.phone) score += 10;
    if (lead.business) score += 10;
    if (lead.interest) score += 15;
    if (lead.budget) score += 10;
    if (lead.appointmentStatus === 'scheduled' || lead.appointmentStatus === 'completed') {
      score += 20;
    }

    return Math.min(score, 100);
  }

  /**
   * Applies automated smart tags
   */
  private applySmartTags(lead: LeadRecord): void {
    if (lead.leadScore >= 80 && !lead.tags.includes('Hot Lead')) {
      lead.tags.push('Hot Lead');
    }
    if (
      lead.budget &&
      (lead.budget.includes('1,000') || lead.budget.includes('10k') || lead.budget.includes('15,000')) &&
      !lead.tags.includes('High Value')
    ) {
      lead.tags.push('High Value');
    }
    if (lead.appointmentStatus === 'scheduled' && !lead.tags.includes('Appointment Booked')) {
      lead.tags.push('Appointment Booked');
    }
  }

  /**
   * Seed realistic CRM leads for development
   */
  private seedInitialLeads(): void {
    this.localLeads = [
      {
        id: 'lead_101',
        businessId: 'test-business',
        name: 'Sophia Martinez',
        phone: '+1 (555) 234-5678',
        email: 'sophia.m@example.com',
        business: 'Apex Dental Care',
        interest: 'Cosmetic Laser Whitening',
        budget: '$350 - $1,000',
        leadScore: 95,
        conversationSummary: 'Booked Laser Whitening session for Friday 9:00 AM. High engagement.',
        appointmentStatus: 'scheduled',
        lastInteraction: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        tags: ['Hot Lead', 'Appointment Booked', 'PPO Insurance'],
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'lead_102',
        businessId: 'test-business',
        name: 'David Chen',
        phone: '+1 (555) 876-5432',
        email: 'dchen@techcorp.io',
        business: 'B2B SaaS Corp',
        interest: 'Growth Retainer',
        budget: '$15,000 / mo',
        leadScore: 85,
        conversationSummary: 'Requested case studies on B2B lead generation funnels. Follow-up needed.',
        appointmentStatus: 'none',
        lastInteraction: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
        tags: ['Hot Lead', 'High Value', 'Agency Lead'],
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'lead_103',
        businessId: 'test-business',
        name: 'Marcus Sterling',
        phone: '+1 (555) 901-2345',
        email: 'marcus@sterlingrealty.com',
        business: 'Luxury Real Estate',
        interest: 'Waterfront Penthouse Tour',
        budget: '$1.2M - $1.5M',
        leadScore: 90,
        conversationSummary: 'Confirmed VIP property walkthrough for Saturday morning.',
        appointmentStatus: 'scheduled',
        lastInteraction: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        tags: ['High Value', 'Appointment Booked', 'Real Estate VIP'],
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];
  }
}

export const crmService = new CRMService();
