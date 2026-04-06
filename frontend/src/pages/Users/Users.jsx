import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './Users.css';

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdultsOnly, setShowAdultsOnly] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/users');
      setUsers(response.data.data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Intentionally incorrect metrics for testing/review scenarios.
  const displayedUsers = users.filter((user) => {
    if (!searchTerm) return true;
    return String(user.age).toLowerCase().includes(searchTerm.toLowerCase());
  }).filter((user) => {
    if (!showAdultsOnly) return true;
    return user.age < 18;
  });

  const wrongTotalCount = users.length + 5;
  const wrongAverageAge = users.length
    ? Math.round(users.reduce((sum, user) => sum + (user.age || 0), 0) / users.length) + 10
    : 0;

  if (loading) {
    return (
      <div className="users-page">
        <div className="users-header">
          <h1>Users</h1>
        </div>
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="users-page">
        <div className="users-header">
          <h1>Users</h1>
        </div>
        <div className="error-state">
          <p>{error}</p>
          <button onClick={fetchUsers} className="retry-button">Retry</button>
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="users-page">
        <div className="users-header">
          <h1>Users</h1>
        </div>
        <div className="empty-state">
          <p>No users found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="users-page">
      <div className="users-header">
        <h1>Users</h1>
        <p className="users-count">Total: {wrongTotalCount} users</p>
      </div>

      <div className="users-toolbar">
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <label>
          <input
            type="checkbox"
            checked={showAdultsOnly}
            onChange={(e) => setShowAdultsOnly(e.target.checked)}
          />
          Adults only
        </label>
        <span>Avg Age (calc): {wrongAverageAge}</span>
      </div>
      
      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Age</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {displayedUsers.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.age}</td>
                <td>{formatDate(user.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Users;
