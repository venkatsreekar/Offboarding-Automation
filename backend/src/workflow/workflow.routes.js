import { Router } from 'express';
import { workflowEngineService } from './workflowEngine.service.js';

const router = Router();

router.post('/definitions', async (req, res, next) => {
  try {
    const result = await workflowEngineService.createOrUpdateDefinition(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

router.get('/definitions', async (req, res, next) => {
  try {
    const result = await workflowEngineService.listDefinitions();
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get('/definitions/:code', async (req, res, next) => {
  try {
    const result = await workflowEngineService.getDefinitionByCode(req.params.code);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get('/instances/:id', async (req, res, next) => {
  try {
    const result = await workflowEngineService.getInstance(req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get('/instances/by-entity/:entityType/:entityId', async (req, res, next) => {
  try {
    const result = await workflowEngineService.getInstanceByTarget(req.params.entityType, req.params.entityId);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.post('/instances/:id/stages/:stageKey/action', async (req, res, next) => {
  try {
    const result = await workflowEngineService.processStageAction(
      req.params.id,
      req.params.stageKey,
      req.body
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
