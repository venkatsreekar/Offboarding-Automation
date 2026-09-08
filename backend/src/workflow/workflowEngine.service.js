import { WorkflowDefinition } from './workflowDefinition.model.js';
import { WorkflowInstance } from './workflowInstance.model.js';
import { eventBus } from '../events/eventBus.js';

export const workflowEngineService = {
  /**
   * Registers or updates a generic workflow definition template.
   */
  async createOrUpdateDefinition(data) {
    const code = data.code.toUpperCase();
    const existing = await WorkflowDefinition.findOne({ code });

    if (existing) {
      existing.name = data.name;
      existing.description = data.description;
      existing.version = (data.version || existing.version) + 1;
      existing.steps = data.steps;
      return existing.save();
    }

    const created = new WorkflowDefinition({
      ...data,
      code,
      version: data.version || 1,
    });
    return created.save();
  },

  /**
   * Retrieves active definition by its unique code.
   */
  async getDefinitionByCode(code) {
    const def = await WorkflowDefinition.findOne({ code: code.toUpperCase(), isActive: true });
    if (!def) {
      const error = new Error(`Workflow definition with code '${code}' not found.`);
      error.status = 404;
      throw error;
    }
    return def;
  },

  /**
   * Lists all workflow definitions.
   */
  async listDefinitions() {
    return WorkflowDefinition.find().sort({ createdAt: -1 });
  },

  /**
   * Instantiates and starts a workflow instance for a business entity.
   */
  async startInstance({ definitionCode, targetEntityType, targetEntityId, dynamicApprovers = {}, metadata = {} }) {
    const definition = await this.getDefinitionByCode(definitionCode);

    if (!definition.steps || definition.steps.length === 0) {
      const error = new Error(`Workflow definition '${definitionCode}' has no steps configured.`);
      error.status = 400;
      throw error;
    }

    const sortedSteps = [...definition.steps].sort((a, b) => a.stepOrder - b.stepOrder);
    const initialStep = sortedSteps[0];

    const stageStates = [];
    const activeStageKeys = [];

    for (const step of sortedSteps) {
      for (const stage of step.stages) {
        const isInitial = step.stepOrder === initialStep.stepOrder;
        const assignedUserId = dynamicApprovers[stage.stageKey];

        const state = {
          stageKey: stage.stageKey,
          name: stage.name,
          stepOrder: step.stepOrder,
          status: isInitial ? 'IN_PROGRESS' : 'PENDING',
          requiredRole: stage.requiredRole,
          assignedRole: stage.requiredRole,
          assignedUserId,
          payload: {},
        };

        stageStates.push(state);

        if (isInitial) {
          activeStageKeys.push(stage.stageKey);
        }
      }
    }

    const instance = new WorkflowInstance({
      definitionId: definition._id,
      definitionCode: definition.code,
      targetEntityType,
      targetEntityId,
      status: 'IN_PROGRESS',
      currentStepOrder: initialStep.stepOrder,
      activeStageKeys,
      stageStates,
      history: [
        {
          event: 'INSTANCE_STARTED',
          stepOrder: initialStep.stepOrder,
          remarks: `Workflow initiated with Step ${initialStep.stepOrder}: ${initialStep.name}`,
          metadata,
          timestamp: new Date(),
        },
      ],
    });

    const saved = await instance.save();

    eventBus.emit('workflow.instance.started', {
      instanceId: saved._id.toString(),
      targetEntityType,
      targetEntityId,
    });

    for (const stageKey of activeStageKeys) {
      eventBus.emit('workflow.stage.activated', {
        instanceId: saved._id.toString(),
        stageKey,
        stepOrder: initialStep.stepOrder,
        targetEntityType,
        targetEntityId,
      });
    }

    return saved;
  },

  /**
   * Processes an approval or rejection on an active stage in a workflow instance.
   */
  async processStageAction(instanceId, stageKey, action) {
    const instance = await WorkflowInstance.findById(instanceId);
    if (!instance) {
      const error = new Error(`Workflow instance '${instanceId}' not found.`);
      error.status = 404;
      throw error;
    }

    if (instance.status !== 'IN_PROGRESS') {
      const error = new Error(`Cannot action stage: Workflow instance is currently in ${instance.status} status.`);
      error.status = 400;
      throw error;
    }

    if (!instance.activeStageKeys.includes(stageKey)) {
      const error = new Error(`Stage '${stageKey}' is not currently active for action.`);
      error.status = 400;
      throw error;
    }

    const stageState = instance.stageStates.find((s) => s.stageKey === stageKey);
    if (!stageState) {
      const error = new Error(`Stage '${stageKey}' not found in instance states.`);
      error.status = 404;
      throw error;
    }

    // Role / Assignee validation
    if (stageState.assignedUserId && stageState.assignedUserId !== action.actorUserId) {
      if (action.actorRole !== 'HR_ADMIN' && action.actorRole !== 'SUPER_ADMIN') {
        const error = new Error(`Stage '${stageKey}' is specifically assigned to another user.`);
        error.status = 403;
        throw error;
      }
    } else if (
      stageState.requiredRole &&
      action.actorRole !== stageState.requiredRole &&
      action.actorRole !== 'HR_ADMIN' &&
      action.actorRole !== 'SUPER_ADMIN'
    ) {
      const error = new Error(
        `Action requires role '${stageState.requiredRole}', but actor has role '${action.actorRole}'.`
      );
      error.status = 403;
      throw error;
    }

    stageState.actionedByUserId = action.actorUserId;
    stageState.actionedByRole = action.actorRole;
    stageState.actionedByName = action.actorName;
    stageState.actionedAt = new Date();
    stageState.decision = action.decision;
    stageState.remarks = action.remarks;
    if (action.payload) {
      stageState.payload = { ...stageState.payload, ...action.payload };
    }

    instance.activeStageKeys = instance.activeStageKeys.filter((k) => k !== stageKey);

    // CASE A: REJECTION
    if (action.decision === 'REJECT') {
      stageState.status = 'REJECTED';
      instance.status = 'REJECTED';

      instance.history.push({
        event: 'STAGE_REJECTED',
        stepOrder: stageState.stepOrder,
        stageKey,
        actorUserId: action.actorUserId,
        actorRole: action.actorRole,
        actorName: action.actorName,
        remarks: action.remarks,
        timestamp: new Date(),
      });

      instance.history.push({
        event: 'WORKFLOW_REJECTED',
        stepOrder: stageState.stepOrder,
        stageKey,
        remarks: `Workflow stopped due to rejection at stage: ${stageState.name}`,
        timestamp: new Date(),
      });

      const saved = await instance.save();

      eventBus.emit('workflow.stage.rejected', {
        instanceId: instance._id.toString(),
        stageKey,
        targetEntityType: instance.targetEntityType,
        targetEntityId: instance.targetEntityId,
        actorUserId: action.actorUserId,
        actorRole: action.actorRole,
        remarks: action.remarks,
      });

      eventBus.emit('workflow.rejected', {
        instanceId: instance._id.toString(),
        targetEntityType: instance.targetEntityType,
        targetEntityId: instance.targetEntityId,
        stageKey,
        remarks: action.remarks,
      });

      return saved;
    }

    // CASE B: APPROVAL
    stageState.status = 'APPROVED';

    instance.history.push({
      event: 'STAGE_APPROVED',
      stepOrder: stageState.stepOrder,
      stageKey,
      actorUserId: action.actorUserId,
      actorRole: action.actorRole,
      actorName: action.actorName,
      remarks: action.remarks,
      timestamp: new Date(),
    });

    eventBus.emit('workflow.stage.approved', {
      instanceId: instance._id.toString(),
      stageKey,
      targetEntityType: instance.targetEntityType,
      targetEntityId: instance.targetEntityId,
      actorUserId: action.actorUserId,
      actorRole: action.actorRole,
      remarks: action.remarks,
      payload: action.payload,
    });

    // Check if current step is fully complete
    const currentStepStages = instance.stageStates.filter((s) => s.stepOrder === instance.currentStepOrder);
    const allCurrentStepApproved = currentStepStages.every((s) => s.status === 'APPROVED');

    if (allCurrentStepApproved) {
      const definition = await WorkflowDefinition.findById(instance.definitionId);
      const sortedSteps = [...(definition?.steps || [])].sort((a, b) => a.stepOrder - b.stepOrder);
      const nextStep = sortedSteps.find((st) => st.stepOrder > instance.currentStepOrder);

      if (nextStep) {
        instance.currentStepOrder = nextStep.stepOrder;
        const newlyActivatedKeys = [];

        for (const stage of nextStep.stages) {
          const stateObj = instance.stageStates.find((s) => s.stageKey === stage.stageKey);
          if (stateObj) {
            stateObj.status = 'IN_PROGRESS';
            newlyActivatedKeys.push(stage.stageKey);
          }
        }

        instance.activeStageKeys = newlyActivatedKeys;

        instance.history.push({
          event: 'STEP_TRANSITION',
          stepOrder: nextStep.stepOrder,
          remarks: `Advanced to Step ${nextStep.stepOrder}: ${nextStep.name} (${nextStep.executionMode})`,
          timestamp: new Date(),
        });

        for (const key of newlyActivatedKeys) {
          eventBus.emit('workflow.stage.activated', {
            instanceId: instance._id.toString(),
            stageKey: key,
            stepOrder: nextStep.stepOrder,
            targetEntityType: instance.targetEntityType,
            targetEntityId: instance.targetEntityId,
          });
        }
      } else {
        instance.status = 'COMPLETED';
        instance.completedAt = new Date();
        instance.activeStageKeys = [];

        instance.history.push({
          event: 'WORKFLOW_COMPLETED',
          stepOrder: instance.currentStepOrder,
          remarks: 'All workflow steps and clearance stages have been successfully approved.',
          timestamp: new Date(),
        });

        eventBus.emit('workflow.completed', {
          instanceId: instance._id.toString(),
          targetEntityType: instance.targetEntityType,
          targetEntityId: instance.targetEntityId,
          completedAt: instance.completedAt,
        });
      }
    }

    return instance.save();
  },

  async getInstance(id) {
    const instance = await WorkflowInstance.findById(id);
    if (!instance) {
      const error = new Error(`Workflow instance '${id}' not found.`);
      error.status = 404;
      throw error;
    }
    return instance;
  },

  async getInstanceByTarget(entityType, entityId) {
    return WorkflowInstance.findOne({ targetEntityType: entityType, targetEntityId: entityId });
  },

  async getActiveTasksForRole(role) {
    return WorkflowInstance.find({
      status: 'IN_PROGRESS',
      stageStates: {
        $elemMatch: {
          status: 'IN_PROGRESS',
          requiredRole: role,
        },
      },
    }).sort({ updatedAt: -1 });
  },

  async getActiveTasksForUser(userId) {
    return WorkflowInstance.find({
      status: 'IN_PROGRESS',
      stageStates: {
        $elemMatch: {
          status: 'IN_PROGRESS',
          assignedUserId: userId,
        },
      },
    }).sort({ updatedAt: -1 });
  },
};
