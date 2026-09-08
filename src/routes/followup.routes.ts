import { Router, Request, Response } from 'express';
import { followupService } from '../services/followup/followup.service.js';

export const followupRouter = Router();

/**
 * POST /api/v1/followup/missed-call
 * Triggers instant SMS/WhatsApp triage when a phone call is missed or dropped
 */
followupRouter.post('/missed-call', async (req: Request, res: Response) => {
  try {
    const { callerPhone, callerName, clinicName, clinicPhone, missedAt } = req.body;

    if (!callerPhone) {
      return res.status(400).json({
        success: false,
        error: 'callerPhone is required',
      });
    }

    const result = await followupService.triggerMissedCallRecovery({
      callerPhone,
      callerName,
      clinicName,
      clinicPhone,
      missedAt,
    });

    return res.status(200).json(result);
  } catch (error: any) {
    console.error(`[FollowupRoute] Error: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
});

/**
 * POST /api/v1/followup/schedule-reminders
 * Schedules 24h and 2h automated appointment reminders
 */
followupRouter.post('/schedule-reminders', async (req: Request, res: Response) => {
  try {
    const { patientName, patientPhone, treatment, appointmentTime, clinicName, clinicAddress } = req.body;

    if (!patientName || !patientPhone || !treatment || !appointmentTime) {
      return res.status(400).json({
        success: false,
        error: 'patientName, patientPhone, treatment, and appointmentTime are required',
      });
    }

    const result = await followupService.scheduleAppointmentReminders({
      patientName,
      patientPhone,
      treatment,
      appointmentTime,
      clinicName,
      clinicAddress,
    });

    return res.status(200).json(result);
  } catch (error: any) {
    console.error(`[FollowupRoute] Error scheduling reminders: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
});

/**
 * POST /api/v1/followup/review-request
 * Triggers post-treatment 5-star Google review request
 */
followupRouter.post('/review-request', async (req: Request, res: Response) => {
  try {
    const { patientName, patientPhone, treatment, clinicName, googleReviewLink } = req.body;

    if (!patientName || !patientPhone || !treatment) {
      return res.status(400).json({
        success: false,
        error: 'patientName, patientPhone, and treatment are required',
      });
    }

    const result = await followupService.triggerReviewRequest({
      patientName,
      patientPhone,
      treatment,
      clinicName,
      googleReviewLink,
    });

    return res.status(200).json(result);
  } catch (error: any) {
    console.error(`[FollowupRoute] Error triggering review request: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
});

/**
 * GET /api/v1/followup/stats
 * Returns retention & missed call recovery metrics
 */
followupRouter.get('/stats', (req: Request, res: Response) => {
  try {
    const stats = followupService.getStats();
    return res.status(200).json({
      success: true,
      stats,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
});
