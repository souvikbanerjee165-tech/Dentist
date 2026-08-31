import { AIConversationTurnResponse } from '../ai/ai.types.js';
import { calendarService } from '../calendar/calendar.service.js';
import { createClient } from '@supabase/supabase-js';
import { config } from '../../config/env.js';
import { IntentValidator } from '../validation/intent.validator.js';
import { eventBus } from '../events/event.bus.ts';
import { decisionLogger } from '../logging/decision.logger.js';

export interface ExecutionResult {
  actionExecuted: 'appointment_booked' | 'lead_qualified' | 'human_handoff_triggered' | 'validation_failed' | 'replied_only';
  validationErrors?: string[];
  details?: Record<string, any>;
}

export class ActionExecutor {
  private supabase = createClient(config.supabase.url, config.supabase.serviceRoleKey, {
    auth: { persistSession: false },
  });

  /**
   * Deterministically executes business actions based on structured LLM decision output.
   * LLM DECIDES -> VALIDATOR CHECKS -> EVENT BUS PUBLISHES -> BACKEND EXECUTES.
   */
  async execute(
    turn: AIConversationTurnResponse,
    context: {
      businessId?: string;
      conversationId?: string;
      userMessage?: string;
      llmProvider?: string;
      ragChunksUsed?: string[];
      durationMs?: number;
    } = {}
  ): Promise<ExecutionResult> {
    const businessId = context.businessId || 'default-business-id';
    const conversationId = context.conversationId || `conv-${Date.now()}`;
    const userMessage = context.userMessage || '';
    const llmProvider = context.llmProvider || 'gemini';
    const ragChunksUsed = context.ragChunksUsed || [];
    const durationMs = context.durationMs || 0;

    // 1. Schema & Business Rules Validation Layer
    const validation = IntentValidator.validate(turn);
    if (!validation.isValid) {
      console.warn('⚠️ [Validator Rejection]: Business rules rejected LLM decision:', validation.errors);
      
      decisionLogger.logDecision({
        conversationId,
        userMessage,
        ragChunksUsed,
        llmProvider,
        confidence: turn.confidence,
        intent: turn.intent,
        validationErrors: validation.errors,
        executedAction: 'validation_failed',
        durationMs,
      });

      return {
        actionExecuted: 'validation_failed',
        validationErrors: validation.errors,
      };
    }

    const sanitizedTurn = validation.sanitizedTurn;
    const { intent, confidence, collected_data, handover_required } = sanitizedTurn;

    // 2. Confidence-Scored Human Handoff Check (< 70% confidence or explicit flag)
    if (confidence < 0.70 || handover_required || intent === 'human_handover') {
      console.log(`🚨 Low confidence (${Math.round(confidence * 100)}%) or handoff requested. Emitting Event.`);
      
      eventBus.publish('HUMAN_TAKEOVER_REQUIRED', {
        conversationId,
        phoneNumber: collected_data.phone_number,
        reason: sanitizedTurn.handover_reason || 'Low model confidence threshold (< 70%)',
        confidence,
      });

      // Update Supabase
      if (collected_data.phone_number) {
        await this.supabase
          .from('conversations')
          .update({ status: 'human_takeover' })
          .eq('phone_number', collected_data.phone_number);
      }

      decisionLogger.logDecision({
        conversationId,
        userMessage,
        ragChunksUsed,
        llmProvider,
        confidence,
        intent,
        executedAction: 'human_handoff_triggered',
        durationMs,
      });

      return {
        actionExecuted: 'human_handoff_triggered',
        details: { reason: sanitizedTurn.handover_reason || 'Low model confidence threshold' },
      };
    }

    // 3. Automated Appointment Booking Execution
    if (
      intent === 'appointment_booking' &&
      collected_data.name &&
      collected_data.phone_number &&
      collected_data.preferred_appointment_date
    ) {
      console.log(`🗓️ Executing Automated Calendar Booking for ${collected_data.name}...`);

      const bookingResult = await calendarService.bookAppointment({
        businessId,
        customerName: collected_data.name,
        customerPhone: collected_data.phone_number,
        customerEmail: collected_data.email || '',
        serviceType: collected_data.business_type || 'General Consultation',
        startTime: new Date().toISOString(),
      });

      // Publish Event to Event Bus (triggers DB, Calendar, WhatsApp, Analytics)
      eventBus.publish('APPOINTMENT_BOOKED', {
        bookingId: bookingResult.appointmentId,
        customerName: collected_data.name,
        customerPhone: collected_data.phone_number,
        customerEmail: collected_data.email,
        service: collected_data.business_type,
        appointmentSlot: collected_data.preferred_appointment_date,
      });

      decisionLogger.logDecision({
        conversationId,
        userMessage,
        ragChunksUsed,
        llmProvider,
        confidence,
        intent,
        executedAction: 'appointment_booked',
        durationMs,
      });

      return {
        actionExecuted: 'appointment_booked',
        details: bookingResult,
      };
    }

    // 4. Automated Lead Qualification Record in CRM
    if (collected_data.name || collected_data.phone_number) {
      eventBus.publish('LEAD_QUALIFIED', {
        fullName: collected_data.name,
        phoneNumber: collected_data.phone_number,
        email: collected_data.email,
        treatment: collected_data.business_type,
      });

      decisionLogger.logDecision({
        conversationId,
        userMessage,
        ragChunksUsed,
        llmProvider,
        confidence,
        intent,
        executedAction: 'lead_qualified',
        durationMs,
      });

      return {
        actionExecuted: 'lead_qualified',
        details: { collected: collected_data },
      };
    }

    // 5. Standard Replied Only
    decisionLogger.logDecision({
      conversationId,
      userMessage,
      ragChunksUsed,
      llmProvider,
      confidence,
      intent,
      executedAction: 'replied_only',
      durationMs,
    });

    return { actionExecuted: 'replied_only' };
  }
}

export const actionExecutor = new ActionExecutor();
