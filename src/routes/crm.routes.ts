import { Router, Request, Response } from 'express';
import { crmService } from '../services/crm/crm.service.js';
import { AppointmentStatus } from '../services/crm/crm.types.js';

const router = Router();

/**
 * GET /api/v1/crm/leads
 * Search and filter leads by text, appointment status, min score, and tags
 */
router.get('/leads', async (req: Request, res: Response) => {
  try {
    const businessId = (req.query.businessId as string) || 'default-business-id';
    const search = (req.query.search as string) || '';
    const appointmentStatus = (req.query.appointmentStatus as AppointmentStatus | 'all') || 'all';
    const minScore = req.query.minScore ? parseInt(req.query.minScore as string, 10) : 0;
    const tags = req.query.tags ? (req.query.tags as string).split(',') : [];
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;

    const result = await crmService.searchAndFilter(businessId, {
      search,
      appointmentStatus,
      minScore,
      tags,
      limit,
      offset,
    });

    res.status(200).json(result);
  } catch (error: any) {
    console.error('Error fetching leads:', error);
    res.status(500).json({ error: 'CRMError', message: 'Failed to retrieve leads.' });
  }
});

/**
 * POST /api/v1/crm/leads
 * Upsert lead record from conversation
 */
router.post('/leads', async (req: Request, res: Response) => {
  try {
    const {
      businessId = 'default-business-id',
      phone,
      name,
      email,
      business,
      interest,
      budget,
      conversationSummary,
      appointmentStatus,
      tags,
    } = req.body;

    if (!phone) {
      res.status(400).json({ error: 'ValidationError', message: 'Phone number is required.' });
      return;
    }

    const lead = await crmService.upsertLead({
      businessId,
      phone,
      name,
      email,
      business,
      interest,
      budget,
      conversationSummary,
      appointmentStatus,
      tags,
    });

    res.status(200).json({ success: true, lead });
  } catch (error: any) {
    console.error('Error upserting lead:', error);
    res.status(500).json({ error: 'CRMError', message: 'Failed to save lead.' });
  }
});

/**
 * POST /api/v1/crm/leads/:id/tags
 * Add tag to lead
 */
router.post('/leads/:id/tags', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { tag } = req.body;

    if (!tag) {
      res.status(400).json({ error: 'ValidationError', message: 'Tag name is required.' });
      return;
    }

    const updated = await crmService.addTag(id, String(tag));
    if (!updated) {
      res.status(404).json({ error: 'NotFound', message: 'Lead not found.' });
      return;
    }

    res.status(200).json({ success: true, lead: updated });
  } catch (error: any) {
    console.error('Error adding tag:', error);
    res.status(500).json({ error: 'CRMError', message: 'Failed to add tag.' });
  }
});

/**
 * DELETE /api/v1/crm/leads/:id/tags/:tag
 * Remove tag from lead
 */
router.delete('/leads/:id/tags/:tag', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const tag = String(req.params.tag);
    const updated = await crmService.removeTag(id, tag);
    if (!updated) {
      res.status(404).json({ error: 'NotFound', message: 'Lead not found.' });
      return;
    }

    res.status(200).json({ success: true, lead: updated });
  } catch (error: any) {
    console.error('Error removing tag:', error);
    res.status(500).json({ error: 'CRMError', message: 'Failed to remove tag.' });
  }
});

/**
 * GET /api/v1/crm/export-csv
 * Stream/Download CSV of captured leads
 */
router.get('/export-csv', async (req: Request, res: Response) => {
  try {
    const businessId = (req.query.businessId as string) || 'default-business-id';
    const csvContent = await crmService.exportToCsv(businessId, req.query as any);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="whatsapp_leads_export.csv"');
    res.status(200).send(csvContent);
  } catch (error: any) {
    console.error('Error exporting CSV:', error);
    res.status(500).json({ error: 'ExportError', message: 'Failed to generate CSV export.' });
  }
});

export default router;
