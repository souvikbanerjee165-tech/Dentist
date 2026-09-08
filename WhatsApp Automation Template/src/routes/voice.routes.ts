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

/**
 * POST /api/v1/voice/interactive/turn
 * Hands-Free Interactive Voice Studio Conversational Loop
 * Sub-second pacing with 12-15 word calibration and autonomous meeting booking
 */
router.post('/interactive/turn', async (req: Request, res: Response) => {
  try {
    const { speech, text, conversationHistory, clinicName } = req.body;
    const userSpeech = speech || text || '';
    const clinic = clinicName || 'St. James Dental Practice';

    const result = await VoiceAIService.processInteractiveStudioTurn(
      userSpeech,
      conversationHistory || [],
      clinic
    );

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error('[Voice Routes] Interactive turn error:', error);
    res.status(500).json({
      success: false,
      reply: 'I would be delighted to assist you with your appointment at St. James Dental.',
      intent: 'faq_inquiry',
      is_meeting_booked: false,
      word_count: 14,
      error: error.message,
    });
  }
});

// ==================== KOKORO LOCAL NEURAL VOICE SERVER ROUTES ====================

const KOKORO_SERVER_URL = process.env.KOKORO_SERVER_URL || 'http://127.0.0.1:8880';

/**
 * GET /api/v1/voice/kokoro/status
 * Queries the local Kokoro neural voice server health
 */
router.get('/kokoro/status', async (_req: Request, res: Response) => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    const response = await fetch(`${KOKORO_SERVER_URL}/health`, { signal: controller.signal });
    clearTimeout(timeout);

    if (response.ok) {
      const data = await response.json();
      return res.status(200).json({
        online: true,
        serverUrl: KOKORO_SERVER_URL,
        ...data,
      });
    }
    return res.status(502).json({ online: false, error: 'Kokoro server returned non-200' });
  } catch (err: any) {
    return res.status(200).json({
      online: false,
      serverUrl: KOKORO_SERVER_URL,
      message: 'Local Kokoro server is warming up or offline',
      error: err.message,
    });
  }
});

/**
 * GET /api/v1/voice/kokoro/voices
 * Lists the 54 Kokoro neural voices
 */
router.get('/kokoro/voices', async (_req: Request, res: Response) => {
  try {
    const response = await fetch(`${KOKORO_SERVER_URL}/voices`);
    if (response.ok) {
      const data = await response.json();
      return res.status(200).json(data);
    }
    return res.status(502).json({ error: 'Failed to fetch voices' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/v1/voice/kokoro/synthesize
 * Synthesizes text to speech using the local Kokoro neural engine
 */
router.post('/kokoro/synthesize', async (req: Request, res: Response) => {
  try {
    const { text, voice, speed } = req.body;
    const response = await fetch(`${KOKORO_SERVER_URL}/synthesize/base64`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        voice: voice || 'bf_emma',
        speed: speed || 1.0,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return res.status(200).json(data);
    }
    return res.status(502).json({ success: false, error: 'Kokoro synthesis failed' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/voice/kokoro/sandbox-turn
 * Full-Duplex Patient -> Doctor AI sandbox turn with local Kokoro audio synthesis
 */
router.post('/kokoro/sandbox-turn', async (req: Request, res: Response) => {
  try {
    const { speech, text, conversationHistory, clinicName, voice, speed } = req.body;
    const userSpeech = speech || text || '';
    const clinic = clinicName || 'St. James Dental Practice';
    const chosenVoice = voice || 'bf_emma';

    // 1. Process Doctor AI Turn with 12-15 word calibration and meeting extraction
    const turnResult = await VoiceAIService.processInteractiveStudioTurn(
      userSpeech,
      conversationHistory || [],
      clinic
    );

    // 2. Synthesize Doctor's response via local Kokoro Neural Server
    let audioBase64: string | null = null;
    let latencyMs: number = 0;
    let ttsEngine: string = 'Browser SpeechSynthesis (Fallback)';

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);
      const kokoroRes = await fetch(`${KOKORO_SERVER_URL}/synthesize/base64`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: turnResult.reply,
          voice: chosenVoice,
          speed: speed || 1.0,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (kokoroRes.ok) {
        const kData = await kokoroRes.json();
        audioBase64 = kData.audio_base64;
        latencyMs = kData.latency_ms;
        ttsEngine = `Kokoro-82M Local Server (${chosenVoice})`;
      }
    } catch (kErr) {
      console.warn('[Kokoro Sandbox] Local synthesis notice, falling back to Web Speech:', kErr);
    }

    return res.status(200).json({
      success: true,
      ...turnResult,
      audio_base64: audioBase64,
      tts_engine: ttsEngine,
      voice: chosenVoice,
      latency_ms: latencyMs,
    });
  } catch (error: any) {
    console.error('[Kokoro Sandbox] Error:', error);
    res.status(500).json({
      success: false,
      reply: 'We have reserved your place with Dr. Sarah. How else may I assist you?',
      intent: 'faq_inquiry',
      is_meeting_booked: false,
      word_count: 14,
      error: error.message,
    });
  }
});

export default router;

