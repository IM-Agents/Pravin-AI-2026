import React from 'react';
import { getStatusColor } from '../utils/helpers';
import '../styles/StatusBadge.css';

const StatusBadge = ({ status }) => {
  const backgroundColor = getStatusColor(status);
  
  return (
    <span 
      className="status-badge" 
      style={{ backgroundColor }}
    >
      {status}
    </span>
  );
};

export default StatusBadge;

