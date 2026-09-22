import { Router, Request, Response } from 'express';
import { clinicProfileService } from '../services/config/clinic-profile.service.js';

const router = Router();

/**
 * GET /api/v1/admin/clinic-profile
 * Returns active white-label clinic profile and branding
 */
router.get('/clinic-profile', (_req: Request, res: Response) => {
  try {
    const config = clinicProfileService.getConfig();
    res.status(200).json({
      success: true,
      config,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/admin/clinic-profile
 * Updates white-label clinic settings (called during $1,500 onboarding)
 */
router.post('/clinic-profile', (req: Request, res: Response) => {
  try {
    const updates = req.body;
    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, error: 'No profile updates provided.' });
    }

    const updated = clinicProfileService.updateConfig(updates);
    console.log(`🏥 [WHITE-LABEL ONBOARDING] Updated Clinic Profile for "${updated.name}" (${updated.legalBusinessName})`);

    res.status(200).json({
      success: true,
      config: updated,
      message: 'Clinic branding, providers, carrier credentials, and billing configured successfully!',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/admin/clinic-profile/reset
 * Resets configuration to default demo clinic
 */
router.post('/clinic-profile/reset', (_req: Request, res: Response) => {
  try {
    const resetConfig = clinicProfileService.resetToDefault();
    res.status(200).json({
      success: true,
      config: resetConfig,
      message: 'Reset to default demo clinic profile.',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
