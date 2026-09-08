import mongoose from 'mongoose';
import { OffboardingRequest } from './offboardingRequest.model.js';
import { WorkflowInstance } from '../workflow/workflowInstance.model.js';
import { employeeService } from '../employee/employee.service.js';
import { workflowEngineService } from '../workflow/workflowEngine.service.js';
import { eventBus } from '../events/eventBus.js';

export const OFFBOARDING_WORKFLOW_CODE = 'EMPLOYEE_OFFBOARDING_V1';

export const STAGE_TO_DEPT_MAP = {
  REPORTING_MANAGER_CLEARANCE: 'reportingManager',
  ADMIN_SYSTEMS_CLEARANCE: 'adminSystems',
  ACCOUNTS_CLEARANCE: 'accounts',
  PERSONNEL_CLEARANCE: 'personnel',
  HR_FINAL_CLEARANCE: 'hr',
};

export const offboardingService = {
  async ensureWorkflowDefinitionExists() {
    await workflowEngineService.createOrUpdateDefinition({
      code: OFFBOARDING_WORKFLOW_CODE,
      name: 'BlazeUp Standard Employee Clearance Workflow',
      description: 'Official multi-department clearance pipeline involving PM, Admin, Accounts, Personnel, and HR.',
      steps: [
        {
          stepOrder: 1,
          name: 'Managerial Clearance',
          executionMode: 'SEQUENTIAL',
          stages: [
            {
              stageKey: 'REPORTING_MANAGER_CLEARANCE',
              name: 'Reporting Manager Clearance',
              description: 'Verification of project handoff, knowledge transfer, and client access revocation',
              approverType: 'DYNAMIC_MANAGER',
              requiredRole: 'REPORTING_MANAGER',
              slaHours: 48,
              requiredChecklistKeys: ['projectCompleted', 'knowledgeTransferDone', 'clientAccessRemoved'],
            },
          ],
        },
        {
          stepOrder: 2,
          name: 'Departmental Parallel Clearances',
          executionMode: 'PARALLEL',
          stages: [
            {
              stageKey: 'ADMIN_SYSTEMS_CLEARANCE',
              name: 'Admin & Systems Clearance',
              description: 'Hardware asset return (laptop, phone, keys) and system/email deactivation',
              approverType: 'ROLE',
              requiredRole: 'ADMIN_SYSTEMS',
              slaHours: 72,
              requiredChecklistKeys: [
                'laptopReturned',
                'chargerReturned',
                'phoneReturned',
                'dataCardReturned',
                'keysReturned',
                'emailDeactivated',
                'systemAccessRevoked',
              ],
            },
            {
              stageKey: 'ACCOUNTS_CLEARANCE',
              name: 'Accounts & Finance Clearance',
              description: 'Settlement of travel advances, staff loans, salary advances, and imprest balances',
              approverType: 'ROLE',
              requiredRole: 'ACCOUNTS',
              slaHours: 72,
              requiredChecklistKeys: [
                'travelAdvancesCleared',
                'staffLoansCleared',
                'salaryAdvancesCleared',
                'imprestSettled',
              ],
            },
            {
              stageKey: 'PERSONNEL_CLEARANCE',
              name: 'Personnel / Facilities Clearance',
              description: 'Physical ID card, facility access/swipe card, and business cards surrender',
              approverType: 'ROLE',
              requiredRole: 'PERSONNEL',
              slaHours: 72,
              requiredChecklistKeys: ['idCardReturned', 'accessCardReturned', 'businessCardsSurrendered'],
            },
          ],
        },
        {
          stepOrder: 3,
          name: 'HR Final Certification',
          executionMode: 'SEQUENTIAL',
          stages: [
            {
              stageKey: 'HR_FINAL_CLEARANCE',
              name: 'HR Final Clearance & Signoff',
              description: 'Final exit interview, resignation signoff, and document generation trigger',
              approverType: 'ROLE',
              requiredRole: 'HR_ADMIN',
              slaHours: 24,
              requiredChecklistKeys: ['exitInterviewCompleted', 'resignationAcceptanceSigned', 'finalSettlementApproved'],
            },
          ],
        },
      ],
    });
  },

  async initiateOffboarding(data) {
    const employee = await employeeService.findById(data.employeeId);

    const existing = await OffboardingRequest.findOne({
      employeeId: employee._id,
      status: { $in: ['INITIATED', 'IN_PROGRESS'] },
    });
    if (existing) {
      const error = new Error(`An active offboarding case already exists for employee '${employee.name}'.`);
      error.status = 400;
      throw error;
    }

    const manager = await employeeService.getReportingManager(employee._id.toString());
    const dynamicApprovers = {};
    if (manager) {
      dynamicApprovers['REPORTING_MANAGER_CLEARANCE'] = manager._id.toString();
    }

    const request = new OffboardingRequest({
      employeeId: employee._id,
      resignationDate: new Date(data.resignationDate),
      lastWorkingDay: new Date(data.lastWorkingDay),
      reason: data.reason,
      notes: data.notes,
      initiatedBy: data.initiatedById ? new mongoose.Types.ObjectId(data.initiatedById) : undefined,
      status: 'IN_PROGRESS',
    });

    const savedRequest = await request.save();

    const workflowInstance = await workflowEngineService.startInstance({
      definitionCode: OFFBOARDING_WORKFLOW_CODE,
      targetEntityType: 'OFFBOARDING_REQUEST',
      targetEntityId: savedRequest._id.toString(),
      dynamicApprovers,
      metadata: {
        employeeName: employee.name,
        employeeCode: employee.employeeId,
        department: employee.department,
        lastWorkingDay: data.lastWorkingDay,
      },
    });

    savedRequest.workflowInstanceId = workflowInstance._id;
    await savedRequest.save();

    await employeeService.updateStatus(employee._id.toString(), 'IN_OFFBOARDING');

    eventBus.emit('offboarding.initiated', {
      offboardingId: savedRequest._id.toString(),
      employeeId: employee._id.toString(),
      employeeName: employee.name,
      lastWorkingDay: data.lastWorkingDay,
      workflowInstanceId: workflowInstance._id.toString(),
    });

    return this.getRequestById(savedRequest._id.toString());
  },

  async submitDepartmentClearance(offboardingId, stageKey, data) {
    const request = await OffboardingRequest.findById(offboardingId);
    if (!request) {
      const error = new Error(`Offboarding request '${offboardingId}' not found.`);
      error.status = 404;
      throw error;
    }

    if (!request.workflowInstanceId) {
      const error = new Error('No workflow instance associated with this offboarding request.');
      error.status = 400;
      throw error;
    }

    const deptKey = STAGE_TO_DEPT_MAP[stageKey];
    if (!deptKey) {
      const error = new Error(`Unknown stage key '${stageKey}'.`);
      error.status = 400;
      throw error;
    }

    const updatedInstance = await workflowEngineService.processStageAction(
      request.workflowInstanceId.toString(),
      stageKey,
      {
        decision: data.decision,
        remarks: data.remarks,
        payload: data.checklistData,
        actorUserId: data.actorUserId,
        actorRole: data.actorRole,
        actorName: data.actorName,
      }
    );

    const isApproved = data.decision === 'APPROVE';
    const actorObjectId = mongoose.Types.ObjectId.isValid(data.actorUserId)
      ? new mongoose.Types.ObjectId(data.actorUserId)
      : undefined;

    if (deptKey === 'reportingManager') {
      request.reportingManagerClearance = {
        projectCompleted: data.checklistData?.projectCompleted ?? true,
        knowledgeTransferDone: data.checklistData?.knowledgeTransferDone ?? true,
        clientAccessRemoved: data.checklistData?.clientAccessRemoved ?? true,
        cleared: isApproved,
        clearedBy: actorObjectId,
        clearedByName: data.actorName,
        clearedAt: new Date(),
        remarks: data.remarks,
      };
    } else if (deptKey === 'adminSystems') {
      request.adminSystemsClearance = {
        ...request.adminSystemsClearance,
        laptopReturned: data.checklistData?.laptopReturned ?? true,
        chargerReturned: data.checklistData?.chargerReturned ?? true,
        phoneReturned: data.checklistData?.phoneReturned ?? true,
        dataCardReturned: data.checklistData?.dataCardReturned ?? true,
        keysReturned: data.checklistData?.keysReturned ?? true,
        emailDeactivated: data.checklistData?.emailDeactivated ?? request.adminSystemsClearance?.emailDeactivated ?? false,
        systemAccessRevoked: data.checklistData?.systemAccessRevoked ?? request.adminSystemsClearance?.systemAccessRevoked ?? false,
        cleared: isApproved,
        clearedBy: actorObjectId,
        clearedByName: data.actorName,
        clearedAt: new Date(),
        remarks: data.remarks,
      };
    } else if (deptKey === 'accounts') {
      request.accountsClearance = {
        travelAdvancesCleared: data.checklistData?.travelAdvancesCleared ?? true,
        travelAdvanceAmount: data.checklistData?.travelAdvanceAmount ?? 0,
        staffLoansCleared: data.checklistData?.staffLoansCleared ?? true,
        staffLoanAmount: data.checklistData?.staffLoanAmount ?? 0,
        salaryAdvancesCleared: data.checklistData?.salaryAdvancesCleared ?? true,
        salaryAdvanceAmount: data.checklistData?.salaryAdvanceAmount ?? 0,
        imprestSettled: data.checklistData?.imprestSettled ?? true,
        imprestAmount: data.checklistData?.imprestAmount ?? 0,
        cleared: isApproved,
        clearedBy: actorObjectId,
        clearedByName: data.actorName,
        clearedAt: new Date(),
        remarks: data.remarks,
      };
    } else if (deptKey === 'personnel') {
      request.personnelClearance = {
        idCardReturned: data.checklistData?.idCardReturned ?? true,
        accessCardReturned: data.checklistData?.accessCardReturned ?? true,
        businessCardsSurrendered: data.checklistData?.businessCardsSurrendered ?? true,
        cleared: isApproved,
        clearedBy: actorObjectId,
        clearedByName: data.actorName,
        clearedAt: new Date(),
        remarks: data.remarks,
      };
    } else if (deptKey === 'hr') {
      request.hrClearance = {
        exitInterviewCompleted: data.checklistData?.exitInterviewCompleted ?? true,
        resignationAcceptanceSigned: data.checklistData?.resignationAcceptanceSigned ?? true,
        finalSettlementApproved: data.checklistData?.finalSettlementApproved ?? true,
        cleared: isApproved,
        clearedBy: actorObjectId,
        clearedByName: data.actorName,
        clearedAt: new Date(),
        remarks: data.remarks,
      };
    }

    if (updatedInstance.status === 'COMPLETED') {
      request.status = 'CLEARED';
      await employeeService.updateStatus(request.employeeId.toString(), 'OFFBOARDED');
    } else if (updatedInstance.status === 'REJECTED') {
      request.status = 'REJECTED';
    }

    await request.save();
    return this.getRequestById(offboardingId);
  },

  async revokeAccess(offboardingId, data) {
    const request = await OffboardingRequest.findById(offboardingId);
    if (!request) {
      const error = new Error(`Offboarding request '${offboardingId}' not found.`);
      error.status = 404;
      throw error;
    }

    request.adminSystemsClearance = {
      ...request.adminSystemsClearance,
      emailDeactivated: data.deactivateEmail,
      systemAccessRevoked: data.revokeSystemAccess,
      accessRevocationTimestamp: new Date(),
      accessRevokedBy: data.revokedByName || data.revokedByUserId,
      technicalNotes: data.technicalNotes,
    };

    await request.save();

    eventBus.emit('offboarding.access.revoked', {
      offboardingId: request._id.toString(),
      employeeId: request.employeeId.toString(),
      emailDeactivated: data.deactivateEmail,
      systemAccessRevoked: data.revokeSystemAccess,
      timestamp: request.adminSystemsClearance.accessRevocationTimestamp,
    });

    return this.getRequestById(offboardingId);
  },

  async sendReminder(offboardingId, data) {
    const request = await OffboardingRequest.findById(offboardingId);
    if (!request) {
      const error = new Error(`Offboarding request '${offboardingId}' not found.`);
      error.status = 404;
      throw error;
    }

    request.reminders.push({
      stageKey: data.stageKey,
      sentBy: data.senderUserId,
      sentByName: data.senderName || 'HR Administrator',
      note: data.customMessage || 'Clearance is pending action. Please review promptly.',
      sentAt: new Date(),
    });

    await request.save();

    eventBus.emit('offboarding.reminder.sent', {
      offboardingId: request._id.toString(),
      stageKey: data.stageKey,
      note: data.customMessage,
      senderName: data.senderName,
    });

    return this.getRequestById(offboardingId);
  },

  async withdrawOffboarding(offboardingId, data = {}) {
    const request = await OffboardingRequest.findById(offboardingId);
    if (!request) {
      const error = new Error(`Offboarding request '${offboardingId}' not found.`);
      error.status = 404;
      throw error;
    }

    if (request.status === 'CLEARED') {
      const error = new Error('Cannot withdraw an offboarding request that has already been cleared and finalized by HR.');
      error.status = 400;
      throw error;
    }

    if (request.status === 'WITHDRAWN') {
      const error = new Error('This offboarding request has already been withdrawn.');
      error.status = 400;
      throw error;
    }

    request.status = 'WITHDRAWN';
    request.notes = (request.notes || '') + `\n[WITHDRAWN]: ${data.reason || 'Withdrawn by employee'}`;
    await request.save();

    // Cancel workflow instance
    if (request.workflowInstanceId) {
      const instance = await WorkflowInstance.findById(request.workflowInstanceId);
      if (instance) {
        instance.status = 'CANCELLED';
        instance.activeStageKeys = [];
        instance.history.push({
          event: 'INSTANCE_CANCELLED',
          remarks: `Workflow cancelled: Resignation withdrawn by ${data.actorName || 'employee'}. Reason: ${data.reason || 'No reason specified'}`,
          actorUserId: data.actorUserId,
          actorName: data.actorName,
          timestamp: new Date(),
        });
        await instance.save();
      }
    }

    // Restore employee status to ACTIVE
    if (request.employeeId) {
      await employeeService.updateStatus(request.employeeId.toString(), 'ACTIVE');
    }

    eventBus.emit('offboarding.withdrawn', {
      offboardingId: request._id.toString(),
      employeeId: request.employeeId.toString(),
      reason: data.reason,
      actorName: data.actorName,
    });

    return this.getRequestById(offboardingId);
  },

  async getDashboardMetrics() {
    const total = await OffboardingRequest.countDocuments();
    const active = await OffboardingRequest.countDocuments({ status: 'IN_PROGRESS' });
    const cleared = await OffboardingRequest.countDocuments({ status: 'CLEARED' });
    const rejected = await OffboardingRequest.countDocuments({ status: 'REJECTED' });

    const now = new Date();
    const threeDaysAhead = new Date();
    threeDaysAhead.setDate(now.getDate() + 3);

    const urgentCases = await OffboardingRequest.countDocuments({
      status: 'IN_PROGRESS',
      lastWorkingDay: { $lte: threeDaysAhead },
    });

    const [adminInstances, accountsInstances, personnelInstances, hrInstances, managerInstances] =
      await Promise.all([
        workflowEngineService.getActiveTasksForRole('ADMIN_SYSTEMS'),
        workflowEngineService.getActiveTasksForRole('ACCOUNTS'),
        workflowEngineService.getActiveTasksForRole('PERSONNEL'),
        workflowEngineService.getActiveTasksForRole('HR_ADMIN'),
        workflowEngineService.getActiveTasksForRole('REPORTING_MANAGER'),
      ]);

    return {
      overview: {
        total,
        active,
        cleared,
        rejected,
        urgentOrBreached: urgentCases,
      },
      departmentBottlenecks: {
        reportingManager: managerInstances.length,
        adminSystems: adminInstances.length,
        accounts: accountsInstances.length,
        personnel: personnelInstances.length,
        hr: hrInstances.length,
      },
    };
  },

  async listRequests(filter = {}) {
    const query = {};
    if (filter.status) query.status = filter.status;

    if (filter.employeeId) {
      try {
        const emp = await employeeService.findById(filter.employeeId);
        if (emp) {
          query.employeeId = emp._id;
        }
      } catch (e) {
        return [];
      }
    }

    let requests = await OffboardingRequest.find(query)
      .populate('employeeId')
      .populate('initiatedBy', 'name email designation')
      .populate('workflowInstanceId')
      .sort({ createdAt: -1 });

    if (filter.reportingManagerId) {
      let mgrId = null;
      try {
        const mgr = await employeeService.findById(filter.reportingManagerId);
        if (mgr) mgrId = mgr._id.toString();
      } catch (e) {
        mgrId = filter.reportingManagerId.toString();
      }

      requests = requests.filter((r) => {
        const repMgr = r.employeeId?.reportingManagerId;
        const repMgrId = repMgr?._id ? repMgr._id.toString() : repMgr?.toString();
        return repMgrId === mgrId;
      });
    }

    return requests;
  },

  async getRequestById(id) {
    const request = await OffboardingRequest.findById(id)
      .populate('employeeId')
      .populate('initiatedBy', 'name email designation')
      .populate('workflowInstanceId');

    if (!request) {
      const error = new Error(`Offboarding request '${id}' not found.`);
      error.status = 404;
      throw error;
    }
    return request;
  },

  async getMyPendingTasks(role, userId) {
    if (role === 'EMPLOYEE' && userId) {
      let empDoc = null;
      try {
        empDoc = await employeeService.findById(userId);
      } catch (e) {}
      if (empDoc) {
        return OffboardingRequest.find({ employeeId: empDoc._id })
          .populate('employeeId')
          .populate('workflowInstanceId')
          .sort({ createdAt: -1 });
      }
      return [];
    }

    let instances = [];

    if (role === 'REPORTING_MANAGER') {
      let managerDoc = null;
      if (userId) {
        try {
          managerDoc = await employeeService.findById(userId);
        } catch (e) {}
      }

      const lookupIds = [];
      if (userId) lookupIds.push(userId.toString());
      if (managerDoc) {
        lookupIds.push(managerDoc._id.toString());
        lookupIds.push(managerDoc.employeeId);
      }

      instances = await WorkflowInstance.find({
        status: 'IN_PROGRESS',
        stageStates: {
          $elemMatch: {
            status: 'IN_PROGRESS',
            $or: [
              { assignedUserId: { $in: lookupIds } },
              { requiredRole: 'REPORTING_MANAGER' },
            ],
          },
        },
      }).sort({ updatedAt: -1 });
    } else {
      instances = await workflowEngineService.getActiveTasksForRole(role);
    }

    const instanceIds = instances.map((inst) => inst._id);

    let requests = await OffboardingRequest.find({ workflowInstanceId: { $in: instanceIds } })
      .populate('employeeId')
      .populate('workflowInstanceId')
      .sort({ lastWorkingDay: 1 });

    if (role === 'REPORTING_MANAGER' && userId) {
      let managerDoc = null;
      try {
        managerDoc = await employeeService.findById(userId);
      } catch (e) {}

      if (managerDoc) {
        const managerIdStr = managerDoc._id.toString();
        requests = requests.filter((r) => {
          const repMgr = r.employeeId?.reportingManagerId;
          const repMgrId = repMgr?._id ? repMgr._id.toString() : repMgr?.toString();
          return repMgrId === managerIdStr;
        });
      }
    }

    return requests;
  },
};
