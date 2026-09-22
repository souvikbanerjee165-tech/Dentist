import fs from 'node:fs';
import path from 'node:path';

export interface TreatmentProcedureItem {
  cdtCode: string; // e.g., 'D2740'
  toothNumber?: number; // 1-32
  surface?: string;     // 'MOD', 'O', 'B'
  description: string;
  grossFee: number;
  insuranceCoveragePercent: number;
  estimatedInsurancePay: number;
  estimatedPatientOutOfPocket: number;
}

export interface TreatmentPhase {
  phaseNumber: number;
  title: string; // 'Phase 1: Periodontal Disease Stabilization', 'Phase 2: Restorative Crown'
  urgency: 'Immediate / Urgent' | 'Recommended within 30 Days' | 'Elective / Aesthetic';
  procedures: TreatmentProcedureItem[];
  phaseGrossTotal: number;
  phaseInsuranceEstTotal: number;
  phasePatientTotal: number;
  status: 'proposed' | 'accepted' | 'declined' | 'completed';
  acceptedAtIso?: string;
}

export interface PatientTreatmentPlan {
  planId: string;
  patientId: string;
  patientName: string;
  diagnosisSummary: string;
  createdDateIso: string;
  attendingDoctor: string;
  insurancePayerName: string;
  phases: TreatmentPhase[];
  totalGrossFee: number;
  totalEstimatedInsurance: number;
  totalPatientOutOfPocket: number;
  planStatus: 'pending_patient_review' | 'partially_accepted' | 'fully_accepted';
  acceptanceSignature?: {
    signedName: string;
    signedAtIso: string;
    ipAddress?: string;
  };
}

export interface BnplFinancingOption {
  providerName: 'CareCredit' | 'Cherry Technologies' | 'Sunbit Healthcare';
  termMonths: number;
  aprPercent: number;
  monthlyPayment: number;
  totalFinanced: number;
  isPromotionalZeroApr: boolean;
  preQualifyUrl: string;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const PLANS_STORE_FILE = path.join(DATA_DIR, 'treatment_plans_store.json');

export class TreatmentPlanService {
  private static instance: TreatmentPlanService;
  private plansMap: Map<string, PatientTreatmentPlan> = new Map();

  private constructor() {
    this.ensureDataDir();
    this.loadData();
  }

  public static getInstance(): TreatmentPlanService {
    if (!TreatmentPlanService.instance) {
      TreatmentPlanService.instance = new TreatmentPlanService();
    }
    return TreatmentPlanService.instance;
  }

  private ensureDataDir(): void {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadData(): void {
    try {
      if (fs.existsSync(PLANS_STORE_FILE)) {
        const raw = fs.readFileSync(PLANS_STORE_FILE, 'utf8');
        const list: PatientTreatmentPlan[] = JSON.parse(raw);
        for (const p of list) {
          this.plansMap.set(p.patientId, p);
        }
        return;
      }
    } catch (err) {
      console.warn('[TreatmentPlanService] Initializing treatment plans store.');
    }

    // Seed comprehensive multi-phase plan for demo patient
    const seedPlan: PatientTreatmentPlan = {
      planId: 'tx-plan-seed-01',
      patientId: 'pat-seed-01',
      patientName: 'Sophia Martinez',
      diagnosisSummary: 'Moderate localized periodontitis (quadrant 1 & 4), fractured mesio-occlusal amalgam with recurrent caries on tooth #19, and aesthetic enamel fluorosis on anterior teeth.',
      createdDateIso: '2026-09-01T11:00:00.000Z',
      attendingDoctor: 'Dr. Sarah Jensen, DDS',
      insurancePayerName: 'Delta Dental PPO (Verified)',
      phases: [
        {
          phaseNumber: 1,
          title: 'Phase 1: Periodontal Disease Arrest & Deep Scaling',
          urgency: 'Immediate / Urgent',
          procedures: [
            {
              cdtCode: 'D4341',
              description: 'Periodontal Scaling & Root Planing - UR Quadrant',
              grossFee: 285,
              insuranceCoveragePercent: 80,
              estimatedInsurancePay: 228,
              estimatedPatientOutOfPocket: 57,
            },
            {
              cdtCode: 'D4341',
              description: 'Periodontal Scaling & Root Planing - LR Quadrant',
              grossFee: 285,
              insuranceCoveragePercent: 80,
              estimatedInsurancePay: 228,
              estimatedPatientOutOfPocket: 57,
            },
            {
              cdtCode: 'D9630',
              description: 'Subgingival Chlorhexidine Antimicrobial Irrigation',
              grossFee: 65,
              insuranceCoveragePercent: 0,
              estimatedInsurancePay: 0,
              estimatedPatientOutOfPocket: 65,
            },
          ],
          phaseGrossTotal: 635,
          phaseInsuranceEstTotal: 456,
          phasePatientTotal: 179,
          status: 'accepted',
          acceptedAtIso: '2026-09-02T09:30:00.000Z',
        },
        {
          phaseNumber: 2,
          title: 'Phase 2: Tooth #19 Core Buildup & All-Ceramic Crown',
          urgency: 'Recommended within 30 Days',
          procedures: [
            {
              cdtCode: 'D2950',
              toothNumber: 19,
              description: 'Core Buildup, including any pins when required',
              grossFee: 295,
              insuranceCoveragePercent: 80,
              estimatedInsurancePay: 236,
              estimatedPatientOutOfPocket: 59,
            },
            {
              cdtCode: 'D2740',
              toothNumber: 19,
              description: 'Crown - Porcelain / Ceramic Substrate (Monolithic Zirconia)',
              grossFee: 1250,
              insuranceCoveragePercent: 50,
              estimatedInsurancePay: 625,
              estimatedPatientOutOfPocket: 625,
            },
          ],
          phaseGrossTotal: 1545,
          phaseInsuranceEstTotal: 861,
          phasePatientTotal: 684,
          status: 'proposed',
        },
        {
          phaseNumber: 3,
          title: 'Phase 3: Maxillary Anterior Aesthetic Smile Enhancement',
          urgency: 'Elective / Aesthetic',
          procedures: [
            {
              cdtCode: 'D2962',
              toothNumber: 8,
              description: 'Labial Veneer (Porcelain Laminate) - Lab Prescribed',
              grossFee: 1100,
              insuranceCoveragePercent: 0,
              estimatedInsurancePay: 0,
              estimatedPatientOutOfPocket: 1100,
            },
            {
              cdtCode: 'D2962',
              toothNumber: 9,
              description: 'Labial Veneer (Porcelain Laminate) - Lab Prescribed',
              grossFee: 1100,
              insuranceCoveragePercent: 0,
              estimatedInsurancePay: 0,
              estimatedPatientOutOfPocket: 1100,
            },
          ],
          phaseGrossTotal: 2200,
          phaseInsuranceEstTotal: 0,
          phasePatientTotal: 2200,
          status: 'proposed',
        },
      ],
      totalGrossFee: 4380,
      totalEstimatedInsurance: 1317,
      totalPatientOutOfPocket: 3063,
      planStatus: 'partially_accepted',
    };

    this.plansMap.set(seedPlan.patientId, seedPlan);
    this.saveData();
  }

  private saveData(): void {
    try {
      const list = Array.from(this.plansMap.values());
      fs.writeFileSync(PLANS_STORE_FILE, JSON.stringify(list, null, 2), 'utf8');
    } catch (err) {
      console.error('[TreatmentPlanService] Failed saving treatment plans store:', err);
    }
  }

  public getPlanByPatientId(patientId: string): PatientTreatmentPlan | null {
    return this.plansMap.get(patientId) || null;
  }

  /**
   * Patient digitally accepts specific phases of their treatment plan
   */
  public acceptTreatmentPhase(params: {
    patientId: string;
    phaseNumbers: number[];
    signedName: string;
    ipAddress?: string;
  }): PatientTreatmentPlan | null {
    const plan = this.plansMap.get(params.patientId);
    if (!plan) return null;

    const now = new Date().toISOString();

    for (const phase of plan.phases) {
      if (params.phaseNumbers.includes(phase.phaseNumber)) {
        phase.status = 'accepted';
        phase.acceptedAtIso = now;
      }
    }

    const allAccepted = plan.phases.every((p) => p.status === 'accepted');
    plan.planStatus = allAccepted ? 'fully_accepted' : 'partially_accepted';
    plan.acceptanceSignature = {
      signedName: params.signedName,
      signedAtIso: now,
      ipAddress: params.ipAddress || '127.0.0.1',
    };

    this.saveData();
    return plan;
  }

  /**
   * Computes instant soft pre-qualification terms for patient financing (BNPL)
   */
  public calculateBnplFinancing(amountOutOfPocket: number): BnplFinancingOption[] {
    const principal = Math.max(100, amountOutOfPocket);

    return [
      {
        providerName: 'Cherry Technologies',
        termMonths: 3,
        aprPercent: 0,
        monthlyPayment: Math.round((principal / 3) * 100) / 100,
        totalFinanced: principal,
        isPromotionalZeroApr: true,
        preQualifyUrl: 'https://withcherry.com/patient/apply?clinic=apex-dental',
      },
      {
        providerName: 'Sunbit Healthcare',
        termMonths: 6,
        aprPercent: 0,
        monthlyPayment: Math.round((principal / 6) * 100) / 100,
        totalFinanced: principal,
        isPromotionalZeroApr: true,
        preQualifyUrl: 'https://sunbit.com/apply?clinic=apex-dental',
      },
      {
        providerName: 'CareCredit',
        termMonths: 12,
        aprPercent: 0,
        monthlyPayment: Math.round((principal / 12) * 100) / 100,
        totalFinanced: principal,
        isPromotionalZeroApr: true,
        preQualifyUrl: 'https://www.carecredit.com/apply?clinic=apex-dental',
      },
      {
        providerName: 'CareCredit',
        termMonths: 24,
        aprPercent: 9.99,
        monthlyPayment: Math.round(((principal * 1.1) / 24) * 100) / 100,
        totalFinanced: Math.round(principal * 1.1 * 100) / 100,
        isPromotionalZeroApr: false,
        preQualifyUrl: 'https://www.carecredit.com/apply?clinic=apex-dental',
      },
    ];
  }
}

export const treatmentPlanService = TreatmentPlanService.getInstance();
