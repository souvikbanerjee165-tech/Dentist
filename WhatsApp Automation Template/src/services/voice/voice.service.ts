import { LLMFactory } from '../ai/providers/llm.factory.js';
import { WhatsAppService } from '../whatsapp/whatsapp.service.js';
import { supabase } from '../../config/supabase.js';

export interface VoiceCallSession {
  callSid: string;
  callerPhone: string;
  clinicName: string;
  transcriptHistory: { role: 'user' | 'assistant' | 'system'; content: string }[];
  patientName?: string;
  intent?: string;
}

// In-memory active call session store (backed by Supabase for persistence)
const activeCallSessions = new Map<string, VoiceCallSession>();

export class VoiceAIService {
  private static whatsappService = new WhatsAppService();

  /**
   * Generates initial TwiML greeting when patient calls the clinic
   */
  static handleInboundCall(
    callSid: string,
    callerPhone: string,
    clinicName: string = 'Apex Dental Clinic'
  ): string {
    const session: VoiceCallSession = {
      callSid,
      callerPhone,
      clinicName,
      transcriptHistory: [],
    };
    activeCallSessions.set(callSid, session);

    const greetingText = `Thank you for calling ${clinicName}. I am the clinic's AI assistant. How can I help you with your dental care or appointment today?`;
    
    session.transcriptHistory.push({ role: 'assistant', content: greetingText });

    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Gather input="speech" timeout="5" speechTimeout="auto" action="/api/v1/voice/respond" method="POST">
        <Say voice="Polly.Amy-Neural" language="en-GB">${greetingText}</Say>
    </Gather>
    <Say voice="Polly.Amy-Neural" language="en-GB">I did not hear your response. Please stay on the line or call back anytime. Goodbye.</Say>
    <Hangup/>
</Response>`;
  }

  /**
   * Processes caller speech transcript using Gemini Flash and returns voice response
   */
  static async processCallerSpeech(
    callSid: string,
    callerSpeech: string,
    callerPhone: string = '+447911123456',
    clinicName: string = 'Apex Dental Clinic'
  ): Promise<string> {
    let session = activeCallSessions.get(callSid);
    if (!session) {
      session = {
        callSid,
        callerPhone,
        clinicName,
        transcriptHistory: [],
      };
      activeCallSessions.set(callSid, session);
    }

    // Clean and record caller input
    const cleanSpeech = callerSpeech?.trim() || '';
    if (!cleanSpeech) {
      return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Gather input="speech" timeout="5" speechTimeout="auto" action="/api/v1/voice/respond" method="POST">
        <Say voice="Polly.Amy-Neural" language="en-GB">Sorry, I did not catch that. Could you please repeat how I can help you today?</Say>
    </Gather>
</Response>`;
    }

    session.transcriptHistory.push({ role: 'user', content: cleanSpeech });

    try {
      // 1. Run through Gemini Flash Brain
      const aiTurn = await LLMFactory.executeWithFailover({
        businessName: clinicName,
        businessIndustry: 'Dental Clinic',
        userMessage: cleanSpeech,
        conversationHistory: session.transcriptHistory,
        knowledgeContext: [
          'Routine Exam & 3D Scan: £95',
          'Emergency Pain Relief: £95 (Same-day priority)',
          'Teeth Whitening: £395',
          'Dental Implants: From £2,800',
          'Emax Veneers: £850 per tooth',
          'Clear Aligners: From £3,100',
          'Opening Hours: Mon-Fri 8:30am - 6:00pm, Sat 9:00am - 2:00pm',
          'Address: 450 Sutter St, Suite 1200',
        ],
      });

      const replyText = aiTurn.reply;
      session.transcriptHistory.push({ role: 'assistant', content: replyText });

      // 2. Check for Acute Emergency or Human Handover requirement
      if (aiTurn.handover_required) {
        const transferNumber = process.env.OWNER_NOTIFICATION_PHONE || '+447911123456';
        return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="Polly.Amy-Neural" language="en-GB">${replyText}. Connecting you with our emergency clinical triage team right now. Please hold.</Say>
    <Dial>${transferNumber}</Dial>
</Response>`;
      }

      // 3. If caller booked or enquired about an appointment, trigger WhatsApp confirmation SMS
      if (aiTurn.intent === 'appointment_booking' && callerPhone) {
        this.dispatchBookingFollowUp(callerPhone, clinicName, replyText);
      }

      // 4. Return conversational speech gather loop
      return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Gather input="speech" timeout="5" speechTimeout="auto" action="/api/v1/voice/respond" method="POST">
        <Say voice="Polly.Amy-Neural" language="en-GB">${this.escapeXml(replyText)}</Say>
    </Gather>
    <Say voice="Polly.Amy-Neural" language="en-GB">Thank you for calling ${clinicName}. We have sent the appointment details to your phone via WhatsApp. Have a wonderful day!</Say>
    <Hangup/>
</Response>`;
    } catch (error: any) {
      console.error('[VoiceAIService] Error processing speech:', error);
      return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="Polly.Amy-Neural" language="en-GB">Thank you for your inquiry. Our front desk has received your request and will follow up with you shortly. Have a great day.</Say>
    <Hangup/>
</Response>`;
    }
  }

  /**
   * Sends an automated WhatsApp booking confirmation to the caller after the phone call
   */
  private static async dispatchBookingFollowUp(
    callerPhone: string,
    clinicName: string,
    summary: string
  ): Promise<void> {
    try {
      const message = `Hi there! 👋 Thank you for calling *${clinicName}*.\n\nHere is the summary of your phone request:\n"${summary}"\n\n📅 If you need to pick or reschedule your time slot directly, tap here:\nhttps://whatsapp-ai-sales-assistant-rho.vercel.app\n\nSee you soon! 🦷`;
      await this.whatsappService.sendTextMessage(callerPhone, message);
    } catch (err) {
      console.warn('[VoiceAIService] WhatsApp post-call follow-up notice:', err);
    }
  }

  /**
   * XML character escaping helper for clean TwiML voice responses
   */
  private static escapeXml(unsafe: string): string {
    return unsafe
      .replace(/[<>&'"]/g, (c) => {
        switch (c) {
          case '<': return '&lt;';
          case '>': return '&gt;';
          case '&': return '&amp;';
          case '\'': return '&apos;';
          case '"': return '&quot;';
          default: return c;
        }
      });
  }
}
