export const getStatusColor = (status) => {
  switch (status) {
    case 'NA':
      return 'default';
    case 'PENDING':
      return 'warning';
    case 'IN-PROGRESS':
      return 'info';
    case 'SUCCESS':
      return 'success';
    case 'FAILURE':
      return 'error';
    default:
      return 'default';
  }
};

export const getStatusLabel = (status) => {
  switch (status) {
    case 'NA':
      return 'Not Applicable';
    case 'PENDING':
      return 'Pending';
    case 'IN-PROGRESS':
      return 'In Progress';
    case 'SUCCESS':
      return 'Completed';
    case 'FAILURE':
      return 'Failed';
    default:
      return status;
  }
};