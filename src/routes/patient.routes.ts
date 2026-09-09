import { Router, Request, Response, NextFunction } from 'express';
import { patientAuthService, PatientSessionPayload } from '../services/patient/patient-auth.service.js';
import { patientRecordsService, ClinicalVisitRecord } from '../services/patient/patient-records.service.js';

// Extend Express Request interface to carry authenticated patient session
declare global {
  namespace Express {
    interface Request {
      patient?: PatientSessionPayload;
    }
  }
}

const router = Router();

/**
 * Middleware: Enforces valid signed Bearer token for patient-isolated routes
 */
export function requirePatientAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Missing or invalid authorization token. Please log in.',
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
 * POST /api/v1/patient/register
 * Register with email, phone, and secure hashed password
 */
router.post('/register', (req: Request, res: Response) => {
  try {
    const { fullName, email, phone, password, insuranceProvider, insurancePolicyNumber, knownAllergies } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'Full name, email, and a secure password are required.',
      });
    }

    const result = patientAuthService.register({
      fullName,
      email,
      phone: phone || '+1 (555) 000-0000',
      password,
      insuranceProvider,
      insurancePolicyNumber,
      knownAllergies,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    // Initialize upcoming booking if one was created during sign-up
    if (req.body.initialTreatment && result.user) {
      patientRecordsService.setUpcomingAppointment({
        id: `appt-${Date.now()}`,
        patientId: result.user.id,
        treatment: req.body.initialTreatment,
        dateStr: req.body.selectedDate || 'Next Available Slot',
        timeStr: req.body.selectedTime || '10:00 AM',
        startIso: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
        endIso: new Date(Date.now() + 24 * 3600 * 1000 + 45 * 60 * 1000).toISOString(),
        doctorName: 'Dr. Sarah Jensen, DDS',
        doctorRole: 'Lead Cosmetic & Restorative Dentist',
        clinicName: 'St. James Dental Practice',
        clinicAddress: '450 Lexington Ave, Suite 800, New York',
        room: 'Operatory 3',
        status: 'confirmed',
        estimatedDuration: '45 Minutes',
        feeGbp: req.body.feeGbp || 180,
        checklist: patientRecordsService.generateChecklistForTreatment(req.body.initialTreatment),
        preVisitGuidelines: [
          'Arrive 10 minutes before your scheduled appointment.',
          'Bring your dental insurance card and photo ID.',
        ],
      });
    }

    res.status(201).json(result);
  } catch (err: any) {
    console.error('[Patient Register Error]:', err);
    res.status(500).json({ success: false, error: 'ServerError', message: err.message });
  }
});

/**
 * POST /api/v1/patient/login
 * Log in with email and password
 */
router.post('/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'Email and password are required.',
      });
    }

    const result = patientAuthService.login(email, password, ip);
    if (!result.success) {
      return res.status(401).json(result);
    }

    res.status(200).json(result);
  } catch (err: any) {
    console.error('[Patient Login Error]:', err);
    res.status(500).json({ success: false, error: 'ServerError', message: err.message });
  }
});

/**
 * POST /api/v1/patient/oauth
 * Social Login: Google, Microsoft, Apple
 */
router.post('/oauth', (req: Request, res: Response) => {
  try {
    const { provider, email, fullName, avatarUrl, providerId } = req.body;
    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';

    if (!provider || !['google', 'microsoft', 'apple'].includes(provider)) {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'Valid provider (google, microsoft, apple) is required.',
      });
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'Account email is required for OAuth verification.',
      });
    }

    const result = patientAuthService.oauthLogin({
      provider,
      email,
      fullName,
      avatarUrl,
      providerId,
      ipAddress: ip,
    });

    res.status(200).json(result);
  } catch (err: any) {
    console.error('[Patient OAuth Error]:', err);
    res.status(500).json({ success: false, error: 'ServerError', message: err.message });
  }
});

/**
 * GET /api/v1/patient/me
 * Retrieve current logged-in patient profile
 */
router.get('/me', requirePatientAuth, (req: Request, res: Response) => {
  const patient = patientAuthService.getPatientById(req.patient!.patientId);
  if (!patient) {
    return res.status(404).json({ success: false, error: 'NotFound', message: 'Patient record not found.' });
  }
  res.status(200).json({ success: true, user: patient });
});

/**
 * POST /api/v1/patient/toggle-2fa
 * Enable or disable Two-Factor Authentication
 */
router.post('/toggle-2fa', requirePatientAuth, (req: Request, res: Response) => {
  const { enabled } = req.body;
  const result = patientAuthService.toggle2FA(req.patient!.patientId, Boolean(enabled));
  res.status(200).json(result);
});

/**
 * GET /api/v1/patient/dashboard
 * Full dashboard data: Upcoming appointment, "What to Bring" checklist, clinical history
 */
router.get('/dashboard', requirePatientAuth, (req: Request, res: Response) => {
  try {
    const patientId = req.patient!.patientId;
    const dashboardData = patientRecordsService.getDashboardData(patientId);
    const patient = patientAuthService.getPatientById(patientId);

    res.status(200).json({
      success: true,
      user: patient,
      ...dashboardData,
    });
  } catch (err: any) {
    console.error('[Patient Dashboard Error]:', err);
    res.status(500).json({ success: false, error: 'ServerError', message: err.message });
  }
});

/**
 * POST /api/v1/patient/checklist/toggle
 * Toggle completion of an item in the patient's "What to Bring" list
 */
router.post('/checklist/toggle', requirePatientAuth, (req: Request, res: Response) => {
  try {
    const { itemId, isCompleted } = req.body;
    if (!itemId) {
      return res.status(400).json({ success: false, error: 'itemId is required.' });
    }

    const ok = patientRecordsService.toggleChecklistItem(
      req.patient!.patientId,
      String(itemId),
      Boolean(isCompleted)
    );

    res.status(200).json({ success: ok });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/patient/history
 * Full chronological clinical visit trail
 */
router.get('/history', requirePatientAuth, (req: Request, res: Response) => {
  try {
    const history = patientRecordsService.getFullPatientHistory(req.patient!.patientId);
    res.status(200).json({ success: true, ...history });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * =========================================================================
 * DOCTOR PORTAL APIS (Doctor inspecting / adding clinical notes to patient)
 * =========================================================================
 */

/**
 * GET /api/v1/patient/doctor/patient/:id
 * Retrieve patient profile, security audit log, checklist, and history for doctor
 */
router.get('/doctor/patient/:id', (req: Request, res: Response) => {
  try {
    const patientId = String(req.params.id);
    const patientView = patientAuthService.getDoctorPatientView(patientId);

    if (!patientView) {
      return res.status(404).json({ success: false, error: 'Patient not found.' });
    }

    const clinicalHistory = patientRecordsService.getFullPatientHistory(patientId);

    res.status(200).json({
      success: true,
      patient: patientView,
      ...clinicalHistory,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/patient/doctor/patient/:id/notes
 * Doctor appends clinical note or new treatment record to patient's trail
 */
router.post('/doctor/patient/:id/notes', (req: Request, res: Response) => {
  try {
    const patientId = String(req.params.id);
    const { treatment, sharedSummary, privateClinicalNotes, feeGbp, aftercareInstructions } = req.body;

    const newRecord: ClinicalVisitRecord = {
      id: `vis-${Date.now()}`,
      patientId,
      date: new Date().toISOString().split('T')[0],
      treatment: treatment || 'Routine Examination & Consultation',
      doctorName: 'Dr. Sarah Jensen, DDS',
      doctorRole: 'Lead Cosmetic & Restorative Dentist',
      operatory: 'Operatory 1',
      status: 'completed',
      sharedSummary: sharedSummary || 'Examination completed. Treatment plan agreed upon with patient.',
      aftercareInstructions: aftercareInstructions || ['Continue normal oral hygiene regimen.'],
      privateClinicalNotes,
      feeGbp: Number(feeGbp) || 95,
      paymentStatus: 'paid',
      receiptNumber: `INV-${Date.now()}`,
    };

    patientRecordsService.addClinicalVisit(newRecord);

    res.status(200).json({ success: true, record: newRecord });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
