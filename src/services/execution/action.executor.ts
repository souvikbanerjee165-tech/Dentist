import { AIConversationTurnResponse } from '../ai/ai.types.js';
import { calendarService } from '../calendar/calendar.service.js';
import { createClient } from '@supabase/supabase-js';
import { config } from '../../config/env.js';

export interface ExecutionResult {
  actionExecuted: 'appointment_booked' | 'lead_qualified' | 'human_handoff_triggered' | 'replied_only';
  details?: Record<string, any>;
}

export class ActionExecutor {
  private supabase = createClient(config.supabase.url, config.supabase.serviceRoleKey, {
    auth: { persistSession: false },
  });

  /**
   * Deterministically executes business actions based on structured LLM decision output.
   * LLM ONLY DECIDES -> BACKEND EXECUTES.
   */
  async execute(
    turn: AIConversationTurnResponse,
    businessId: string = 'default-business-id'
  ): Promise<ExecutionResult> {
    const { intent, confidence, collected_data, handover_required } = turn;

    // 1. Confidence-Scored Human Handoff Check (< 70% confidence or explicit flag)
    if (confidence < 0.70 || handover_required || intent === 'human_handover') {
      console.log(`🚨 Low confidence (${Math.round(confidence * 100)}%) or handoff requested. Routing to Human Takeover.`);
      
      // Update conversation state in Supabase
      if (collected_data.phone_number) {
        await this.supabase
          .from('conversations')
          .update({ status: 'human_takeover' })
          .eq('phone_number', collected_data.phone_number);
      }

      return {
        actionExecuted: 'human_handoff_triggered',
        details: { reason: turn.handover_reason || 'Low model confidence' },
      };
    }

    // 2. Automated Appointment Booking Execution
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

      return {
        actionExecuted: 'appointment_booked',
        details: bookingResult,
      };
    }

    // 3. Automated Lead Qualification Record in CRM
    if (collected_data.name || collected_data.phone_number) {
      return {
        actionExecuted: 'lead_qualified',
        details: { collected: collected_data },
      };
    }

    return { actionExecuted: 'replied_only' };
  }
}

export const actionExecutor = new ActionExecutor();
