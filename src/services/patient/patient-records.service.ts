import fs from 'node:fs';
import path from 'node:path';

export interface ChecklistItem {
  id: string;
  label: string;
  category: 'identity' | 'insurance' | 'medical' | 'dental_hardware' | 'instructions';
  description: string;
  isRequired: boolean;
  isCompleted: boolean;
}

export interface ClinicalVisitRecord {
  id: string;
  patientId: string;
  date: string; // ISO 8601 or display
  treatment: string;
  doctorName: string;
  doctorRole: string;
  operatory: string;
  status: 'completed' | 'in_progress' | 'scheduled';
  sharedSummary: string;
  aftercareInstructions: string[];
  privateClinicalNotes?: string;
  feeGbp: number;
  paymentStatus: 'paid' | 'insurance_pending' | 'due';
  receiptNumber: string;
  prescriptions?: string[];
  vitals?: {
    bloodPressure?: string;
    pulse?: number;
  };
}

export interface UpcomingAppointmentDetails {
  id: string;
  patientId: string;
  treatment: string;
  dateStr: string;
  timeStr: string;
  startIso: string;
  endIso: string;
  doctorName: string;
  doctorRole: string;
  clinicName: string;
  clinicAddress: string;
  room: string;
  status: 'confirmed' | 'checked_in' | 'in_prep';
  estimatedDuration: string;
  feeGbp: number;
  checklist: ChecklistItem[];
  preVisitGuidelines: string[];
}

export interface PatientDashboardData {
  patientId: string;
  upcomingAppointment: UpcomingAppointmentDetails | null;
  clinicalHistory: ClinicalVisitRecord[];
  totalVisitsCount: number;
  loyaltyStatus: 'New Patient' | 'Regular Patient' | 'VIP Care Member';
  lastVisitDate?: string;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const RECORDS_FILE = path.join(DATA_DIR, 'patient_records_store.json');

export class PatientRecordsService {
  private static instance: PatientRecordsService;
  private upcomingMap: Map<string, UpcomingAppointmentDetails> = new Map();
  private historyMap: Map<string, ClinicalVisitRecord[]> = new Map();

  private constructor() {
    this.ensureDataDirectory();
    this.loadRecords();
  }

  public static getInstance(): PatientRecordsService {
    if (!PatientRecordsService.instance) {
      PatientRecordsService.instance = new PatientRecordsService();
    }
    return PatientRecordsService.instance;
  }

  private ensureDataDirectory(): void {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  /**
   * Generates tailored "What to Bring / Carry" checklist items based on procedure
   */
  public generateChecklistForTreatment(treatment: string): ChecklistItem[] {
    const baseItems: ChecklistItem[] = [
      {
        id: 'chk-id-01',
        label: 'Government-Issued Photo ID',
        category: 'identity',
        description: 'Driver’s license, national ID, or passport for identity verification.',
        isRequired: true,
        isCompleted: false,
      },
      {
        id: 'chk-ins-02',
        label: 'Dental Insurance Card & Policy Info',
        category: 'insurance',
        description: 'Physical card or digital policy barcode for direct electronic claims.',
        isRequired: true,
        isCompleted: false,
      },
      {
        id: 'chk-med-03',
        label: 'Current Medications & Allergy List',
        category: 'medical',
        description: 'List of any regular prescriptions, blood thinners, or heart medications.',
        isRequired: false,
        isCompleted: false,
      },
    ];

    const lower = treatment.toLowerCase();

    if (lower.includes('whitening') || lower.includes('bleach') || lower.includes('cosmetic')) {
      baseItems.push(
        {
          id: 'chk-cos-04',
          label: 'Existing Aligners or Night Guard (if any)',
          category: 'dental_hardware',
          description: 'Bring any retainers so Dr. Sarah can verify fit after shade enhancement.',
          isRequired: false,
          isCompleted: false,
        },
        {
          id: 'chk-cos-05',
          label: 'Pre-Visit Preparation (White Diet & Clean Teeth)',
          category: 'instructions',
          description: 'Avoid black coffee or tea 2 hours before appointment; brush 30 mins prior.',
          isRequired: true,
          isCompleted: false,
        }
      );
    } else if (lower.includes('implant') || lower.includes('surgery') || lower.includes('extraction')) {
      baseItems.push(
        {
          id: 'chk-surg-04',
          label: 'Designated Driver / Companion',
          category: 'instructions',
          description: 'Recommended if local sedation or relaxing medication is administered.',
          isRequired: true,
          isCompleted: false,
        },
        {
          id: 'chk-surg-05',
          label: 'Prior X-Rays or CBCT Scans (if available)',
          category: 'medical',
          description: 'Any digital dental scans taken at outside clinics within the last 12 months.',
          isRequired: false,
          isCompleted: false,
        }
      );
    } else {
      // General Exam & Hygiene
      baseItems.push({
        id: 'chk-gen-04',
        label: 'Oral Appliance / Retainers for Inspection',
        category: 'dental_hardware',
        description: 'Bring mouthguards or retainers for complimentary ultrasonic disinfection.',
        isRequired: false,
        isCompleted: false,
      });
    }

    return baseItems;
  }

  private loadRecords(): void {
    try {
      if (fs.existsSync(RECORDS_FILE)) {
        const raw = fs.readFileSync(RECORDS_FILE, 'utf8');
        const data = JSON.parse(raw);
        if (data.upcoming) {
          for (const [k, v] of Object.entries(data.upcoming)) {
            this.upcomingMap.set(k, v as UpcomingAppointmentDetails);
          }
        }
        if (data.history) {
          for (const [k, v] of Object.entries(data.history)) {
            this.historyMap.set(k, v as ClinicalVisitRecord[]);
          }
        }
        return;
      }
    } catch (err) {
      console.warn('[PatientRecords] Initializing seeded patient clinical records.');
    }

    // Seed Sophia Martinez (pat-sophia-01)
    const sophiaUpcoming: UpcomingAppointmentDetails = {
      id: 'appt-sophia-2026',
      patientId: 'pat-sophia-01',
      treatment: 'Cosmetic Laser Teeth Whitening (£395)',
      dateStr: 'Friday, Sep 11, 2026',
      timeStr: '03:00 PM',
      startIso: '2026-09-11T15:00:00.000Z',
      endIso: '2026-09-11T15:45:00.000Z',
      doctorName: 'Dr. Sarah Jensen, DDS',
      doctorRole: 'Lead Cosmetic Dentist',
      clinicName: 'St. James Dental Practice',
      clinicAddress: '450 Lexington Ave, Suite 800, New York',
      room: 'Operatory 3 • Aesthetic Laser Suite',
      status: 'confirmed',
      estimatedDuration: '45 Minutes',
      feeGbp: 395,
      checklist: this.generateChecklistForTreatment('Cosmetic Laser Teeth Whitening'),
      preVisitGuidelines: [
        'Arrive 10 minutes prior for digital shade mapping and registration update.',
        'Avoid consuming dark coffee, black tea, or colored berries 2 hours before the treatment.',
        'A desensitizing protective gel will be applied prior to the laser activation cycle.',
      ],
    };
    sophiaUpcoming.checklist[0].isCompleted = true; // Photo ID marked ready
    sophiaUpcoming.checklist[1].isCompleted = true; // Insurance marked ready
    this.upcomingMap.set('pat-sophia-01', sophiaUpcoming);

    const sophiaHistory: ClinicalVisitRecord[] = [
      {
        id: 'vis-soph-01',
        patientId: 'pat-sophia-01',
        date: '2026-04-18',
        treatment: 'Comprehensive Oral Wellness Exam & Ultrasonic Hygiene Clean',
        doctorName: 'Dr. Sarah Jensen, DDS',
        doctorRole: 'Lead Cosmetic Dentist',
        operatory: 'Operatory 1',
        status: 'completed',
        sharedSummary: 'Full mouth 3D digital imaging, periodontal screening (BPE score 0/1 across all quadrants). Calculus debridement completed with ultrasonic scaler. Enamel in excellent health.',
        aftercareInstructions: [
          'Continue twice-daily electric brushing and daily water flossing.',
          'Routine hygiene maintenance scheduled in 6 months.',
        ],
        privateClinicalNotes: 'Patient expressed interest in brightening shades before summer. Recommended laser whitening.',
        feeGbp: 180,
        paymentStatus: 'paid',
        receiptNumber: 'INV-2026-0418-SPH',
        vitals: { bloodPressure: '118/76', pulse: 68 },
      },
      {
        id: 'vis-soph-02',
        patientId: 'pat-sophia-01',
        date: '2025-11-12',
        treatment: 'New Patient Assessment & Digital Bitewing Radiographs',
        doctorName: 'Dr. Sarah Jensen, DDS',
        doctorRole: 'Lead Cosmetic Dentist',
        operatory: 'Operatory 2',
        status: 'completed',
        sharedSummary: 'Initial comprehensive dental charting completed. No active caries detected. Mild enamel micro-abrasion noted on tooth #9, addressed with fluoride varnish.',
        aftercareInstructions: [
          'Avoid chewing hard ice or non-food objects.',
        ],
        feeGbp: 95,
        paymentStatus: 'paid',
        receiptNumber: 'INV-2025-1112-SPH',
        vitals: { bloodPressure: '120/78', pulse: 72 },
      },
    ];
    this.historyMap.set('pat-sophia-01', sophiaHistory);

    // Seed Liam Vance (pat-liam-02)
    const liamUpcoming: UpcomingAppointmentDetails = {
      id: 'appt-liam-2026',
      patientId: 'pat-liam-02',
      treatment: 'Dental Implant Consultation & 3D CBCT Scan (£2,800)',
      dateStr: 'Monday, Sep 14, 2026',
      timeStr: '11:00 AM',
      startIso: '2026-09-14T11:00:00.000Z',
      endIso: '2026-09-14T12:00:00.000Z',
      doctorName: 'Dr. Sarah Jensen, DDS',
      doctorRole: 'Lead Restorative & Implant Specialist',
      clinicName: 'St. James Dental Practice',
      clinicAddress: '450 Lexington Ave, Suite 800, New York',
      room: 'Operatory 4 • Surgical & 3D Imaging Suite',
      status: 'confirmed',
      estimatedDuration: '60 Minutes',
      feeGbp: 150,
      checklist: this.generateChecklistForTreatment('Dental Implant Surgery'),
      preVisitGuidelines: [
        'Bring any previous panoramic X-rays from your previous dentist.',
        'Full 3D cone beam CT will map bone density for precise implant placement.',
      ],
    };
    this.upcomingMap.set('pat-liam-02', liamUpcoming);

    const liamHistory: ClinicalVisitRecord[] = [
      {
        id: 'vis-liam-01',
        patientId: 'pat-liam-02',
        date: '2026-02-10',
        treatment: 'Emergency Tooth Relief & Diagnostic X-Ray (Tooth #19)',
        doctorName: 'Dr. Sarah Jensen, DDS',
        doctorRole: 'Lead Restorative Dentist',
        operatory: 'Operatory 1',
        status: 'completed',
        sharedSummary: 'Patient presented with localized sensitivity on lower left first molar. Diagnosed fractured cusp. Temporary stabilizing composite placed. Discussed titanium implant options.',
        aftercareInstructions: [
          'Chew on the opposite side until definitive implant replacement is placed.',
        ],
        feeGbp: 95,
        paymentStatus: 'paid',
        receiptNumber: 'INV-2026-0210-LVM',
      },
    ];
    this.historyMap.set('pat-liam-02', liamHistory);

    // Seed Chloe Bennett (pat-chloe-03)
    const chloeUpcoming: UpcomingAppointmentDetails = {
      id: 'appt-chloe-2026',
      patientId: 'pat-chloe-03',
      treatment: 'Invisalign & Clear Aligner Progress Review',
      dateStr: 'Wednesday, Sep 16, 2026',
      timeStr: '02:30 PM',
      startIso: '2026-09-16T14:30:00.000Z',
      endIso: '2026-09-16T15:00:00.000Z',
      doctorName: 'Dr. Sarah Jensen, DDS',
      doctorRole: 'Lead Cosmetic Dentist',
      clinicName: 'St. James Dental Practice',
      clinicAddress: '450 Lexington Ave, Suite 800, New York',
      room: 'Operatory 2 • Ortho & Cosmetic Room',
      status: 'confirmed',
      estimatedDuration: '30 Minutes',
      feeGbp: 0,
      checklist: this.generateChecklistForTreatment('Clear Aligners'),
      preVisitGuidelines: [
        'Please wear current tray set #12 to the clinic.',
        'Bring tray set #13 and #14 for validation.',
      ],
    };
    this.upcomingMap.set('pat-chloe-03', chloeUpcoming);

    this.saveRecords();
  }

  private saveRecords(): void {
    try {
      const upcomingObj: Record<string, UpcomingAppointmentDetails> = {};
      for (const [k, v] of this.upcomingMap.entries()) {
        upcomingObj[k] = v;
      }

      const historyObj: Record<string, ClinicalVisitRecord[]> = {};
      for (const [k, v] of this.historyMap.entries()) {
        historyObj[k] = v;
      }

      fs.writeFileSync(
        RECORDS_FILE,
        JSON.stringify({ upcoming: upcomingObj, history: historyObj }, null, 2),
        'utf8'
      );
    } catch (err) {
      console.error('[PatientRecords] Failed saving records store:', err);
    }
  }

  /**
   * Retrieves comprehensive dashboard payload for logged-in patient
   */
  public getDashboardData(patientId: string): PatientDashboardData {
    const upcoming = this.upcomingMap.get(patientId) || null;
    const history = this.historyMap.get(patientId) || [];

    let loyaltyStatus: 'New Patient' | 'Regular Patient' | 'VIP Care Member' = 'New Patient';
    if (history.length >= 2) loyaltyStatus = 'VIP Care Member';
    else if (history.length === 1) loyaltyStatus = 'Regular Patient';

    const lastVisit = history.length > 0 ? history[0].date : undefined;

    return {
      patientId,
      upcomingAppointment: upcoming,
      clinicalHistory: history,
      totalVisitsCount: history.length,
      loyaltyStatus,
      lastVisitDate: lastVisit,
    };
  }

  /**
   * Toggles a checklist item's status (completed vs pending)
   */
  public toggleChecklistItem(patientId: string, itemId: string, isCompleted: boolean): boolean {
    const upcoming = this.upcomingMap.get(patientId);
    if (!upcoming) return false;

    const item = upcoming.checklist.find((i) => i.id === itemId);
    if (!item) return false;

    item.isCompleted = isCompleted;
    this.saveRecords();
    return true;
  }

  /**
   * Adds or updates upcoming booking for patient
   */
  public setUpcomingAppointment(details: UpcomingAppointmentDetails): void {
    this.upcomingMap.set(details.patientId, details);
    this.saveRecords();
  }

  /**
   * Doctor appends a completed visit record with clinical summary
   */
  public addClinicalVisit(record: ClinicalVisitRecord): void {
    const list = this.historyMap.get(record.patientId) || [];
    list.unshift(record);
    this.historyMap.set(record.patientId, list);
    this.saveRecords();
  }

  /**
   * Retrieves full clinical history trail for doctor inspection
   */
  public getFullPatientHistory(patientId: string): {
    upcoming: UpcomingAppointmentDetails | null;
    history: ClinicalVisitRecord[];
  } {
    return {
      upcoming: this.upcomingMap.get(patientId) || null,
      history: this.historyMap.get(patientId) || [],
    };
  }
}

export const patientRecordsService = PatientRecordsService.getInstance();
