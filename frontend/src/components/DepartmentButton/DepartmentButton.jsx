import React, { useState } from 'react';
import { ordersApi } from '../../services/api';

function DepartmentButton({ orderId, department, status, disabled, onStatusChange }) {
  const [loading, setLoading] = useState(false);

  const handlePrint = async () => {
    if (loading || disabled) return;
    
    setLoading(true);
    try {
      await ordersApi.triggerPrint(orderId, department);
      onStatusChange?.(department, 'IN-PROGRESS');
    } catch (error) {
      console.error('Print failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      await ordersApi.retryPrint(orderId, department);
      onStatusChange?.(department, 'IN-PROGRESS');
    } catch (error) {
      console.error('Retry failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    const url = ordersApi.downloadPdf(orderId, department);
    window.open(url, '_blank');
  };

  const statusClass = status.toLowerCase().replace('-', '-');
  const isDisabled = disabled || status === 'NA' || status === 'IN-PROGRESS' || loading;

  if (status === 'FAILED') {
    return (
      <div className="failed-actions">
        <button
          className="status-btn failed"
          onClick={handleRetry}
          disabled={loading || disabled}
          title="Retry"
        >
          {loading ? (
            <span className="spinner"></span>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 4v6h-6M1 20v-6h6"/>
              <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
            </svg>
          )}
          <span>Retry</span>
        </button>
        <button
          className="status-btn success"
          onClick={handleDownload}
          title="Download PDF"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
          </svg>
        </button>
      </div>
    );
  }

  if (status === 'SUCCESS') {
    return (
      <button
        className={`status-btn ${statusClass}`}
        onClick={handleDownload}
        title="Download PDF"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        <span>Success</span>
      </button>
    );
  }

  if (status === 'IN-PROGRESS') {
    return (
      <button className={`status-btn in-progress`} disabled>
        <span className="spinner"></span>
        <span>Printing...</span>
      </button>
    );
  }

  if (status === 'NA') {
    return (
      <button className={`status-btn na`} disabled>
        <span>NA</span>
      </button>
    );
  }

  return (
    <button
      className={`status-btn ${statusClass}`}
      onClick={handlePrint}
      disabled={isDisabled}
      title="Print"
    >
      {loading ? (
        <span className="spinner"></span>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="6 9 6 2 18 2 18 9"/>
          <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/>
          <rect x="6" y="14" width="12" height="8"/>
        </svg>
      )}
      <span>PENDING</span>
    </button>
  );
}

export default DepartmentButton;
