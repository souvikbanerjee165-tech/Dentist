import { Router } from 'express';
import { WebhookController } from '../controllers/webhook.controller.js';

const router = Router();

// Meta Webhook Verification (supports both direct and nested routes)
router.get('/', WebhookController.verifyWebhook);
router.get('/whatsapp', WebhookController.verifyWebhook);

// Meta Inbound Webhook Events
router.post('/', WebhookController.handleIncomingWebhook);
router.post('/whatsapp', WebhookController.handleIncomingWebhook);

export default router;
