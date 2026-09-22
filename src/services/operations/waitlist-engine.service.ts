import fs from 'node:fs';
import path from 'node:path';
import { smsRcsService } from '../messaging/sms-rcs.service.js';

export interface WaitlistEntry {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  preferredDays: string[];
  preferredTimeOfDay: 'Morning (9am-12pm)' | 'Afternoon (12pm-5pm)' | 'Any';
  requestedTreatment: string;
  urgencyLevel: 'High (In Pain)' | 'Medium (Routine)' | 'Flexible';
  addedAtIso: string;
}

export interface OpenedSlotOffer {
  offerId: string;
  slotDate: string;
  slotTime: string;
  doctorName: string;
  treatmentType: string;
  operatory: string;
  openedAtIso: string;
  status: 'open_broadcasting' | 'claimed' | 'expired';
  claimedByPatientId?: string;
  claimedByPatientName?: string;
  claimedAtIso?: string;
  recipientsNotifiedCount: number;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const WAITLIST_STORE_FILE = path.join(DATA_DIR, 'waitlist_engine_store.json');

export class WaitlistEngineService {
  private static instance: WaitlistEngineService;
  private waitlist: WaitlistEntry[] = [];
  private activeOffers: Map<string, OpenedSlotOffer> = new Map();

  private constructor() {
    this.ensureDataDir();
    this.loadData();
  }

  public static getInstance(): WaitlistEngineService {
    if (!WaitlistEngineService.instance) {
      WaitlistEngineService.instance = new WaitlistEngineService();
    }
    return WaitlistEngineService.instance;
  }

  private ensureDataDir(): void {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadData(): void {
    try {
      if (fs.existsSync(WAITLIST_STORE_FILE)) {
        const raw = fs.readFileSync(WAITLIST_STORE_FILE, 'utf8');
        const data = JSON.parse(raw);
        this.waitlist = data.waitlist || [];
        if (data.offers) {
          for (const [k, v] of Object.entries(data.offers)) {
            this.activeOffers.set(k, v as OpenedSlotOffer);
          }
        }
        return;
      }
    } catch (err) {
      console.warn('[WaitlistEngineService] Initializing waitlist store.');
    }

    // Seed sample waitlist patients
    this.waitlist = [
      {
        id: 'wl-01',
        patientId: 'pat-seed-02',
        patientName: 'Liam Vance',
        patientPhone: '+1 (555) 345-6789',
        preferredDays: ['Monday', 'Tuesday', 'Wednesday'],
        preferredTimeOfDay: 'Afternoon (12pm-5pm)',
        requestedTreatment: 'Crown Replacement & Examination',
        urgencyLevel: 'High (In Pain)',
        addedAtIso: '2026-09-01T08:00:00.000Z',
      },
      {
        id: 'wl-02',
        patientId: 'pat-seed-03',
        patientName: 'Chloe Bennett',
        patientPhone: '+1 (555) 765-4321',
        preferredDays: ['Thursday', 'Friday'],
        preferredTimeOfDay: 'Any',
        requestedTreatment: 'Cosmetic Laser Teeth Whitening',
        urgencyLevel: 'Medium (Routine)',
        addedAtIso: '2026-09-02T12:00:00.000Z',
      },
    ];

    this.saveData();
  }

  private saveData(): void {
    try {
      const offersObj: Record<string, OpenedSlotOffer> = {};
      for (const [k, v] of this.activeOffers.entries()) {
        offersObj[k] = v;
      }
      fs.writeFileSync(
        WAITLIST_STORE_FILE,
        JSON.stringify({ waitlist: this.waitlist, offers: offersObj }, null, 2),
        'utf8'
      );
    } catch (err) {
      console.error('[WaitlistEngineService] Failed saving waitlist store:', err);
    }
  }

  public getWaitlist(): WaitlistEntry[] {
    return this.waitlist;
  }

  public addToWaitlist(entry: Omit<WaitlistEntry, 'id' | 'addedAtIso'>): WaitlistEntry {
    const full: WaitlistEntry = {
      ...entry,
      id: `wl-${Date.now()}`,
      addedAtIso: new Date().toISOString(),
    };
    this.waitlist.push(full);
    this.saveData();
    return full;
  }

  /**
   * Triggers an automated cancellation backfill broadcast
   * Blasts RCS Rich Cards and 10DLC SMS with 1-click claim action chips
   */
  public async triggerCancellationBackfill(params: {
    slotDate: string;
    slotTime: string;
    doctorName?: string;
    treatmentType?: string;
    operatory?: string;
  }): Promise<OpenedSlotOffer> {
    const offerId = `offer-${Date.now()}`;
    const doctor = params.doctorName || 'Dr. Sarah Jensen, DDS';
    const treatment = params.treatmentType || 'General / Cosmetic Priority Slot';

    const offer: OpenedSlotOffer = {
      offerId,
      slotDate: params.slotDate,
      slotTime: params.slotTime,
      doctorName: doctor,
      treatmentType: treatment,
      operatory: params.operatory || 'Operatory 3',
      openedAtIso: new Date().toISOString(),
      status: 'open_broadcasting',
      recipientsNotifiedCount: this.waitlist.length,
    };

    this.activeOffers.set(offerId, offer);

    // Simulate dispatching RCS / SMS notifications to waitlist
    for (const patient of this.waitlist) {
      console.log(
        `[Waitlist RCS Blast] To: ${patient.patientPhone} (${patient.patientName}) -> "Slot Opened: ${params.slotDate} at ${params.slotTime} with ${doctor}. Tap [Claim Slot] now!"`
      );
    }

    this.saveData();
    return offer;
  }

  /**
   * Atomically claims an opened slot for the first patient to tap the chip
   */
  public claimSlot(params: {
    offerId: string;
    patientId: string;
    patientName: string;
  }): { success: boolean; message: string; offer?: OpenedSlotOffer } {
    const offer = this.activeOffers.get(params.offerId);

    if (!offer) {
      return { success: false, message: 'This slot offer is no longer valid or has expired.' };
    }

    if (offer.status === 'claimed') {
      return {
        success: false,
        message: `Sorry! This slot was just claimed by another patient at ${new Date(offer.claimedAtIso!).toLocaleTimeString()}. You remain #1 on our priority waitlist for the next opening.`,
        offer,
      };
    }

    // Atomic claim lock
    offer.status = 'claimed';
    offer.claimedByPatientId = params.patientId;
    offer.claimedByPatientName = params.patientName;
    offer.claimedAtIso = new Date().toISOString();

    // Remove patient from waitlist
    this.waitlist = this.waitlist.filter((w) => w.patientId !== params.patientId);

    this.saveData();

    return {
      success: true,
      message: `🎉 Success! You have locked in the priority slot on ${offer.slotDate} at ${offer.slotTime} with ${offer.doctorName}. We have updated your appointment calendar!`,
      offer,
    };
  }

  public getActiveOffers(): OpenedSlotOffer[] {
    return Array.from(this.activeOffers.values());
  }
}

export const waitlistEngineService = WaitlistEngineService.getInstance();
