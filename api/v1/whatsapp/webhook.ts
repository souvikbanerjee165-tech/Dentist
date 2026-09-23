import crypto from 'node:crypto';

export default function handler(req: any, res: any) {
  // 1. Meta Webhook Verification Challenge (GET)
  if (req.method === 'GET') {
    const mode = req.query?.['hub.mode'] || req.query?.hub_mode;
    const token = req.query?.['hub.verify_token'] || req.query?.hub_verify_token;
    const challenge = req.query?.['hub.challenge'] || req.query?.hub_challenge;

    const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

    if (process.env.NODE_ENV === 'production' && (!VERIFY_TOKEN || VERIFY_TOKEN === 'whatsapp_sales_assistant_verify_token')) {
      console.error('❌ FATAL: WHATSAPP_VERIFY_TOKEN must be configured securely in production.');
      return res.status(500).json({ error: 'ServerMisconfigured' });
    }

    const effectiveToken = VERIFY_TOKEN || 'whatsapp_sales_assistant_verify_token';

    if (mode === 'subscribe' && token === effectiveToken) {
      console.log('✅ WhatsApp Webhook verified successfully with Meta.');
      return res.status(200).send(challenge);
    }
    
    console.warn('❌ WhatsApp Webhook verification failed. Tokens did not match.');
    return res.status(403).send('Verification failed');
  }

  // 2. Inbound Webhook Event Payload (POST)
  if (req.method === 'POST') {
    const signature = (req.headers?.['x-hub-signature-256'] || req.headers?.['X-Hub-Signature-256']) as string;
    const appSecret = process.env.WHATSAPP_APP_SECRET;

    if (process.env.NODE_ENV === 'production') {
      if (!appSecret || appSecret.startsWith('your_app_secret')) {
        console.error('❌ FATAL: WHATSAPP_APP_SECRET must be configured in production.');
        return res.status(500).json({ error: 'ServerMisconfigured' });
      }
      if (!signature) {
        return res.status(401).json({ error: 'MissingSignature', message: 'Missing X-Hub-Signature-256 header' });
      }
    }

    // Enforce HMAC-SHA256 verification when signature or production secret is present
    if (appSecret && signature && !appSecret.startsWith('your_app_secret')) {
      try {
        const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
        const expectedSignature = `sha256=${crypto
          .createHmac('sha256', appSecret)
          .update(rawBody)
          .digest('hex')}`;

        const sigBuf = Buffer.from(signature);
        const expectedBuf = Buffer.from(expectedSignature);

        if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
          console.warn('❌ WhatsApp Webhook signature verification failed.');
          return res.status(403).json({ error: 'InvalidSignature', message: 'HMAC signature mismatch' });
        }
      } catch (err: any) {
        console.error('Error validating signature:', err);
        return res.status(403).json({ error: 'SignatureError', message: 'Failed to verify signature' });
      }
    }

    console.log('📩 Inbound Meta Webhook Event received (verified):', JSON.stringify(req.body).slice(0, 120));
    return res.status(200).send('EVENT_RECEIVED');
  }

  return res.status(405).send('Method Not Allowed');
}
