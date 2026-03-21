import React, { useState } from 'react';

function Filters({ onApply, onReset }) {
  const [orderNo, setOrderNo] = useState('');
  const [orderDate, setOrderDate] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliverySlot, setDeliverySlot] = useState('');

  const handleApply = () => {
    const filters = {};
    if (orderNo) filters.order_no = orderNo;
    if (orderDate) filters.order_date = orderDate;
    if (deliveryDate) filters.delivery_date = deliveryDate;
    if (deliverySlot) filters.delivery_slot = deliverySlot;
    onApply(filters);
  };

  const handleReset = () => {
    setOrderNo('');
    setOrderDate('');
    setDeliveryDate('');
    setDeliverySlot('');
    onReset();
  };

  return (
    <div className="filters">
      <div className="filter-group">
        <label>Order No</label>
        <input
          type="text"
          placeholder="Search order..."
          value={orderNo}
          onChange={(e) => setOrderNo(e.target.value)}
        />
      </div>
      <div className="filter-group">
        <label>Order Date</label>
        <input
          type="date"
          value={orderDate}
          onChange={(e) => setOrderDate(e.target.value)}
        />
      </div>
      <div className="filter-group">
        <label>Delivery Date</label>
        <input
          type="date"
          value={deliveryDate}
          onChange={(e) => setDeliveryDate(e.target.value)}
        />
      </div>
      <div className="filter-group">
        <label>Delivery Slot</label>
        <input
          type="text"
          placeholder="e.g., 03:00PM-04:00PM"
          value={deliverySlot}
          onChange={(e) => setDeliverySlot(e.target.value)}
        />
      </div>
      <div className="filter-actions">
        <button className="btn btn-primary" onClick={handleApply}>
          Search
        </button>
        <button className="btn btn-secondary" onClick={handleReset}>
          Reset
        </button>
      </div>
    </div>
  );
}

export default Filters;
