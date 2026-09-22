import { Router, Request, Response } from 'express';
import { pmsCsvImporterService } from '../services/pms/pms-csv-importer.service.js';
import { openDentalAdapterService } from '../services/pms/opendental-adapter.service.js';

const router = Router();

/**
 * POST /api/v1/pms/import-schedule-csv
 * Ingests CSV export from Dentrix, Eaglesoft, or generic schedule
 */
router.post('/import-schedule-csv', (req: Request, res: Response) => {
  try {
    const csvContent = typeof req.body === 'string' ? req.body : req.body?.csvContent;

    if (!csvContent || typeof csvContent !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'CSV text content is required in request body.',
      });
    }

    const result = pmsCsvImporterService.parseScheduleCsv(csvContent);

    res.status(200).json({
      success: result.success,
      detectedFormat: result.detectedFormat,
      importedCount: result.importedCount,
      skippedCount: result.skippedCount,
      appointments: result.appointments,
      intakeMessagesQueuedCount: result.intakeMessagesQueuedCount,
      curbsideListenersActiveCount: result.curbsideListenersActiveCount,
      message: `Successfully imported ${result.importedCount} appointments from ${result.detectedFormat.toUpperCase()} schedule! Pre-visit intake texts & curbside listeners queued.`,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/pms/opendental/test-connection
 * Tests authentication & reachability of Open Dental Direct API
 */
router.post('/opendental/test-connection', async (req: Request, res: Response) => {
  try {
    const { apiBaseUrl, customerApiKey, practiceTitle } = req.body || {};
    const result = await openDentalAdapterService.testConnection({
      apiBaseUrl,
      customerApiKey,
      practiceTitle,
    });

    res.status(200).json({
      success: result.connected,
      ...result,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/pms/opendental/sync
 * Syncs appointments for specified date from Open Dental
 */
router.post('/opendental/sync', async (req: Request, res: Response) => {
  try {
    const dateStr = req.body?.dateStr || new Date().toISOString().split('T')[0];
    const syncResult = await openDentalAdapterService.syncAppointments(dateStr);

    res.status(200).json({
      success: true,
      count: syncResult.count,
      appointments: syncResult.appointments,
      message: `Successfully synchronized ${syncResult.count} appointments from Open Dental for ${dateStr}.`,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/pms/syncwave-webhook
 * Webhook receiver for dental aggregators (SyncWave / NexHealth Synchronizer)
 */
router.post('/syncwave-webhook', (req: Request, res: Response) => {
  try {
    const event = req.body;
    console.log(`🔌 [PMS AGGREGATOR WEBHOOK] Received SyncWave event: ${event?.eventType || 'appointment.updated'}`);

    res.status(200).json({
      received: true,
      timestamp: new Date().toISOString(),
      action: 'acknowledged',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
