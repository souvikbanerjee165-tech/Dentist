import { Request, Response } from 'express';
import { config } from '../config/env.js';
import { WhatsAppWebhookParser } from '../services/whatsapp/webhook.parser.js';
import { whatsappService } from '../services/whatsapp/whatsapp.service.js';
import { aiConversationService } from '../services/ai/ai.service.js';
import { crmService } from '../services/crm/crm.service.js';
import { calendarService } from '../services/calendar/calendar.service.js';

export class WebhookController {
  /**
   * GET /api/v1/webhook/whatsapp
   * Webhook verification challenge from Meta
   */
  static verifyWebhook(req: Request, res: Response): void {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === config.whatsapp.verifyToken) {
      console.log('✅ WhatsApp Webhook verified successfully with Meta.');
      res.status(200).send(challenge);
    } else {
      console.warn('❌ WhatsApp Webhook verification failed. Tokens did not match.');
      res.status(403).json({ error: 'VerificationFailed' });
    }
  }

  /**
   * POST /api/v1/webhook/whatsapp
   * Inbound message processing pipeline
   */
  static async handleIncomingWebhook(req: Request, res: Response): Promise<void> {
    // 1. Always acknowledge Meta immediately with 200 OK to prevent webhook retries
    res.status(200).send('EVENT_RECEIVED');

    try {
      // 2. Parse incoming payload
      const incoming = WhatsAppWebhookParser.parsePayload(req.body);
      if (!incoming) return; // Status updates or delivery receipts

      const { from, senderName, text = '', type, messageId, location } = incoming;
      const businessId = 'default-business-id';

      console.log(`📩 Incoming WhatsApp [${type.toUpperCase()}] from ${senderName} (${from}): "${text}"`);

      // 3. Mark message as read
      await whatsappService.markAsRead(messageId);

      // 4. Ingest/Update lead in CRM
      const lead = await crmService.upsertLead({
        businessId,
        phone: from,
        name: senderName !== 'WhatsApp Customer' ? senderName : null,
        conversationSummary: `Received ${type} message: ${text.slice(0, 100)}`,
      });

      // 5. Check if Location was shared -> Provide clinic proximity info
      if (type === 'location' && location) {
        const locationReply = `📍 Thank you for sharing your location! Our clinic is located at 450 Lexington Avenue, Suite 800, New York, NY 10017 (Approx. 10-15 minutes from your area). Would you like to check available consultation times?`;
        await whatsappService.sendTextMessage(from, locationReply);
        return;
      }

      // 6. Process message through AI Sales Engine
      const aiTurn = await aiConversationService.processTurn({
        businessName: 'Apex Care Clinic',
        businessIndustry: 'Medical & Dental Clinic',
        userMessage: text,
        conversationHistory: [],
        existingLeadData: {
          name: lead.name,
          phone_number: lead.phone,
          email: lead.email || undefined,
          business_type: lead.business || undefined,
          budget: lead.budget || undefined,
        },
      });

      // 7. Update CRM with AI extracted data & score
      await crmService.upsertLead({
        businessId,
        phone: from,
        name: aiTurn.collected_data.name || lead.name,
        email: aiTurn.collected_data.email || lead.email,
        business: aiTurn.collected_data.business_type || lead.business,
        budget: aiTurn.collected_data.budget || lead.budget,
        conversationSummary: aiTurn.reply.slice(0, 150),
        appointmentStatus: aiTurn.intent === 'appointment_booking' ? 'scheduled' : lead.appointmentStatus,
      });

      // 8. If appointment booking intent, check slots and offer interactive buttons
      if (aiTurn.intent === 'appointment_booking') {
        const slots = await calendarService.findAvailableSlots(new Date().toISOString(), 45, 2);
        if (slots.suggestedSlots.length >= 2) {
          await whatsappService.sendInteractiveButtons(
            from,
            `${aiTurn.reply}\n\nHere are our next 2 available openings:`,
            [
              { id: `slot_1`, title: 'Fri 3:00 PM' },
              { id: `slot_2`, title: 'Sat 11:00 AM' },
              { id: `slot_other`, title: 'Other Day' },
            ]
          );
          return;
        }
      }

      // 9. Send WhatsApp text response back to customer
      const sendResult = await whatsappService.sendTextMessage(from, aiTurn.reply);
      console.log(`📤 Reply delivered to WhatsApp (${from}) in ${sendResult.attemptCount} attempt(s).`);
    } catch (error) {
      console.error('Error handling WhatsApp webhook message:', error);
    }
  }
}
