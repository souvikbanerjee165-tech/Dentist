import { Router } from 'express';
import { WebhookController } from '../controllers/webhook.controller.js';

const router = Router();

// Meta Webhook Verification
router.get('/whatsapp', WebhookController.verifyWebhook);

// Meta Inbound Webhook Events
router.post('/whatsapp', WebhookController.handleIncomingWebhook);

export default router;
