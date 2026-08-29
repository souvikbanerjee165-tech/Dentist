import { WhatsAppIncomingMessage } from './whatsapp.types.js';

export class WhatsAppWebhookParser {
  /**
   * Parses official Meta WhatsApp Cloud API Webhook payload into normalized message object
   */
  static parsePayload(body: any): WhatsAppIncomingMessage | null {
    try {
      const entry = body?.entry?.[0];
      const change = entry?.changes?.[0];
      const value = change?.value;
      const message = value?.messages?.[0];
      const contact = value?.contacts?.[0];

      if (!message) return null;

      const from = message.from;
      const senderName = contact?.profile?.name || 'WhatsApp Customer';
      const messageId = message.id;
      const timestamp = new Date(parseInt(message.timestamp, 10) * 1000).toISOString();
      const type = message.type;

      const result: WhatsAppIncomingMessage = {
        messageId,
        from,
        senderName,
        timestamp,
        type,
      };

      // 1. Text Message
      if (type === 'text') {
        result.text = message.text?.body || '';
      }

      // 2. Image Message (e.g. Insurance card, teeth photo, building)
      else if (type === 'image') {
        result.text = message.image?.caption || '[Customer sent an image]';
        result.media = {
          id: message.image?.id,
          mimeType: message.image?.mime_type,
          caption: message.image?.caption,
        };
      }

      // 3. Audio / Voice Note Message
      else if (type === 'audio' || type === 'voice') {
        result.text = '[Customer sent a voice note]';
        result.media = {
          id: message.audio?.id || message.voice?.id,
          mimeType: message.audio?.mime_type || message.voice?.mime_type,
        };
      }

      // 4. Document Message (e.g. PDF medical record, intake form)
      else if (type === 'document') {
        result.text = message.document?.caption || `[Customer sent a document: ${message.document?.filename || 'File'}]`;
        result.media = {
          id: message.document?.id,
          mimeType: message.document?.mime_type,
          fileName: message.document?.filename,
          caption: message.document?.caption,
        };
      }

      // 5. Location Message
      else if (type === 'location') {
        const loc = message.location;
        result.location = {
          latitude: loc?.latitude,
          longitude: loc?.longitude,
          name: loc?.name,
          address: loc?.address,
        };
        result.text = `[Customer shared location: ${loc?.name || loc?.address || `${loc?.latitude}, ${loc?.longitude}`}]`;
      }

      // 6. Interactive Button or List Reply
      else if (type === 'interactive') {
        const interactive = message.interactive;
        if (interactive?.type === 'button_reply') {
          result.interactive = {
            type: 'button_reply',
            buttonId: interactive.button_reply?.id,
            title: interactive.button_reply?.title,
          };
          result.text = interactive.button_reply?.title || '';
        } else if (interactive?.type === 'list_reply') {
          result.interactive = {
            type: 'list_reply',
            buttonId: interactive.list_reply?.id,
            title: interactive.list_reply?.title,
          };
          result.text = interactive.list_reply?.title || '';
        }
      }

      return result;
    } catch (error) {
      console.error('Error parsing WhatsApp webhook payload:', error);
      return null;
    }
  }
}
