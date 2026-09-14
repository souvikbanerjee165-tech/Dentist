import { Router, Request, Response } from 'express';
import { smsRcsService } from '../services/messaging/sms-rcs.service.js';

const router = Router();

/**
 * POST /api/v1/sms/consent
 * Capture TCPA & HIPAA regulatory consent from patient booking/registration
 */
router.post('/consent', (req: Request, res: Response) => {
  try {
    const { phoneNumber, patientName, channel, tcpaConsentGranted, hipaaAcknowledgementGranted } = req.body;

    if (!phoneNumber || !patientName) {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'Phone number and patient name are required to record TCPA consent.',
      });
    }

    if (!tcpaConsentGranted) {
      return res.status(400).json({
        success: false,
        error: 'ConsentRequired',
        message: 'TCPA express consent must be actively agreed to prior to sending SMS notifications.',
      });
    }

    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
    const userAgent = (req.headers['user-agent'] as string) || 'Browser';

    const record = smsRcsService.recordConsent({
      phoneNumber,
      patientName,
      channel: channel || 'sms',
      tcpaConsentGranted: Boolean(tcpaConsentGranted),
      hipaaAcknowledgementGranted: Boolean(hipaaAcknowledgementGranted),
      ipAddress: ip,
      userAgent,
    });

    res.status(200).json({ success: true, consent: record });
  } catch (err: any) {
    console.error('[SMS Consent Route] Error:', err);
    res.status(500).json({ success: false, error: 'ServerError', message: err.message });
  }
});

/**
 * POST /api/v1/sms/send-confirmation
 * Dispatches 10DLC SMS / RCS Rich Card confirmation to patient
 */
router.post('/send-confirmation', async (req: Request, res: Response) => {
  try {
    const { to, patientName, treatment, appointmentDate, appointmentTime, channel, clinicName } = req.body;

    if (!to || !patientName || !treatment) {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'Recipient phone number (to), patientName, and treatment are required.',
      });
    }

    const result = await smsRcsService.sendBookingConfirmation({
      to,
      patientName,
      treatment,
      appointmentDate: appointmentDate || 'Upcoming Slot',
      appointmentTime: appointmentTime || '10:00 AM',
      clinicName: clinicName || 'St. James Dental Practice',
      channel: channel || 'sms',
    });

    res.status(200).json(result);
  } catch (err: any) {
    console.error('[SMS Send Confirmation Error]:', err);
    res.status(500).json({ success: false, error: 'DispatchError', message: err.message });
  }
});

/**
 * POST /api/v1/sms/inbound
 * Webhook for inbound 2-way patient SMS/RCS responses
 * Telnyx / Twilio / Carrier Webhook compatible
 */
router.post('/inbound', async (req: Request, res: Response) => {
  try {
    // Extract from Telnyx webhook payload structure or direct body
    const from =
      req.body?.data?.payload?.from?.phone_number ||
      req.body?.From ||
      req.body?.from ||
      '+15550001234';

    const text =
      req.body?.data?.payload?.text ||
      req.body?.Body ||
      req.body?.text ||
      '';

    console.log(`[SMS Inbound Webhook] Received from ${from}: "${text}"`);

    const result = await smsRcsService.handleInboundText(from, text);

    // Return 200 with formatted reply for Telnyx / webhook responder
    res.status(200).json({
      success: true,
      from,
      incomingText: text,
      response: result.reply,
      intent: result.intent,
      status: result.status,
    });
  } catch (err: any) {
    console.error('[SMS Inbound Webhook Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/sms/consent/audit
 * Doctor & Compliance Audit view of all consented North American phone numbers
 */
router.get('/consent/audit', (req: Request, res: Response) => {
  const list = smsRcsService.getConsentAuditList();
  res.status(200).json({
    success: true,
    totalConsents: list.length,
    activeConsents: list.filter((c) => c.status === 'active').length,
    consents: list,
  });
});

/**
 * POST /api/v1/sms/simulate-rcs
 * Provides the interactive RCS Card and 10DLC SMS payload for client preview
 */
router.post('/simulate-rcs', (req: Request, res: Response) => {
  const { patientName, treatment, appointmentDate, appointmentTime, clinicName } = req.body;

  const card = smsRcsService.buildRcsCard({
    to: '+15552345678',
    patientName: patientName || 'Sophia Martinez',
    treatment: treatment || 'Teeth Whitening (£395)',
    appointmentDate: appointmentDate || 'Friday, Sep 4',
    appointmentTime: appointmentTime || '3:00 PM',
    clinicName: clinicName || 'St. James Dental Practice',
  });

  const smsText = smsRcsService.buildSmsFallbackText({
    to: '+15552345678',
    patientName: patientName || 'Sophia Martinez',
    treatment: treatment || 'Teeth Whitening (£395)',
    appointmentDate: appointmentDate || 'Friday, Sep 4',
    appointmentTime: appointmentTime || '3:00 PM',
    clinicName: clinicName || 'St. James Dental Practice',
  });

  res.status(200).json({
    success: true,
    rcsCard: card,
    smsFallback: smsText,
  });
});

export default router;
