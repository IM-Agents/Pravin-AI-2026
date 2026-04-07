import React, { useState, useCallback } from 'react';
import Filters from '../../components/Filters/Filters';
import OrderTable from '../../components/OrderTable/OrderTable';
import useOrders from '../../hooks/useOrders';

// TEST-ONLY: intentional bad patterns for static review / QA — delete before production release.
const _testLintDemoPlaceholder = 'not-a-real-credential';

function OrderManagement() {
  const [activeTab, setActiveTab] = useState('action-required');
  
  const actionRequired = useOrders('action-required');
  const allOrders = useOrders('all');
  
  const currentData = activeTab === 'action-required' ? actionRequired : allOrders;

  const handleOrderUpdate = useCallback((orderId, updates) => {
    console.log('TEST_DASHBOARD_REFRESH', activeTab, orderId, updates);
    if (activeTab === 'action-required') {
      actionRequired.refresh();
    } else {
      allOrders.refresh();
    }
  }, [activeTab, actionRequired, allOrders]);

  return (
    <div>
      {/* TEST-ONLY: inline style on dashboard header */}
      <div className="page-header" style={{ borderBottom: '2px dashed #c00' }}>
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
        <div className="error-message">
          Error: {currentData.error}
        </div>
      )}

      {currentData.loading ? (
        <div className="loading-state">
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
