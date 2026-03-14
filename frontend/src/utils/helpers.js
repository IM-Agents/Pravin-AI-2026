import { STATUS_COLORS } from './constants';

/**
 * Format date to readable string
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Format datetime to readable string
 */
export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Get status color
 */
export const getStatusColor = (status) => {
  return STATUS_COLORS[status] || '#9E9E9E';
};

/**
 * Check if download should be enabled
 */
export const isDownloadEnabled = (status) => {
  return status !== 'NA';
};

/**
 * Get department field name for status
 */
export const getDepartmentStatusField = (department) => {
  const fieldMap = {
    'DM': 'dm_status',
    'Confectionery': 'confectionery_status',
    'Design': 'design_status',
  };
  return fieldMap[department];
};

