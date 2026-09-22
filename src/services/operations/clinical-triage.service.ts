import fs from 'node:fs';
import path from 'node:path';

export type TriageCategory = 'Clinical / Urgent' | 'Scheduling' | 'Billing / Insurance' | 'General';
export type TriageUrgency = 'P1_Emergency' | 'P2_Urgent' | 'P3_Routine' | 'P4_Low';

export interface InboundMessageThread {
  threadId: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  category: TriageCategory;
  urgency: TriageUrgency;
  messages: Array<{
    id: string;
    sender: 'patient' | 'doctor' | 'front_desk' | 'ai_assistant';
    senderName: string;
    text: string;
    timestampIso: string;
    isEncrypted: boolean;
  }>;
  status: 'new' | 'assigned_to_clinician' | 'resolved';
  assignedTo?: string; // 'Dr. Sarah Jensen, DDS' | 'Lead Receptionist' | 'Billing Coordinator'
  lastActivityIso: string;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const TRIAGE_STORE_FILE = path.join(DATA_DIR, 'clinical_triage_store.json');

export class ClinicalTriageService {
  private static instance: ClinicalTriageService;
  private threads: InboundMessageThread[] = [];

  private constructor() {
    this.ensureDataDir();
    this.loadData();
  }

  public static getInstance(): ClinicalTriageService {
    if (!ClinicalTriageService.instance) {
      ClinicalTriageService.instance = new ClinicalTriageService();
    }
    return ClinicalTriageService.instance;
  }

  private ensureDataDir(): void {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadData(): void {
    try {
      if (fs.existsSync(TRIAGE_STORE_FILE)) {
        const raw = fs.readFileSync(TRIAGE_STORE_FILE, 'utf8');
        this.threads = JSON.parse(raw);
        return;
      }
    } catch (err) {
      console.warn('[ClinicalTriageService] Initializing triage store.');
    }

    // Seed realistic inbox threads across categories
    this.threads = [
      {
        threadId: 'th-01',
        patientId: 'pat-seed-01',
        patientName: 'Sophia Martinez',
        patientPhone: '+1 (555) 234-5678',
        category: 'Clinical / Urgent',
        urgency: 'P2_Urgent',
        messages: [
          {
            id: 'm-01',
            sender: 'patient',
            senderName: 'Sophia Martinez',
            text: 'Hi Dr. Sarah, I had a wisdom tooth pulled yesterday and my lower jaw is starting to throb a bit. Is it okay to take ibuprofen with my prescribed antibiotic?',
            timestampIso: '2026-09-02T14:10:00.000Z',
            isEncrypted: true,
          },
          {
            id: 'm-02',
            sender: 'doctor',
            senderName: 'Dr. Sarah Jensen, DDS',
            text: 'Hello Sophia, yes! 400mg Ibuprofen is safe and recommended alongside your Amoxicillin. Make sure to take both with food or a glass of milk to protect your stomach.',
            timestampIso: '2026-09-02T14:18:00.000Z',
            isEncrypted: true,
          },
        ],
        status: 'resolved',
        assignedTo: 'Dr. Sarah Jensen, DDS',
        lastActivityIso: '2026-09-02T14:18:00.000Z',
      },
      {
        threadId: 'th-02',
        patientId: 'pat-seed-02',
        patientName: 'Liam Vance',
        patientPhone: '+1 (555) 345-6789',
        category: 'Scheduling',
        urgency: 'P3_Routine',
        messages: [
          {
            id: 'm-03',
            sender: 'patient',
            senderName: 'Liam Vance',
            text: 'Can I reschedule my crown prep appointment from tomorrow to next Tuesday at 3pm?',
            timestampIso: '2026-09-03T10:00:00.000Z',
            isEncrypted: false,
          },
        ],
        status: 'new',
        assignedTo: 'Front Desk Coordinator',
        lastActivityIso: '2026-09-03T10:00:00.000Z',
      },
    ];

    this.saveData();
  }

  private saveData(): void {
    try {
      fs.writeFileSync(TRIAGE_STORE_FILE, JSON.stringify(this.threads, null, 2), 'utf8');
    } catch (err) {
      console.error('[ClinicalTriageService] Failed saving triage store:', err);
    }
  }

  /**
   * Intelligently categorizes inbound text based on clinical and operational keywords
   */
  public categorizeMessage(text: string): { category: TriageCategory; urgency: TriageUrgency } {
    const lower = text.toLowerCase();

    // 1. Clinical / Urgent
    if (
      lower.includes('pain') ||
      lower.includes('bleed') ||
      lower.includes('swell') ||
      lower.includes('hurt') ||
      lower.includes('throbbing') ||
      lower.includes('fever') ||
      lower.includes('infection') ||
      lower.includes('pus') ||
      lower.includes('numb') ||
      lower.includes('emergency') ||
      lower.includes('allergic')
    ) {
      const isSevere = lower.includes('severe') || lower.includes('unbearable') || lower.includes('heavy bleed');
      return {
        category: 'Clinical / Urgent',
        urgency: isSevere ? 'P1_Emergency' : 'P2_Urgent',
      };
    }

    // 2. Billing & Insurance
    if (
      lower.includes('insurance') ||
      lower.includes('copay') ||
      lower.includes('bill') ||
      lower.includes('cost') ||
      lower.includes('price') ||
      lower.includes('coverage') ||
      lower.includes('deductible') ||
      lower.includes('receipt') ||
      lower.includes('financing')
    ) {
      return {
        category: 'Billing / Insurance',
        urgency: 'P3_Routine',
      };
    }

    // 3. Scheduling
    if (
      lower.includes('reschedule') ||
      lower.includes('cancel') ||
      lower.includes('appointment') ||
      lower.includes('slot') ||
      lower.includes('time') ||
      lower.includes('late') ||
      lower.includes('calendar') ||
      lower.includes('book')
    ) {
      return {
        category: 'Scheduling',
        urgency: 'P3_Routine',
      };
    }

    // 4. General
    return {
      category: 'General',
      urgency: 'P4_Low',
    };
  }

  /**
   * Ingests a new message into an existing or newly created triage thread
   */
  public ingestInboundPatientMessage(params: {
    patientId: string;
    patientName: string;
    patientPhone: string;
    text: string;
  }): InboundMessageThread {
    const { category, urgency } = this.categorizeMessage(params.text);

    let thread = this.threads.find((t) => t.patientId === params.patientId && t.status !== 'resolved');

    if (!thread) {
      thread = {
        threadId: `th-${Date.now()}`,
        patientId: params.patientId,
        patientName: params.patientName,
        patientPhone: params.patientPhone,
        category,
        urgency,
        messages: [],
        status: 'new',
        assignedTo: category === 'Clinical / Urgent' ? 'Dr. Sarah Jensen, DDS' : 'Front Desk Reception',
        lastActivityIso: new Date().toISOString(),
      };
      this.threads.unshift(thread);
    } else {
      // Elevate urgency if clinical keywords detected
      if (category === 'Clinical / Urgent') {
        thread.category = category;
        thread.urgency = urgency;
        thread.assignedTo = 'Dr. Sarah Jensen, DDS';
      }
    }

    thread.messages.push({
      id: `m-${Date.now()}`,
      sender: 'patient',
      senderName: params.patientName,
      text: params.text,
      timestampIso: new Date().toISOString(),
      isEncrypted: true,
    });
    thread.lastActivityIso = new Date().toISOString();

    this.saveData();
    return thread;
  }

  /**
   * Clinician or front desk replies directly through the portal
   */
  public replyToThread(params: {
    threadId: string;
    senderName: string;
    role: 'doctor' | 'front_desk';
    text: string;
  }): InboundMessageThread | null {
    const thread = this.threads.find((t) => t.threadId === params.threadId);
    if (!thread) return null;

    thread.messages.push({
      id: `m-${Date.now()}`,
      sender: params.role,
      senderName: params.senderName,
      text: params.text,
      timestampIso: new Date().toISOString(),
      isEncrypted: true,
    });
    thread.lastActivityIso = new Date().toISOString();
    thread.status = 'assigned_to_clinician';

    this.saveData();
    return thread;
  }

  public getStaffInbox(categoryFilter?: TriageCategory): InboundMessageThread[] {
    if (categoryFilter) {
      return this.threads.filter((t) => t.category === categoryFilter);
    }
    return this.threads;
  }

  public getThreadForPatient(patientId: string): InboundMessageThread | null {
    return this.threads.find((t) => t.patientId === patientId) || null;
  }
}

export const clinicalTriageService = ClinicalTriageService.getInstance();
