import React, { useState, useEffect } from 'react';
import { ordersApi } from '../../services/api';

const EVENT_ICONS = {
  WEBHOOK_RECEIVED: '🔔',
  RULE_EVALUATED: '📋',
  PDF_GENERATED: '📄',
  PRINT_TRIGGERED: '🖨️',
  PRINT_RESULT: '✅',
  ORDER_IGNORED: '🚫',
  ORDER_UNIGNORED: '✓',
  ORDER_CANCELLED: '❌',
  PRINT_CANCELLED: '🛑',
  PRINTER_VALIDATION_FAILED: '⚠️',
  MANUAL_PRINT_TRIGGERED: '👆'
};

function Timeline({ orderId, orderNumber, onClose }) {
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        const response = await ordersApi.getTimeline(orderId);
        setTimeline(response.data.data);
      } catch (error) {
        console.error('Failed to fetch timeline:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTimeline();
  }, [orderId]);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <>
      <div className="modal-overlay" onClick={onClose}></div>
      <div className="timeline-modal">
        <div className="timeline-modal-header">
          <h3>Timeline - {orderNumber}</h3>
          <button className="timeline-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="timeline-modal-content">
          {loading ? (
            <p>Loading...</p>
          ) : timeline.length === 0 ? (
            <p>No timeline events</p>
          ) : (
            timeline.map((event) => (
              <div key={event.id} className="timeline-event">
                <div className="timeline-icon">
                  {EVENT_ICONS[event.event_type] || '•'}
                </div>
                <div className="timeline-event-content">
                  <div className="timeline-event-header">
                    <span className="timeline-event-type">
                      {event.event_type.replace(/_/g, ' ')}
                    </span>
                    <span className="timeline-event-time">
                      {formatTime(event.timestamp)}
                    </span>
                  </div>
                  <p className="timeline-event-message">{event.message}</p>
                  {event.department && (
                    <span className="timeline-event-dept">
                      Department: {event.department.toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

export default Timeline;
