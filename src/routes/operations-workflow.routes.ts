import { Router, Request, Response } from 'express';
import { waitlistEngineService } from '../services/operations/waitlist-engine.service.js';
import { clinicalTriageService, TriageCategory } from '../services/operations/clinical-triage.service.js';

const router = Router();

/**
 * GET /api/v1/operations/waitlist
 * Lists current waitlist patients
 */
router.get('/waitlist', (_req: Request, res: Response) => {
  const waitlist = waitlistEngineService.getWaitlist();
  const activeOffers = waitlistEngineService.getActiveOffers();

  res.status(200).json({
    success: true,
    count: waitlist.length,
    waitlist,
    activeOffers,
  });
});

/**
 * POST /api/v1/operations/waitlist/join
 * Adds a patient to the priority cancellation waitlist
 */
router.post('/waitlist/join', (req: Request, res: Response) => {
  try {
    const { patientId, patientName, patientPhone, preferredDays, preferredTimeOfDay, requestedTreatment, urgencyLevel } =
      req.body;

    if (!patientId || !patientName || !patientPhone) {
      return res.status(400).json({ success: false, error: 'patientId, patientName, and phone required.' });
    }

    const entry = waitlistEngineService.addToWaitlist({
      patientId,
      patientName,
      patientPhone,
      preferredDays: preferredDays || ['Monday', 'Friday'],
      preferredTimeOfDay: preferredTimeOfDay || 'Any',
      requestedTreatment: requestedTreatment || 'General Dental Consultation',
      urgencyLevel: urgencyLevel || 'Medium (Routine)',
    });

    res.status(201).json({
      success: true,
      entry,
      message: 'Added to priority waitlist. You will receive an instant RCS/SMS alert whenever a slot opens!',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/operations/waitlist/trigger-backfill
 * Staff triggers automated cancellation broadcast to fill an empty chair
 */
router.post('/waitlist/trigger-backfill', async (req: Request, res: Response) => {
  try {
    const { slotDate, slotTime, doctorName, treatmentType, operatory } = req.body;

    if (!slotDate || !slotTime) {
      return res.status(400).json({ success: false, error: 'slotDate and slotTime are required.' });
    }

    const offer = await waitlistEngineService.triggerCancellationBackfill({
      slotDate,
      slotTime,
      doctorName,
      treatmentType,
      operatory,
    });

    res.status(200).json({
      success: true,
      offer,
      message: `Cancellation broadcast dispatched via RCS/SMS to ${offer.recipientsNotifiedCount} waitlisted patients!`,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/operations/waitlist/claim
 * Patient claims an opened slot via 1-click action chip
 */
router.post('/waitlist/claim', (req: Request, res: Response) => {
  try {
    const { offerId, patientId, patientName } = req.body;

    if (!offerId || !patientId) {
      return res.status(400).json({ success: false, error: 'offerId and patientId are required.' });
    }

    const result = waitlistEngineService.claimSlot({
      offerId,
      patientId,
      patientName: patientName || 'Sophia Martinez',
    });

    res.status(result.success ? 200 : 409).json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/operations/triage/inbox
 * Staff Inbox: returns threads categorized by Clinical/Urgent, Scheduling, Billing, General
 */
router.get('/triage/inbox', (req: Request, res: Response) => {
  const category = req.query.category as TriageCategory | undefined;
  const threads = clinicalTriageService.getStaffInbox(category);

  res.status(200).json({
    success: true,
    totalThreads: threads.length,
    threads,
  });
});

/**
 * POST /api/v1/operations/triage/message
 * Ingests inbound patient message and performs automatic triage
 */
router.post('/triage/message', (req: Request, res: Response) => {
  try {
    const { patientId, patientName, patientPhone, text } = req.body;

    if (!patientId || !text) {
      return res.status(400).json({ success: false, error: 'patientId and text required.' });
    }

    const thread = clinicalTriageService.ingestInboundPatientMessage({
      patientId,
      patientName: patientName || 'Sophia Martinez',
      patientPhone: patientPhone || '+1 (555) 234-5678',
      text,
    });

    res.status(200).json({
      success: true,
      category: thread.category,
      urgency: thread.urgency,
      thread,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/operations/triage/reply
 * Clinician / Front-desk sends encrypted reply to patient thread
 */
router.post('/triage/reply', (req: Request, res: Response) => {
  try {
    const { threadId, senderName, role, text } = req.body;

    if (!threadId || !text) {
      return res.status(400).json({ success: false, error: 'threadId and text required.' });
    }

    const thread = clinicalTriageService.replyToThread({
      threadId,
      senderName: senderName || 'Dr. Sarah Jensen, DDS',
      role: role || 'doctor',
      text,
    });

    res.status(200).json({
      success: true,
      thread,
      message: 'Reply delivered to patient portal and SMS bridge.',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
