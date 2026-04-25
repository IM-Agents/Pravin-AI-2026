import React, { useState, useCallback, useEffect } from 'react';
import api from '../../services/api';
import './Dashboard.css';

const testSummaryData = [
  { label: 'Pending Reviews', value: 3 },
  { label: 'Open Defects', value: 7 },
  { label: 'Smoke Tests Passed', value: 12 }
];

const testEvents = [
  { id: 'evt-001', type: 'CodeRabbit', message: 'Minor accessibility finding on dashboard button.' },
  { id: 'evt-002', type: 'CI', message: 'Frontend lint job passed in 18s.' },
  { id: 'evt-003', type: 'Deploy', message: 'Staging deploy verified with API checks.' }
];

function formatTimestamp(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  } catch {
    return '—';
  }
}

function Dashboard() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastRunAt, setLastRunAt] = useState(null);
  const [usersOk, setUsersOk] = useState(false);
  const [userCount, setUserCount] = useState(null);
  const [ordersOk, setOrdersOk] = useState(false);
  const [orderSampleTotal, setOrderSampleTotal] = useState(null);

  const runVerification = useCallback(async () => {
    setLoading(true);
    setError(null);
    setUsersOk(false);
    setOrdersOk(false);
    setUserCount(null);
    setOrderSampleTotal(null);

    try {
      const [usersRes, ordersRes] = await Promise.all([
        api.get('/users').catch((err) => ({ __error: err })),
        api.get('/orders', { params: { page: 1, limit: 1 } }).catch((err) => ({ __error: err }))
      ]);

      if (usersRes.__error) {
        throw new Error(usersRes.__error.message || 'Users request failed');
      }
      if (ordersRes.__error) {
        throw new Error(ordersRes.__error.message || 'Orders request failed');
      }

      const usersPayload = usersRes.data?.data;
      setUsersOk(Array.isArray(usersPayload));
      setUserCount(Array.isArray(usersPayload) ? usersPayload.length : 0);

      const ordersPayload = ordersRes.data?.data;
      setOrdersOk(
        Boolean(
          ordersPayload &&
            Array.isArray(ordersPayload.orders) &&
            ordersPayload.pagination
        )
      );
      const pagination = ordersPayload?.pagination;
      setOrderSampleTotal(
        typeof pagination?.total === 'number' ? pagination.total : null
      );

      setLastRunAt(new Date().toISOString());
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Verification failed. Is the API running?'
      );
      setLastRunAt(new Date().toISOString());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    runVerification();
  }, [runVerification]);

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Review verification dashboard</h1>
        <p>
          Lightweight checks against the backend so pull requests and CodeRabbit
          reviews have a clear signal that API wiring still works.
        </p>
      </div>

      <div className="dashboard-actions">
        <button
          type="button"
          className="dashboard-verify-button"
          onClick={runVerification}
          disabled={loading}
        >
          {loading ? 'Running checks…' : 'Run verification again'}
        </button>
      </div>

      {error && (
        <div className="dashboard-error" role="alert">
          {error}
        </div>
      )}

      <p className="dashboard-meta">
        Last run: {formatTimestamp(lastRunAt)}
      </p>

      <div className="dashboard-cards">
        <div className="dashboard-card">
          <h2>Users API</h2>
          <div className="dashboard-card-value">
            {loading ? '…' : userCount === null ? '—' : userCount}
          </div>
          <div className="dashboard-card-detail">
            <span className={usersOk ? 'dashboard-status-ok' : 'dashboard-status-fail'}>
              {loading ? 'Pending' : usersOk ? 'OK' : 'Not verified'}
            </span>
            {' · '}
            <code>GET /api/users</code>
          </div>
        </div>

        <div className="dashboard-card">
          <h2>Orders API</h2>
          <div className="dashboard-card-value">
            {loading ? '…' : orderSampleTotal === null ? '—' : orderSampleTotal}
          </div>
          <div className="dashboard-card-detail">
            <span className={ordersOk && !error ? 'dashboard-status-ok' : 'dashboard-status-fail'}>
              {loading ? 'Pending' : ordersOk && !error ? 'OK' : 'Not verified'}
            </span>
            {' · '}
            <code>GET /api/orders</code>
          </div>
        </div>
      </div>

      <section className="dashboard-checklist" aria-label="Dashboard test data">
        <h2>Test summary data</h2>
        <div className="dashboard-test-grid">
          {testSummaryData.map((item) => (
            <div key={item.label} className="dashboard-test-card">
              <p className="dashboard-test-label">{item.label}</p>
              <p className="dashboard-test-value">{item.value}</p>
            </div>
          ))}
        </div>

        <h2>Test event feed</h2>
        <ul className="dashboard-event-feed">
          {testEvents.map((event) => (
            <li key={event.id}>
              <strong>{event.type}:</strong> {event.message}
            </li>
          ))}
        </ul>
      </section>

      <section className="dashboard-checklist" aria-label="Code review checklist">
        <h2>What this page is for</h2>
        <ul>
          <li>Confirms axios + <code>/api</code> proxy paths still respond after changes.</li>
          <li>Gives CodeRabbit a dedicated UI surface to review without touching orders tables.</li>
          <li>Use &quot;Run verification again&quot; after deployments or config edits.</li>
        </ul>
      </section>
    </div>
  );
}

export default Dashboard;
