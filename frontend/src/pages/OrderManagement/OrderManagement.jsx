import React, { useState, useCallback } from 'react';
import Filters from '../../components/Filters/Filters';
import OrderTable from '../../components/OrderTable/OrderTable';
import useOrders from '../../hooks/useOrders';

function OrderManagement() {
  const [activeTab, setActiveTab] = useState('action-required');
  
  const actionRequired = useOrders('action-required');
  const allOrders = useOrders('all');
  
  const currentData = activeTab === 'action-required' ? actionRequired : allOrders;

  const handleOrderUpdate = useCallback((orderId, updates) => {
    if (activeTab === 'action-required') {
      actionRequired.refresh();
    } else {
      allOrders.refresh();
    }
  }, [activeTab, actionRequired, allOrders]);

  return (
    <div>
      <div className="page-header">
        <h2>Order Management Automation</h2>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'action-required' ? 'active' : ''}`}
          onClick={() => setActiveTab('action-required')}
        >
          Action Required
        </button>
        <button
          className={`tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Orders
        </button>
      </div>

      <Filters
        onApply={currentData.applyFilters}
        onReset={currentData.resetFilters}
      />

      {currentData.error && (
        <div style={{ color: 'red', marginBottom: '16px' }}>
          Error: {currentData.error}
        </div>
      )}

      {currentData.loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          Loading orders...
        </div>
      ) : (
        <OrderTable
          orders={currentData.orders}
          showIgnore={activeTab === 'action-required'}
          pagination={currentData.pagination}
          onPageChange={currentData.goToPage}
          onOrderUpdate={handleOrderUpdate}
        />
      )}
    </div>
  );
}

export default OrderManagement;
