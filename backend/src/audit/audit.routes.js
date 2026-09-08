import { Router } from 'express';
import { auditService } from './audit.service.js';

const router = Router();

router.get('/:entityType/:entityId', async (req, res, next) => {
  try {
    const logs = await auditService.getLogsForEntity(req.params.entityType, req.params.entityId);
    res.json(logs);
  } catch (err) {
    next(err);
  }
});

export default router;
