import { Router, Request, Response } from 'express';
import { VoiceAIService } from '../services/voice/voice.service.js';
import { telnyxVoiceService } from '../services/voice/telnyx.service.js';

const router = Router();

// ==================== TELNYX WHOLESALE VOICE API ====================

/**
 * POST /api/v1/voice/telnyx/inbound
 * Telnyx TeXML Webhook for Inbound Calls
 */
router.post('/telnyx/inbound', (req: Request, res: Response) => {
  try {
    const callControlId = (req.body?.CallControlId as string) || (req.body?.CallSid as string) || `telnyx-${Date.now()}`;
    const fromNumber = (req.body?.From as string) || '+447700900123';
    const clinicName = (req.query?.clinic as string) || 'St. James Dental Practice';

    const texml = telnyxVoiceService.handleInboundCall(callControlId, fromNumber, clinicName);

    res.set('Content-Type', 'text/xml');
    res.send(texml);
  } catch (error: any) {
    console.error('[Telnyx Route] Error handling inbound call:', error);
    res.status(500).send('<Response><Say>An error occurred. Please call back.</Say><Hangup/></Response>');
  }
});

/**
 * POST /api/v1/voice/telnyx/respond
 * Telnyx TeXML Gather Speech Result Callback
 */
router.post('/telnyx/respond', async (req: Request, res: Response) => {
  try {
    const callControlId = (req.body?.CallControlId as string) || (req.body?.CallSid as string) || `telnyx-${Date.now()}`;
    const callerSpeech = (req.body?.SpeechResult as string) || (req.body?.speech as string) || '';
    const fromNumber = (req.body?.From as string) || '+447700900123';
    const clinicName = (req.query?.clinic as string) || 'St. James Dental Practice';

    const texml = await telnyxVoiceService.processCallerSpeech(callControlId, callerSpeech, fromNumber, clinicName);

    res.set('Content-Type', 'text/xml');
    res.send(texml);
  } catch (error: any) {
    console.error('[Telnyx Route] Error processing speech:', error);
    res.status(500).send('<Response><Say>Connecting to clinic front desk.</Say><Hangup/></Response>');
  }
});

/**
 * POST /api/v1/voice/telnyx/outbound
 * Initiates an outbound PSTN call via Telnyx wholesale gateway
 */
router.post('/telnyx/outbound', async (req: Request, res: Response) => {
  try {
    const { to, from, clinicName, patientName, purpose } = req.body;

    if (!to) {
      return res.status(400).json({ success: false, error: 'Destination phone number (to) is required' });
    }

    const result = await telnyxVoiceService.initiateOutboundCall({
      to,
      from,
      clinicName,
      patientName,
      purpose,
    });

    res.status(200).json(result);
  } catch (error: any) {
    console.error('[Telnyx Route] Error initiating outbound call:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/v1/voice/telnyx/webrtc-token
 * Generates WebRTC credentials for In-Browser Click-to-Call
 */
router.get('/telnyx/webrtc-token', (req: Request, res: Response) => {
  try {
    const clientName = (req.query?.clientName as string) || 'dental-front-desk';
    const credentials = telnyxVoiceService.generateWebRTCLogin(clientName);
    res.status(200).json({ success: true, ...credentials });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/v1/voice/telnyx/events
 * Telnyx Call Status Webhook (Ringing, Answered, Hangup)
 */
router.post('/telnyx/events', (req: Request, res: Response) => {
  const event = req.body?.data?.event_type || 'call.event';
  console.log(`[Telnyx Event] ${event}`);
  res.status(200).json({ received: true });
});

// ==================== LEGACY & SIMULATION ROUTES ====================

// POST /api/v1/voice/inbound (Twilio/Generic Inbound Call Webhook)
router.post('/inbound', (req: Request, res: Response) => {
  try {
    const callSid = (req.body?.CallSid as string) || `call-${Date.now()}`;
    const fromNumber = (req.body?.From as string) || '+447911123456';
    const clinicName = (req.query?.clinic as string) || 'Apex Dental Care';

    const twiml = VoiceAIService.handleInboundCall(callSid, fromNumber, clinicName);

    res.set('Content-Type', 'text/xml');
    res.send(twiml);
  } catch (error: any) {
    res.status(500).send('<Response><Say>An error occurred. Please call back.</Say><Hangup/></Response>');
  }
});

// POST /api/v1/voice/respond (Twilio Speech Result Webhook)
router.post('/respond', async (req: Request, res: Response) => {
  try {
    const callSid = (req.body?.CallSid as string) || `call-${Date.now()}`;
    const callerSpeech = (req.body?.SpeechResult as string) || (req.body?.speech as string) || '';
    const fromNumber = (req.body?.From as string) || '+447911123456';
    const clinicName = (req.query?.clinic as string) || 'Apex Dental Care';

    const twiml = await VoiceAIService.processCallerSpeech(callSid, callerSpeech, fromNumber, clinicName);

    res.set('Content-Type', 'text/xml');
    res.send(twiml);
  } catch (error: any) {
    res.status(500).send('<Response><Say>We are connecting you to front desk.</Say><Hangup/></Response>');
  }
});

// POST /api/v1/voice/simulate (Developer & Dashboard Simulator)
router.post('/simulate', async (req: Request, res: Response) => {
  try {
    const { speech, phone, clinicName } = req.body;
    const callSid = `sim-${Date.now()}`;
    const twiml = await VoiceAIService.processCallerSpeech(
      callSid, 
      speech || 'I have a broken molar and need an emergency appointment today',
      phone || '+447911123456',
      clinicName || 'Apex Dental Care'
    );
    res.json({
      success: true,
      inputSpeech: speech,
      twimlResponse: twiml,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
