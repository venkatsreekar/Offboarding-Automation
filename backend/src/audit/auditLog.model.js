import mongoose from 'mongoose';

const AuditLogSchema = new mongoose.Schema(
  {
    entityType: { type: String, required: true, index: true },
    entityId: { type: String, required: true, index: true },
    action: { type: String, required: true },
    actorId: { type: String },
    actorName: { type: String },
    actorRole: { type: String },
    details: { type: Object, default: {} },
    ipAddress: { type: String },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true, collection: 'audit_logs' }
);

export const AuditLog = mongoose.model('AuditLog', AuditLogSchema);
