import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { Employee } from './employee/employee.model.js';
import { seedService } from './seed/seed.service.js';

import employeeRouter from './employee/employee.routes.js';
import workflowRouter from './workflow/workflow.routes.js';
import offboardingRouter from './offboarding/offboarding.routes.js';
import documentRouter from './documents/document.routes.js';
import auditRouter from './audit/audit.routes.js';
import notificationRouter from './notifications/notification.routes.js';
import { seedRouter } from './seed/seed.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'BlazeUp HROS Offboarding Engine',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/v1/employees', employeeRouter);
app.use('/api/v1/workflows', workflowRouter);
app.use('/api/v1/offboarding', offboardingRouter);
app.use('/api/v1/documents', documentRouter);
app.use('/api/v1/audit', auditRouter);
app.use('/api/v1/notifications', notificationRouter);
app.use('/api/v1/seed', seedRouter);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
});

// Start Server
async function start() {
  try {
    await connectDB();
    
    // Auto-seed if database is fresh
    const empCount = await Employee.countDocuments();
    if (empCount === 0) {
      console.log('🌱 Database is empty. Populating demo offboarding dataset...');
      await seedService.seedDemoData();
    } else {
      console.log(`ℹ️ Database already populated with ${empCount} employees.`);
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`====================================================`);
      console.log(`🚀 BlazeUp HROS Offboarding Engine running on port ${PORT}`);
      console.log(`📡 Health Check: http://localhost:${PORT}/api/v1/health`);
      console.log(`====================================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
