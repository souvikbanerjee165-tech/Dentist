import { Router, Request, Response } from 'express';
import { ExecutiveBriefingService } from '../services/briefing/executive.briefing.service.js';

const router = Router();

// GET /api/v1/briefing/cron (Triggered by Vercel Cron at 8:00 AM)
router.get('/cron', async (req: Request, res: Response) => {
  try {
    const businessId = req.query.businessId as string | undefined;
    const phone = (req.query.phone as string) || '+447911123456';
    const result = await ExecutiveBriefingService.sendBriefing(phone, 'Apex Dental Care', businessId);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/v1/briefing/metrics
router.get('/metrics', async (req: Request, res: Response) => {
  try {
    const businessId = req.query.businessId as string | undefined;
    const summary = await ExecutiveBriefingService.generateDailyBriefing(businessId);
    res.json({ success: true, summary });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/v1/briefing/send-preview
router.post('/send-preview', async (req: Request, res: Response) => {
  try {
    const { targetPhone, clinicName, businessId } = req.body;
    const result = await ExecutiveBriefingService.sendBriefing(targetPhone || '+447911123456', clinicName || 'Apex Dental Care', businessId);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
