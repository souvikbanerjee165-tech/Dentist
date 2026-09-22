import { Router, Request, Response } from 'express';
import { insuranceRteService } from '../services/billing/insurance-rte.service.js';
import { treatmentPlanService } from '../services/billing/treatment-plan.service.js';
import { copayPaymentService } from '../services/billing/copay-payment.service.js';
import { requirePatientOwnerOrStaff } from '../middleware/auth.middleware.js';

const router = Router();

/**
 * POST /api/v1/financial/insurance/scan-ocr
 * Ingests insurance card images and returns parsed Payer & Member data
 * Protected: Patient owner or staff auth required
 */
router.post('/insurance/scan-ocr', requirePatientOwnerOrStaff, async (req: Request, res: Response) => {
  try {
    const { frontImageBase64, backImageBase64, patientId, patientFullName } = req.body;

    const extracted = await insuranceRteService.scanCardOcr({
      frontImageBase64,
      backImageBase64,
      patientId: patientId || 'pat-guest',
      patientFullName: patientFullName || 'Sophia Martinez',
    });

    res.status(200).json({
      success: true,
      card: extracted,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/financial/insurance/rte-verify
 * Executes 270/271 Real-Time Eligibility clearinghouse verification
 * Protected: Patient owner or staff auth required
 */
router.post('/insurance/rte-verify', requirePatientOwnerOrStaff, async (req: Request, res: Response) => {
  try {
    const { patientId, card } = req.body;

    if (!patientId || !card) {
      return res.status(400).json({ success: false, error: 'patientId and card data are required.' });
    }

    const report = await insuranceRteService.verifyRealTimeEligibility({
      patientId,
      card,
    });

    res.status(200).json({
      success: true,
      report,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/financial/insurance/:patientId
 * Fetches verified insurance card & RTE report for patient
 */
router.get('/insurance/:patientId', requirePatientOwnerOrStaff, (req: Request, res: Response) => {
  const patientId = String(req.params.patientId);
  const data = insuranceRteService.getPatientInsurance(patientId);

  res.status(200).json({
    success: true,
    data,
  });
});

/**
 * GET /api/v1/financial/treatment-plan/:patientId
 * Retrieves phased treatment proposal with insurance coverage & patient responsibility
 */
router.get('/treatment-plan/:patientId', requirePatientOwnerOrStaff, (req: Request, res: Response) => {
  const patientId = String(req.params.patientId);
  const plan = treatmentPlanService.getPlanByPatientId(patientId);

  res.status(200).json({
    success: true,
    plan,
  });
});

/**
 * POST /api/v1/financial/treatment-plan/accept
 * Patient digitally accepts specific phases of their treatment plan
 */
router.post('/treatment-plan/accept', requirePatientOwnerOrStaff, (req: Request, res: Response) => {
  try {
    const { patientId, phaseNumbers, signedName } = req.body;

    if (!patientId || !phaseNumbers || !signedName) {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'patientId, phaseNumbers array, and signedName are required.',
      });
    }

    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';

    const updated = treatmentPlanService.acceptTreatmentPhase({
      patientId: String(patientId),
      phaseNumbers,
      signedName,
      ipAddress: ip,
    });

    res.status(200).json({
      success: true,
      plan: updated,
      message: 'Treatment plan phase successfully accepted and scheduled for clinical prep!',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/financial/bnpl/calculate
 * Calculates soft 0% APR financing options across CareCredit, Cherry, Sunbit
 */
router.get('/bnpl/calculate', (req: Request, res: Response) => {
  const amount = Number(req.query.amount) || 1200;
  const options = treatmentPlanService.calculateBnplFinancing(amount);

  res.status(200).json({
    success: true,
    amount,
    options,
  });
});

/**
 * POST /api/v1/financial/copay/authorize
 * Pre-authorizes copay on card-on-file for 1-click check-out
 */
router.post('/copay/authorize', requirePatientOwnerOrStaff, (req: Request, res: Response) => {
  try {
    const { patientId, treatmentName, amount, cardId } = req.body;

    if (!patientId || !amount) {
      return res.status(400).json({ success: false, error: 'patientId and amount are required.' });
    }

    const transaction = copayPaymentService.preAuthorizeCopay({
      patientId: String(patientId),
      treatmentName: treatmentName || 'Dental Care Copay',
      amount: Number(amount),
      cardId,
    });

    res.status(200).json({
      success: true,
      transaction,
      message: 'Copay successfully pre-authorized on file. Patient can depart immediately after care without stopping at billing desk.',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/financial/copay/cards/:patientId
 * Lists saved cards on file for patient
 */
router.get('/copay/cards/:patientId', requirePatientOwnerOrStaff, (req: Request, res: Response) => {
  const patientId = String(req.params.patientId);
  const cards = copayPaymentService.getCardsForPatient(patientId);

  res.status(200).json({
    success: true,
    cards,
  });
});

export default router;
