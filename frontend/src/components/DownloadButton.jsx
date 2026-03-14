import React, { useState } from 'react';
import OrderService from '../services/orderService';
import { isDownloadEnabled } from '../utils/helpers';
import '../styles/DownloadButton.css';

const DownloadButton = ({ orderId, department, status }) => {
  const [downloading, setDownloading] = useState(false);
  const enabled = isDownloadEnabled(status);

  const handleDownload = async () => {
    if (!enabled || downloading) return;

    try {
      setDownloading(true);
      await OrderService.downloadDepartmentPDF(orderId, department.toLowerCase());
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      className={`download-button ${!enabled ? 'disabled' : ''}`}
      onClick={handleDownload}
      disabled={!enabled || downloading}
      title={!enabled ? 'Not available' : 'Download PDF'}
    >
      {downloading ? '⏳' : '📥'}
    </button>
  );
};

export default DownloadButton;

