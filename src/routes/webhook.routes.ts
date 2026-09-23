import { Router } from 'express';
import { WebhookController } from '../controllers/webhook.controller.js';
import { validateWhatsAppSignature } from '../middleware/security.middleware.js';

const router = Router();

// Meta Webhook Verification (supports both direct and nested routes)
router.get('/', WebhookController.verifyWebhook);
router.get('/whatsapp', WebhookController.verifyWebhook);

// Meta Inbound Webhook Events (Secured with HMAC-SHA256 validation)
router.post('/', validateWhatsAppSignature, WebhookController.handleIncomingWebhook);
router.post('/whatsapp', validateWhatsAppSignature, WebhookController.handleIncomingWebhook);

export default router;
