import { Router } from 'express';
import { offboardingService } from './offboarding.service.js';

const router = Router();

router.post('/initiate', async (req, res, next) => {
  try {
    const result = await offboardingService.initiateOffboarding(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

router.get('/dashboard', async (req, res, next) => {
  try {
    const metrics = await offboardingService.getDashboardMetrics();
    res.json(metrics);
  } catch (err) {
    next(err);
  }
});

router.get('/requests', async (req, res, next) => {
  try {
    const { status, search, employeeId, reportingManagerId } = req.query;
    const requests = await offboardingService.listRequests({ status, search, employeeId, reportingManagerId });
    res.json(requests);
  } catch (err) {
    next(err);
  }
});

router.get('/my-tasks', async (req, res, next) => {
  try {
    const { role, userId } = req.query;
    const tasks = await offboardingService.getMyPendingTasks(role, userId);
    res.json(tasks);
  } catch (err) {
    next(err);
  }
});

router.get('/requests/:id', async (req, res, next) => {
  try {
    const request = await offboardingService.getRequestById(req.params.id);
    res.json(request);
  } catch (err) {
    next(err);
  }
});

router.post('/requests/:id/clearance/:stageKey', async (req, res, next) => {
  try {
    const result = await offboardingService.submitDepartmentClearance(
      req.params.id,
      req.params.stageKey,
      req.body
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.post('/requests/:id/revoke-access', async (req, res, next) => {
  try {
    const result = await offboardingService.revokeAccess(req.params.id, req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.post('/requests/:id/remind', async (req, res, next) => {
  try {
    const result = await offboardingService.sendReminder(req.params.id, req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.post('/requests/:id/withdraw', async (req, res, next) => {
  try {
    const result = await offboardingService.withdrawOffboarding(req.params.id, req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
