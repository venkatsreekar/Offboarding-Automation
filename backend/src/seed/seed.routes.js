import { Router } from 'express';
import { seedService } from './seed.service.js';

export const seedRouter = Router();

seedRouter.post('/reset', async (req, res) => {
  try {
    const result = await seedService.seedDemoData();
    res.json({
      success: true,
      message: 'Demo dataset successfully seeded with employees and offboarding cases',
      data: result,
    });
  } catch (err) {
    console.error('Error seeding data:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});
