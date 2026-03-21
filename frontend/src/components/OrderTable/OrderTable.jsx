import React, { useState } from 'react';
import DepartmentButton from '../DepartmentButton/DepartmentButton';
import IgnoreButton from '../IgnoreButton/IgnoreButton';
import Timeline from '../Timeline/Timeline';

function OrderTable({ orders, showIgnore, pagination, onPageChange, onOrderUpdate }) {
  const [selectedOrder, setSelectedOrder] = useState(null);

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleIgnoreUpdate = (orderId, isIgnored) => {
    onOrderUpdate?.(orderId, { is_ignored: isIgnored });
  };

  const handleStatusChange = (orderId, department, status) => {
    onOrderUpdate?.(orderId, { [`${department}_status`]: status });
  };

  return (
    <>
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Order No</th>
              <th>Order Date & Time</th>
              <th>Customer</th>
              <th>Delivery Date</th>
              <th>Delivery Time</th>
              <th>Specific Time</th>
              <th>Reserved</th>
              <th>DM</th>
              <th>Confectionery</th>
              <th>Design</th>
              <th>Timeline</th>
              {showIgnore && <th>Action</th>}
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={showIgnore ? 12 : 11} style={{ textAlign: 'center', padding: '40px' }}>
                  No orders found
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr 
                  key={order.order_id} 
                  className={order.is_ignored ? 'ignored' : ''}
                >
                  <td>{order.order_number}</td>
                  <td>{formatDateTime(order.order_created_at)}</td>
                  <td>{order.customer_name}</td>
                  <td>{formatDate(order.delivery_date)}</td>
                  <td>{order.delivery_time || '-'}</td>
                  <td>{order.specific_delivery_time || '-'}</td>
                  <td>
                    <span className={`badge ${order.reserved ? 'badge-yes' : 'badge-no'}`}>
                      {order.reserved ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td>
                    <DepartmentButton
                      orderId={order.order_id}
                      department="dm"
                      status={order.dm_status}
                      disabled={order.is_ignored || order.is_cancelled}
                      onStatusChange={(dept, status) => handleStatusChange(order.order_id, dept, status)}
                    />
                  </td>
                  <td>
                    <DepartmentButton
                      orderId={order.order_id}
                      department="confectionery"
                      status={order.confectionery_status}
                      disabled={order.is_ignored || order.is_cancelled}
                      onStatusChange={(dept, status) => handleStatusChange(order.order_id, dept, status)}
                    />
                  </td>
                  <td>
                    <DepartmentButton
                      orderId={order.order_id}
                      department="design"
                      status={order.design_status}
                      disabled={order.is_ignored || order.is_cancelled}
                      onStatusChange={(dept, status) => handleStatusChange(order.order_id, dept, status)}
                    />
                  </td>
                  <td>
                    <button
                      className="btn btn-secondary"
                      onClick={() => setSelectedOrder(order)}
                    >
                      View
                    </button>
                  </td>
                  {showIgnore && (
                    <td>
                      <IgnoreButton
                        orderId={order.order_id}
                        isIgnored={order.is_ignored}
                        onUpdate={(ignored) => handleIgnoreUpdate(order.order_id, ignored)}
                      />
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
        
        {pagination && pagination.totalPages > 0 && (
          <div className="pagination">
            <div className="pagination-info">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} orders
            </div>
            <div className="pagination-buttons">
              <button
                className="pagination-btn"
                onClick={() => onPageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
              >
                Previous
              </button>
              <button
                className="pagination-btn"
                onClick={() => onPageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedOrder && (
        <Timeline
          orderId={selectedOrder.order_id}
          orderNumber={selectedOrder.order_number}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </>
  );
}

export default OrderTable;
