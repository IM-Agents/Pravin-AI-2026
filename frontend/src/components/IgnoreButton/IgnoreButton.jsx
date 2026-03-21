import React, { useState } from 'react';
import { ordersApi } from '../../services/api';

function IgnoreButton({ orderId, isIgnored, onUpdate }) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      await ordersApi.updateIgnore(orderId, !isIgnored);
      onUpdate?.(!isIgnored);
    } catch (error) {
      console.error('Failed to update ignore status:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className={`btn ${isIgnored ? 'btn-warning' : 'btn-secondary'}`}
      onClick={handleClick}
      disabled={loading}
    >
      {loading ? '...' : isIgnored ? 'REMOVE IGNORE' : 'IGNORE'}
    </button>
  );
}

export default IgnoreButton;
