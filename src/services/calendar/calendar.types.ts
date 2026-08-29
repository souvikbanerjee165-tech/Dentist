export interface TimeSlot {
  startTime: string; // ISO 8601 string
  endTime: string;   // ISO 8601 string
  displayTime: string; // e.g. "Friday, Sep 4 at 3:00 PM"
}

export interface BookAppointmentInput {
  businessId: string;
  leadId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  serviceType: string;
  startTime: string; // ISO 8601
  durationMinutes?: number;
  notes?: string;
}

export interface AppointmentRecord {
  id: string;
  businessId: string;
  leadId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  googleEventId?: string;
  title: string;
  serviceType: string;
  startTime: string;
  endTime: string;
  status: 'confirmed' | 'rescheduled' | 'cancelled';
  notes?: string;
  createdAt: string;
}

export interface BookingResult {
  success: boolean;
  appointment?: AppointmentRecord;
  confirmationMessage: string;
  error?: string;
}
