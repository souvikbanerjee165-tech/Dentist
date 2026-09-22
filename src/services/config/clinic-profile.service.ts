import fs from 'node:fs';
import path from 'node:path';

export interface ClinicProvider {
  id: string;
  name: string;
  title: string;
  credentials: string; // e.g. 'DDS', 'DMD', 'RDH'
  photoUrl: string;
  bio: string;
  npiNumber?: string;
  active: boolean;
}

export interface ClinicOperatory {
  id: string;
  name: string;
  roomNumber: string;
  specialty: string;
  active: boolean;
}

export interface ClinicColors {
  primary: string;       // e.g. '#2563eb'
  secondary: string;     // e.g. '#0891b2'
  accent: string;        // e.g. '#10b981'
  brandDark: string;     // e.g. '#0f172a'
}

export interface ClinicContact {
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
  googlePlaceId?: string;
  googleReviewUrl?: string;
  emergencyPhone?: string;
}

export interface ClinicTelephony {
  provider: 'telnyx' | 'twilio';
  accountSid: string;
  authToken: string;
  fromPhoneNumber: string;
  messagingProfileId?: string;
}

export interface ClinicBillingConfig {
  stripeAccountId?: string;
  stripePublishableKey?: string;
  currency: string;
}

export interface ClinicProfileConfig {
  clinicId: string;
  name: string;
  legalBusinessName: string;
  tagline: string;
  logoUrl: string;
  faviconUrl: string;
  colors: ClinicColors;
  contact: ClinicContact;
  providers: ClinicProvider[];
  operatories: ClinicOperatory[];
  telephony: ClinicTelephony;
  billing: ClinicBillingConfig;
  businessHours: Record<string, { open: string; close: string; isClosed: boolean }>;
  onboardingStatus: 'configured' | 'pending';
  lastUpdatedIso: string;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const CONFIG_FILE = path.join(DATA_DIR, 'clinic_profile_store.json');

export class ClinicProfileService {
  private static instance: ClinicProfileService;
  private currentConfig!: ClinicProfileConfig;

  private constructor() {
    this.ensureDataDir();
    this.loadConfig();
  }

  public static getInstance(): ClinicProfileService {
    if (!ClinicProfileService.instance) {
      ClinicProfileService.instance = new ClinicProfileService();
    }
    return ClinicProfileService.instance;
  }

  private ensureDataDir(): void {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private getDefaultConfig(): ClinicProfileConfig {
    return {
      clinicId: 'clinic_apex_01',
      name: 'Apex Dental & Aesthetics',
      legalBusinessName: 'Apex Dental Partners, LLC',
      tagline: 'Modern, Gentle & Tech-Forward Dentistry in Manhattan',
      logoUrl: '/images/dentist_doctor.jpg',
      faviconUrl: '/favicon.ico',
      colors: {
        primary: '#2563eb',     // Royal Blue
        secondary: '#0891b2',   // Cyan
        accent: '#10b981',      // Emerald
        brandDark: '#0b1120',   // Midnight Slate
      },
      contact: {
        address: '450 Lexington Ave, Suite 800',
        city: 'New York',
        state: 'NY',
        zip: '10017',
        phone: '+1 (555) 234-5678',
        email: 'appointments@apexdental.com',
        googlePlaceId: 'ChIJ4zY1X-BZwokRFmycw8',
        googleReviewUrl: 'https://g.page/r/apex-dental/review',
        emergencyPhone: '+1 (555) 234-9911',
      },
      providers: [
        {
          id: 'prov-01',
          name: 'Dr. Sarah Jensen',
          title: 'Lead Cosmetic & Restorative Dentist',
          credentials: 'DDS, FAGD',
          photoUrl: '/images/dentist_doctor.jpg',
          bio: 'Columbia University School of Dental Medicine graduate with 12+ years specializing in aesthetic smile design and pain-free restorative care.',
          npiNumber: '1982736450',
          active: true,
        },
        {
          id: 'prov-02',
          name: 'Dr. Marcus Vance',
          title: 'Oral & Maxillofacial Surgeon',
          credentials: 'DMD, MD',
          photoUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&auto=format&fit=crop&q=80',
          bio: 'Dual-degree surgeon with fellowship training in complex implants, bone grafting, and gentle sedation procedures.',
          npiNumber: '1249876531',
          active: true,
        },
      ],
      operatories: [
        { id: 'op-01', name: 'Operatory 1', roomNumber: 'Room 101', specialty: 'Hygiene & Cleanings', active: true },
        { id: 'op-02', name: 'Operatory 2', roomNumber: 'Room 102', specialty: 'Restorative & Endodontics', active: true },
        { id: 'op-03', name: 'Operatory 3', roomNumber: 'Room 103', specialty: 'Aesthetic Laser & Surgical Suite', active: true },
        { id: 'op-04', name: 'Operatory 4', roomNumber: 'Room 104', specialty: 'Emergency & Consultation', active: true },
      ],
      telephony: {
        provider: 'telnyx',
        accountSid: 'KEY0184A918B744_DEMO',
        authToken: 'c8f041b3d76e4811a221f7e',
        fromPhoneNumber: '+18005550199',
        messagingProfileId: 'msg_prof_4981a',
      },
      billing: {
        stripeAccountId: 'acct_1NvDentalApexDemo',
        stripePublishableKey: 'pk_live_51NvDentalDemoKey99',
        currency: 'USD',
      },
      businessHours: {
        monday: { open: '08:00', close: '18:00', isClosed: false },
        tuesday: { open: '08:00', close: '18:00', isClosed: false },
        wednesday: { open: '08:00', close: '18:00', isClosed: false },
        thursday: { open: '08:00', close: '19:00', isClosed: false },
        friday: { open: '08:00', close: '16:00', isClosed: false },
        saturday: { open: '09:00', close: '14:00', isClosed: false },
        sunday: { open: '00:00', close: '00:00', isClosed: true },
      },
      onboardingStatus: 'configured',
      lastUpdatedIso: new Date().toISOString(),
    };
  }

  private loadConfig(): void {
    try {
      if (fs.existsSync(CONFIG_FILE)) {
        const raw = fs.readFileSync(CONFIG_FILE, 'utf8');
        this.currentConfig = JSON.parse(raw);
        return;
      }
    } catch (err) {
      console.warn('[ClinicProfileService] Initializing default clinic profile.');
    }

    this.currentConfig = this.getDefaultConfig();
    this.saveConfig();
  }

  private saveConfig(): void {
    try {
      this.currentConfig.lastUpdatedIso = new Date().toISOString();
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(this.currentConfig, null, 2), 'utf8');
    } catch (err) {
      console.error('[ClinicProfileService] Failed saving clinic profile:', err);
    }
  }

  public getConfig(): ClinicProfileConfig {
    return this.currentConfig;
  }

  public updateConfig(partial: Partial<ClinicProfileConfig>): ClinicProfileConfig {
    this.currentConfig = {
      ...this.currentConfig,
      ...partial,
      colors: {
        ...this.currentConfig.colors,
        ...(partial.colors || {}),
      },
      contact: {
        ...this.currentConfig.contact,
        ...(partial.contact || {}),
      },
      telephony: {
        ...this.currentConfig.telephony,
        ...(partial.telephony || {}),
      },
      billing: {
        ...this.currentConfig.billing,
        ...(partial.billing || {}),
      },
      businessHours: {
        ...this.currentConfig.businessHours,
        ...(partial.businessHours || {}),
      },
      onboardingStatus: 'configured',
      lastUpdatedIso: new Date().toISOString(),
    };

    if (partial.providers) {
      this.currentConfig.providers = partial.providers;
    }
    if (partial.operatories) {
      this.currentConfig.operatories = partial.operatories;
    }

    this.saveConfig();
    return this.currentConfig;
  }

  public getProfile(): ClinicProfileConfig {
    return this.getConfig();
  }

  public updateProfile(partial: Partial<ClinicProfileConfig>): ClinicProfileConfig {
    return this.updateConfig(partial);
  }

  public getBrandingCssVariables(): Record<string, string> {
    const c = this.currentConfig.colors;
    return {
      '--brand-primary': c.primary,
      '--brand-secondary': c.secondary,
      '--brand-accent': c.accent,
      '--brand-dark': c.brandDark,
    };
  }

  public resetToDefault(): ClinicProfileConfig {
    this.currentConfig = this.getDefaultConfig();
    this.saveConfig();
    return this.currentConfig;
  }
}

export const clinicProfileService = ClinicProfileService.getInstance();

