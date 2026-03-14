import React, { useState, useEffect } from 'react';
import OrderTable from '../components/OrderTable';
import OrderService from '../services/orderService';
import { POLLING_INTERVAL } from '../utils/constants';
import '../styles/OrderPage.css';

const AllOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadOrders();
    
    // Set up polling
    const interval = setInterval(loadOrders, POLLING_INTERVAL);
    
    return () => clearInterval(interval);
  }, []);

  const loadOrders = async () => {
    try {
      const response = await OrderService.getAllOrders();
      setOrders(response.orders || []);
      setError(null);
    } catch (err) {
      setError('Failed to load orders');
      console.error('Load orders error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="order-page">
      <div className="page-header">
        <h1>All Orders</h1>
        <button className="refresh-button" onClick={loadOrders} disabled={loading}>
          {loading ? '⏳ Loading...' : '🔄 Refresh'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading && orders.length === 0 ? (
        <div className="loading-state">Loading orders...</div>
      ) : (
        <OrderTable 
          orders={orders} 
          showIgnoreButton={false}
          onRefresh={loadOrders}
        />
      )}
    </div>
  );
};

export default AllOrdersPage;

