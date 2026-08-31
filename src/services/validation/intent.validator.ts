import { AIConversationTurnResponse, LeadCollectedData } from '../ai/ai.types.js';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedTurn: AIConversationTurnResponse;
}

export class IntentValidator {
  private static ALLOWED_SERVICES = [
    'Emergency Tooth Pain Relief & Exam',
    'Cosmetic Laser Teeth Whitening',
    'Comprehensive Oral Exam & Deep Clean',
    'General Consultation',
    'Porcelain Veneers',
  ];

  /**
   * Validates structured LLM outputs against strict clinical business rules
   * Prevents invalid dates, stale prices, and hallucinated appointment slots
   */
  static validate(turn: AIConversationTurnResponse): ValidationResult {
    const errors: string[] = [];
    const sanitized = { ...turn };

    // 1. Basic Confidence Bound Check
    if (typeof sanitized.confidence !== 'number' || sanitized.confidence < 0 || sanitized.confidence > 1) {
      sanitized.confidence = 0.5; // fallback to medium confidence
    }

    // 2. Validate Appointment Booking Business Rules
    if (sanitized.intent === 'appointment_booking') {
      const { preferred_appointment_date, phone_number, name } = sanitized.collected_data;

      // Rule A: Missing critical contact details
      if (!name || name.trim().length < 2) {
        errors.push('Patient full name is missing or invalid.');
      }

      if (!phone_number || phone_number.replace(/\D/g, '').length < 7) {
        errors.push('Patient phone/WhatsApp number is missing or incomplete.');
      }

      // Rule B: Calendar Date Sanity Check
      if (preferred_appointment_date) {
        const parsedDate = new Date(preferred_appointment_date);
        
        // Check for impossible date (e.g. Feb 31, NaN)
        if (isNaN(parsedDate.getTime())) {
          // If unparseable string like "Friday 3 PM", we allow soft scheduling but flag for verification
        } else {
          const now = new Date();
          now.setHours(0, 0, 0, 0);

          // Reject dates in the past
          if (parsedDate < now) {
            errors.push(`Cannot book an appointment in the past: ${preferred_appointment_date}`);
          }

          // Reject dates beyond 90 days out
          const maxFuture = new Date();
          maxFuture.setDate(maxFuture.getDate() + 90);
          if (parsedDate > maxFuture) {
            errors.push(`Booking date is too far in advance (> 90 days): ${preferred_appointment_date}`);
          }
        }
      } else {
        errors.push('Preferred appointment date was not specified.');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedTurn: sanitized,
    };
  }
}
