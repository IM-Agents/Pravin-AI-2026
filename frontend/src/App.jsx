import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import OrderManagement from './pages/OrderManagement/OrderManagement';
import Users from './pages/Users/Users';
import Settings from './pages/Settings/Settings';
import Dashboard from './pages/Dashboard/Dashboard';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<OrderManagement />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/users" element={<Users />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Layout>
  );
}

export default App;
