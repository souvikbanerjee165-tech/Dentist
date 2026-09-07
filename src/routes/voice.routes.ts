import { Router, Request, Response } from 'express';
import { VoiceAIService } from '../services/voice/voice.service.js';

const router = Router();

// POST /api/v1/voice/inbound (Twilio Inbound Call Webhook)
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
