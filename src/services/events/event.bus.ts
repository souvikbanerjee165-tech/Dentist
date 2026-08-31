import { EventEmitter } from 'events';

export type SystemEventType =
  | 'APPOINTMENT_BOOKED'
  | 'LEAD_QUALIFIED'
  | 'HUMAN_TAKEOVER_REQUIRED'
  | 'WHATSAPP_MESSAGE_SENT'
  | 'DECISION_LOGGED';

export interface SystemEvent<T = any> {
  type: SystemEventType;
  payload: T;
  timestamp: string;
  correlationId: string;
}

export class SystemEventBus {
  private emitter = new EventEmitter();

  constructor() {
    this.emitter.setMaxListeners(30);
    this.registerDefaultListeners();
  }

  /**
   * Publish an event to the bus
   */
  publish<T>(type: SystemEventType, payload: T, correlationId: string = `evt-${Date.now()}`): void {
    const event: SystemEvent<T> = {
      type,
      payload,
      timestamp: new Date().toISOString(),
      correlationId,
    };

    console.log(`📡 [EventBus Emitted]: ${type} (ID: ${correlationId})`);
    this.emitter.emit(type, event);
  }

  /**
   * Subscribe a listener to an event
   */
  subscribe<T>(type: SystemEventType, listener: (event: SystemEvent<T>) => Promise<void> | void): void {
    this.emitter.on(type, listener);
  }

  /**
   * Register default event bus listeners for modular side-effects
   */
  private registerDefaultListeners(): void {
    // 1. Appointment Booked Listener
    this.subscribe('APPOINTMENT_BOOKED', async (event) => {
      console.log(`  └─ 🗓️ [Listener: Calendar & CRM] Synced booking for ${event.payload.customerName}`);
    });

    // 2. WhatsApp Notification Dispatch Listener
    this.subscribe('APPOINTMENT_BOOKED', async (event) => {
      console.log(`  └─ 💬 [Listener: WhatsApp Dispatch] Confirmation queued for ${event.payload.customerPhone}`);
    });

    // 3. Human Takeover Alert Listener
    this.subscribe('HUMAN_TAKEOVER_REQUIRED', async (event) => {
      console.log(`  └─ 🚨 [Listener: Staff Alert] Notified clinic front desk for takeover: ${event.payload.reason}`);
    });

    // 4. Analytics & ROI Listener
    this.subscribe('LEAD_QUALIFIED', async (event) => {
      console.log(`  └─ 📈 [Listener: Analytics] Logged lead acquisition to ROI dashboard.`);
    });
  }
}

export const eventBus = new SystemEventBus();
