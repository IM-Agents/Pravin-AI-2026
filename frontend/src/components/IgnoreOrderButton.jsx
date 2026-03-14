import React, { useState } from 'react';
import OrderService from '../services/orderService';
import '../styles/IgnoreOrderButton.css';

const IgnoreOrderButton = ({ orderId, isIgnored, onUpdate }) => {
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    if (loading) return;

    const confirmMessage = isIgnored 
      ? 'Are you sure you want to unignore this order?' 
      : 'Are you sure you want to ignore this order?';
    
    if (!window.confirm(confirmMessage)) return;

    try {
      setLoading(true);
      await OrderService.toggleIgnoreOrder(orderId, !isIgnored);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Toggle ignore failed:', error);
      alert('Failed to update order status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className={`ignore-button ${isIgnored ? 'ignored' : ''}`}
      onClick={handleToggle}
      disabled={loading}
      title={isIgnored ? 'Unignore order' : 'Ignore order'}
    >
      {loading ? '⏳' : isIgnored ? '🔓 Unignore' : '🔒 Ignore'}
    </button>
  );
};

export default IgnoreOrderButton;

