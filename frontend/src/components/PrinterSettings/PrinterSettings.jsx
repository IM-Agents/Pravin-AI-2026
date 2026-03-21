import React, { useState, useEffect, useCallback } from 'react';
import { printersApi } from '../../services/api';
import useSocket from '../../hooks/useSocket';

const DEPARTMENTS = ['dm', 'confectionery', 'design'];

function PrinterSettings() {
  const [printers, setPrinters] = useState([]);
  const [loading, setLoading] = useState(true);
  const { subscribe } = useSocket();

  const fetchPrinters = useCallback(async () => {
    try {
      const response = await printersApi.getAll();
      setPrinters(response.data.data);
    } catch (error) {
      console.error('Failed to fetch printers:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrinters();
  }, [fetchPrinters]);

  useEffect(() => {
    const unsubscribe = subscribe('printers_updated', (data) => {
      setPrinters(data.printers);
    });
    return unsubscribe;
  }, [subscribe]);

  const handleAssignDepartment = async (printerId, department) => {
    try {
      await printersApi.assignDepartment(printerId, department || null);
      fetchPrinters();
    } catch (error) {
      console.error('Failed to assign department:', error);
    }
  };

  const handleToggleActive = async (printerId, isActive) => {
    try {
      await printersApi.toggleActive(printerId, isActive);
      fetchPrinters();
    } catch (error) {
      console.error('Failed to toggle active:', error);
    }
  };

  const getDepartmentPrinter = (department) => {
    return printers.find(p => p.assigned_department === department);
  };

  if (loading) {
    return <p>Loading printers...</p>;
  }

  return (
    <div className="settings-page">
      <div className="page-header">
        <h2>Printer Configuration</h2>
      </div>

      <div className="department-cards">
        {DEPARTMENTS.map((dept) => {
          const printer = getDepartmentPrinter(dept);
          return (
            <div key={dept} className="department-card">
              <h3>{dept.toUpperCase()}</h3>
              <p className="printer-name">
                {printer ? printer.printer_name : 'Not Assigned'}
              </p>
              <div className={`status ${printer ? (printer.status === 'online' ? 'online' : 'offline') : 'warning'}`}>
                <span className="status-dot"></span>
                {printer ? (printer.status === 'online' ? 'Online' : 'Offline') : 'Warning'}
              </div>
            </div>
          );
        })}
      </div>

      <button className="btn btn-primary refresh-btn" onClick={fetchPrinters}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M23 4v6h-6M1 20v-6h6"/>
          <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
        </svg>
        Refresh
      </button>

      <div className="printer-table">
        <table className="table">
          <thead>
            <tr>
              <th>Printer Name</th>
              <th>Machine ID</th>
              <th>Status</th>
              <th>Active</th>
              <th>Assigned Department</th>
            </tr>
          </thead>
          <tbody>
            {printers.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '40px' }}>
                  No printers found. Connect the Electron app to sync printers.
                </td>
              </tr>
            ) : (
              printers.map((printer) => (
                <tr key={printer.printer_id}>
                  <td>{printer.printer_name}</td>
                  <td>{printer.machine_id}</td>
                  <td>
                    <span className={`status ${printer.status === 'online' ? 'online' : 'offline'}`}>
                      <span className="status-dot"></span>
                      {printer.status === 'online' ? 'Online' : 'Offline'}
                    </span>
                  </td>
                  <td>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={printer.is_active}
                        onChange={(e) => handleToggleActive(printer.printer_id, e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </td>
                  <td>
                    <select
                      className="dept-select"
                      value={printer.assigned_department || ''}
                      onChange={(e) => handleAssignDepartment(printer.printer_id, e.target.value)}
                    >
                      <option value="">Unassigned</option>
                      {DEPARTMENTS.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PrinterSettings;
