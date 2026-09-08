import { AuditLog } from './auditLog.model.js';
import { eventBus } from '../events/eventBus.js';

export const auditService = {
  async log(data) {
    const entry = new AuditLog({
      ...data,
      timestamp: data.timestamp || new Date(),
    });
    return entry.save();
  },

  async getLogsForEntity(entityType, entityId) {
    return AuditLog.find({ entityType, entityId }).sort({ timestamp: -1 });
  },
};

// Event listeners for automatic audit logging
eventBus.on('offboarding.initiated', async (event) => {
  await auditService.log({
    entityType: 'OFFBOARDING_REQUEST',
    entityId: event.offboardingId,
    action: 'OFFBOARDING_INITIATED',
    actorRole: 'HR_ADMIN',
    details: {
      employeeId: event.employeeId,
      employeeName: event.employeeName,
      lastWorkingDay: event.lastWorkingDay,
      workflowInstanceId: event.workflowInstanceId,
    },
  });
});

eventBus.on('workflow.stage.approved', async (event) => {
  await auditService.log({
    entityType: event.targetEntityType || 'WORKFLOW_INSTANCE',
    entityId: event.targetEntityId || event.instanceId,
    action: 'STAGE_APPROVED',
    actorId: event.actorUserId,
    actorRole: event.actorRole,
    details: {
      stageKey: event.stageKey,
      remarks: event.remarks,
      payload: event.payload,
    },
  });
});

eventBus.on('workflow.stage.rejected', async (event) => {
  await auditService.log({
    entityType: event.targetEntityType || 'WORKFLOW_INSTANCE',
    entityId: event.targetEntityId || event.instanceId,
    action: 'STAGE_REJECTED',
    actorId: event.actorUserId,
    actorRole: event.actorRole,
    details: {
      stageKey: event.stageKey,
      remarks: event.remarks,
    },
  });
});

eventBus.on('offboarding.access.revoked', async (event) => {
  await auditService.log({
    entityType: 'OFFBOARDING_REQUEST',
    entityId: event.offboardingId,
    action: 'ACCESS_REVOKED',
    actorRole: 'ADMIN_SYSTEMS',
    details: {
      emailDeactivated: event.emailDeactivated,
      systemAccessRevoked: event.systemAccessRevoked,
      revocationTimestamp: event.timestamp,
    },
  });
});

eventBus.on('offboarding.reminder.sent', async (event) => {
  await auditService.log({
    entityType: 'OFFBOARDING_REQUEST',
    entityId: event.offboardingId,
    action: 'REMINDER_SENT',
    actorRole: 'HR_ADMIN',
    actorName: event.senderName,
    details: {
      stageKey: event.stageKey,
      note: event.note,
    },
  });
});

eventBus.on('workflow.completed', async (event) => {
  await auditService.log({
    entityType: event.targetEntityType || 'WORKFLOW_INSTANCE',
    entityId: event.targetEntityId || event.instanceId,
    action: 'WORKFLOW_COMPLETED',
    actorRole: 'SYSTEM',
    details: {
      completedAt: event.completedAt,
    },
  });
});
