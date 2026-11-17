import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const sterilApi = {
  // Dashboard
  getDashboardStats: async () => {
    const res = await api.get('/dashboard/stats');
    return res.data.data;
  },

  // Equipment
  getAllEquipment: async (category = '') => {
    const res = await api.get(`/equipment${category ? `?category=${encodeURIComponent(category)}` : ''}`);
    return res.data.data;
  },
  getEquipmentById: async (id) => {
    const res = await api.get(`/equipment/${id}`);
    return res.data.data;
  },
  updateEquipmentStatus: async (id, status) => {
    const res = await api.patch(`/equipment/${id}/status?status=${encodeURIComponent(status)}`);
    return res.data.data;
  },

  // Trays & Instruments
  getAllTrays: async (department = '') => {
    const res = await api.get(`/trays${department ? `?department=${encodeURIComponent(department)}` : ''}`);
    return res.data.data;
  },
  getTrayById: async (trayId) => {
    const res = await api.get(`/trays/${trayId}`);
    return res.data.data;
  },
  updateInstrumentStatus: async (code, sterilizationStatus, contaminationStatus) => {
    const res = await api.patch(`/trays/instruments/${code}/status`, {
      sterilizationStatus,
      contaminationStatus,
    });
    return res.data.data;
  },

  // Workflows
  initiateWorkflow: async (payload) => {
    const res = await api.post('/workflows/initiate', payload);
    return res.data.data;
  },
  getAllWorkflowInstances: async () => {
    const res = await api.get('/workflows/instances');
    return res.data.data;
  },
  getWorkflowDetails: async (processInstanceId) => {
    const res = await api.get(`/workflows/${processInstanceId}`);
    return res.data.data;
  },

  // Custom Tasklist
  getAllTasks: async () => {
    const res = await api.get('/tasks');
    return res.data.data;
  },
  getMyTasks: async (user = 'cssd-technician') => {
    const res = await api.get(`/tasks/my?user=${encodeURIComponent(user)}`);
    return res.data.data;
  },
  getUnassignedTasks: async () => {
    const res = await api.get('/tasks/unassigned');
    return res.data.data;
  },
  getCompletedTasks: async () => {
    const res = await api.get('/tasks/completed');
    return res.data.data;
  },
  getOverdueTasks: async () => {
    const res = await api.get('/tasks/overdue');
    return res.data.data;
  },
  getTaskById: async (taskId) => {
    const res = await api.get(`/tasks/${taskId}`);
    return res.data.data;
  },
  claimTask: async (taskId, assignee) => {
    const res = await api.post(`/tasks/${taskId}/claim`, { assignee });
    return res.data.data;
  },
  completeTask: async (taskId, assignee, variables) => {
    const res = await api.post(`/tasks/${taskId}/complete`, { assignee, variables });
    return res.data.data;
  },

  // Autoclave IoT
  getAllAutoclaves: async () => {
    const res = await api.get('/autoclaves');
    return res.data.data;
  },
  getAutoclaveTelemetry: async (machineCode) => {
    const res = await api.get(`/autoclaves/${machineCode}/telemetry`);
    return res.data; // direct DTO
  },
  simulateAutoclaveFailure: async (machineCode, fail) => {
    const res = await api.post(`/autoclaves/${machineCode}/simulate-failure`, { fail });
    return res.data;
  },

  // Calibration
  getCalibrationRecords: async (equipmentId = '') => {
    const url = equipmentId ? `/calibration/records/${equipmentId}` : '/calibration/records';
    const res = await api.get(url);
    return res.data.data;
  },
  performCalibration: async (payload) => {
    const res = await api.post('/calibration/perform', payload);
    return res.data.data;
  },

  // Maintenance
  getMaintenanceTickets: async (status = '') => {
    const res = await api.get(`/maintenance/tickets${status ? `?status=${encodeURIComponent(status)}` : ''}`);
    return res.data.data;
  },
  createMaintenanceTicket: async (ticket) => {
    const res = await api.post('/maintenance/tickets', ticket);
    return res.data.data;
  },
  resolveMaintenanceTicket: async (ticketNumber, notes) => {
    const res = await api.post(`/maintenance/tickets/${ticketNumber}/resolve`, { notes });
    return res.data.data;
  },

  // Reports
  getSummaryReport: async () => {
    const res = await api.get('/reports/summary');
    return res.data.data;
  },
};
