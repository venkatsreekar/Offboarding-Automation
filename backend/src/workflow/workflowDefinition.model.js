import mongoose from 'mongoose';

const StageConfigSchema = new mongoose.Schema(
  {
    stageKey: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    approverType: {
      type: String,
      enum: ['ROLE', 'DYNAMIC_MANAGER', 'SPECIFIC_USER'],
      default: 'ROLE',
      required: true,
    },
    requiredRole: { type: String, trim: true },
    slaHours: { type: Number, default: 48 },
    requiredChecklistKeys: [{ type: String }],
  },
  { _id: false }
);

const StepConfigSchema = new mongoose.Schema(
  {
    stepOrder: { type: Number, required: true },
    name: { type: String, required: true, trim: true },
    executionMode: {
      type: String,
      enum: ['SEQUENTIAL', 'PARALLEL'],
      default: 'SEQUENTIAL',
      required: true,
    },
    stages: [StageConfigSchema],
  },
  { _id: false }
);

const WorkflowDefinitionSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    version: { type: Number, default: 1 },
    isActive: { type: Boolean, default: true },
    steps: [StepConfigSchema],
  },
  { timestamps: true, collection: 'workflow_definitions' }
);

export const WorkflowDefinition = mongoose.model('WorkflowDefinition', WorkflowDefinitionSchema);
