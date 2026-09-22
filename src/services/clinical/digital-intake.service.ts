import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export interface MedicalHistory {
  currentMedications: string[];
  chronicConditions: string[]; // e.g., 'Hypertension', 'Type 2 Diabetes', 'Asthma', 'Bleeding Disorder'
  allergies: string[];         // e.g., 'Penicillin', 'Latex', 'Local Anesthetics', 'Sulfa'
  pastSurgeries: string[];
  hasHeartMurmurOrValveReplacement: boolean;
  takesBloodThinners: boolean;
  isPregnantOrNursing?: boolean;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
}

export interface LegalSignature {
  signatureType: 'draw' | 'type';
  signatureData: string; // Base64 data URL or typed full legal name
  signedByFullName: string;
  signedAtIso: string;
  ipAddress?: string;
  userAgent?: string;
  sha256Hash: string; // Cryptographic hash of patientId + timestamp + signatureData for non-repudiation
}

export interface PatientIntakeSubmission {
  id: string;
  patientId: string;
  patientFullName: string;
  submittedAtIso: string;
  medicalHistory: MedicalHistory;
  hipaaAcknowledged: boolean;
  treatmentConsentAcknowledged: boolean;
  financialAgreementAcknowledged: boolean;
  signature: LegalSignature;
  status: 'submitted' | 'reviewed_by_clinician';
  reviewedByDoctor?: string;
  reviewedAtIso?: string;
}

export interface PreSedationScreening {
  npoFastingHours: number;
  hasSleepApnea: boolean;
  previousAdverseSedationReaction: boolean;
  hasEscortForDischarge: boolean;
  asaClassEstimate: 'ASA I' | 'ASA II' | 'ASA III';
  clearedForSedation: boolean;
}

export interface CosmeticSmileGoals {
  primaryGoal: 'Whiter Teeth' | 'Straightening' | 'Fix Chipped Teeth' | 'Full Smile Makeover';
  currentShadeConcern: string;
  interestedInAligners: boolean;
  interestedInVeneers: boolean;
  budgetExpectation: '$500 - $1,500' | '$1,500 - $5,000' | '$5,000+';
  notes?: string;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const INTAKE_STORE_FILE = path.join(DATA_DIR, 'patient_intake_store.json');

export class DigitalIntakeService {
  private static instance: DigitalIntakeService;
  private intakeMap: Map<string, PatientIntakeSubmission> = new Map();
  private sedationScreenings: Map<string, PreSedationScreening> = new Map();
  private cosmeticGoals: Map<string, CosmeticSmileGoals> = new Map();

  private constructor() {
    this.ensureDataDir();
    this.loadData();
  }

  public static getInstance(): DigitalIntakeService {
    if (!DigitalIntakeService.instance) {
      DigitalIntakeService.instance = new DigitalIntakeService();
    }
    return DigitalIntakeService.instance;
  }

  private ensureDataDir(): void {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadData(): void {
    try {
      if (fs.existsSync(INTAKE_STORE_FILE)) {
        const raw = fs.readFileSync(INTAKE_STORE_FILE, 'utf8');
        const list: PatientIntakeSubmission[] = JSON.parse(raw);
        for (const item of list) {
          this.intakeMap.set(item.patientId, item);
        }
        return;
      }
    } catch (err) {
      console.warn('[DigitalIntakeService] Initializing new intake store.');
    }

    // Seed sample completed intake for demo patient Sophia Martinez
    const seededHash = crypto
      .createHash('sha256')
      .update(`pat-seed-01|2026-09-01T10:00:00.000Z|Sophia Martinez`)
      .digest('hex');

    const seed: PatientIntakeSubmission = {
      id: 'intake-seed-01',
      patientId: 'pat-seed-01',
      patientFullName: 'Sophia Martinez',
      submittedAtIso: '2026-09-01T10:00:00.000Z',
      medicalHistory: {
        currentMedications: ['Vitamin D3 2000 IU', 'Cetirizine 10mg as needed for seasonal allergies'],
        chronicConditions: ['Mild Asthma'],
        allergies: ['Penicillin (Hives)'],
        pastSurgeries: ['Wisdom Tooth Extraction (2021)'],
        hasHeartMurmurOrValveReplacement: false,
        takesBloodThinners: false,
        isPregnantOrNursing: false,
        emergencyContactName: 'Carlos Martinez',
        emergencyContactPhone: '+1 (555) 987-6543',
        emergencyContactRelation: 'Spouse',
      },
      hipaaAcknowledged: true,
      treatmentConsentAcknowledged: true,
      financialAgreementAcknowledged: true,
      signature: {
        signatureType: 'type',
        signatureData: 'Sophia Martinez',
        signedByFullName: 'Sophia Martinez',
        signedAtIso: '2026-09-01T10:00:00.000Z',
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 Chrome/128',
        sha256Hash: seededHash,
      },
      status: 'reviewed_by_clinician',
      reviewedByDoctor: 'Dr. Sarah Jensen, DDS',
      reviewedAtIso: '2026-09-01T10:15:00.000Z',
    };
    this.intakeMap.set(seed.patientId, seed);
    this.saveData();
  }

  private saveData(): void {
    try {
      const list = Array.from(this.intakeMap.values());
      fs.writeFileSync(INTAKE_STORE_FILE, JSON.stringify(list, null, 2), 'utf8');
    } catch (err) {
      console.error('[DigitalIntakeService] Failed saving intake store:', err);
    }
  }

  public submitIntake(params: {
    patientId: string;
    patientFullName: string;
    medicalHistory: MedicalHistory;
    hipaaAcknowledged: boolean;
    treatmentConsentAcknowledged: boolean;
    financialAgreementAcknowledged: boolean;
    signatureType: 'draw' | 'type';
    signatureData: string;
    ipAddress?: string;
    userAgent?: string;
  }): PatientIntakeSubmission {
    const timestamp = new Date().toISOString();
    
    // Generate legal non-repudiation SHA-256 fingerprint under ESIGN Act
    const hash = crypto
      .createHash('sha256')
      .update(`${params.patientId}|${timestamp}|${params.signatureData}`)
      .digest('hex');

    const submission: PatientIntakeSubmission = {
      id: `intake-${Date.now()}`,
      patientId: params.patientId,
      patientFullName: params.patientFullName,
      submittedAtIso: timestamp,
      medicalHistory: params.medicalHistory,
      hipaaAcknowledged: params.hipaaAcknowledged,
      treatmentConsentAcknowledged: params.treatmentConsentAcknowledged,
      financialAgreementAcknowledged: params.financialAgreementAcknowledged,
      signature: {
        signatureType: params.signatureType,
        signatureData: params.signatureData,
        signedByFullName: params.patientFullName,
        signedAtIso: timestamp,
        ipAddress: params.ipAddress || '127.0.0.1',
        userAgent: params.userAgent || 'Web Browser',
        sha256Hash: hash,
      },
      status: 'submitted',
    };

    this.intakeMap.set(params.patientId, submission);
    this.saveData();
    return submission;
  }

  public getIntakeByPatientId(patientId: string): PatientIntakeSubmission | null {
    return this.intakeMap.get(patientId) || null;
  }

  public reviewIntake(patientId: string, doctorName: string): PatientIntakeSubmission | null {
    const item = this.intakeMap.get(patientId);
    if (!item) return null;
    item.status = 'reviewed_by_clinician';
    item.reviewedByDoctor = doctorName;
    item.reviewedAtIso = new Date().toISOString();
    this.saveData();
    return item;
  }

  public submitSedationScreening(patientId: string, screening: PreSedationScreening): PreSedationScreening {
    this.sedationScreenings.set(patientId, screening);
    return screening;
  }

  public getSedationScreening(patientId: string): PreSedationScreening | null {
    return this.sedationScreenings.get(patientId) || null;
  }

  public submitCosmeticGoals(patientId: string, goals: CosmeticSmileGoals): CosmeticSmileGoals {
    this.cosmeticGoals.set(patientId, goals);
    return goals;
  }

  public getCosmeticGoals(patientId: string): CosmeticSmileGoals | null {
    return this.cosmeticGoals.get(patientId) || null;
  }
}

export const digitalIntakeService = DigitalIntakeService.getInstance();
