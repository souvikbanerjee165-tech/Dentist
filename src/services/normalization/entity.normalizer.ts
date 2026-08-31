import { AIConversationTurnResponse } from '../ai/ai.types.js';

export enum CanonicalTreatment {
  EMERGENCY_EXAM = 'EMERGENCY_EXAM',
  LASER_WHITENING = 'LASER_WHITENING',
  DEEP_CLEAN = 'DEEP_CLEAN',
  PORCELAIN_VENEERS = 'PORCELAIN_VENEERS',
  GENERAL_CONSULTATION = 'GENERAL_CONSULTATION',
}

export const TREATMENT_METADATA: Record<CanonicalTreatment, { name: string; price: number; durationMinutes: number }> = {
  [CanonicalTreatment.EMERGENCY_EXAM]: { name: 'Emergency Tooth Pain Relief & Exam', price: 95, durationMinutes: 30 },
  [CanonicalTreatment.LASER_WHITENING]: { name: 'Cosmetic Laser Teeth Whitening', price: 350, durationMinutes: 45 },
  [CanonicalTreatment.DEEP_CLEAN]: { name: 'Comprehensive Oral Exam & Deep Clean', price: 180, durationMinutes: 60 },
  [CanonicalTreatment.PORCELAIN_VENEERS]: { name: 'Porcelain Veneers Consultation', price: 950, durationMinutes: 45 },
  [CanonicalTreatment.GENERAL_CONSULTATION]: { name: 'General Dental Consultation', price: 95, durationMinutes: 30 },
};

export class EntityNormalizer {
  /**
   * Normalizes fuzzy AI text into canonical, deterministic backend entities
   */
  static normalize(turn: AIConversationTurnResponse): AIConversationTurnResponse {
    const normalized = JSON.parse(JSON.stringify(turn)) as AIConversationTurnResponse;
    const { collected_data } = normalized;

    // 1. Normalize Phone Number to strict E.164 (e.g. "+1 (555) 234-5678" -> "+15552345678")
    if (collected_data.phone_number) {
      const digits = collected_data.phone_number.replace(/[^\d+]/g, '');
      collected_data.phone_number = digits.startsWith('+') ? digits : `+1${digits}`;
    }

    // 2. Normalize Full Name (Title Case & Trim)
    if (collected_data.name) {
      collected_data.name = collected_data.name
        .trim()
        .replace(/\s+/g, ' ')
        .split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
    }

    // 3. Normalize Treatment / Service to Canonical Enum
    if (collected_data.business_type) {
      const raw = collected_data.business_type.toLowerCase();
      let canonical: CanonicalTreatment = CanonicalTreatment.GENERAL_CONSULTATION;

      if (raw.includes('whiten') || raw.includes('laser') || raw.includes('350')) {
        canonical = CanonicalTreatment.LASER_WHITENING;
      } else if (raw.includes('pain') || raw.includes('emergency') || raw.includes('relief') || raw.includes('95')) {
        canonical = CanonicalTreatment.EMERGENCY_EXAM;
      } else if (raw.includes('clean') || raw.includes('hygiene') || raw.includes('180') || raw.includes('comprehensive')) {
        canonical = CanonicalTreatment.DEEP_CLEAN;
      } else if (raw.includes('veneer') || raw.includes('porcelain')) {
        canonical = CanonicalTreatment.PORCELAIN_VENEERS;
      }

      collected_data.business_type = canonical;
    }

    // 4. Normalize Relative Date String (e.g., "Friday", "Tomorrow") to Strict ISO Date
    if (collected_data.preferred_appointment_date) {
      collected_data.preferred_appointment_date = this.normalizeDate(collected_data.preferred_appointment_date);
    }

    return normalized;
  }

  private static normalizeDate(dateStr: string): string {
    const lower = dateStr.toLowerCase().trim();
    const now = new Date();

    if (lower.includes('today')) {
      return now.toISOString();
    }
    if (lower.includes('tomorrow')) {
      const d = new Date(now);
      d.setDate(d.getDate() + 1);
      return d.toISOString();
    }
    if (lower.includes('friday')) {
      const d = new Date(now);
      const day = d.getDay();
      const diff = (5 - day + 7) % 7 || 7; // next Friday
      d.setDate(d.getDate() + diff);
      d.setHours(15, 0, 0, 0); // Default to 3:00 PM if unspecified
      return d.toISOString();
    }

    const parsed = new Date(dateStr);
    return isNaN(parsed.getTime()) ? dateStr : parsed.toISOString();
  }
}
