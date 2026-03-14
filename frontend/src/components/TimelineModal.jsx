import React, { useState, useEffect } from 'react';
import OrderService from '../services/orderService';
import { formatDateTime } from '../utils/helpers';
import '../styles/TimelineModal.css';

const TimelineModal = ({ orderId, onClose }) => {
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTimeline();
  }, [orderId]);

  const loadTimeline = async () => {
    try {
      setLoading(true);
      const response = await OrderService.getOrderTimeline(orderId);
      setTimeline(response.timeline || []);
      setError(null);
    } catch (err) {
      setError('Failed to load timeline');
      console.error('Timeline error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Order Timeline</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          {loading && <div className="loading">Loading timeline...</div>}
          
          {error && <div className="error">{error}</div>}
          
          {!loading && !error && timeline.length === 0 && (
            <div className="empty">No timeline events found</div>
          )}
          
          {!loading && !error && timeline.length > 0 && (
            <div className="timeline-list">
              {timeline.map((event, index) => (
                <div key={index} className="timeline-event">
                  <div className="event-header">
                    <span className="event-type">{event.event_type}</span>
                    {event.department && (
                      <span className="event-department">{event.department}</span>
                    )}
                    {event.status && (
                      <span className="event-status">{event.status}</span>
                    )}
                  </div>
                  <div className="event-message">{event.message}</div>
                  <div className="event-timestamp">
                    {formatDateTime(event.timestamp)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimelineModal;

