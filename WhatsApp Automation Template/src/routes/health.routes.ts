import { Router, Request, Response } from 'express';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'whatsapp-ai-sales-assistant-api',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

export default router;
