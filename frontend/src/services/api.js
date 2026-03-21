import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

export const ordersApi = {
  getActionRequired: (params = {}) => 
    api.get('/orders/action-required', { params }),
  
  getAll: (params = {}) => 
    api.get('/orders', { params }),
  
  getDetail: (orderId) => 
    api.get(`/orders/${orderId}`),
  
  updateIgnore: (orderId, ignored) => 
    api.patch(`/orders/${orderId}/ignore`, { ignored }),
  
  getTimeline: (orderId) => 
    api.get(`/orders/${orderId}/timeline`),
  
  triggerPrint: (orderId, department, type = 'standard') => 
    api.post(`/orders/${orderId}/departments/${department}/print`, { type }),
  
  retryPrint: (orderId, department) => 
    api.post(`/orders/${orderId}/departments/${department}/retry`),
  
  downloadPdf: (orderId, department) => 
    `/api/orders/${orderId}/departments/${department}/download-pdf`
};

export const printersApi = {
  getAll: () => 
    api.get('/printers'),
  
  sync: (machineId, printers) => 
    api.post('/printers/sync', { machine_id: machineId, printers }),
  
  updateStatus: (machineId, printerName, status) => 
    api.post('/printers/status', { machine_id: machineId, printer_name: printerName, status }),
  
  assignDepartment: (printerId, department) => 
    api.patch(`/printers/${printerId}/assign`, { department }),
  
  toggleActive: (printerId, isActive) => 
    api.patch(`/printers/${printerId}/active`, { is_active: isActive })
};

export default api;
