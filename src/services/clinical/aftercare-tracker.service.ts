import fs from 'node:fs';
import path from 'node:path';

export interface AftercareMilestone {
  dayNumber: number;
  title: string;
  instructions: string[];
  vitalSignsCheckRequired?: boolean;
  medicationReminder?: string;
  dietRecommendation: string;
  warningSigns: string[];
  isCompleted: boolean;
}

export interface PatientDailySymptomLog {
  id: string;
  patientId: string;
  dayNumber: number;
  timestampIso: string;
  painScale: number; // 1 to 10
  bleedingLevel: 'none' | 'spotting' | 'moderate' | 'heavy';
  swellingLevel: 'none' | 'mild' | 'moderate' | 'severe';
  tookPrescribedMedication: boolean;
  notes?: string;
  isEmergencyEscalation: boolean;
  escalationReason?: string;
}

export interface ActiveAftercarePlan {
  planId: string;
  patientId: string;
  patientName: string;
  treatmentName: string;
  procedureDateIso: string;
  attendingDoctor: string;
  milestones: AftercareMilestone[];
  logs: PatientDailySymptomLog[];
  status: 'active' | 'completed' | 'escalated_to_doctor';
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const AFTERCARE_STORE_FILE = path.join(DATA_DIR, 'aftercare_plans_store.json');

export interface ClinicalTriageAlert {
  alertId: string;
  patientId: string;
  patientName: string;
  treatment: string;
  painScale: number;
  bleeding: string;
  timestampIso: string;
  status: 'pending_doctor_ack' | 'acknowledged' | 'escalated_to_secondary_oncall';
  acknowledgedByDoctor: boolean;
  acknowledgedBy?: string;
  acknowledgedAtIso?: string;
  timeoutMinutes: number;
  secondaryEscalationAtIso?: string;
}

export class AftercareTrackerService {
  private static instance: AftercareTrackerService;
  private plansMap: Map<string, ActiveAftercarePlan> = new Map();
  private criticalAlerts: ClinicalTriageAlert[] = [];

  private constructor() {
    this.ensureDataDir();
    this.loadData();
  }

  public static getInstance(): AftercareTrackerService {
    if (!AftercareTrackerService.instance) {
      AftercareTrackerService.instance = new AftercareTrackerService();
    }
    return AftercareTrackerService.instance;
  }

  private ensureDataDir(): void {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadData(): void {
    try {
      if (fs.existsSync(AFTERCARE_STORE_FILE)) {
        const raw = fs.readFileSync(AFTERCARE_STORE_FILE, 'utf8');
        const list: ActiveAftercarePlan[] = JSON.parse(raw);
        for (const plan of list) {
          this.plansMap.set(plan.patientId, plan);
        }
        return;
      }
    } catch (err) {
      console.warn('[AftercareTrackerService] Initializing aftercare plans store.');
    }

    // Seed sample plan for Sophia Martinez (Wisdom Tooth & Deep Cleaning)
    const seedPlan: ActiveAftercarePlan = {
      planId: 'plan-seed-01',
      patientId: 'pat-seed-01',
      patientName: 'Sophia Martinez',
      treatmentName: 'Surgical Extraction & Deep Periodontal Scaling',
      procedureDateIso: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      attendingDoctor: 'Dr. Sarah Jensen, DDS',
      milestones: [
        {
          dayNumber: 1,
          title: 'Day 1: Hemostasis & Clot Protection',
          instructions: [
            'Bite firmly on gauze pad for 45 minutes.',
            'DO NOT drink through a straw, spit vigorously, or smoke.',
            'Apply ice pack to cheek: 20 minutes on, 20 minutes off.',
          ],
          medicationReminder: 'Take 400mg Ibuprofen with food every 6 hours for inflammation control.',
          dietRecommendation: 'Cold soft foods only: Greek yogurt, smoothies (spoon only), applesauce.',
          warningSigns: ['Continuous bright red bleeding after changing gauze twice.'],
          isCompleted: true,
        },
        {
          dayNumber: 2,
          title: 'Day 2: Gentle Saltwater Rinsing & Tissue Soothing',
          instructions: [
            'Begin gentle warm saltwater rinses (1/2 tsp salt in 8oz warm water) after meals.',
            'Do not rinse vigorously—let water fall out of your mouth into sink.',
            'Keep head elevated with 2 pillows while resting.',
          ],
          dietRecommendation: 'Warm lukewarm soft foods: Scrambled eggs, mashed potatoes, lukewarm broth.',
          warningSigns: ['Fever over 101°F (38.3°C) or severe throbbing radiating to ear.'],
          isCompleted: false,
        },
        {
          dayNumber: 3,
          title: 'Day 3: Swelling Peak & Healing Transition',
          instructions: [
            'Switch from cold ice packs to warm moist washcloth compress to reduce jaw stiffness.',
            'Gently brush remaining teeth, carefully avoiding the direct surgical extraction site.',
          ],
          dietRecommendation: 'Soft pasta, oatmeal, soft steamed fish.',
          warningSigns: ['Sudden spike in sharp pain or foul taste/odor (possible dry socket).'],
          isCompleted: false,
        },
      ],
      logs: [
        {
          id: 'log-01',
          patientId: 'pat-seed-01',
          dayNumber: 1,
          timestampIso: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
          painScale: 4,
          bleedingLevel: 'spotting',
          swellingLevel: 'mild',
          tookPrescribedMedication: true,
          notes: 'Ice pack helped significantly, mild dull ache.',
          isEmergencyEscalation: false,
        },
      ],
      status: 'active',
    };

    this.plansMap.set(seedPlan.patientId, seedPlan);
    this.saveData();
  }

  private saveData(): void {
    try {
      const list = Array.from(this.plansMap.values());
      fs.writeFileSync(AFTERCARE_STORE_FILE, JSON.stringify(list, null, 2), 'utf8');
    } catch (err) {
      console.error('[AftercareTrackerService] Failed saving aftercare store:', err);
    }
  }

  public getPlanByPatientId(patientId: string): ActiveAftercarePlan | null {
    return this.plansMap.get(patientId) || null;
  }

  /**
   * Logs daily patient recovery metrics
   * Automatically trips emergency escalation if pain >= 7 or bleeding is heavy
   */
  public logDailyCheckin(params: {
    patientId: string;
    dayNumber: number;
    painScale: number;
    bleedingLevel: 'none' | 'spotting' | 'moderate' | 'heavy';
    swellingLevel: 'none' | 'mild' | 'moderate' | 'severe';
    tookPrescribedMedication: boolean;
    notes?: string;
  }): { log: PatientDailySymptomLog; alertTriggered: boolean; message: string } {
    let plan = this.plansMap.get(params.patientId);

    if (!plan) {
      // Auto-create standard recovery plan if none exists
      plan = {
        planId: `plan-${Date.now()}`,
        patientId: params.patientId,
        patientName: 'Valued Patient',
        treatmentName: 'General Dental Procedure',
        procedureDateIso: new Date().toISOString(),
        attendingDoctor: 'Dr. Sarah Jensen, DDS',
        milestones: [
          {
            dayNumber: 1,
            title: 'Day 1: Rest & Ice',
            instructions: ['Avoid hard chewing', 'Use ice compress as needed'],
            dietRecommendation: 'Soft foods',
            warningSigns: ['Severe unmanageable pain'],
            isCompleted: true,
          },
          {
            dayNumber: 2,
            title: 'Day 2: Saltwater Rinse',
            instructions: ['Gentle rinse with warm salt water'],
            dietRecommendation: 'Soft warm foods',
            warningSigns: ['Heavy bleeding'],
            isCompleted: false,
          },
        ],
        logs: [],
        status: 'active',
      };
      this.plansMap.set(params.patientId, plan);
    }

    const isEmergency = params.painScale >= 7 || params.bleedingLevel === 'heavy';
    let escalationReason: string | undefined;

    if (params.painScale >= 7) {
      escalationReason = `High pain level reported (${params.painScale}/10) requiring urgent clinical triage.`;
    } else if (params.bleedingLevel === 'heavy') {
      escalationReason = 'Heavy post-operative bleeding reported requiring immediate provider attention.';
    }

    const newLog: PatientDailySymptomLog = {
      id: `log-${Date.now()}`,
      patientId: params.patientId,
      dayNumber: params.dayNumber,
      timestampIso: new Date().toISOString(),
      painScale: params.painScale,
      bleedingLevel: params.bleedingLevel,
      swellingLevel: params.swellingLevel,
      tookPrescribedMedication: params.tookPrescribedMedication,
      notes: params.notes,
      isEmergencyEscalation: isEmergency,
      escalationReason,
    };

    plan.logs.push(newLog);

    // Mark milestone completed
    const milestone = plan.milestones.find((m) => m.dayNumber === params.dayNumber);
    if (milestone) {
      milestone.isCompleted = true;
    }

    if (isEmergency) {
      plan.status = 'escalated_to_doctor';
      const alert: ClinicalTriageAlert = {
        alertId: `alert-${Date.now()}`,
        patientId: params.patientId,
        patientName: plan.patientName,
        treatment: plan.treatmentName,
        painScale: params.painScale,
        bleeding: params.bleedingLevel,
        timestampIso: new Date().toISOString(),
        status: 'pending_doctor_ack',
        acknowledgedByDoctor: false,
        timeoutMinutes: 15,
      };
      this.criticalAlerts.unshift(alert);

      console.warn(
        `🚨 [CRITICAL AFTERCARE TRIAGE] Patient ${plan.patientName} logged Pain=${params.painScale}/10, Bleeding=${params.bleedingLevel}. Alerting Dr. Sarah Jensen.`
      );
    }

    this.saveData();

    return {
      log: newLog,
      alertTriggered: isEmergency,
      message: isEmergency
        ? '⚠️ Your symptom report indicates severe pain or bleeding. We have immediately notified Dr. Sarah Jensen and our on-call dental team will reach out within 15 minutes.'
        : '✅ Recovery check-in recorded! Your healing trajectory is progressing normally. Continue your saltwater rinses.',
    };
  }

  /**
   * Checks and updates alerts that exceeded acknowledgment timeout
   */
  public checkEscalationTimeouts(): number {
    const now = Date.now();
    let escalatedCount = 0;
    for (const alert of this.criticalAlerts) {
      if (!alert.acknowledgedByDoctor && alert.status === 'pending_doctor_ack') {
        const createdTime = new Date(alert.timestampIso).getTime();
        const elapsedMinutes = (now - createdTime) / (60 * 1000);
        if (elapsedMinutes >= alert.timeoutMinutes) {
          alert.status = 'escalated_to_secondary_oncall';
          alert.secondaryEscalationAtIso = new Date().toISOString();
          escalatedCount++;
          console.warn(
            `🚨 [ESCALATION TIMEOUT] Alert ${alert.alertId} for ${alert.patientName} unacknowledged after ${alert.timeoutMinutes}m! Escalating to Secondary On-Call Surgeon.`
          );
        }
      }
    }
    return escalatedCount;
  }

  public getCriticalAlerts(): ClinicalTriageAlert[] {
    this.checkEscalationTimeouts();
    return this.criticalAlerts;
  }

  public acknowledgeAlert(alertId: string, doctorName?: string): boolean {
    const alert = this.criticalAlerts.find((a) => a.alertId === alertId);
    if (alert) {
      alert.acknowledgedByDoctor = true;
      alert.status = 'acknowledged';
      alert.acknowledgedBy = doctorName || 'Dr. Sarah Jensen, DDS';
      alert.acknowledgedAtIso = new Date().toISOString();
      return true;
    }
    return false;
  }
}

export const aftercareTrackerService = AftercareTrackerService.getInstance();
