import { Router } from 'express';
import { employeeService } from './employee.service.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const { department, status, role, search } = req.query;
    const employees = await employeeService.findAll({ department, status, role, search });
    res.json(employees);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const employee = await employeeService.findById(req.params.id);
    res.json(employee);
  } catch (err) {
    next(err);
  }
});

router.get('/:id/manager', async (req, res, next) => {
  try {
    const manager = await employeeService.getReportingManager(req.params.id);
    res.json(manager);
  } catch (err) {
    next(err);
  }
});

export default router;
