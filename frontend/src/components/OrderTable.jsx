import React, { useState } from 'react';
import StatusBadge from './StatusBadge';
import DownloadButton from './DownloadButton';
import TimelineModal from './TimelineModal';
import IgnoreOrderButton from './IgnoreOrderButton';
import { formatDate, formatDateTime } from '../utils/helpers';
import { DEPARTMENTS } from '../utils/constants';
import '../styles/OrderTable.css';

const OrderTable = ({ orders, showIgnoreButton, onRefresh }) => {
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const handleTimelineClick = (orderId) => {
    setSelectedOrderId(orderId);
  };

  const handleCloseTimeline = () => {
    setSelectedOrderId(null);
  };

  if (!orders || orders.length === 0) {
    return <div className="empty-state">No orders found</div>;
  }

  return (
    <>
      <div className="table-container">
        <table className="order-table">
          <thead>
            <tr>
              <th>Order Number</th>
              <th>Customer Name</th>
              <th>Delivery Date</th>
              <th>DM Status</th>
              <th>DM Download</th>
              <th>Confectionery Status</th>
              <th>Confectionery Download</th>
              <th>Design Status</th>
              <th>Design Download</th>
              <th>Last Updated</th>
              <th>Timeline</th>
              {showIgnoreButton && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="order-number">{order.order_number}</td>
                <td>{order.customer_name}</td>
                <td>{formatDate(order.delivery_date)}</td>
                
                {/* DM Status & Download */}
                <td>
                  <StatusBadge status={order.departmentStatus?.dm_status || 'Pending'} />
                </td>
                <td>
                  <DownloadButton 
                    orderId={order.id} 
                    department={DEPARTMENTS.DM}
                    status={order.departmentStatus?.dm_status || 'Pending'}
                  />
                </td>
                
                {/* Confectionery Status & Download */}
                <td>
                  <StatusBadge status={order.departmentStatus?.confectionery_status || 'Pending'} />
                </td>
                <td>
                  <DownloadButton 
                    orderId={order.id} 
                    department={DEPARTMENTS.CONFECTIONERY}
                    status={order.departmentStatus?.confectionery_status || 'Pending'}
                  />
                </td>
                
                {/* Design Status & Download */}
                <td>
                  <StatusBadge status={order.departmentStatus?.design_status || 'Pending'} />
                </td>
                <td>
                  <DownloadButton 
                    orderId={order.id} 
                    department={DEPARTMENTS.DESIGN}
                    status={order.departmentStatus?.design_status || 'Pending'}
                  />
                </td>
                
                <td>{formatDateTime(order.updated_at)}</td>
                
                <td>
                  <button 
                    className="timeline-button"
                    onClick={() => handleTimelineClick(order.id)}
                    title="View timeline"
                  >
                    📋 Timeline
                  </button>
                </td>
                
                {showIgnoreButton && (
                  <td>
                    <IgnoreOrderButton 
                      orderId={order.id}
                      isIgnored={order.is_ignored}
                      onUpdate={onRefresh}
                    />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedOrderId && (
        <TimelineModal 
          orderId={selectedOrderId} 
          onClose={handleCloseTimeline}
        />
      )}
    </>
  );
};

export default OrderTable;

