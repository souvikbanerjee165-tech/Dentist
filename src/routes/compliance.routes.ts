import { Router, Request, Response } from 'express';
import { complianceAuditService } from '../services/compliance/compliance-audit.service.js';
import { requireStaffOrDoctorAuth } from '../middleware/auth.middleware.js';

const router = Router();

/**
 * GET /api/v1/compliance/export-audit-log
 * 1-Click CSV Download of all HIPAA/TCPA Compliance Audit Records
 * Protected: Staff/Doctor auth required
 */
router.get('/export-audit-log', requireStaffOrDoctorAuth, (_req: Request, res: Response) => {
  try {
    const csvData = complianceAuditService.exportAuditLogCsv();
    const filename = `hipaa_compliance_audit_log_${new Date().toISOString().split('T')[0]}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(csvData);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/compliance/audit-events
 * Lists recent security and compliance events
 * Protected: Staff/Doctor auth required
 */
router.get('/audit-events', requireStaffOrDoctorAuth, (req: Request, res: Response) => {
  try {
    const limit = Number(req.query.limit) || 100;
    const events = complianceAuditService.getEvents(limit);

    res.status(200).json({
      success: true,
      count: events.length,
      events,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/compliance/baa-summary
 * Returns dynamic BAA agreement terms personalized for the clinic
 */
router.get('/baa-summary', (_req: Request, res: Response) => {
  try {
    const baa = complianceAuditService.getBaaAgreement();
    res.status(200).json({
      success: true,
      baa,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
