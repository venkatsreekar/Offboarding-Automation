import { Notification } from './notification.model.js';
import { eventBus } from '../events/eventBus.js';

export const notificationService = {
  async create(data) {
    const notification = new Notification(data);
    return notification.save();
  },

  async getForUserOrRole(role, userId) {
    const query = {
      $or: [{ recipientRole: role }],
    };
    if (userId) {
      query.$or.push({ recipientUserId: userId });
    }

    return Notification.find(query).sort({ createdAt: -1 }).limit(30);
  },

  async markAsRead(id) {
    return Notification.findByIdAndUpdate(id, { isRead: true }, { new: true });
  },
};

// Event listeners for automatic notifications
eventBus.on('workflow.stage.activated', async (event) => {
  const roleMap = {
    REPORTING_MANAGER_CLEARANCE: {
      role: 'REPORTING_MANAGER',
      title: 'Action Required: Reporting Manager Clearance Pending',
      dept: 'Reporting Manager',
    },
    ADMIN_SYSTEMS_CLEARANCE: {
      role: 'ADMIN_SYSTEMS',
      title: 'Action Required: Hardware Return & System Access Revocation',
      dept: 'Admin & Systems',
    },
    ACCOUNTS_CLEARANCE: {
      role: 'ACCOUNTS',
      title: 'Action Required: Financial Clearance & Advances Settlement',
      dept: 'Accounts & Finance',
    },
    PERSONNEL_CLEARANCE: {
      role: 'PERSONNEL',
      title: 'Action Required: ID & Access Badge Clearance',
      dept: 'Personnel & Facilities',
    },
    HR_FINAL_CLEARANCE: {
      role: 'HR_ADMIN',
      title: 'Action Required: All Department Clearances Done - Final HR Signoff Required',
      dept: 'Human Resources',
    },
  };

  const info = roleMap[event.stageKey] || {
    role: 'HR_ADMIN',
    title: `Clearance task active: ${event.stageKey}`,
    dept: 'Department',
  };

  await notificationService.create({
    recipientRole: info.role,
    title: info.title,
    message: `An offboarding clearance task is awaiting action for ${info.dept}.`,
    type: 'ACTION_REQUIRED',
    targetLink: `/offboarding/${event.targetEntityId}`,
    metadata: event,
  });
});

eventBus.on('offboarding.reminder.sent', async (event) => {
  const role = event.stageKey.includes('ADMIN')
    ? 'ADMIN_SYSTEMS'
    : event.stageKey.includes('ACCOUNTS')
    ? 'ACCOUNTS'
    : event.stageKey.includes('PERSONNEL')
    ? 'PERSONNEL'
    : 'REPORTING_MANAGER';

  await notificationService.create({
    recipientRole: role,
    title: 'Reminder: Pending Clearance Urgently Required',
    message: event.note || 'HR has flagged this clearance as urgent. Please action promptly.',
    type: 'REMINDER',
    targetLink: `/offboarding/${event.offboardingId}`,
    metadata: event,
  });
});

eventBus.on('workflow.completed', async (event) => {
  await notificationService.create({
    recipientRole: 'HR_ADMIN',
    title: 'Offboarding Completed: All Clearances Satisfied',
    message: 'The entire offboarding workflow has concluded successfully. Certificates generated.',
    type: 'COMPLETED',
    targetLink: `/offboarding/${event.targetEntityId}`,
    metadata: event,
  });
});
