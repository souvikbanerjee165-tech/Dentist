import { Router, Request, Response } from 'express';
import { ClinicProvisioningService } from '../services/onboarding/provisioning.service.js';

const router = Router();

// POST /api/v1/onboarding/provision
router.post('/provision', async (req: Request, res: Response) => {
  try {
    const {
      clinicName,
      doctorName,
      city,
      phone,
      email,
      openingHours,
      services,
      emergencyRules,
      notificationPhone,
    } = req.body;

    if (!clinicName || !phone) {
      return res.status(400).json({ success: false, message: 'clinicName and phone are required.' });
    }

    const result = await ClinicProvisioningService.provisionClinic({
      clinicName,
      doctorName: doctorName || 'Dr. Sarah Jensen, BDS',
      city: city || 'London',
      phone,
      email: email || 'contact@clinic.co.uk',
      openingHours: openingHours || 'Mon-Fri 8:30am - 6:00pm',
      services: services || [
        { name: 'Routine Exam & 3D Scan', price: 95, category: 'General' },
        { name: 'Emergency Pain Relief', price: 95, category: 'Emergency' },
        { name: 'Laser Teeth Whitening', price: 395, category: 'Cosmetic' },
        { name: 'Dental Implants', price: 2800, category: 'Implants' },
      ],
      emergencyRules,
      notificationPhone,
    });

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
