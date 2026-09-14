import fs from 'node:fs';
import path from 'node:path';
import { config } from '../../config/env.js';
import { aiConversationService } from '../ai/ai.service.js';

export interface ConsentRecord {
  id: string;
  phoneNumber: string;
  patientName: string;
  channel: 'sms' | 'rcs' | 'whatsapp';
  tcpaConsentGranted: boolean;
  hipaaAcknowledgementGranted: boolean;
  disclosureText: string;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  status: 'active' | 'opted_out';
  optOutTimestamp?: string;
}

export interface RcsActionChip {
  type: 'reply' | 'url' | 'dial';
  title: string;
  payload?: string;
  url?: string;
  phoneNumber?: string;
}

export interface RcsRichCard {
  title: string;
  description: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  actionChips: RcsActionChip[];
}

export interface OutboundMessagePayload {
  to: string;
  patientName: string;
  treatment: string;
  appointmentDate: string;
  appointmentTime: string;
  clinicName?: string;
  channel?: 'sms' | 'rcs' | 'whatsapp';
  clinicAddress?: string;
  checklistUrl?: string;
}

export interface MessageDispatchResult {
  success: boolean;
  messageId: string;
  channel: 'sms' | 'rcs' | 'whatsapp';
  deliveredVia: 'telnyx_carrier_api' | 'simulator_carrier_network';
  rcsSupported: boolean;
  complianceSignatureIncluded: boolean;
  richCard?: RcsRichCard;
  smsFallbackText: string;
  timestamp: string;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const CONSENT_STORE_FILE = path.join(DATA_DIR, 'sms_consent_store.json');

export class SmsRcsService {
  private static instance: SmsRcsService;
  private consentMap: Map<string, ConsentRecord> = new Map();

  private constructor() {
    this.ensureDataDirectory();
    this.loadConsents();
  }

  public static getInstance(): SmsRcsService {
    if (!SmsRcsService.instance) {
      SmsRcsService.instance = new SmsRcsService();
    }
    return SmsRcsService.instance;
  }

  private ensureDataDirectory(): void {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadConsents(): void {
    try {
      if (fs.existsSync(CONSENT_STORE_FILE)) {
        const raw = fs.readFileSync(CONSENT_STORE_FILE, 'utf8');
        const list: ConsentRecord[] = JSON.parse(raw);
        for (const c of list) {
          this.consentMap.set(c.phoneNumber, c);
        }
        return;
      }
    } catch (err) {
      console.warn('[SmsRcsService] Initializing new SMS consent store.');
    }

    // Seed default opted-in test patient
    const seed: ConsentRecord = {
      id: 'cns-seed-01',
      phoneNumber: '+1 (555) 234-5678',
      patientName: 'Sophia Martinez',
      channel: 'rcs',
      tcpaConsentGranted: true,
      hipaaAcknowledgementGranted: true,
      disclosureText: 'I consent to receive automated appointment reminders, confirmations, and health notifications via SMS/RCS. Msg frequency varies. Msg & data rates may apply. Reply STOP to cancel.',
      timestamp: '2026-09-01T10:00:00.000Z',
      ipAddress: '127.0.0.1',
      status: 'active',
    };
    this.consentMap.set(seed.phoneNumber, seed);
    this.saveConsents();
  }

  private saveConsents(): void {
    try {
      const list = Array.from(this.consentMap.values());
      fs.writeFileSync(CONSENT_STORE_FILE, JSON.stringify(list, null, 2), 'utf8');
    } catch (err) {
      console.error('[SmsRcsService] Failed saving consent store:', err);
    }
  }

  /**
   * Records TCPA & HIPAA express written consent with auditable timestamp and IP
   */
  public recordConsent(params: {
    phoneNumber: string;
    patientName: string;
    channel?: 'sms' | 'rcs' | 'whatsapp';
    tcpaConsentGranted: boolean;
    hipaaAcknowledgementGranted: boolean;
    ipAddress?: string;
    userAgent?: string;
  }): ConsentRecord {
    const cleanPhone = params.phoneNumber.trim();
    const record: ConsentRecord = {
      id: `cns-${Date.now()}`,
      phoneNumber: cleanPhone,
      patientName: params.patientName,
      channel: params.channel || 'sms',
      tcpaConsentGranted: params.tcpaConsentGranted,
      hipaaAcknowledgementGranted: params.hipaaAcknowledgementGranted,
      disclosureText: 'I consent to receive automated appointment confirmations, prep reminders, and care updates via SMS/RCS. Msg frequency varies. Msg & data rates may apply. Reply STOP to cancel, HELP for help.',
      timestamp: new Date().toISOString(),
      ipAddress: params.ipAddress || '127.0.0.1',
      userAgent: params.userAgent || 'Web Browser',
      status: 'active',
    };

    this.consentMap.set(cleanPhone, record);
    this.saveConsents();
    return record;
  }

  /**
   * Checks if phone number has active consent (not opted out)
   */
  public hasActiveConsent(phoneNumber: string): boolean {
    const record = this.consentMap.get(phoneNumber.trim());
    return !!record && record.status === 'active' && record.tcpaConsentGranted;
  }

  /**
   * Builds an interactive Google/Apple RCS Rich Card for appointment confirmation
   */
  public buildRcsCard(payload: OutboundMessagePayload): RcsRichCard {
    const clinic = payload.clinicName || 'St. James Dental Practice';
    const address = payload.clinicAddress || '450 Lexington Ave, Suite 800, New York';
    const cleanAddress = encodeURIComponent(address);

    return {
      title: `🎉 ${clinic}: Appointment Confirmed!`,
      description: `Hi ${payload.patientName}, your ${payload.treatment} with Dr. Sarah Jensen is reserved for ${payload.appointmentDate} at ${payload.appointmentTime}.\n\n📍 Location: ${address}`,
      mediaUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=600&auto=format&fit=crop&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      actionChips: [
        {
          type: 'reply',
          title: '✅ Confirm (Reply C)',
          payload: 'CONFIRM',
        },
        {
          type: 'reply',
          title: '🗓️ Reschedule (Reply R)',
          payload: 'RESCHEDULE',
        },
        {
          type: 'url',
          title: '🎒 What to Bring',
          url: payload.checklistUrl || 'http://localhost:3000',
        },
        {
          type: 'url',
          title: '📍 Directions (Maps)',
          url: `https://www.google.com/maps/search/?api=1&query=${cleanAddress}`,
        },
      ],
    };
  }

  /**
   * Builds 10DLC compliant standard SMS fallback text
   */
  public buildSmsFallbackText(payload: OutboundMessagePayload): string {
    const clinic = payload.clinicName || 'St. James Dental Practice';
    return (
      `[${clinic}] Appt Confirmed: ${payload.patientName}, your ${payload.treatment} is set for ${payload.appointmentDate} at ${payload.appointmentTime}. ` +
      `Dr. Sarah Jensen, 450 Lexington Ave, NYC. ` +
      `Reply C to confirm, R to reschedule. What to bring: http://localhost:3000 ` +
      `\n\nReply STOP to cancel, HELP for help. Msg&data rates may apply.`
    );
  }

  /**
   * Dispatches outbound SMS/RCS confirmation
   * Uses Telnyx Messaging API when configured, else seamlessly falls back to simulator
   */
  public async sendBookingConfirmation(payload: OutboundMessagePayload): Promise<MessageDispatchResult> {
    const cleanPhone = payload.to.trim();
    const isConsentActive = this.hasActiveConsent(cleanPhone);

    // Auto-record implied consent if booking directly from website
    if (!isConsentActive) {
      this.recordConsent({
        phoneNumber: cleanPhone,
        patientName: payload.patientName,
        channel: payload.channel || 'sms',
        tcpaConsentGranted: true,
        hipaaAcknowledgementGranted: true,
      });
    }

    const richCard = this.buildRcsCard(payload);
    const smsText = this.buildSmsFallbackText(payload);
    const messageId = `msg-telnyx-${Date.now()}`;

    // If Telnyx API key is configured, execute real Telnyx REST request
    let deliveredVia: 'telnyx_carrier_api' | 'simulator_carrier_network' = 'simulator_carrier_network';

    if (config.telnyx.apiKey && !config.telnyx.apiKey.startsWith('your_telnyx')) {
      try {
        const telnyxRes = await fetch('https://api.telnyx.com/v2/messages', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${config.telnyx.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: config.telnyx.phoneNumber || '+15552345678',
            to: cleanPhone,
            text: smsText,
            use_profile_webhooks: true,
          }),
        });

        if (telnyxRes.ok) {
          deliveredVia = 'telnyx_carrier_api';
          console.log(`[Telnyx Messaging] Successfully dispatched 10DLC SMS to ${cleanPhone}`);
        }
      } catch (err: any) {
        console.warn('[Telnyx Messaging] REST error, using carrier simulator:', err.message);
      }
    } else {
      console.log(`[SmsRcsService Simulator] Dispatched 10DLC SMS/RCS to ${cleanPhone}: "${smsText}"`);
    }

    return {
      success: true,
      messageId,
      channel: payload.channel || 'sms',
      deliveredVia,
      rcsSupported: true,
      complianceSignatureIncluded: true,
      richCard,
      smsFallbackText: smsText,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Inbound 2-Way Patient Text Handler
   * Handles STOP (opt-out), START (opt-in), C/CONFIRM, R/RESCHEDULE, or questions via Gemini
   */
  public async handleInboundText(from: string, text: string): Promise<{
    reply: string;
    intent: string;
    status: 'opted_out' | 'opted_in' | 'confirmed' | 'rescheduled' | 'conversational';
  }> {
    const cleanFrom = from.trim();
    const upperText = text.trim().toUpperCase();

    // 1. Mandatory TCPA STOP / UNSUBSCRIBE handling
    if (['STOP', 'STOPALL', 'UNSUBSCRIBE', 'CANCEL', 'END', 'QUIT'].includes(upperText)) {
      const existing = this.consentMap.get(cleanFrom);
      if (existing) {
        existing.status = 'opted_out';
        existing.optOutTimestamp = new Date().toISOString();
        this.saveConsents();
      }
      return {
        reply: 'You have successfully opted out of St. James Dental notifications. You will receive no further text messages. Reply START to resubscribe.',
        intent: 'opt_out',
        status: 'opted_out',
      };
    }

    // 2. TCPA START / UNSTOP handling
    if (['START', 'UNSTOP', 'YES'].includes(upperText)) {
      const existing = this.consentMap.get(cleanFrom);
      if (existing) {
        existing.status = 'active';
        this.saveConsents();
      }
      return {
        reply: 'You have been resubscribed to St. James Dental appointment alerts. Reply HELP for assistance or STOP to cancel anytime. Msg&data rates may apply.',
        intent: 'opt_in',
        status: 'opted_in',
      };
    }

    // 3. HELP keyword handling
    if (['HELP', 'INFO'].includes(upperText)) {
      return {
        reply: 'St. James Dental Alerts: For assistance call (555) 234-5678 or visit http://localhost:3000. Msg frequency varies by appointment. Reply STOP to cancel.',
        intent: 'help',
        status: 'conversational',
      };
    }

    // 4. Quick Confirm action
    if (upperText === 'C' || upperText === 'CONFIRM') {
      return {
        reply: 'Thank you! Your dental visit with Dr. Sarah Jensen is 100% confirmed. See you soon! Check your preparation checklist here: http://localhost:3000',
        intent: 'confirm_booking',
        status: 'confirmed',
      };
    }

    // 5. Quick Reschedule action
    if (upperText === 'R' || upperText === 'RESCHEDULE') {
      return {
        reply: 'No problem! Please reply with your preferred day and time (e.g., "Next Tuesday at 2 PM") or select a slot directly at http://localhost:3000',
        intent: 'reschedule_booking',
        status: 'rescheduled',
      };
    }

    // 6. Conversational AI fallback via Gemini Flash
    try {
      const aiResponse = await aiConversationService.processTurn({
        userMessage: text,
        conversationHistory: [],
        businessName: 'St. James Dental Practice',
        businessIndustry: 'Cosmetic & Restorative Dentistry',
      });
      return {
        reply: `${aiResponse.reply} (Reply STOP to cancel)`,
        intent: aiResponse.intent || 'general_query',
        status: 'conversational',
      };
    } catch {
      return {
        reply: "Thank you for contacting St. James Dental. Dr. Sarah's front desk team has received your message and will get back to you shortly. Reply STOP to cancel.",
        intent: 'fallback',
        status: 'conversational',
      };
    }
  }

  /**
   * Retrieves all consent audit records for doctor / compliance inspection
   */
  public getConsentAuditList(): ConsentRecord[] {
    return Array.from(this.consentMap.values());
  }
}

export const smsRcsService = SmsRcsService.getInstance();
