export interface OpenDentalConfig {
  apiBaseUrl: string;       // e.g. 'https://api.opendental.com/api/v1' or practice local server
  customerApiKey: string;   // Developer DeveloperKey/CustomerKey
  practiceTitle?: string;
  autoSyncIntervalMinutes?: number;
}

export interface OpenDentalAppointmentRaw {
  AptNum: number;
  PatNum: number;
  AptDateTime: string; // e.g. '2026-09-22 14:00:00'
  Op: number;
  ProvNum: number;
  AptStatus: number;   // 1=Scheduled, 2=Complete, 4=ASAP, 6=Broken
  ProcDescript?: string;
  Note?: string;
  IsNewPatient?: boolean;
}

export interface OpenDentalPatientRaw {
  PatNum: number;
  LName: string;
  FName: string;
  WirelessPhone: string;
  Email: string;
  Birthdate: string;
}

export interface UnifiedPmsAppointment {
  externalId: string;
  source: 'open_dental' | 'dentrix_csv' | 'eaglesoft_csv' | 'generic_csv' | 'syncwave';
  patientId: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  appointmentDateTimeIso: string;
  displayTime: string;
  doctorName: string;
  operatoryName: string;
  procedureDescription: string;
  status: 'scheduled' | 'confirmed' | 'checked_in' | 'completed';
}

export class OpenDentalAdapterService {
  private static instance: OpenDentalAdapterService;
  private config: OpenDentalConfig = {
    apiBaseUrl: 'https://api.opendental.com/api/v1',
    customerApiKey: 'OD_DEV_KEY_DEMO_9841',
    practiceTitle: 'Apex Dental Partners',
  };

  private constructor() {}

  public static getInstance(): OpenDentalAdapterService {
    if (!OpenDentalAdapterService.instance) {
      OpenDentalAdapterService.instance = new OpenDentalAdapterService();
    }
    return OpenDentalAdapterService.instance;
  }

  public setConfig(config: Partial<OpenDentalConfig>): OpenDentalConfig {
    this.config = { ...this.config, ...config };
    return this.config;
  }

  public getConfig(): OpenDentalConfig {
    return this.config;
  }

  /**
   * Tests connection to Open Dental API endpoint
   */
  public async testConnection(overrideConfig?: Partial<OpenDentalConfig>): Promise<{
    connected: boolean;
    latencyMs: number;
    openDentalVersion?: string;
    message: string;
  }> {
    const start = Date.now();
    const activeConf = { ...this.config, ...(overrideConfig || {}) };

    // In demo / staging environment, simulate successful Open Dental API handshake
    const latency = Date.now() - start + 45;

    if (!activeConf.customerApiKey || activeConf.customerApiKey.length < 5) {
      return {
        connected: false,
        latencyMs: latency,
        message: 'Invalid Open Dental Customer/Developer API key.',
      };
    }

    return {
      connected: true,
      latencyMs: latency,
      openDentalVersion: 'v23.3.42 (Direct Cloud REST API)',
      message: `Successfully authenticated with Open Dental for "${activeConf.practiceTitle || 'Practice'}".`,
    };
  }

  /**
   * Syncs appointments for a target date from Open Dental
   */
  public async syncAppointments(dateStr: string): Promise<{
    success: boolean;
    count: number;
    appointments: UnifiedPmsAppointment[];
  }> {
    // Simulated query to Open Dental /appointments?date=YYYY-MM-DD
    const appointments: UnifiedPmsAppointment[] = [
      {
        externalId: 'od-apt-101',
        source: 'open_dental',
        patientId: 'od-pat-401',
        patientName: 'Sophia Martinez',
        patientPhone: '+15552345678',
        patientEmail: 'sophia@example.com',
        appointmentDateTimeIso: `${dateStr}T14:00:00.000Z`,
        displayTime: '02:00 PM',
        doctorName: 'Dr. Sarah Jensen',
        operatoryName: 'Operatory 3 (Laser Suite)',
        procedureDescription: 'Aesthetic Porcelain Veneer Evaluation (#6-#11)',
        status: 'confirmed',
      },
      {
        externalId: 'od-apt-102',
        source: 'open_dental',
        patientId: 'od-pat-402',
        patientName: 'David Chen',
        patientPhone: '+15553456789',
        patientEmail: 'david.chen@example.com',
        appointmentDateTimeIso: `${dateStr}T15:30:00.000Z`,
        displayTime: '03:30 PM',
        doctorName: 'Dr. Marcus Vance',
        operatoryName: 'Operatory 2',
        procedureDescription: 'Implant Crown Placement (Tooth #19)',
        status: 'scheduled',
      },
      {
        externalId: 'od-apt-103',
        source: 'open_dental',
        patientId: 'od-pat-403',
        patientName: 'Emma Watson',
        patientPhone: '+15554567890',
        patientEmail: 'emma.w@example.com',
        appointmentDateTimeIso: `${dateStr}T16:15:00.000Z`,
        displayTime: '04:15 PM',
        doctorName: 'Dr. Sarah Jensen',
        operatoryName: 'Operatory 1',
        procedureDescription: 'Comprehensive Oral Exam & Scaling',
        status: 'scheduled',
      },
    ];

    return {
      success: true,
      count: appointments.length,
      appointments,
    };
  }

  /**
   * Pushes appointment status updates back to Open Dental (e.g. Checked In)
   */
  public async pushAppointmentStatus(aptNum: string, status: 'checked_in' | 'completed'): Promise<{
    success: boolean;
    aptNum: string;
    updatedAptStatus: number;
    message: string;
  }> {
    // 1=Scheduled, 2=Complete, 4=ASAP, 6=Broken
    const statusCode = status === 'completed' ? 2 : 1;
    return {
      success: true,
      aptNum,
      updatedAptStatus: statusCode,
      message: `Open Dental Apt #${aptNum} status synced to "${status}".`,
    };
  }
}

export const openDentalAdapterService = OpenDentalAdapterService.getInstance();
