import axios from 'axios';

const API = axios.create({
  baseURL: '/api/v1',
});

export const api = {
  // Dashboard & Metrics
  getDashboard: async () => {
    const { data } = await API.get('/offboarding/dashboard');
    return data;
  },

  // Offboarding Requests
  getOffboardings: async (params) => {
    const { data } = await API.get('/offboarding/requests', { params });
    return data;
  },

  getOffboardingById: async (id) => {
    const { data } = await API.get(`/offboarding/requests/${id}`);
    return data;
  },

  initiateOffboarding: async (payload) => {
    const { data } = await API.post('/offboarding/initiate', payload);
    return data;
  },

  submitClearance: async (id, stageKey, payload) => {
    const { data } = await API.post(`/offboarding/requests/${id}/clearance/${stageKey}`, payload);
    return data;
  },

  revokeAccess: async (id, payload) => {
    const { data } = await API.post(`/offboarding/requests/${id}/revoke-access`, payload);
    return data;
  },

  sendReminder: async (id, payload) => {
    const { data } = await API.post(`/offboarding/requests/${id}/remind`, payload);
    return data;
  },

  withdrawOffboarding: async (id, payload) => {
    const { data } = await API.post(`/offboarding/requests/${id}/withdraw`, payload);
    return data;
  },

  // Approver Tasks
  getMyTasks: async (role, userId) => {
    const { data } = await API.get('/offboarding/my-tasks', { params: { role, userId } });
    return data;
  },

  // Employees
  getEmployees: async (params) => {
    const { data } = await API.get('/employees', { params });
    return data;
  },

  // Notifications
  getNotifications: async (role, userId) => {
    const { data } = await API.get('/notifications', { params: { role, userId } });
    return data;
  },

  markNotificationRead: async (id) => {
    await API.patch(`/notifications/${id}/read`);
  },

  // Audit Logs
  getAuditLogs: async (entityType, entityId) => {
    const { data } = await API.get(`/audit/${entityType}/${entityId}`);
    return data;
  },

  // Demo Seed
  resetSeedData: async () => {
    const { data } = await API.post('/seed/reset');
    return data;
  },

  // Workflow Definitions (Generic Engine)
  getWorkflowDefinitions: async () => {
    const { data } = await API.get('/workflows/definitions');
    return data;
  },

  saveWorkflowDefinition: async (definition) => {
    const { data } = await API.post('/workflows/definitions', definition);
    return data;
  },

  // Documents
  getDocumentUrl: (offboardingId, docType) => {
    const map = {
      RESIGNATION_ACCEPTANCE: 'resignation-acceptance',
      NOC_CERTIFICATE: 'noc-certificate',
      RELIEVING_LETTER: 'relieving-letter',
    };
    const endpoint = map[docType] || 'noc-certificate';
    return `/api/v1/documents/${offboardingId}/${endpoint}`;
  },
};
