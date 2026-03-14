import React, { useState, useEffect } from 'react';
import PrinterService from '../services/printerService';
import { DEPARTMENTS } from '../utils/constants';
import '../styles/PrinterManagement.css';

const PrinterManagementPage = () => {
  const [printers, setPrinters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPrinters();
  }, []);

  const loadPrinters = async () => {
    try {
      setLoading(true);
      const response = await PrinterService.getAllPrinters();
      setPrinters(response.printers || []);
      setError(null);
    } catch (err) {
      setError('Failed to load printers');
      console.error('Load printers error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignPrinter = async (printerId, department) => {
    try {
      await PrinterService.assignPrinter(printerId, department);
      alert(`Printer assigned to ${department} successfully`);
      loadPrinters();
    } catch (error) {
      console.error('Assign printer error:', error);
      alert('Failed to assign printer. Please try again.');
    }
  };

  const handleToggleActive = async (printerId, currentStatus) => {
    try {
      await PrinterService.togglePrinterActive(printerId, !currentStatus);
      loadPrinters();
    } catch (error) {
      console.error('Toggle active error:', error);
      alert('Failed to update printer status. Please try again.');
    }
  };

  return (
    <div className="printer-management-page">
      <div className="page-header">
        <h1>Printer Management</h1>
        <button className="refresh-button" onClick={loadPrinters} disabled={loading}>
          {loading ? '⏳ Loading...' : '🔄 Refresh'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading-state">Loading printers...</div>
      ) : printers.length === 0 ? (
        <div className="empty-state">
          <p>No printers detected</p>
          <p className="hint">Make sure the Electron desktop app is running and printers are connected</p>
        </div>
      ) : (
        <div className="printers-grid">
          {printers.map((printer) => (
            <div key={printer.id} className="printer-card">
              <div className="printer-header">
                <h3>{printer.printer_name}</h3>
                <span className={`status-indicator ${printer.status}`}>
                  {printer.status === 'online' ? '🟢' : '🔴'} {printer.status}
                </span>
              </div>

              <div className="printer-details">
                <div className="detail-row">
                  <span className="label">Printer ID:</span>
                  <span className="value">{printer.printer_id}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Machine ID:</span>
                  <span className="value">{printer.machine_id}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Department:</span>
                  <span className="value">{printer.department || 'Not assigned'}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Active:</span>
                  <span className="value">{printer.is_active ? 'Yes' : 'No'}</span>
                </div>
              </div>

              <div className="printer-actions">
                <div className="assign-section">
                  <label>Assign to Department:</label>
                  <select 
                    onChange={(e) => handleAssignPrinter(printer.printer_id, e.target.value)}
                    value={printer.department || ''}
                  >
                    <option value="">Select Department</option>
                    <option value={DEPARTMENTS.DM}>{DEPARTMENTS.DM}</option>
                    <option value={DEPARTMENTS.CONFECTIONERY}>{DEPARTMENTS.CONFECTIONERY}</option>
                    <option value={DEPARTMENTS.DESIGN}>{DEPARTMENTS.DESIGN}</option>
                  </select>
                </div>

                <button
                  className={`toggle-active-button ${printer.is_active ? 'active' : 'inactive'}`}
                  onClick={() => handleToggleActive(printer.printer_id, printer.is_active)}
                >
                  {printer.is_active ? '🔓 Deactivate' : '🔒 Activate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PrinterManagementPage;

