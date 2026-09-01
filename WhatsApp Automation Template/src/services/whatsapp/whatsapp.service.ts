import { config } from '../../config/env.js';
import { SendMessageResponse, WhatsAppButton } from './whatsapp.types.js';

export class WhatsAppService {
  private apiVersion = 'v21.0';
  private baseUrl = 'https://graph.facebook.com';

  /**
   * Sends a plain text WhatsApp message with automatic retry on failure
   */
  async sendTextMessage(toPhone: string, text: string): Promise<SendMessageResponse> {
    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: this.cleanPhoneNumber(toPhone),
      type: 'text',
      text: {
        preview_url: false,
        body: text,
      },
    };

    return this.sendWithRetry('/messages', payload);
  }

  /**
   * Sends an interactive message with Quick Reply buttons (e.g. "Book Slot", "Pricing")
   */
  async sendInteractiveButtons(
    toPhone: string,
    bodyText: string,
    buttons: WhatsAppButton[]
  ): Promise<SendMessageResponse> {
    const formattedButtons = buttons.slice(0, 3).map((btn) => ({
      type: 'reply',
      reply: {
        id: btn.id,
        title: btn.title.slice(0, 20), // Meta 20 char limit per button title
      },
    }));

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: this.cleanPhoneNumber(toPhone),
      type: 'interactive',
      interactive: {
        type: 'button',
        body: { text: bodyText },
        action: { buttons: formattedButtons },
      },
    };

    return this.sendWithRetry('/messages', payload);
  }

  /**
   * Marks incoming message as read (blue ticks on WhatsApp)
   */
  async markAsRead(messageId: string): Promise<boolean> {
    const payload = {
      messaging_product: 'whatsapp',
      status: 'read',
      message_id: messageId,
    };

    const res = await this.sendWithRetry('/messages', payload);
    return res.success;
  }

  /**
   * Internal dispatcher with automatic exponential backoff retry
   */
  private async sendWithRetry(
    endpoint: string,
    payload: any,
    maxRetries: number = 3,
    initialDelayMs: number = 400
  ): Promise<SendMessageResponse> {
    const phoneNumberId = config.whatsapp.phoneNumberId;
    const token = config.whatsapp.apiToken;

    // Offline / Mock Mode when Meta API credentials are placeholder
    if (!token || token.startsWith('your_whatsapp') || !phoneNumberId || phoneNumberId.startsWith('your_whatsapp')) {
      return {
        success: true,
        whatsappMessageId: `wamid.mock_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        attemptCount: 1,
      };
    }

    const url = `${this.baseUrl}/${this.apiVersion}/${phoneNumberId}${endpoint}`;
    let attempt = 0;
    let delay = initialDelayMs;

    while (attempt < maxRetries) {
      attempt++;
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          const data = (await response.json()) as any;
          const msgId = data?.messages?.[0]?.id || `wamid_${Date.now()}`;
          return {
            success: true,
            whatsappMessageId: msgId,
            attemptCount: attempt,
          };
        }

        const errorBody = await response.text();
        console.warn(`⚠️ WhatsApp API Attempt ${attempt}/${maxRetries} failed (Status ${response.status}): ${errorBody}`);

        // If client error (4xx other than 429), do not retry
        if (response.status >= 400 && response.status < 500 && response.status !== 429) {
          return {
            success: false,
            error: errorBody,
            attemptCount: attempt,
          };
        }
      } catch (networkError: any) {
        console.warn(`⚠️ WhatsApp Network Attempt ${attempt}/${maxRetries} error:`, networkError.message);
      }

      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff (400ms -> 800ms -> 1600ms)
      }
    }

    return {
      success: false,
      error: `Failed to deliver WhatsApp message after ${maxRetries} attempts.`,
      attemptCount: attempt,
    };
  }

  /**
   * Strips formatting, spaces, and '+' characters for Meta international E.164 standard
   */
  private cleanPhoneNumber(phone: string): string {
    return phone.replace(/[^0-9]/g, '');
  }
}

export const whatsappService = new WhatsAppService();
