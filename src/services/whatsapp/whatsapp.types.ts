export interface WhatsAppIncomingMessage {
  messageId: string;
  from: string; // Customer's phone number e.g. "15552345678"
  senderName: string;
  timestamp: string;
  type: 'text' | 'image' | 'audio' | 'voice' | 'document' | 'location' | 'interactive';
  text?: string;
  media?: {
    id: string;
    mimeType?: string;
    caption?: string;
    fileName?: string;
  };
  location?: {
    latitude: number;
    longitude: number;
    name?: string;
    address?: string;
  };
  interactive?: {
    type: 'button_reply' | 'list_reply';
    buttonId?: string;
    title?: string;
  };
}

export interface WhatsAppButton {
  id: string;
  title: string;
}

export interface SendMessageResponse {
  success: boolean;
  whatsappMessageId?: string;
  error?: string;
  attemptCount: number;
}
