import { Router, Request, Response } from 'express';
import { MissedRevenueRadarService } from '../services/revenue/radar.service.js';

const router = Router();

// GET /api/v1/revenue/pipeline
router.get('/pipeline', async (req: Request, res: Response) => {
  try {
    const businessId = req.query.businessId as string | undefined;
    const items = await MissedRevenueRadarService.getPipeline(businessId);
    res.json({ success: true, count: items.length, items });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/v1/revenue/dispatch-vip
router.post('/dispatch-vip', async (req: Request, res: Response) => {
  try {
    const { radarId, offerDiscount } = req.body;
    if (!radarId) {
      return res.status(400).json({ success: false, message: 'radarId is required.' });
    }
    const result = await MissedRevenueRadarService.dispatchVIPOffer(radarId, offerDiscount);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
