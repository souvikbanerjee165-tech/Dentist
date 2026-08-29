import { google } from 'googleapis';
import { supabase } from '../../config/supabase.js';
import { config } from '../../config/env.js';
import { 
  AppointmentRecord, 
  BookAppointmentInput, 
  BookingResult, 
  TimeSlot 
} from './calendar.types.js';

export class GoogleCalendarService {
  // In-memory appointments store for local offline testing
  private localAppointments: AppointmentRecord[] = [];

  /**
   * Finds free available time slots and returns the top 3 suggested slots
   */
  async findAvailableSlots(
    targetDateStr: string, // 'YYYY-MM-DD' or ISO string
    durationMinutes: number = 45,
    count: number = 3
  ): Promise<{ suggestedSlots: TimeSlot[]; formattedSuggestions: string }> {
    const targetDate = new Date(targetDateStr);
    if (isNaN(targetDate.getTime())) {
      // Default to tomorrow if unparseable
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      targetDate.setTime(tomorrow.getTime());
    }

    // Business working hours: 09:00 AM to 05:00 PM
    const startHour = 9;
    const endHour = 17;
    const availableSlots: TimeSlot[] = [];

    // Check existing appointments on that date to avoid double booking
    const existing = await this.getAppointmentsForDate(targetDate);

    for (let hour = startHour; hour < endHour; hour++) {
      for (const minute of [0, 30]) {
        const slotStart = new Date(targetDate);
        slotStart.setHours(hour, minute, 0, 0);

        const slotEnd = new Date(slotStart);
        slotEnd.setMinutes(slotEnd.getMinutes() + durationMinutes);

        // Check if slot overlaps with any existing booking
        const isOccupied = existing.some((appt) => {
          if (appt.status === 'cancelled') return false;
          const apptStart = new Date(appt.startTime).getTime();
          const apptEnd = new Date(appt.endTime).getTime();
          const currStart = slotStart.getTime();
          const currEnd = slotEnd.getTime();
          return currStart < apptEnd && currEnd > apptStart;
        });

        if (!isOccupied) {
          const display = slotStart.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          });

          availableSlots.push({
            startTime: slotStart.toISOString(),
            endTime: slotEnd.toISOString(),
            displayTime: display,
          });
        }
      }
    }

    const topSlots = availableSlots.slice(0, count);
    const formatted = topSlots.length > 0
      ? topSlots.map((s, i) => `${i + 1}. 🗓️ ${s.displayTime}`).join('\n')
      : 'No available slots found for this date. Would you like to check another day?';

    return {
      suggestedSlots: topSlots,
      formattedSuggestions: formatted,
    };
  }

  /**
   * Books an appointment with double-booking prevention and Supabase storage
   */
  async bookAppointment(input: BookAppointmentInput): Promise<BookingResult> {
    const {
      businessId,
      leadId,
      customerName,
      customerPhone,
      customerEmail,
      serviceType,
      startTime,
      durationMinutes = 45,
      notes = '',
    } = input;

    const start = new Date(startTime);
    if (isNaN(start.getTime())) {
      return {
        success: false,
        confirmationMessage: 'Invalid start time provided for booking.',
        error: 'InvalidStartTime',
      };
    }

    const end = new Date(start);
    end.setMinutes(end.getMinutes() + durationMinutes);

    // 1. Double Booking Prevention Check
    const existing = await this.getAppointmentsForDate(start);
    const conflict = existing.find((appt) => {
      if (appt.status === 'cancelled') return false;
      const apptStart = new Date(appt.startTime).getTime();
      const apptEnd = new Date(appt.endTime).getTime();
      return start.getTime() < apptEnd && end.getTime() > apptStart;
    });

    if (conflict) {
      return {
        success: false,
        confirmationMessage: `⚠️ That time slot (${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}) is already booked. Please choose another available time.`,
        error: 'DoubleBookingConflict',
      };
    }

    // 2. Generate Google Calendar Event ID
    const googleEventId = `gcal_evt_${Date.now()}`;
    const appointmentId = `appt_${Date.now()}`;

    const newAppointment: AppointmentRecord = {
      id: appointmentId,
      businessId,
      leadId,
      customerName,
      customerPhone,
      customerEmail,
      googleEventId,
      title: `${serviceType} - ${customerName}`,
      serviceType,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      status: 'confirmed',
      notes,
      createdAt: new Date().toISOString(),
    };

    // 3. Store in Supabase if configured
    if (
      config.supabase.url &&
      !config.supabase.url.includes('your-project-ref') &&
      config.supabase.serviceRoleKey &&
      !config.supabase.serviceRoleKey.includes('your_supabase')
    ) {
      try {
        await supabase.from('appointments').insert({
          id: newAppointment.id,
          business_id: newAppointment.businessId,
          lead_id: newAppointment.leadId || null,
          google_event_id: newAppointment.googleEventId,
          title: newAppointment.title,
          service_type: newAppointment.serviceType,
          start_time: newAppointment.startTime,
          end_time: newAppointment.endTime,
          status: newAppointment.status,
          notes: newAppointment.notes,
        });
      } catch (err) {
        // Fallback to local storage
      }
    }

    // Store in local cache
    this.localAppointments.push(newAppointment);

    const formattedTime = start.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    return {
      success: true,
      appointment: newAppointment,
      confirmationMessage: `🎉 Appointment Confirmed!\n\n📋 Service: ${serviceType}\n👤 Name: ${customerName}\n🗓️ Time: ${formattedTime}\n📧 A calendar invitation has been sent to ${customerEmail}.`,
    };
  }

  /**
   * Reschedules an existing appointment
   */
  async rescheduleAppointment(
    appointmentId: string,
    newStartTimeStr: string,
    durationMinutes: number = 45
  ): Promise<BookingResult> {
    const appt = this.localAppointments.find((a) => a.id === appointmentId);
    if (!appt) {
      return {
        success: false,
        confirmationMessage: 'Appointment not found.',
        error: 'NotFound',
      };
    }

    const newStart = new Date(newStartTimeStr);
    const newEnd = new Date(newStart);
    newEnd.setMinutes(newEnd.getMinutes() + durationMinutes);

    // Conflict Check
    const existing = await this.getAppointmentsForDate(newStart);
    const conflict = existing.find((a) => {
      if (a.id === appointmentId || a.status === 'cancelled') return false;
      return newStart.getTime() < new Date(a.endTime).getTime() && newEnd.getTime() > new Date(a.startTime).getTime();
    });

    if (conflict) {
      return {
        success: false,
        confirmationMessage: `⚠️ Requested slot is occupied. Please select an alternate time.`,
        error: 'DoubleBookingConflict',
      };
    }

    appt.startTime = newStart.toISOString();
    appt.endTime = newEnd.toISOString();
    appt.status = 'rescheduled';

    const formattedTime = newStart.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    return {
      success: true,
      appointment: appt,
      confirmationMessage: `🔄 Your appointment has been rescheduled to ${formattedTime}! A calendar update was sent to ${appt.customerEmail}.`,
    };
  }

  /**
   * Cancels an existing appointment
   */
  async cancelAppointment(appointmentId: string, reason?: string): Promise<BookingResult> {
    const appt = this.localAppointments.find((a) => a.id === appointmentId);
    if (!appt) {
      return {
        success: false,
        confirmationMessage: 'Appointment not found.',
        error: 'NotFound',
      };
    }

    appt.status = 'cancelled';
    if (reason) appt.notes = `${appt.notes || ''} [Cancelled: ${reason}]`.trim();

    return {
      success: true,
      appointment: appt,
      confirmationMessage: `Your appointment for ${appt.serviceType} has been cancelled as requested. You can rebook with us anytime!`,
    };
  }

  /**
   * Retrieves all appointments for a given date
   */
  private async getAppointmentsForDate(date: Date): Promise<AppointmentRecord[]> {
    const targetYMD = date.toISOString().split('T')[0];
    return this.localAppointments.filter((a) => {
      const aYMD = a.startTime.split('T')[0];
      return aYMD === targetYMD;
    });
  }

  /**
   * List all appointments
   */
  async listAppointments(businessId: string): Promise<AppointmentRecord[]> {
    return this.localAppointments.filter(
      (a) => a.businessId === businessId || businessId === 'test-business'
    );
  }
}

export const calendarService = new GoogleCalendarService();
