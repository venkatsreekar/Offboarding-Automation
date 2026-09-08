import { Router } from 'express';
import { notificationService } from './notification.service.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const { role, userId } = req.query;
    const notifications = await notificationService.getForUserOrRole(role, userId);
    res.json(notifications);
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/read', async (req, res, next) => {
  try {
    const updated = await notificationService.markAsRead(req.params.id);
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

export default router;
