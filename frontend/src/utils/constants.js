export const DEPARTMENTS = {
  DM: 'DM',
  CONFECTIONERY: 'Confectionery',
  DESIGN: 'Design',
};

export const ORDER_STATUS = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In-Progress',
  SUCCESS: 'Success',
  FAILURE: 'Failure',
  NA: 'NA',
};

export const STATUS_COLORS = {
  Pending: '#FFA500',      // Orange
  'In-Progress': '#2196F3', // Blue
  Success: '#4CAF50',       // Green
  Failure: '#F44336',       // Red
  NA: '#9E9E9E',           // Gray
};

export const PRINTER_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline',
};

export const POLLING_INTERVAL = parseInt(process.env.REACT_APP_POLLING_INTERVAL) || 30000;

