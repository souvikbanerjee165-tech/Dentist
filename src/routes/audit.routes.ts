import { Router, Request, Response } from 'express';
import { ClinicAuditService } from '../services/audit/clinic.audit.service.js';

const router = Router();

// POST /api/v1/audit/analyze
router.post('/analyze', (req: Request, res: Response) => {
  try {
    const { clinicName, websiteUrl, city } = req.body;
    const auditReport = ClinicAuditService.generateAudit(
      clinicName || 'London Aesthetic Smiles',
      websiteUrl || 'https://www.londonaestheticsmiles.co.uk',
      city || 'London'
    );
    res.json({ success: true, report: auditReport });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
