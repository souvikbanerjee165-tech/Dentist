import { Router, Request, Response } from 'express';
import { aiConversationService } from '../services/ai/ai.service.js';
import { ConversationTurnInput } from '../services/ai/ai.types.js';

const router = Router();

/**
 * POST /api/v1/chat/turn
 * Process a customer WhatsApp message turn and return structured JSON
 */
router.post('/turn', async (req: Request, res: Response) => {
  try {
    const {
      businessName = 'Apex Care Clinic',
      businessIndustry = 'Medical & Dental Clinic',
      userMessage,
      conversationHistory = [],
      existingLeadData = {},
      knowledgeContext = [],
    } = req.body;

    if (!userMessage || typeof userMessage !== 'string') {
      res.status(400).json({
        error: 'ValidationError',
        message: 'Field "userMessage" is required and must be a string.',
      });
      return;
    }

    const input: ConversationTurnInput = {
      businessName,
      businessIndustry,
      userMessage,
      conversationHistory,
      existingLeadData,
      knowledgeContext,
    };

    const turnResponse = await aiConversationService.processTurn(input);
    res.status(200).json(turnResponse);
  } catch (error) {
    console.error('Error in /api/v1/chat/turn:', error);
    res.status(500).json({
      error: 'InternalError',
      message: 'Failed to process AI conversation turn.',
    });
  }
});

export default router;
