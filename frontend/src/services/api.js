import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const ordersAPI = {
  getAll: (params) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  getTimeline: (id) => api.get(`/orders/${id}/timeline`),
  downloadPDF: (id) => api.get(`/orders/${id}/pdf`, { responseType: 'blob' }),
  retryPrint: (id, department) => api.post(`/orders/${id}/retry-print`, { department }),
};

export const printersAPI = {
  discover: () => api.get('/printers/discover'),
  getConfigs: (storeClientId = 1) => api.get('/printers/configs', { params: { store_client_id: storeClientId } }),
  saveConfig: (config) => api.post('/printers/configs', config),
  updateStatus: (department, storeClientId = 1) => 
    api.post(`/printers/configs/${department}/status`, { store_client_id: storeClientId }),
  getQueueStats: () => api.get('/printers/queue/stats'),
};

export default api;