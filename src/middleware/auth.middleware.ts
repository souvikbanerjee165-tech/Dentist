import crypto from 'node:crypto';
import { Request, Response, NextFunction } from 'express';
import { patientAuthService, PatientSessionPayload } from '../services/patient/patient-auth.service.js';
import { ADMIN_SECRET, STAFF_SECRET } from '../config/security-secrets.js';

export { ADMIN_SECRET, STAFF_SECRET };

// In-memory cache for webhook replay prevention (5-minute TTL)
const processedWebhookIds = new Map<string, number>();

// Clean up expired webhook IDs every 2 minutes
setInterval(() => {
  const now = Date.now();
  for (const [id, timestamp] of processedWebhookIds.entries()) {
    if (now - timestamp > 5 * 60 * 1000) {
      processedWebhookIds.delete(id);
    }
  }
}, 2 * 60 * 1000).unref();

export interface StaffSessionPayload {
  staffId: string;
  role: 'doctor' | 'staff' | 'admin';
  name: string;
}

declare global {
  namespace Express {
    interface Request {
      patient?: PatientSessionPayload;
      staff?: StaffSessionPayload;
      isAdmin?: boolean;
    }
  }
}

/**
 * Middleware: Enforces valid patient session token
 */
export function requirePatientAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Authentication required. Please log in.',
    });
  }

  const token = authHeader.split(' ')[1];
  const payload = patientAuthService.verifySessionToken(token);

  if (!payload) {
    return res.status(401).json({
      success: false,
      error: 'TokenExpired',
      message: 'Session has expired or token is invalid. Please log in again.',
    });
  }

  req.patient = payload;
  next();
}

/**
 * Middleware: Enforces staff or doctor authorization (or admin)
 */
export function requireStaffOrDoctorAuth(req: Request, res: Response, next: NextFunction) {
  const apiKey = req.headers['x-staff-key'] || req.headers['x-admin-key'];
  const authHeader = req.headers.authorization;

  // Check static or environment staff API key
  if (apiKey) {
    const keyStr = String(apiKey);
    const isValidStaff = keyStr === STAFF_SECRET || keyStr === ADMIN_SECRET;
    if (isValidStaff) {
      req.staff = { staffId: 'staff-sys-01', role: 'doctor', name: 'Dr. Sarah Jensen, DDS' };
      return next();
    }
  }

  // Check Bearer token if staff JWT was supplied
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    if (token === STAFF_SECRET || token === ADMIN_SECRET) {
      req.staff = { staffId: 'staff-sys-01', role: 'doctor', name: 'Dr. Sarah Jensen, DDS' };
      return next();
    }
  }

  return res.status(403).json({
    success: false,
    error: 'Forbidden',
    message: 'Clinical staff or doctor authorization required to access this endpoint.',
  });
}

/**
 * Middleware: Enforces clinic administrator privileges
 */
export function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  const adminKey = req.headers['x-admin-key'] || (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : undefined);

  if (!adminKey || adminKey !== ADMIN_SECRET) {
    return res.status(403).json({
      success: false,
      error: 'Forbidden',
      message: 'Super-admin privileges required to modify clinic configurations.',
    });
  }

  req.isAdmin = true;
  next();
}

/**
 * Middleware: Enforces that the caller is either the patient themselves OR an authorized staff member
 */
export function requirePatientOwnerOrStaff(req: Request, res: Response, next: NextFunction) {
  const targetPatientId = req.params.patientId || req.params.id || req.body?.patientId;

  // 1. Check if authenticated staff
  const apiKey = req.headers['x-staff-key'] || req.headers['x-admin-key'];
  if (apiKey && (apiKey === STAFF_SECRET || apiKey === ADMIN_SECRET)) {
    req.staff = { staffId: 'staff-sys-01', role: 'doctor', name: 'Dr. Sarah Jensen, DDS' };
    return next();
  }

  // 2. Check if authenticated patient and matches target patientId
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    if (token === STAFF_SECRET || token === ADMIN_SECRET) {
      req.staff = { staffId: 'staff-sys-01', role: 'doctor', name: 'Dr. Sarah Jensen, DDS' };
      return next();
    }

    const payload = patientAuthService.verifySessionToken(token);
    if (payload) {
      req.patient = payload;
      if (!targetPatientId || payload.patientId === targetPatientId) {
        return next();
      }
    }
  }

  return res.status(403).json({
    success: false,
    error: 'AccessDenied',
    message: 'You are not authorized to view or modify this patient record.',
  });
}

/**
 * Middleware: Prevents webhook replay attacks by checking unique event/message ID
 */
export function preventWebhookReplay(req: Request, res: Response, next: NextFunction) {
  const eventId =
    (req.headers['x-webhook-id'] as string) ||
    req.body?.id ||
    req.body?.data?.id ||
    req.body?.entry?.[0]?.id ||
    req.body?.messageId;

  if (eventId) {
    if (processedWebhookIds.has(eventId)) {
      console.warn(`[ReplayPrevention] Ignored duplicate webhook event ID: ${eventId}`);
      // Return 200 OK immediately so carrier stops retrying
      return res.status(200).json({ status: 'duplicate_ignored', eventId });
    }
    processedWebhookIds.set(eventId, Date.now());
  }

  next();
}
