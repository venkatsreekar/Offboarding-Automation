import mongoose from 'mongoose';

const StageStateSchema = new mongoose.Schema(
  {
    stageKey: { type: String, required: true },
    name: { type: String, required: true },
    stepOrder: { type: Number, required: true },
    status: {
      type: String,
      enum: ['PENDING', 'IN_PROGRESS', 'APPROVED', 'REJECTED', 'SKIPPED'],
      default: 'PENDING',
      required: true,
    },
    requiredRole: { type: String },
    assignedUserId: { type: String },
    assignedRole: { type: String },
    actionedByUserId: { type: String },
    actionedByRole: { type: String },
    actionedByName: { type: String },
    actionedAt: { type: Date },
    decision: { type: String, enum: ['APPROVE', 'REJECT'] },
    remarks: { type: String },
    payload: { type: Object, default: {} },
  },
  { _id: false }
);

const WorkflowHistoryEntrySchema = new mongoose.Schema(
  {
    event: { type: String, required: true },
    stepOrder: { type: Number },
    stageKey: { type: String },
    actorUserId: { type: String },
    actorRole: { type: String },
    actorName: { type: String },
    remarks: { type: String },
    metadata: { type: Object },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const WorkflowInstanceSchema = new mongoose.Schema(
  {
    definitionId: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkflowDefinition', required: true },
    definitionCode: { type: String, required: true },
    targetEntityType: { type: String, required: true },
    targetEntityId: { type: String, required: true },
    status: {
      type: String,
      enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'REJECTED', 'CANCELLED'],
      default: 'IN_PROGRESS',
      required: true,
    },
    currentStepOrder: { type: Number, required: true, default: 1 },
    activeStageKeys: [{ type: String }],
    stageStates: [StageStateSchema],
    history: [WorkflowHistoryEntrySchema],
    completedAt: { type: Date },
  },
  { timestamps: true, collection: 'workflow_instances' }
);

export const WorkflowInstance = mongoose.model('WorkflowInstance', WorkflowInstanceSchema);
