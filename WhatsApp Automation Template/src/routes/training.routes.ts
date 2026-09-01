import { Router, Request, Response } from 'express';
import { AITrainingService } from '../services/training/training.service.js';

const router = Router();

// GET /api/v1/training/queue
router.get('/queue', async (req: Request, res: Response) => {
  try {
    const businessId = req.query.businessId as string | undefined;
    const items = await AITrainingService.getTrainingQueue(businessId);
    res.json({ success: true, count: items.length, items });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/v1/training/log
router.post('/log', async (req: Request, res: Response) => {
  try {
    const { question, businessId, conversationId } = req.body;
    await AITrainingService.logUnansweredQuestion(question, businessId, conversationId);
    res.json({ success: true, message: 'Question logged for AI training analysis.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/v1/training/approve
router.post('/approve', async (req: Request, res: Response) => {
  try {
    const { queueId, approvedAnswer, category, businessId } = req.body;
    if (!queueId || !approvedAnswer) {
      return res.status(400).json({ success: false, message: 'queueId and approvedAnswer are required.' });
    }
    const result = await AITrainingService.approveAndTrain(queueId, approvedAnswer, category, businessId);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
