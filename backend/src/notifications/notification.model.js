import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema(
  {
    recipientRole: { type: String, required: true, index: true },
    recipientUserId: { type: String, index: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['ACTION_REQUIRED', 'REMINDER', 'STATUS_UPDATE', 'COMPLETED', 'REJECTED'],
      default: 'ACTION_REQUIRED',
    },
    targetLink: { type: String, trim: true },
    isRead: { type: Boolean, default: false },
    metadata: { type: Object, default: {} },
  },
  { timestamps: true, collection: 'notifications' }
);

export const Notification = mongoose.model('Notification', NotificationSchema);
