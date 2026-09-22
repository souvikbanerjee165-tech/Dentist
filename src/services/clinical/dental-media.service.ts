import fs from 'node:fs';
import path from 'node:path';

export interface DentalImagingRecord {
  id: string;
  patientId: string;
  category: 'xray_bitewing' | 'xray_panoramic' | 'intraoral_photo' | 'smile_design_3d' | 'before_after';
  title: string;
  dateTakenIso: string;
  primaryImageUrl: string;
  comparisonBeforeUrl?: string; // For before/after slider
  teethNumbers?: number[];     // Universal numbering system 1-32
  doctorClinicalNotes: string;
  findings: string;
  isSharedWithPatient: boolean;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const MEDIA_STORE_FILE = path.join(DATA_DIR, 'dental_media_store.json');

export class DentalMediaService {
  private static instance: DentalMediaService;
  private mediaList: DentalImagingRecord[] = [];

  private constructor() {
    this.ensureDataDir();
    this.loadData();
  }

  public static getInstance(): DentalMediaService {
    if (!DentalMediaService.instance) {
      DentalMediaService.instance = new DentalMediaService();
    }
    return DentalMediaService.instance;
  }

  private ensureDataDir(): void {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadData(): void {
    try {
      if (fs.existsSync(MEDIA_STORE_FILE)) {
        const raw = fs.readFileSync(MEDIA_STORE_FILE, 'utf8');
        this.mediaList = JSON.parse(raw);
        return;
      }
    } catch (err) {
      console.warn('[DentalMediaService] Initializing dental media store.');
    }

    // Seed realistic records for demo patient
    this.mediaList = [
      {
        id: 'img-01',
        patientId: 'pat-seed-01',
        category: 'before_after',
        title: 'Cosmetic Laser Whitening & Enamel Micro-Abrasion',
        dateTakenIso: '2026-08-15T14:30:00.000Z',
        primaryImageUrl: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&auto=format&fit=crop&q=80',
        comparisonBeforeUrl: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800&auto=format&fit=crop&q=80',
        teethNumbers: [6, 7, 8, 9, 10, 11],
        doctorClinicalNotes: 'Completed in-office laser whitening (4x 15min cycles). Shade progressed from A3.5 to B1.',
        findings: 'Dramatic 8-shade brightening, no cervical sensitivity reported.',
        isSharedWithPatient: true,
      },
      {
        id: 'img-02',
        patientId: 'pat-seed-01',
        category: 'xray_bitewing',
        title: 'Right Posterior Digital Bitewings (Teeth #2–#4, #30–#31)',
        dateTakenIso: '2026-08-01T09:15:00.000Z',
        primaryImageUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&auto=format&fit=crop&q=80',
        teethNumbers: [2, 3, 4, 30, 31],
        doctorClinicalNotes: 'Low-dose sensor imaging. No recurrent decay detected under existing restorations.',
        findings: 'Normal alveolar crest height, intact periodontal ligament space.',
        isSharedWithPatient: true,
      },
      {
        id: 'img-03',
        patientId: 'pat-seed-01',
        category: 'smile_design_3d',
        title: '3D Aesthetic Smile Mockup (Digital Smile Design)',
        dateTakenIso: '2026-08-20T11:00:00.000Z',
        primaryImageUrl: 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=800&auto=format&fit=crop&q=80',
        teethNumbers: [7, 8, 9, 10],
        doctorClinicalNotes: 'Virtual wax-up simulating 4 minimal-prep porcelain veneers on maxillary anterior teeth.',
        findings: 'Golden proportion symmetry achieved with balanced incisal edge curve.',
        isSharedWithPatient: true,
      },
    ];

    this.saveData();
  }

  private saveData(): void {
    try {
      fs.writeFileSync(MEDIA_STORE_FILE, JSON.stringify(this.mediaList, null, 2), 'utf8');
    } catch (err) {
      console.error('[DentalMediaService] Failed saving dental media store:', err);
    }
  }

  public getMediaForPatient(patientId: string): DentalImagingRecord[] {
    return this.mediaList.filter((m) => m.patientId === patientId && m.isSharedWithPatient);
  }

  public publishMedia(record: Omit<DentalImagingRecord, 'id'>): DentalImagingRecord {
    const full: DentalImagingRecord = {
      ...record,
      id: `img-${Date.now()}`,
    };
    this.mediaList.unshift(full);
    this.saveData();
    return full;
  }
}

export const dentalMediaService = DentalMediaService.getInstance();
