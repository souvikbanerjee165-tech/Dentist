export default function handler(req: any, res: any) {
  // 1. Meta Webhook Verification Challenge (GET)
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'whatsapp_sales_assistant_verify_token';

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('✅ WhatsApp Webhook verified successfully with Meta.');
      return res.status(200).send(challenge);
    }
    
    console.warn('❌ WhatsApp Webhook verification failed. Tokens did not match.');
    return res.status(403).send('Verification failed');
  }

  // 2. Inbound Webhook Event Payload (POST)
  if (req.method === 'POST') {
    console.log('📩 Inbound Meta Webhook Event received:', JSON.stringify(req.body).slice(0, 120));
    return res.status(200).send('EVENT_RECEIVED');
  }

  return res.status(405).send('Method Not Allowed');
}
