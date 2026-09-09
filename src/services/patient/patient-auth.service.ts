import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

export interface PatientUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  passwordHash?: string;
  salt?: string;
  authProvider: 'email' | 'google' | 'microsoft' | 'apple';
  providerId?: string;
  avatarUrl?: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  dateOfBirth?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  knownAllergies: string[];
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  emailVerified: boolean;
  createdAt: string;
  lastLoginAt: string;
  securityAuditLog: Array<{
    timestamp: string;
    action: string;
    ipAddress?: string;
    userAgent?: string;
    status: 'success' | 'warning' | 'failed';
  }>;
}

export interface PatientSessionPayload {
  patientId: string;
  email: string;
  fullName: string;
  role: 'patient';
  exp: number; // Unix timestamp in seconds
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const PATIENTS_STORE_FILE = path.join(DATA_DIR, 'patients_store.json');
const JWT_SECRET = process.env.PATIENT_JWT_SECRET || 'dental_patient_portal_secure_hmac_secret_2026_x89';

export class PatientAuthService {
  private static instance: PatientAuthService;
  private patients: Map<string, PatientUser> = new Map();

  private constructor() {
    this.ensureDataDirectory();
    this.loadPatients();
  }

  public static getInstance(): PatientAuthService {
    if (!PatientAuthService.instance) {
      PatientAuthService.instance = new PatientAuthService();
    }
    return PatientAuthService.instance;
  }

  private ensureDataDirectory(): void {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  /**
   * Hashes password using Node.js scrypt with a unique random salt
   */
  private hashPassword(password: string, salt: string): string {
    return crypto.scryptSync(password, salt, 64).toString('hex');
  }

  /**
   * Generates a signed session token using HMAC-SHA256
   */
  public generateSessionToken(patient: PatientUser): string {
    const payload: PatientSessionPayload = {
      patientId: patient.id,
      email: patient.email,
      fullName: patient.fullName,
      role: 'patient',
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days expiration
    };

    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${header}.${body}`)
      .digest('base64url');

    return `${header}.${body}.${signature}`;
  }

  /**
   * Verifies signed token and extracts patient payload
   */
  public verifySessionToken(token: string): PatientSessionPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const [header, body, signature] = parts;
      const expectedSignature = crypto
        .createHmac('sha256', JWT_SECRET)
        .update(`${header}.${body}`)
        .digest('base64url');

      if (signature !== expectedSignature) return null;

      const payload: PatientSessionPayload = JSON.parse(
        Buffer.from(body, 'base64url').toString('utf8')
      );

      if (payload.exp < Math.floor(Date.now() / 1000)) {
        return null; // Expired token
      }

      return payload;
    } catch {
      return null;
    }
  }

  /**
   * Loads patient data from disk or seeds default realistic patients
   */
  private loadPatients(): void {
    try {
      if (fs.existsSync(PATIENTS_STORE_FILE)) {
        const raw = fs.readFileSync(PATIENTS_STORE_FILE, 'utf8');
        const list: PatientUser[] = JSON.parse(raw);
        for (const p of list) {
          this.patients.set(p.id, p);
        }
        return;
      }
    } catch (err) {
      console.warn('[PatientAuth] Failed reading patients store, initializing seeded database.');
    }

    // Seed realistic demo patient accounts with hashed passwords (Default: 'Patient123!')
    const seedPatients: PatientUser[] = [
      {
        id: 'pat-sophia-01',
        fullName: 'Sophia Martinez',
        email: 'sophia@example.com',
        phone: '+1 (555) 234-5678',
        salt: '9f2b8c7e1a3d5e4f',
        passwordHash: this.hashPassword('Patient123!', '9f2b8c7e1a3d5e4f'),
        authProvider: 'email',
        avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
        insuranceProvider: 'Delta Dental Premier PPO',
        insurancePolicyNumber: 'DD-98234-NY',
        dateOfBirth: '1992-04-14',
        emergencyContact: {
          name: 'Carlos Martinez',
          phone: '+1 (555) 345-6789',
          relationship: 'Spouse',
        },
        knownAllergies: ['Penicillin', 'Latex'],
        twoFactorEnabled: false,
        emailVerified: true,
        createdAt: '2025-11-12T10:00:00.000Z',
        lastLoginAt: new Date().toISOString(),
        securityAuditLog: [
          {
            timestamp: new Date().toISOString(),
            action: 'Patient session authenticated (Demo Seed)',
            ipAddress: '127.0.0.1',
            status: 'success',
          },
        ],
      },
      {
        id: 'pat-liam-02',
        fullName: 'Liam Vance',
        email: 'liam@example.com',
        phone: '+44 7700 900551',
        salt: '4e6a8b2c1d3f5g7h',
        passwordHash: this.hashPassword('Patient123!', '4e6a8b2c1d3f5g7h'),
        authProvider: 'google',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        insuranceProvider: 'Bupa Global Dental',
        insurancePolicyNumber: 'BUPA-UK-7721',
        dateOfBirth: '1987-09-22',
        emergencyContact: {
          name: 'Rachel Vance',
          phone: '+44 7700 900552',
          relationship: 'Partner',
        },
        knownAllergies: ['None Reported'],
        twoFactorEnabled: true,
        emailVerified: true,
        createdAt: '2025-12-05T14:30:00.000Z',
        lastLoginAt: new Date().toISOString(),
        securityAuditLog: [
          {
            timestamp: new Date().toISOString(),
            action: 'Google SSO Authentication verified',
            ipAddress: '127.0.0.1',
            status: 'success',
          },
        ],
      },
      {
        id: 'pat-chloe-03',
        fullName: 'Chloe Bennett',
        email: 'chloe@example.com',
        phone: '+44 7700 900882',
        salt: '8c1d3e5f7a9b2c4d',
        passwordHash: this.hashPassword('Patient123!', '8c1d3e5f7a9b2c4d'),
        authProvider: 'apple',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        insuranceProvider: 'AXA Health Dental Core',
        insurancePolicyNumber: 'AXA-DENT-4019',
        dateOfBirth: '1995-01-30',
        emergencyContact: {
          name: 'Eleanor Bennett',
          phone: '+44 7700 900883',
          relationship: 'Mother',
        },
        knownAllergies: ['Codeine'],
        twoFactorEnabled: false,
        emailVerified: true,
        createdAt: '2026-01-18T09:15:00.000Z',
        lastLoginAt: new Date().toISOString(),
        securityAuditLog: [
          {
            timestamp: new Date().toISOString(),
            action: 'Apple ID OAuth sign-in completed',
            ipAddress: '127.0.0.1',
            status: 'success',
          },
        ],
      },
    ];

    for (const p of seedPatients) {
      this.patients.set(p.id, p);
    }
    this.savePatients();
  }

  private savePatients(): void {
    try {
      const list = Array.from(this.patients.values());
      fs.writeFileSync(PATIENTS_STORE_FILE, JSON.stringify(list, null, 2), 'utf8');
    } catch (err) {
      console.error('[PatientAuth] Error persisting patients to disk:', err);
    }
  }

  /**
   * Registers a new patient account with strong password hashing
   */
  public register(params: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    insuranceProvider?: string;
    insurancePolicyNumber?: string;
    knownAllergies?: string[];
  }): { success: boolean; user?: PatientUser; token?: string; error?: string } {
    const emailNorm = params.email.trim().toLowerCase();
    
    // Check if email already exists
    for (const p of this.patients.values()) {
      if (p.email.toLowerCase() === emailNorm) {
        return { success: false, error: 'An account with this email already exists.' };
      }
    }

    if (params.password.length < 8) {
      return { success: false, error: 'Password must be at least 8 characters.' };
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = this.hashPassword(params.password, salt);
    const newId = `pat-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;

    const newPatient: PatientUser = {
      id: newId,
      fullName: params.fullName.trim(),
      email: emailNorm,
      phone: params.phone.trim(),
      salt,
      passwordHash,
      authProvider: 'email',
      insuranceProvider: params.insuranceProvider || 'Self-Pay / Private',
      insurancePolicyNumber: params.insurancePolicyNumber || 'N/A',
      knownAllergies: params.knownAllergies || ['None Reported'],
      twoFactorEnabled: false,
      emailVerified: true,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      securityAuditLog: [
        {
          timestamp: new Date().toISOString(),
          action: 'New patient registered via secure email auth',
          ipAddress: '127.0.0.1',
          status: 'success',
        },
      ],
    };

    this.patients.set(newId, newPatient);
    this.savePatients();

    const token = this.generateSessionToken(newPatient);
    return { success: true, user: this.sanitizePatient(newPatient), token };
  }

  /**
   * Authenticates patient with email and password
   */
  public login(
    email: string,
    password: string,
    ipAddress = '127.0.0.1'
  ): { success: boolean; user?: PatientUser; token?: string; error?: string } {
    const emailNorm = email.trim().toLowerCase();
    let foundPatient: PatientUser | null = null;

    for (const p of this.patients.values()) {
      if (p.email.toLowerCase() === emailNorm) {
        foundPatient = p;
        break;
      }
    }

    if (!foundPatient) {
      return { success: false, error: 'Invalid email or password.' };
    }

    if (!foundPatient.passwordHash || !foundPatient.salt) {
      return {
        success: false,
        error: `This account was registered using ${foundPatient.authProvider}. Please sign in with ${foundPatient.authProvider}.`,
      };
    }

    const calculatedHash = this.hashPassword(password, foundPatient.salt);
    if (calculatedHash !== foundPatient.passwordHash) {
      foundPatient.securityAuditLog.unshift({
        timestamp: new Date().toISOString(),
        action: 'Failed password attempt',
        ipAddress,
        status: 'failed',
      });
      this.savePatients();
      return { success: false, error: 'Invalid email or password.' };
    }

    foundPatient.lastLoginAt = new Date().toISOString();
    foundPatient.securityAuditLog.unshift({
      timestamp: new Date().toISOString(),
      action: 'Successful patient login',
      ipAddress,
      status: 'success',
    });
    if (foundPatient.securityAuditLog.length > 25) {
      foundPatient.securityAuditLog.pop();
    }
    this.savePatients();

    const token = this.generateSessionToken(foundPatient);
    return { success: true, user: this.sanitizePatient(foundPatient), token };
  }

  /**
   * Handles OAuth login for Google, Microsoft, and Apple
   */
  public oauthLogin(params: {
    provider: 'google' | 'microsoft' | 'apple';
    email: string;
    fullName?: string;
    avatarUrl?: string;
    providerId?: string;
    ipAddress?: string;
  }): { success: boolean; user: PatientUser; token: string; isNewAccount: boolean } {
    const emailNorm = params.email.trim().toLowerCase();
    let existingPatient: PatientUser | null = null;

    for (const p of this.patients.values()) {
      if (p.email.toLowerCase() === emailNorm) {
        existingPatient = p;
        break;
      }
    }

    if (existingPatient) {
      // Existing patient logged in via provider
      existingPatient.lastLoginAt = new Date().toISOString();
      if (params.avatarUrl && !existingPatient.avatarUrl) {
        existingPatient.avatarUrl = params.avatarUrl;
      }
      existingPatient.securityAuditLog.unshift({
        timestamp: new Date().toISOString(),
        action: `OAuth sign-in verified via ${params.provider.toUpperCase()}`,
        ipAddress: params.ipAddress || '127.0.0.1',
        status: 'success',
      });
      this.savePatients();

      const token = this.generateSessionToken(existingPatient);
      return { success: true, user: this.sanitizePatient(existingPatient), token, isNewAccount: false };
    }

    // New patient account auto-provisioned via OAuth
    const newId = `pat-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    const newPatient: PatientUser = {
      id: newId,
      fullName: params.fullName || emailNorm.split('@')[0],
      email: emailNorm,
      phone: '+1 (555) 000-0000',
      authProvider: params.provider,
      providerId: params.providerId || `prov-${Date.now()}`,
      avatarUrl: params.avatarUrl,
      insuranceProvider: 'Pending Verification',
      insurancePolicyNumber: 'Pending',
      knownAllergies: ['None Reported'],
      twoFactorEnabled: false,
      emailVerified: true,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      securityAuditLog: [
        {
          timestamp: new Date().toISOString(),
          action: `Account created via ${params.provider.toUpperCase()} Single Sign-On`,
          ipAddress: params.ipAddress || '127.0.0.1',
          status: 'success',
        },
      ],
    };

    this.patients.set(newId, newPatient);
    this.savePatients();

    const token = this.generateSessionToken(newPatient);
    return { success: true, user: this.sanitizePatient(newPatient), token, isNewAccount: true };
  }

  /**
   * Retrieves sanitized patient by ID
   */
  public getPatientById(id: string): PatientUser | null {
    const p = this.patients.get(id);
    return p ? this.sanitizePatient(p) : null;
  }

  /**
   * Retrieves internal patient record including security logs (for doctor review)
   */
  public getDoctorPatientView(id: string): PatientUser | null {
    const p = this.patients.get(id);
    if (!p) return null;
    const sanitized = this.sanitizePatient(p);
    sanitized.securityAuditLog = p.securityAuditLog;
    return sanitized;
  }

  /**
   * Toggles Two-Factor Authentication state
   */
  public toggle2FA(patientId: string, enabled: boolean): { success: boolean; twoFactorEnabled: boolean } {
    const patient = this.patients.get(patientId);
    if (!patient) return { success: false, twoFactorEnabled: false };

    patient.twoFactorEnabled = enabled;
    patient.securityAuditLog.unshift({
      timestamp: new Date().toISOString(),
      action: enabled ? 'Two-Factor Authentication enabled' : 'Two-Factor Authentication disabled',
      status: 'warning',
    });
    this.savePatients();
    return { success: true, twoFactorEnabled: enabled };
  }

  /**
   * Strips sensitive cryptographic credentials before returning to client
   */
  private sanitizePatient(patient: PatientUser): PatientUser {
    const copy = { ...patient };
    delete copy.passwordHash;
    delete copy.salt;
    delete copy.twoFactorSecret;
    return copy;
  }
}

export const patientAuthService = PatientAuthService.getInstance();
