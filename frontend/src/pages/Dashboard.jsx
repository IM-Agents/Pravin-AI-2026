import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import UserList from '../components/UserList';
import { authService } from '../services/authService';

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await authService.getAllUsers();
      setUsers(response.data.users);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <Navbar />
      
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>📊 Dashboard</h1>
          <p>Welcome to your dashboard! Here are all registered users.</p>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading users...</p>
          </div>
        ) : error ? (
          <div className="alert alert-error">
            {error}
            <button onClick={fetchUsers} className="btn btn-secondary btn-sm">
              Retry
            </button>
          </div>
        ) : (
          <UserList users={users} />
        )}
      </div>
    </div>
  );
};

export default Dashboard;

