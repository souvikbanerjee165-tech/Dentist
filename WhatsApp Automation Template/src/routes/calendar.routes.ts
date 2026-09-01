import { Router, Request, Response } from 'express';
import { calendarService } from '../services/calendar/calendar.service.js';

const router = Router();

/**
 * GET /api/v1/calendar/slots
 * Find free time slots and format 3 suggestions
 */
router.get('/slots', async (req: Request, res: Response) => {
  try {
    const date = (req.query.date as string) || new Date().toISOString().split('T')[0];
    const duration = parseInt((req.query.duration as string) || '45', 10);

    const result = await calendarService.findAvailableSlots(date, duration, 3);
    res.status(200).json(result);
  } catch (error: any) {
    console.error('Error finding calendar slots:', error);
    res.status(500).json({ error: 'CalendarError', message: 'Failed to retrieve available slots.' });
  }
});

/**
 * POST /api/v1/calendar/book
 * Book an appointment with double-booking prevention
 */
router.post('/book', async (req: Request, res: Response) => {
  try {
    const {
      businessId = 'default-business-id',
      leadId,
      customerName,
      customerPhone,
      customerEmail,
      serviceType = 'Consultation',
      startTime,
      durationMinutes = 45,
      notes = '',
    } = req.body;

    if (!customerName || !customerPhone || !customerEmail || !startTime) {
      res.status(400).json({
        error: 'ValidationError',
        message: 'customerName, customerPhone, customerEmail, and startTime are required.',
      });
      return;
    }

    const bookingResult = await calendarService.bookAppointment({
      businessId,
      leadId,
      customerName,
      customerPhone,
      customerEmail,
      serviceType,
      startTime,
      durationMinutes,
      notes,
    });

    if (!bookingResult.success) {
      res.status(409).json(bookingResult);
      return;
    }

    res.status(201).json(bookingResult);
  } catch (error: any) {
    console.error('Error booking appointment:', error);
    res.status(500).json({ error: 'BookingError', message: 'Failed to book appointment.' });
  }
});

/**
 * POST /api/v1/calendar/reschedule
 */
router.post('/reschedule', async (req: Request, res: Response) => {
  try {
    const { appointmentId, newStartTime, durationMinutes = 45 } = req.body;

    if (!appointmentId || !newStartTime) {
      res.status(400).json({
        error: 'ValidationError',
        message: 'appointmentId and newStartTime are required.',
      });
      return;
    }

    const result = await calendarService.rescheduleAppointment(
      appointmentId,
      newStartTime,
      durationMinutes
    );

    if (!result.success) {
      res.status(409).json(result);
      return;
    }

    res.status(200).json(result);
  } catch (error: any) {
    console.error('Error rescheduling appointment:', error);
    res.status(500).json({ error: 'RescheduleError', message: 'Failed to reschedule.' });
  }
});

/**
 * POST /api/v1/calendar/cancel
 */
router.post('/cancel', async (req: Request, res: Response) => {
  try {
    const { appointmentId, reason } = req.body;

    if (!appointmentId) {
      res.status(400).json({ error: 'ValidationError', message: 'appointmentId is required.' });
      return;
    }

    const result = await calendarService.cancelAppointment(appointmentId, reason);
    res.status(200).json(result);
  } catch (error: any) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({ error: 'CancelError', message: 'Failed to cancel appointment.' });
  }
});

/**
 * GET /api/v1/calendar/appointments
 */
router.get('/appointments', async (req: Request, res: Response) => {
  try {
    const businessId = (req.query.businessId as string) || 'default-business-id';
    const list = await calendarService.listAppointments(businessId);
    res.status(200).json({ appointments: list });
  } catch (error: any) {
    console.error('Error listing appointments:', error);
    res.status(500).json({ error: 'ListError', message: 'Failed to list appointments.' });
  }
});

export default router;
