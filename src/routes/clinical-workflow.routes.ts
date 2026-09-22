import { Router, Request, Response } from 'express';
import { digitalIntakeService } from '../services/clinical/digital-intake.service.js';
import { aftercareTrackerService } from '../services/clinical/aftercare-tracker.service.js';
import { dentalMediaService } from '../services/clinical/dental-media.service.js';
import { patientRecordsService } from '../services/patient/patient-records.service.js';

const router = Router();

/**
 * POST /api/v1/clinical/intake/submit
 * Saves patient digital medical history & legal e-signature
 */
router.post('/intake/submit', (req: Request, res: Response) => {
  try {
    const {
      patientId,
      patientFullName,
      medicalHistory,
      hipaaAcknowledged,
      treatmentConsentAcknowledged,
      financialAgreementAcknowledged,
      signatureType,
      signatureData,
    } = req.body;

    if (!patientId || !patientFullName || !signatureData) {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'Patient ID, full legal name, and signature are required.',
      });
    }

    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
    const userAgent = (req.headers['user-agent'] as string) || 'Browser';

    const submission = digitalIntakeService.submitIntake({
      patientId,
      patientFullName,
      medicalHistory: medicalHistory || {
        currentMedications: [],
        chronicConditions: [],
        allergies: [],
        pastSurgeries: [],
        hasHeartMurmurOrValveReplacement: false,
        takesBloodThinners: false,
        emergencyContactName: '',
        emergencyContactPhone: '',
        emergencyContactRelation: '',
      },
      hipaaAcknowledged: Boolean(hipaaAcknowledged),
      treatmentConsentAcknowledged: Boolean(treatmentConsentAcknowledged),
      financialAgreementAcknowledged: Boolean(financialAgreementAcknowledged),
      signatureType: signatureType || 'type',
      signatureData,
      ipAddress: ip,
      userAgent,
    });

    res.status(201).json({ success: true, submission });
  } catch (err: any) {
    console.error('[Clinical Intake Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/clinical/intake/:patientId
 * Fetches digital intake & screening status
 */
router.get('/intake/:patientId', (req: Request, res: Response) => {
  const patientId = String(req.params.patientId);
  const intake = digitalIntakeService.getIntakeByPatientId(patientId);
  const sedation = digitalIntakeService.getSedationScreening(patientId);
  const cosmetic = digitalIntakeService.getCosmeticGoals(patientId);

  res.status(200).json({
    success: true,
    intake,
    sedation,
    cosmetic,
  });
});

/**
 * POST /api/v1/clinical/checkin/arrive
 * 1-Click Curbside "I've Arrived" Button
 * Instantly alerts front-desk and marks patient as checked_in
 */
router.post('/checkin/arrive', (req: Request, res: Response) => {
  try {
    const { patientId, parkingSpotOrLocation } = req.body;

    if (!patientId) {
      return res.status(400).json({ success: false, error: 'Patient ID required' });
    }

    const upcoming = patientRecordsService.getUpcomingAppointment(String(patientId));

    if (upcoming) {
      upcoming.status = 'checked_in';
      patientRecordsService.setUpcomingAppointment(upcoming);
    }

    console.log(
      `🚗 [CURBSIDE CHECK-IN] Patient ${patientId} arrived! Location: "${parkingSpotOrLocation || 'Outside Main Entrance'}"`
    );

    res.status(200).json({
      success: true,
      status: 'checked_in',
      message: 'Welcome! Front desk and Dr. Sarah Jensen have been notified. Please take a seat in the lounge or stay comfortable in your vehicle.',
      arrivedAtIso: new Date().toISOString(),
      room: upcoming?.room || 'Operatory 3',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/clinical/aftercare/:patientId
 * Retrieves procedure aftercare regimen & symptom log history
 */
router.get('/aftercare/:patientId', (req: Request, res: Response) => {
  const patientId = String(req.params.patientId);
  const plan = aftercareTrackerService.getPlanByPatientId(patientId);

  res.status(200).json({
    success: true,
    plan,
  });
});

/**
 * POST /api/v1/clinical/aftercare/log
 * Logs daily patient recovery metrics; triggers staff alert if pain >= 7
 */
router.post('/aftercare/log', (req: Request, res: Response) => {
  try {
    const { patientId, dayNumber, painScale, bleedingLevel, swellingLevel, tookPrescribedMedication, notes } = req.body;

    if (!patientId || dayNumber === undefined || painScale === undefined) {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'patientId, dayNumber, and painScale (1-10) are required.',
      });
    }

    const result = aftercareTrackerService.logDailyCheckin({
      patientId: String(patientId),
      dayNumber: Number(dayNumber),
      painScale: Number(painScale),
      bleedingLevel: bleedingLevel || 'none',
      swellingLevel: swellingLevel || 'none',
      tookPrescribedMedication: Boolean(tookPrescribedMedication),
      notes,
    });

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/clinical/media/:patientId
 * Retrieves X-rays, 3D scans, and before/after comparisons
 */
router.get('/media/:patientId', (req: Request, res: Response) => {
  const patientId = String(req.params.patientId);
  const media = dentalMediaService.getMediaForPatient(patientId);

  res.status(200).json({
    success: true,
    count: media.length,
    media,
  });
});

/**
 * GET /api/v1/clinical/alerts
 * Doctor CRM: Returns real-time critical aftercare alerts
 */
router.get('/alerts', (_req: Request, res: Response) => {
  const alerts = aftercareTrackerService.getCriticalAlerts();
  res.status(200).json({
    success: true,
    alerts,
  });
});

export default router;
